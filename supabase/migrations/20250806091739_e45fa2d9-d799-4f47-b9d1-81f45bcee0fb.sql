-- === ETAPA 1: CRIAÇÃO DO SISTEMA RBAC PROFISSIONAL ===

-- Criar tabela de perfis de acesso
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 50 CHECK (level >= 1 AND level <= 100),
  color TEXT NOT NULL DEFAULT '#6366f1',
  icon TEXT NOT NULL DEFAULT 'Shield',
  active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de permissões
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  subject TEXT NOT NULL,
  resource_type TEXT,
  description TEXT,
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de associação perfil-permissão  
CREATE TABLE IF NOT EXISTS public.profile_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted BOOLEAN NOT NULL DEFAULT true,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  granted_by UUID,
  UNIQUE(profile_id, permission_id)
);

-- Adicionar coluna profile_id na tabela pessoas (se não existir)
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- === ETAPA 2: POPULAR COM PERFIS INICIAIS ===

INSERT INTO public.profiles (name, display_name, description, level, color, icon, is_system) VALUES
('super_admin', 'Super Administrador', 'Acesso total ao sistema', 100, '#ef4444', 'Crown', true),
('admin', 'Administrador', 'Administrador geral da igreja', 90, '#3b82f6', 'Shield', false),
('pastor', 'Pastor', 'Pastor da igreja', 85, '#8b5cf6', 'Crown', false),
('missionario', 'Missionário', 'Pastor missionário', 80, '#f59e0b', 'Globe', false),
('lider_celula', 'Líder de Célula', 'Responsável por células', 60, '#10b981', 'Users', false),
('tesoureiro', 'Tesoureiro', 'Responsável pelas finanças', 70, '#ec4899', 'DollarSign', false),
('aluno', 'Aluno', 'Aluno do portal de ensino', 30, '#6b7280', 'BookOpen', false),
('membro', 'Membro', 'Membro comum da igreja', 20, '#94a3b8', 'User', false)
ON CONFLICT (name) DO NOTHING;

-- === ETAPA 3: CRIAR PERMISSÕES GRANULARES ===

INSERT INTO public.permissions (action, subject, resource_type, description, is_sensitive) VALUES
-- Permissões administrativas
('manage', 'system', null, 'Gerenciar todo o sistema', true),
('manage', 'users', null, 'Gerenciar usuários', true),
('manage', 'security', null, 'Gerenciar segurança e permissões', true),

-- Módulo Financeiro
('read', 'finance', null, 'Visualizar dados financeiros', false),
('create', 'finance', 'transaction', 'Criar transações financeiras', false),
('update', 'finance', 'transaction', 'Editar transações financeiras', false),
('delete', 'finance', 'transaction', 'Excluir transações financeiras', true),
('export', 'finance', 'reports', 'Exportar relatórios financeiros', false),
('approve', 'finance', 'transaction', 'Aprovar transações financeiras', true),

-- Portal de Ensino
('read', 'ensino', null, 'Visualizar portal de ensino', false),
('create', 'ensino', 'course', 'Criar cursos', false),
('update', 'ensino', 'course', 'Editar cursos', false),
('delete', 'ensino', 'course', 'Excluir cursos', true),
('manage', 'ensino', 'students', 'Gerenciar alunos', false),
('grade', 'ensino', 'students', 'Avaliar alunos', false),

-- Gestão de Pessoas
('read', 'pessoas', null, 'Visualizar dados de pessoas', false),
('create', 'pessoas', null, 'Cadastrar pessoas', false),
('update', 'pessoas', null, 'Editar dados de pessoas', false),
('delete', 'pessoas', null, 'Excluir pessoas', true),
('export', 'pessoas', 'data', 'Exportar dados de pessoas', true),

-- Células
('read', 'celulas', null, 'Visualizar células', false),
('create', 'celulas', null, 'Criar células', false),
('update', 'celulas', null, 'Editar células', false),
('delete', 'celulas', null, 'Excluir células', true),
('manage', 'celulas', 'reports', 'Gerenciar relatórios de células', false),

-- Agenda e Eventos
('read', 'agenda', null, 'Visualizar agenda', false),
('create', 'agenda', 'event', 'Criar eventos', false),
('update', 'agenda', 'event', 'Editar eventos', false),
('delete', 'agenda', 'event', 'Excluir eventos', false),

-- Comunicação
('read', 'comunicacao', null, 'Visualizar comunicações', false),
('create', 'comunicacao', 'message', 'Criar mensagens', false),
('send', 'comunicacao', 'notification', 'Enviar notificações', false),

-- Dashboard e Relatórios
('read', 'dashboard', null, 'Visualizar dashboard', false),
('read', 'reports', 'analytics', 'Visualizar relatórios analíticos', false),
('export', 'reports', 'data', 'Exportar relatórios', false),

