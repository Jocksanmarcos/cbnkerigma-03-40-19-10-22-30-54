-- Primeiro, remover tabelas conflitantes se existirem e recriar corretamente
DROP TABLE IF EXISTS public.security_profile_permissions CASCADE;
DROP TABLE IF EXISTS public.security_user_profiles CASCADE;  
DROP TABLE IF EXISTS public.security_profiles CASCADE;

-- Recriar a estrutura correta
CREATE TABLE public.security_profiles (
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

CREATE TABLE public.security_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_name TEXT NOT NULL,
  action_name TEXT NOT NULL,
  resource_type TEXT,
  description TEXT,
  is_sensitive BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.security_profile_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.security_profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.security_permissions(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  granted_by UUID REFERENCES auth.users(id),
  conditions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(profile_id, permission_id)
);

CREATE TABLE public.security_user_profiles (
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

-- Ativar RLS
ALTER TABLE public.security_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_profile_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_user_profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas
CREATE POLICY "Security admins can manage profiles" ON public.security_profiles
FOR ALL USING (is_security_admin());

CREATE POLICY "Everyone can view active profiles" ON public.security_profiles
FOR SELECT USING (active = true);

CREATE POLICY "Security admins can manage permissions" ON public.security_permissions
FOR ALL USING (is_security_admin());

CREATE POLICY "Everyone can view permissions" ON public.security_permissions
FOR SELECT USING (true);

CREATE POLICY "Security admins can manage profile permissions" ON public.security_profile_permissions
FOR ALL USING (is_security_admin());

CREATE POLICY "Everyone can view profile permissions" ON public.security_profile_permissions
FOR SELECT USING (true);

CREATE POLICY "Security admins can manage user profiles" ON public.security_user_profiles
FOR ALL USING (is_security_admin());

CREATE POLICY "Users can view own profiles" ON public.security_user_profiles
FOR SELECT USING (user_id = auth.uid() OR is_security_admin());

-- Triggers para updated_at
CREATE TRIGGER update_security_profiles_updated_at
  BEFORE UPDATE ON public.security_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_security_user_profiles_updated_at
  BEFORE UPDATE ON public.security_user_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados padrão
INSERT INTO public.security_profiles (name, display_name, description, level, color, icon, is_system) VALUES
('super_admin', 'Super Admin', 'Acesso total ao sistema', 10, '#dc2626', 'crown', true),
('admin_igreja', 'Admin Igreja', 'Administrador da igreja local', 8, '#ea580c', 'shield', true),
('pastor', 'Pastor', 'Pastor com acesso aos membros', 7, '#7c3aed', 'church', true),
('lider_celula', 'Líder Célula', 'Líder de célula com acesso limitado', 5, '#059669', 'users', true),
('membro', 'Membro', 'Membro comum da igreja', 1, '#0891b2', 'user', true);

-- Inserir permissões
INSERT INTO public.security_permissions (module_name, action_name, description, is_sensitive) VALUES
('pessoas', 'read', 'Ver dados de pessoas', false),
('pessoas', 'create', 'Criar novos registros de pessoas', false),
('pessoas', 'update', 'Editar dados de pessoas', true),
('pessoas', 'delete', 'Excluir registros de pessoas', true),
('pessoas', 'manage', 'Gerenciar completamente pessoas', true),
('celulas', 'read', 'Ver células', false),
('celulas', 'create', 'Criar células', false),
('celulas', 'update', 'Editar células', false),
('celulas', 'delete', 'Excluir células', true),
('celulas', 'manage', 'Gerenciar completamente células', true),
('ensino', 'read', 'Ver ensino e cursos', false),
('ensino', 'create', 'Criar cursos', false),
('ensino', 'update', 'Editar cursos', false),
('ensino', 'delete', 'Excluir cursos', true),
('ensino', 'manage', 'Gerenciar completamente ensino', true),
('admin', 'read', 'Acessar painel administrativo', false),
('admin', 'manage_users', 'Gerenciar usuários', true),
('admin', 'manage_system', 'Gerenciar sistema', true),
('financeiro', 'read', 'Ver dados financeiros', true),
('financeiro', 'create', 'Criar lançamentos financeiros', true),
('financeiro', 'update', 'Editar lançamentos financeiros', true),
('financeiro', 'delete', 'Excluir lançamentos financeiros', true),
('financeiro', 'manage', 'Gerenciar completamente finanças', true),
('comunicacao', 'read', 'Ver comunicações', false),
('comunicacao', 'create', 'Criar comunicações', false),
('comunicacao', 'update', 'Editar comunicações', false),
('comunicacao', 'delete', 'Excluir comunicações', true),
('comunicacao', 'manage', 'Gerenciar completamente comunicações', true),
('agenda', 'read', 'Ver agenda de eventos', false),
('agenda', 'create', 'Criar eventos', false),
('agenda', 'update', 'Editar eventos', false),
('agenda', 'delete', 'Excluir eventos', true),
('agenda', 'manage', 'Gerenciar completamente agenda', true),
('dashboard', 'read', 'Ver dashboard', false),
('dashboard', 'export', 'Exportar dados do dashboard', true),
('portal_aluno', 'read', 'Acessar portal do aluno', false),
('portal_aluno', 'submit', 'Enviar atividades no portal', false);