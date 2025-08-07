-- Verificar e ajustar apenas as tabelas que precisam ser alteradas
-- Primeiro, adicionar colunas faltantes nas tabelas existentes

-- Adicionar colunas à security_profiles se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_profiles' AND column_name = 'display_name') THEN
        ALTER TABLE public.security_profiles ADD COLUMN display_name TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_profiles' AND column_name = 'color') THEN
        ALTER TABLE public.security_profiles ADD COLUMN color TEXT NOT NULL DEFAULT '#6366f1';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_profiles' AND column_name = 'icon') THEN
        ALTER TABLE public.security_profiles ADD COLUMN icon TEXT NOT NULL DEFAULT 'shield';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_profiles' AND column_name = 'is_system') THEN
        ALTER TABLE public.security_profiles ADD COLUMN is_system BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Adicionar colunas à security_permissions se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_permissions' AND column_name = 'is_sensitive') THEN
        ALTER TABLE public.security_permissions ADD COLUMN is_sensitive BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Adicionar colunas à security_profile_permissions se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_profile_permissions' AND column_name = 'granted_at') THEN
        ALTER TABLE public.security_profile_permissions ADD COLUMN granted_at TIMESTAMP WITH TIME ZONE DEFAULT now();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'security_profile_permissions' AND column_name = 'granted_by') THEN
        ALTER TABLE public.security_profile_permissions ADD COLUMN granted_by UUID REFERENCES auth.users(id);
    END IF;
END $$;

-- Atualizar display_name onde estiver null
UPDATE public.security_profiles SET display_name = name WHERE display_name IS NULL;

-- Tornar display_name NOT NULL após atualizar
ALTER TABLE public.security_profiles ALTER COLUMN display_name SET NOT NULL;

-- Inserir perfis padrão se não existirem
INSERT INTO public.security_profiles (name, display_name, description, level, color, icon, is_system) VALUES
('super_admin', 'Super Admin', 'Acesso total ao sistema', 10, '#dc2626', 'crown', true),
('admin_igreja', 'Admin Igreja', 'Administrador da igreja local', 8, '#ea580c', 'shield', true),
('pastor', 'Pastor', 'Pastor com acesso aos membros', 7, '#7c3aed', 'church', true),
('lider_celula', 'Líder Célula', 'Líder de célula com acesso limitado', 5, '#059669', 'users', true),
('membro', 'Membro', 'Membro comum da igreja', 1, '#0891b2', 'user', true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon,
  is_system = EXCLUDED.is_system;

-- Inserir permissões se não existirem
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
('portal_aluno', 'submit', 'Enviar atividades no portal', false)
ON CONFLICT (module_name, action_name, COALESCE(resource_type, '')) DO UPDATE SET
  description = EXCLUDED.description,
  is_sensitive = EXCLUDED.is_sensitive;