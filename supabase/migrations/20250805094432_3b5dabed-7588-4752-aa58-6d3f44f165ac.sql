-- Criar tabela para gerenciar configurações de MFA dos usuários
CREATE TABLE IF NOT EXISTS public.user_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  backup_codes TEXT[], -- Códigos de backup para recuperação
  phone_number TEXT, -- Para SMS MFA (futuro)
  preferred_method TEXT DEFAULT 'totp', -- 'totp', 'sms', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Habilitar RLS
ALTER TABLE public.user_mfa_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - usuários só podem ver/editar suas próprias configurações
CREATE POLICY "Users can view their own MFA settings"
ON public.user_mfa_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own MFA settings"
ON public.user_mfa_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own MFA settings"
ON public.user_mfa_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_user_mfa_settings_updated_at
    BEFORE UPDATE ON public.user_mfa_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar códigos de backup
CREATE OR REPLACE FUNCTION public.generate_backup_codes()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  codes TEXT[] := ARRAY[]::TEXT[];
  i INTEGER;
BEGIN
  -- Gerar 10 códigos de backup aleatórios
  FOR i IN 1..10 LOOP
    codes := array_append(codes, 
      substring(encode(gen_random_bytes(6), 'hex') from 1 for 8)
    );
  END LOOP;
  
  RETURN codes;
END;
$$;