-- Perfil pessoal (todos devem ter)
('read', 'profile', 'own', 'Visualizar próprio perfil', false),
('update', 'profile', 'own', 'Editar próprio perfil', false)
ON CONFLICT DO NOTHING;

-- === ETAPA 4: CONFIGURAR PERMISSÕES PARA PERFIL TESOUREIRO (EXEMPLO) ===

-- Obter IDs dos perfis e permissões
DO $$
DECLARE
  tesoureiro_id UUID;
  super_admin_id UUID;
  admin_id UUID;
  pastor_id UUID;
  perm_id UUID;
BEGIN
  -- Obter ID do perfil tesoureiro
  SELECT id INTO tesoureiro_id FROM public.profiles WHERE name = 'tesoureiro';
  SELECT id INTO super_admin_id FROM public.profiles WHERE name = 'super_admin';
  SELECT id INTO admin_id FROM public.profiles WHERE name = 'admin';
  SELECT id INTO pastor_id FROM public.profiles WHERE name = 'pastor';
  
  -- Super Admin: todas as permissões
  FOR perm_id IN (SELECT id FROM public.permissions)
  LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id, granted)
    VALUES (super_admin_id, perm_id, true)
    ON CONFLICT (profile_id, permission_id) DO NOTHING;
  END LOOP;
  
  -- Admin: maioria das permissões exceto manage system
  FOR perm_id IN (SELECT id FROM public.permissions WHERE NOT (action = 'manage' AND subject = 'system'))
  LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id, granted)
    VALUES (admin_id, perm_id, true)
    ON CONFLICT (profile_id, permission_id) DO NOTHING;
  END LOOP;
  
  -- Pastor: permissões gerenciais sem finanças sensíveis
  FOR perm_id IN (
    SELECT id FROM public.permissions 
    WHERE NOT (action = 'manage' AND subject = 'system')
    AND NOT (action = 'delete' AND subject = 'finance')
    AND NOT (action = 'export' AND subject = 'pessoas')
  )
  LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id, granted)
    VALUES (pastor_id, perm_id, true)
    ON CONFLICT (profile_id, permission_id) DO NOTHING;
  END LOOP;
  
  -- Tesoureiro: permissões financeiras completas + básicas
  FOR perm_id IN (
    SELECT id FROM public.permissions 
    WHERE (subject = 'finance' OR subject = 'dashboard' OR subject = 'profile')
    OR (action = 'read' AND subject IN ('pessoas', 'reports'))
  )
  LOOP
    INSERT INTO public.profile_permissions (profile_id, permission_id, granted)
    VALUES (tesoureiro_id, perm_id, true)
    ON CONFLICT (profile_id, permission_id) DO NOTHING;
  END LOOP;
  
END $$;

-- === ETAPA 5: HABILITAR RLS ===

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Admins podem gerenciar perfis" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile_permissions pp
      JOIN public.permissions p ON pp.permission_id = p.id
      JOIN public.pessoas pe ON pe.profile_id = pp.profile_id
      WHERE pe.user_id = auth.uid()
      AND p.action = 'manage' AND p.subject = 'security'
      AND pp.granted = true
    )
  );

CREATE POLICY "Todos podem ver perfis ativos" ON public.profiles
  FOR SELECT USING (active = true);

-- Políticas para permissions
CREATE POLICY "Admins podem ver todas as permissões" ON public.permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profile_permissions pp
      JOIN public.permissions p ON pp.permission_id = p.id
      JOIN public.pessoas pe ON pe.profile_id = pp.profile_id
      WHERE pe.user_id = auth.uid()
      AND p.action = 'manage' AND p.subject = 'security'
      AND pp.granted = true
    )
  );

-- Políticas para profile_permissions
CREATE POLICY "Admins podem gerenciar associações" ON public.profile_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profile_permissions pp
      JOIN public.permissions p ON pp.permission_id = p.id
      JOIN public.pessoas pe ON pe.profile_id = pp.profile_id
      WHERE pe.user_id = auth.uid()
      AND p.action = 'manage' AND p.subject = 'security'
      AND pp.granted = true
    )
  );

-- Função para verificar permissões de usuário
CREATE OR REPLACE FUNCTION public.user_has_permission(
  user_uuid UUID,
  action_name TEXT,
  subject_name TEXT,
  resource_type_param TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pessoas pe
    JOIN profile_permissions pp ON pe.profile_id = pp.profile_id
    JOIN permissions p ON pp.permission_id = p.id
    WHERE pe.user_id = user_uuid
    AND pp.granted = true
    AND p.action = action_name
    AND p.subject = subject_name
    AND (resource_type_param IS NULL OR p.resource_type = resource_type_param)
  );
END;
$$;