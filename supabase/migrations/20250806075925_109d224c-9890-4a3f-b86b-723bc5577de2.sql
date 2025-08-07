-- ===== MIGRAÇÃO 1: ESTRUTURA PARA MULTIPLE CONGREGAÇÕES (MULTI-TENANCY) =====

-- Tabela de congregações
CREATE TABLE IF NOT EXISTS public.congregations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  main_church_id UUID REFERENCES public.igrejas(id),
  active BOOLEAN NOT NULL DEFAULT true,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== MIGRAÇÃO 2: NOTIFICAÇÕES DE SEGURANÇA =====

-- Tabela para logs de eventos de segurança
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  event_type TEXT NOT NULL, -- 'login_new_device', 'password_change', 'mfa_change', etc.
  event_data JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  location_data JSONB, -- cidade, país, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para notificações de segurança enviadas
CREATE TABLE IF NOT EXISTS public.security_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  security_event_id UUID REFERENCES public.security_events(id),
  notification_type TEXT NOT NULL, -- 'email', 'push', 'sms'
  template_used TEXT NOT NULL,
  recipient TEXT NOT NULL, -- email ou device token
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== MIGRAÇÃO 3: DADOS DE PRIVACIDADE E CONSENTIMENTO (LGPD) =====

-- Tabela para consentimentos LGPD
CREATE TABLE IF NOT EXISTS public.privacy_consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  consent_type TEXT NOT NULL, -- 'marketing', 'analytics', 'communications', etc.
  granted BOOLEAN NOT NULL,
  consent_version TEXT NOT NULL DEFAULT '1.0',
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para solicitações de dados (direito LGPD)
CREATE TABLE IF NOT EXISTS public.data_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  request_type TEXT NOT NULL, -- 'export', 'deletion', 'rectification'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'rejected'
  request_data JSONB DEFAULT '{}',
  response_data JSONB DEFAULT '{}',
  processed_by UUID,
  processed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE, -- para links de download
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== MIGRAÇÃO 4: SUPORTE A PASSKEYS (WEBAUTHN) =====

-- Tabela para credenciais WebAuthn/Passkeys
CREATE TABLE IF NOT EXISTS public.passkey_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credential_id TEXT UNIQUE NOT NULL,
  public_key BYTEA NOT NULL,
  counter BIGINT NOT NULL DEFAULT 0,
  device_type TEXT, -- 'platform', 'cross-platform'
  device_name TEXT, -- nome amigável dado pelo usuário
  backup_eligible BOOLEAN DEFAULT false,
  backup_state BOOLEAN DEFAULT false,
  transports TEXT[], -- 'usb', 'nfc', 'ble', 'internal'
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ===== ÍNDICES PARA PERFORMANCE =====

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON public.security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);

CREATE INDEX IF NOT EXISTS idx_security_notifications_user_id ON public.security_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_security_notifications_status ON public.security_notifications(status);

CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_id ON public.privacy_consents(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_consents_type ON public.privacy_consents(consent_type);

CREATE INDEX IF NOT EXISTS idx_data_requests_user_id ON public.data_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_data_requests_status ON public.data_requests(status);

CREATE INDEX IF NOT EXISTS idx_passkey_credentials_user_id ON public.passkey_credentials(user_id);

-- ===== TRIGGERS PARA UPDATED_AT =====

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_congregations_updated_at
  BEFORE UPDATE ON public.congregations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_privacy_consents_updated_at
  BEFORE UPDATE ON public.privacy_consents
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_data_requests_updated_at
  BEFORE UPDATE ON public.data_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== FUNÇÕES DE SEGURANÇA =====

-- Função para registrar eventos de segurança
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_location_data JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, event_data, ip_address, user_agent, location_data
  ) VALUES (
    p_user_id, p_event_type, p_event_data, p_ip_address, p_user_agent, p_location_data
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se precisa notificar sobre login suspeito
CREATE OR REPLACE FUNCTION public.check_suspicious_login(
  p_user_id UUID,
  p_ip_address INET,
  p_user_agent TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  recent_login_count INTEGER;
  different_location_count INTEGER;
BEGIN
  -- Verificar se há logins recentes do mesmo IP/device
  SELECT COUNT(*) INTO recent_login_count
  FROM public.security_events 
  WHERE user_id = p_user_id 
    AND event_type = 'login_success'
    AND ip_address = p_ip_address
    AND created_at > now() - INTERVAL '30 days';
  
  -- Se não há logins recentes deste IP, é suspeito
  IF recent_login_count = 0 THEN
    RETURN true;
  END IF;
  
  -- Verificar logins de localizações muito diferentes nas últimas 24h
  SELECT COUNT(DISTINCT ip_address) INTO different_location_count
  FROM public.security_events 
  WHERE user_id = p_user_id 
    AND event_type = 'login_success'
    AND created_at > now() - INTERVAL '24 hours';
  
  -- Se há mais de 2 IPs diferentes em 24h, é suspeito
  RETURN different_location_count > 2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;