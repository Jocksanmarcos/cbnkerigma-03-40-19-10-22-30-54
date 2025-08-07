-- Finalizar sistema de segurança com tabelas faltantes e políticas RLS
-- Criar tabelas de segurança que ainda não existem
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.security_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 1,
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT NOT NULL DEFAULT 'shield',
  active BOOLEAN DEFAULT true,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.security_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_name TEXT NOT NULL,
  module_name TEXT NOT NULL,
  resource_type TEXT,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(action_name, module_name, resource_type)
);

CREATE TABLE IF NOT EXISTS public.security_profile_permissions (
  profile_id UUID REFERENCES public.security_profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.security_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT false,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  PRIMARY KEY (profile_id, permission_id)
);

CREATE TABLE IF NOT EXISTS public.security_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.security_profiles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  UNIQUE(user_id, profile_id)
);

-- Inserir perfis de segurança padrão
INSERT INTO public.security_profiles (name, display_name, description, level, color, icon, is_system)
VALUES 
  ('admin', 'Administrador Geral', 'Acesso total ao sistema', 100, '#dc2626', 'crown', true),
  ('leader', 'Líder', 'Gerenciamento de pessoas e células', 80, '#059669', 'users', true),
  ('coordinator', 'Coordenador', 'Coordenação de ensino e eventos', 60, '#7c3aed', 'star', true),
  ('teacher', 'Professor', 'Gerenciamento de ensino', 40, '#2563eb', 'book-open', true),
  ('member', 'Membro', 'Acesso básico de membro', 20, '#6b7280', 'user', true)
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões padrão
INSERT INTO public.security_permissions (action_name, module_name, resource_type, description, is_sensitive)
VALUES 
  -- Admin
  ('manage', 'admin', 'system', 'Gerenciar sistema completo', true),
  ('view', 'admin', 'dashboard', 'Ver dashboard administrativo', true),
  
  -- Pessoas
  ('view', 'pessoas', null, 'Ver pessoas', false),
  ('create', 'pessoas', null, 'Criar pessoas', false),
  ('edit', 'pessoas', null, 'Editar pessoas', false),
  ('delete', 'pessoas', null, 'Excluir pessoas', true),
  
  -- Ensino
  ('view', 'ensino', null, 'Ver ensino', false),
  ('create', 'ensino', null, 'Criar conteúdo de ensino', false),
  ('edit', 'ensino', null, 'Editar ensino', false),
  ('manage', 'ensino', null, 'Gerenciar ensino', false),
  
  -- Células
  ('view', 'celulas', null, 'Ver células', false),
  ('create', 'celulas', null, 'Criar células', false),
  ('edit', 'celulas', null, 'Editar células', false),
  ('manage', 'celulas', null, 'Gerenciar células', false),
  
  -- Financeiro
  ('view', 'financeiro', null, 'Ver financeiro', true),
  ('create', 'financeiro', null, 'Criar lançamentos financeiros', true),
  ('edit', 'financeiro', null, 'Editar financeiro', true),
  ('manage', 'financeiro', null, 'Gerenciar financeiro', true),
  
  -- Eventos
  ('view', 'eventos', null, 'Ver eventos', false),
  ('create', 'eventos', null, 'Criar eventos', false),
  ('edit', 'eventos', null, 'Editar eventos', false),
  ('manage', 'eventos', null, 'Gerenciar eventos', false)
ON CONFLICT (action_name, module_name, resource_type) DO NOTHING;

-- Habilitar RLS em todas as tabelas de segurança
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para logs de auditoria
CREATE POLICY "Admins podem ver todos os logs de auditoria" 
ON public.security_audit_logs 
FOR SELECT 
USING (is_security_admin());

CREATE POLICY "Sistema pode criar logs de auditoria" 
ON public.security_audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Políticas RLS para sessões ativas
CREATE POLICY "Admins podem gerenciar sessões" 
ON public.security_active_sessions 
FOR ALL 
USING (is_security_admin());

CREATE POLICY "Usuários podem ver próprias sessões" 
ON public.security_active_sessions 
FOR SELECT 
USING (user_id = auth.uid());

-- Políticas RLS para perfis de segurança
CREATE POLICY "Admins podem gerenciar perfis de segurança" 
ON public.security_profiles 
FOR ALL 
USING (is_security_admin());

CREATE POLICY "Todos podem ver perfis ativos" 
ON public.security_profiles 
FOR SELECT 
USING (active = true);

-- Políticas RLS para permissões
CREATE POLICY "Admins podem gerenciar permissões" 
ON public.security_permissions 
FOR ALL 
USING (is_security_admin());

CREATE POLICY "Todos podem ver permissões" 
ON public.security_permissions 
FOR SELECT 
USING (true);

-- Políticas RLS para associações perfil-permissão
CREATE POLICY "Admins podem gerenciar associações perfil-permissão" 
ON public.security_profile_permissions 
FOR ALL 
USING (is_security_admin());

CREATE POLICY "Todos podem ver associações" 
ON public.security_profile_permissions 
FOR SELECT 
USING (true);

-- Políticas RLS para usuários-perfis
CREATE POLICY "Admins podem gerenciar associações usuário-perfil" 
ON public.security_user_profiles 
FOR ALL 
USING (is_security_admin());

CREATE POLICY "Usuários podem ver próprios perfis" 
ON public.security_user_profiles 
FOR SELECT 
USING (user_id = auth.uid());

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_timestamp ON public.security_audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_security_active_sessions_user_id ON public.security_active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_active_sessions_active ON public.security_active_sessions(active);
CREATE INDEX IF NOT EXISTS idx_security_user_profiles_user_id ON public.security_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_security_user_profiles_active ON public.security_user_profiles(active);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_security_profiles_updated_at
    BEFORE UPDATE ON public.security_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_security_updated_at();

-- Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM security_active_sessions 
  WHERE expires_at < now() OR last_activity < (now() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;