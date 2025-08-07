-- Sistema RBAC Avançado
-- Etapa 1: Criar tabelas principais para o sistema RBAC

-- Tabela de perfis de segurança (se não existir)
CREATE TABLE IF NOT EXISTS public.security_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  level INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de permissões (se não existir)
CREATE TABLE IF NOT EXISTS public.security_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action_name TEXT NOT NULL, -- read, create, update, delete, export, manage, etc.
  module_name TEXT NOT NULL, -- dashboard, finance, users, courses, etc.
  resource_type TEXT, -- report, entry, profile, etc.
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de associação perfil-permissões (se não existir)
CREATE TABLE IF NOT EXISTS public.security_profile_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES public.security_profiles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.security_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  conditions JSONB DEFAULT '{}',
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(profile_id, permission_id)
);

-- Tabela de atribuição de perfis aos usuários
CREATE TABLE IF NOT EXISTS public.security_user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.security_profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  active BOOLEAN DEFAULT true,
  UNIQUE(user_id, profile_id)
);

-- Tabela de sessões ativas para auditoria
CREATE TABLE IF NOT EXISTS public.security_active_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '24 hours')
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.security_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_security_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER security_profiles_updated_at
  BEFORE UPDATE ON public.security_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_security_updated_at();

-- Inserir perfis padrão
INSERT INTO public.security_profiles (name, description, level) VALUES
  ('Administrador Geral', 'Acesso total ao sistema', 100),
  ('Coordenador', 'Acesso de coordenação e supervisão', 80),
  ('Líder', 'Acesso de liderança e gestão', 60),
  ('Membro', 'Acesso básico de membro', 40),
  ('Visitante', 'Acesso limitado para visitantes', 20)
ON CONFLICT (name) DO NOTHING;

-- Inserir permissões básicas
INSERT INTO public.security_permissions (action_name, module_name, resource_type, description, is_sensitive) VALUES
  -- Dashboard
  ('read', 'dashboard', 'overview', 'Visualizar dashboard principal', false),
  ('read', 'dashboard', 'analytics', 'Visualizar analytics', false),
  
  -- Portal do Aluno
  ('read', 'portal_aluno', 'courses', 'Visualizar cursos', false),
  ('read', 'portal_aluno', 'profile', 'Visualizar perfil', false),
  ('update', 'portal_aluno', 'profile', 'Editar perfil', false),
  ('submit', 'portal_aluno', 'assignments', 'Enviar tarefas', false),
  
  -- Ensino
  ('read', 'ensino', 'courses', 'Visualizar cursos', false),
  ('create', 'ensino', 'courses', 'Criar cursos', false),
  ('update', 'ensino', 'courses', 'Editar cursos', false),
  ('delete', 'ensino', 'courses', 'Excluir cursos', false),
  ('manage', 'ensino', 'students', 'Gerenciar alunos', false),
  
  -- Finanças
  ('read', 'financas', 'reports', 'Visualizar relatórios financeiros', true),
  ('create', 'financas', 'entry', 'Criar lançamentos', true),
  ('update', 'financas', 'entry', 'Editar lançamentos', true),
  ('delete', 'financas', 'entry', 'Excluir lançamentos', true),
  ('export', 'financas', 'reports', 'Exportar relatórios', true),
  ('manage', 'financas', 'categories', 'Gerenciar categorias', true),
  
  -- Pessoas
  ('read', 'pessoas', 'profiles', 'Visualizar pessoas', false),
  ('create', 'pessoas', 'profiles', 'Cadastrar pessoas', false),
  ('update', 'pessoas', 'profiles', 'Editar pessoas', false),
  ('delete', 'pessoas', 'profiles', 'Excluir pessoas', true),
  ('export', 'pessoas', 'data', 'Exportar dados de pessoas', true),
  
  -- Células
  ('read', 'celulas', 'list', 'Visualizar células', false),
  ('create', 'celulas', 'group', 'Criar células', false),
  ('update', 'celulas', 'group', 'Editar células', false),
  ('manage', 'celulas', 'reports', 'Gerenciar relatórios', false),
  
  -- Agenda
  ('read', 'agenda', 'events', 'Visualizar eventos', false),
  ('create', 'agenda', 'events', 'Criar eventos', false),
  ('update', 'agenda', 'events', 'Editar eventos', false),
  ('delete', 'agenda', 'events', 'Excluir eventos', false),
  
  -- Comunicação
  ('read', 'comunicacao', 'messages', 'Visualizar mensagens', false),
  ('create', 'comunicacao', 'messages', 'Enviar mensagens', false),
  ('manage', 'comunicacao', 'campaigns', 'Gerenciar campanhas', false),
  
  -- Administração
  ('manage', 'admin', 'users', 'Gerenciar usuários', true),
  ('manage', 'admin', 'permissions', 'Gerenciar permissões', true),
  ('manage', 'admin', 'system', 'Administração do sistema', true),
  ('read', 'admin', 'audit', 'Visualizar logs de auditoria', true),
  ('manage', 'admin', 'security', 'Gerenciar segurança', true)
