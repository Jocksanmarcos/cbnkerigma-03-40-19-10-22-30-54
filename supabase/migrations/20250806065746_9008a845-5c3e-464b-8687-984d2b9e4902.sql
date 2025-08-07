-- CORRIGIR E COMPLETAR A ESTRUTURA DE SEGURANÇA

-- Primeiro, criar as tabelas básicas sem os triggers problemáticos
CREATE TABLE IF NOT EXISTS public.security_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  action_name TEXT NOT NULL,
  resource_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_profile_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.security_profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.security_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, permission_id)
);

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

-- Ativar RLS
ALTER TABLE public.security_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Inserir perfis padrão
INSERT INTO public.security_profiles (name, description, level) VALUES
('Super Admin', 'Acesso total ao sistema', 10),
('Admin Igreja', 'Administrador da igreja local', 8),
('Pastor', 'Pastor com acesso aos membros', 7),
('Líder Célula', 'Líder de célula com acesso limitado', 5),
('Membro', 'Membro comum da igreja', 1)
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões básicas
INSERT INTO public.security_permissions (module_name, action_name, description) VALUES
('pessoas', 'read', 'Ver dados de pessoas'),
('pessoas', 'create', 'Criar novos registros de pessoas'),
('pessoas', 'update', 'Editar dados de pessoas'),
('pessoas', 'delete', 'Excluir registros de pessoas'),
('pessoas', 'manage', 'Gerenciar completamente pessoas'),
('celulas', 'read', 'Ver células'),
('celulas', 'create', 'Criar células'),
('celulas', 'update', 'Editar células'),
('celulas', 'delete', 'Excluir células'),
('celulas', 'manage', 'Gerenciar completamente células'),
('ensino', 'read', 'Ver ensino e cursos'),
('ensino', 'create', 'Criar cursos'),
('ensino', 'update', 'Editar cursos'),
('ensino', 'delete', 'Excluir cursos'),
('ensino', 'manage', 'Gerenciar completamente ensino'),
('admin', 'read', 'Acessar painel administrativo'),
('admin', 'manage_users', 'Gerenciar usuários'),
('admin', 'manage_system', 'Gerenciar sistema'),
('financeiro', 'read', 'Ver dados financeiros'),
('financeiro', 'create', 'Criar lançamentos financeiros'),
('financeiro', 'update', 'Editar lançamentos financeiros'),
('financeiro', 'delete', 'Excluir lançamentos financeiros'),
('financeiro', 'manage', 'Gerenciar completamente finanças')
ON CONFLICT DO NOTHING;