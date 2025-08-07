-- ===== CORREÇÃO DOS PROBLEMAS DE SEGURANÇA =====

-- 1. Corrigir funções com search_path (definir explicitamente)
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id UUID,
  p_event_type TEXT,
  p_event_data JSONB DEFAULT '{}',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_location_data JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.check_suspicious_login(
  p_user_id UUID,
  p_ip_address INET,
  p_user_agent TEXT
) RETURNS BOOLEAN
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2. Habilitar RLS em todas as novas tabelas
ALTER TABLE public.congregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passkey_credentials ENABLE ROW LEVEL SECURITY;

-- 3. Criar políticas RLS para congregations
CREATE POLICY "Admins podem gerenciar congregações"
ON public.congregations
FOR ALL
USING (is_sede_admin())
WITH CHECK (is_sede_admin());

CREATE POLICY "Qualquer um pode ver congregações ativas"
ON public.congregations
FOR SELECT
USING (active = true);

-- 4. Criar políticas RLS para security_events
CREATE POLICY "Usuários podem ver próprios eventos de segurança"
ON public.security_events
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Sistema pode criar eventos de segurança"
ON public.security_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins podem ver todos os eventos de segurança"
ON public.security_events
FOR SELECT
USING (is_sede_admin());

-- 5. Criar políticas RLS para security_notifications
CREATE POLICY "Usuários podem ver próprias notificações de segurança"
ON public.security_notifications
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Sistema pode criar notificações de segurança"
ON public.security_notifications
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Sistema pode atualizar notificações de segurança"
ON public.security_notifications
FOR UPDATE
USING (true);

-- 6. Criar políticas RLS para privacy_consents
CREATE POLICY "Usuários podem gerenciar próprios consentimentos"
ON public.privacy_consents
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins podem ver todos os consentimentos"
ON public.privacy_consents
FOR SELECT
USING (is_sede_admin());

-- 7. Criar políticas RLS para data_requests
CREATE POLICY "Usuários podem gerenciar próprias solicitações de dados"
ON public.data_requests
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins podem gerenciar todas as solicitações de dados"
ON public.data_requests
FOR ALL
USING (is_sede_admin())
WITH CHECK (is_sede_admin());

-- 8. Criar políticas RLS para passkey_credentials
CREATE POLICY "Usuários podem gerenciar próprias credenciais passkey"
ON public.passkey_credentials
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- ===== FUNÇÕES AUXILIARES PARA LGPD =====

-- Função para exportar dados do usuário
CREATE OR REPLACE FUNCTION public.export_user_data(user_uuid UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_data JSONB := '{}';
  temp_data JSONB;
BEGIN
  -- Verificar se o usuário pode acessar estes dados
  IF auth.uid() != user_uuid AND NOT is_sede_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Dados básicos da pessoa
  SELECT to_jsonb(p.*) INTO temp_data
  FROM public.pessoas p
  WHERE p.user_id = user_uuid;
  
  IF temp_data IS NOT NULL THEN
    user_data := jsonb_set(user_data, '{pessoa}', temp_data);
  END IF;

  -- Consentimentos de privacidade
  SELECT jsonb_agg(to_jsonb(pc.*)) INTO temp_data
  FROM public.privacy_consents pc
  WHERE pc.user_id = user_uuid;
  
  IF temp_data IS NOT NULL THEN
    user_data := jsonb_set(user_data, '{consentimentos}', temp_data);
  END IF;

  -- Eventos de segurança (últimos 90 dias)
  SELECT jsonb_agg(to_jsonb(se.*)) INTO temp_data
  FROM public.security_events se
  WHERE se.user_id = user_uuid
    AND se.created_at > now() - INTERVAL '90 days';
  
  IF temp_data IS NOT NULL THEN
    user_data := jsonb_set(user_data, '{eventos_seguranca}', temp_data);
  END IF;

  -- Credenciais passkey
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', pc.id,
      'device_name', pc.device_name,
      'device_type', pc.device_type,
      'created_at', pc.created_at,
      'last_used_at', pc.last_used_at
    )
  ) INTO temp_data
  FROM public.passkey_credentials pc
  WHERE pc.user_id = user_uuid;
  
  IF temp_data IS NOT NULL THEN
    user_data := jsonb_set(user_data, '{credenciais_passkey}', temp_data);
  END IF;

  RETURN user_data;
END;
$$;

-- Função para processar solicitação de exclusão de dados
CREATE OR REPLACE FUNCTION public.process_data_deletion(request_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  request_record RECORD;
BEGIN
  -- Verificar se é admin
  IF NOT is_sede_admin() THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  SELECT * INTO request_record
  FROM public.data_requests
  WHERE id = request_id AND request_type = 'deletion' AND status = 'pending';

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Anonimizar dados na tabela pessoas (não deletar completamente)
  UPDATE public.pessoas 
  SET 
    nome_completo = 'Usuário Removido',
    email = 'removido+' || request_record.user_id || '@exemplo.com',
    telefone = NULL,
    endereco = NULL,
    observacoes = 'Dados removidos a pedido do usuário - LGPD'
  WHERE user_id = request_record.user_id;

  -- Remover dados sensíveis de outras tabelas
  DELETE FROM public.privacy_consents WHERE user_id = request_record.user_id;
  DELETE FROM public.passkey_credentials WHERE user_id = request_record.user_id;
  
  -- Manter eventos de segurança por motivos de auditoria (apenas últimos 30 dias)
  DELETE FROM public.security_events 
  WHERE user_id = request_record.user_id 
    AND created_at < now() - INTERVAL '30 days';

  -- Atualizar status da solicitação
  UPDATE public.data_requests
  SET 
    status = 'completed',
    processed_by = auth.uid(),
    processed_at = now()
  WHERE id = request_id;

  RETURN true;
END;
$$;