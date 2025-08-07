-- ETAPA 1: ESTRUTURA COMPLETA DE SEGURANÇA RBAC/ABAC

-- Tabela de perfis de segurança
CREATE TABLE IF NOT EXISTS public.security_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 1, -- Nível hierárquico (1=básico, 10=admin)
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de permissões do sistema
CREATE TABLE IF NOT EXISTS public.security_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL, -- pessoas, ensino, celulas, etc
  action_name TEXT NOT NULL, -- create, read, update, delete, manage
  resource_type TEXT, -- specific resources within module
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de relacionamento perfil-permissões
CREATE TABLE IF NOT EXISTS public.security_profile_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.security_profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.security_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}', -- Condições ABAC
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, permission_id)
);

-- Tabela de usuários com perfis
CREATE TABLE IF NOT EXISTS public.security_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.security_profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

-- Tabela de sessões ativas para monitoramento
CREATE TABLE IF NOT EXISTS public.security_active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de trilha de auditoria
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_security_user_profiles_user_id ON public.security_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_security_user_profiles_profile_id ON public.security_user_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_resource_type ON public.security_audit_logs(resource_type);

-- Ativar RLS em todas as tabelas de segurança
ALTER TABLE public.security_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Trigger para updated_at
CREATE TRIGGER update_security_profiles_updated_at
  BEFORE UPDATE ON public.security_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_user_profiles_updated_at
  BEFORE UPDATE ON public.security_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();