ON CONFLICT DO NOTHING;

-- Função para verificar permissões
CREATE OR REPLACE FUNCTION public.has_security_permission(
  user_uuid UUID,
  module_name TEXT,
  action_name TEXT,
  resource_type TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM security_user_profiles sup
    JOIN security_profile_permissions spp ON sup.profile_id = spp.profile_id
    JOIN security_permissions sp ON spp.permission_id = sp.id
    WHERE sup.user_id = user_uuid
      AND sup.active = true
      AND (sup.expires_at IS NULL OR sup.expires_at > now())
      AND sp.module_name = has_security_permission.module_name
      AND sp.action_name = has_security_permission.action_name
      AND (resource_type IS NULL OR sp.resource_type = has_security_permission.resource_type)
      AND spp.granted = true
  );
END;
$$;

-- Função para obter nível de segurança do usuário
CREATE OR REPLACE FUNCTION public.get_user_security_level(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  max_level INTEGER := 0;
BEGIN
  SELECT COALESCE(MAX(sp.level), 0) INTO max_level
  FROM security_user_profiles sup
  JOIN security_profiles sp ON sup.profile_id = sp.id
  WHERE sup.user_id = user_uuid
    AND sup.active = true
    AND (sup.expires_at IS NULL OR sup.expires_at > now())
    AND sp.active = true;
    
  RETURN max_level;
END;
$$;

-- Função para verificar se é admin de segurança
CREATE OR REPLACE FUNCTION public.is_security_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar no novo sistema de segurança
  IF has_security_permission(user_uuid, 'admin', 'manage_system') THEN
    RETURN true;
  END IF;
  
  -- Fallback para o sistema antigo (compatibilidade)
  IF is_sede_admin(user_uuid) OR is_pastor_missao(user_uuid) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Função para log de auditoria automática
CREATE OR REPLACE FUNCTION public.log_security_audit(
  p_user_id UUID,
  p_action TEXT,
  p_resource_type TEXT,
  p_resource_id UUID DEFAULT NULL,
  p_old_values JSONB DEFAULT NULL,
  p_new_values JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO security_audit_logs (
    user_id, action, resource_type, resource_id, 
    old_values, new_values, metadata
  )
  VALUES (
    p_user_id, p_action, p_resource_type, p_resource_id,
    p_old_values, p_new_values, p_metadata
  )
  RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- Trigger automático para auditoria
CREATE OR REPLACE FUNCTION public.auto_audit_trigger()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_type TEXT;
BEGIN
  -- Determinar o tipo de ação
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
    new_data := to_jsonb(NEW);
    old_data := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Inserir log de auditoria
  INSERT INTO security_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_data,
    new_data,
    jsonb_build_object(
      'table', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
      'trigger_time', now()
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Função para limpeza de sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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

-- Policies de RLS
-- Security Profiles
CREATE POLICY "Admins podem gerenciar perfis de segurança"
  ON public.security_profiles
  FOR ALL
  USING (is_security_admin())
  WITH CHECK (is_security_admin());

CREATE POLICY "Usuários podem ver perfis ativos"
  ON public.security_profiles
  FOR SELECT
  USING (active = true);

-- Security Permissions
CREATE POLICY "Admins podem gerenciar permissões"
  ON public.security_permissions
  FOR ALL
  USING (is_security_admin())
  WITH CHECK (is_security_admin());

CREATE POLICY "Usuários podem ver permissões"
  ON public.security_permissions
  FOR SELECT
  USING (true);

-- Security Profile Permissions
CREATE POLICY "Admins podem gerenciar permissões de perfis"
  ON public.security_profile_permissions
  FOR ALL
  USING (is_security_admin())
  WITH CHECK (is_security_admin());

CREATE POLICY "Usuários podem ver permissões de seus perfis"
  ON public.security_profile_permissions
  FOR SELECT
  USING (
    profile_id IN (
      SELECT profile_id 
      FROM security_user_profiles 
      WHERE user_id = auth.uid() AND active = true
    )
  );

-- Security User Profiles
CREATE POLICY "Admins podem gerenciar atribuições de perfis"
  ON public.security_user_profiles
  FOR ALL
  USING (is_security_admin())
  WITH CHECK (is_security_admin());

CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.security_user_profiles
  FOR SELECT
  USING (user_id = auth.uid());

-- Security Active Sessions
CREATE POLICY "Usuários podem gerenciar suas próprias sessões"
  ON public.security_active_sessions
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins podem ver todas as sessões"
  ON public.security_active_sessions
  FOR SELECT
  USING (is_security_admin());

-- Security Audit Logs
CREATE POLICY "Admins podem ver logs de auditoria"
  ON public.security_audit_logs
  FOR SELECT
  USING (is_security_admin());

CREATE POLICY "Sistema pode criar logs"
  ON public.security_audit_logs
  FOR INSERT
  WITH CHECK (true);