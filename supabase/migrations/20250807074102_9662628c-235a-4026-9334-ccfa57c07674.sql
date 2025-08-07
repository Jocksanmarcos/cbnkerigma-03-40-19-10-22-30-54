-- GRANDE CONSOLIDAÇÃO DO BANCO DE DADOS KERIGMA HUB - VERSÃO CORRIGIDA
-- Eliminando duplicações e estabelecendo a Fonte Única de Verdade

-- ========================================
-- 1. CONSOLIDAÇÃO SEGURA DA TABELA PESSOAS
-- ========================================

-- Adicionar campos necessários à tabela pessoas se não existirem
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS papel_igreja text DEFAULT 'membro_comum';
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS nivel_acesso integer DEFAULT 1;
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS profile_id uuid;

-- Migrar dados administrativos de usuarios_admin para pessoas
UPDATE pessoas SET 
  papel_igreja = COALESCE((
    SELECT ua.papel FROM usuarios_admin ua WHERE ua.user_id = pessoas.user_id LIMIT 1
  ), 'membro_comum'),
  nivel_acesso = CASE 
    WHEN EXISTS (SELECT 1 FROM usuarios_admin ua WHERE ua.user_id = pessoas.user_id AND ua.papel = 'admin') THEN 5
    WHEN EXISTS (SELECT 1 FROM usuarios_admin ua WHERE ua.user_id = pessoas.user_id AND ua.papel = 'lider') THEN 3
    ELSE 1
  END;

-- Migrar dados de voluntarios para pessoas (apenas observações)
UPDATE pessoas SET 
  observacoes = COALESCE(pessoas.observacoes, '') || CASE 
    WHEN EXISTS (SELECT 1 FROM voluntarios v WHERE v.email = pessoas.email) 
    THEN ' | Voluntário registrado no sistema'
    ELSE ''
  END
WHERE EXISTS (SELECT 1 FROM voluntarios WHERE email = pessoas.email);

-- ========================================
-- 2. NOVA ARQUITETURA RBAC DEFINITIVA
-- ========================================

-- Criar tabela de perfis (profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de permissões (permissions)
CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  description text,
  module text NOT NULL,
  action text NOT NULL,
  resource_type text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de permissões por perfil (profile_permissions)
CREATE TABLE IF NOT EXISTS profile_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  granted boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(profile_id, permission_id)
);

-- Inserir perfis básicos
INSERT INTO profiles (code, name, description, level) VALUES
  ('admin', 'Administrador', 'Acesso completo ao sistema', 5),
  ('lider', 'Líder', 'Acesso a funções de liderança', 3),
  ('membro', 'Membro', 'Acesso básico de membro', 1),
  ('discipulador', 'Discipulador', 'Acesso ao portal de ensino', 2),
  ('coordenador', 'Coordenador', 'Coordenação de áreas específicas', 4)
ON CONFLICT (code) DO NOTHING;

-- Inserir permissões básicas
INSERT INTO permissions (code, name, module, action) VALUES
  ('admin.manage_system', 'Gerenciar Sistema', 'admin', 'manage'),
  ('people.view', 'Ver Pessoas', 'people', 'view'),
  ('people.manage', 'Gerenciar Pessoas', 'people', 'manage'),
  ('cells.view', 'Ver Células', 'cells', 'view'),
  ('cells.manage', 'Gerenciar Células', 'cells', 'manage'),
  ('finance.view', 'Ver Financeiro', 'finance', 'view'),
  ('finance.manage', 'Gerenciar Financeiro', 'finance', 'manage'),
  ('education.view', 'Ver Ensino', 'education', 'view'),
  ('education.manage', 'Gerenciar Ensino', 'education', 'manage'),
  ('reports.view', 'Ver Relatórios', 'reports', 'view'),
  ('events.view', 'Ver Eventos', 'events', 'view'),
  ('events.manage', 'Gerenciar Eventos', 'events', 'manage')
ON CONFLICT (code) DO NOTHING;

-- Associar todas as permissões aos admins
INSERT INTO profile_permissions (profile_id, permission_id, granted)
SELECT p.id, perm.id, true
FROM profiles p
CROSS JOIN permissions perm
WHERE p.code = 'admin'
ON CONFLICT (profile_id, permission_id) DO NOTHING;

-- Permissões para líderes
INSERT INTO profile_permissions (profile_id, permission_id, granted)
SELECT p.id, perm.id, true
FROM profiles p
CROSS JOIN permissions perm
WHERE p.code = 'lider' 
  AND perm.code IN ('people.view', 'people.manage', 'cells.view', 'cells.manage', 'education.view', 'reports.view', 'events.view')
ON CONFLICT (profile_id, permission_id) DO NOTHING;

-- Permissões para discipuladores
INSERT INTO profile_permissions (profile_id, permission_id, granted)
SELECT p.id, perm.id, true
FROM profiles p
CROSS JOIN permissions perm
WHERE p.code = 'discipulador' 
  AND perm.code IN ('education.view', 'education.manage', 'people.view')
ON CONFLICT (profile_id, permission_id) DO NOTHING;

-- Permissões para membros
INSERT INTO profile_permissions (profile_id, permission_id, granted)
SELECT p.id, perm.id, true
FROM profiles p
CROSS JOIN permissions perm
WHERE p.code = 'membro' 
  AND perm.code IN ('events.view')
ON CONFLICT (profile_id, permission_id) DO NOTHING;

-- Atualizar pessoas com perfis baseado no papel_igreja
UPDATE pessoas SET profile_id = (
  SELECT id FROM profiles WHERE code = 
    CASE 
      WHEN pessoas.papel_igreja = 'admin' THEN 'admin'
      WHEN pessoas.papel_igreja = 'lider' THEN 'lider'
      WHEN pessoas.papel_igreja = 'discipulador' THEN 'discipulador'
      WHEN pessoas.papel_igreja = 'coordenador' THEN 'coordenador'
      ELSE 'membro'
    END
  LIMIT 1
);

-- ========================================
-- 3. CONSOLIDAÇÃO DE TABELAS DE MÓDULOS
-- ========================================

-- Migrar dados de cursos para cursos_ensino se a tabela cursos existir
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cursos') THEN
    INSERT INTO cursos_ensino (nome, descricao, categoria, nivel, carga_horaria, ativo, material_didatico, pre_requisitos, publico_alvo, emite_certificado)
    SELECT nome, descricao, categoria, nivel, carga_horaria, ativo, material_didatico, pre_requisitos, publico_alvo, emite_certificado
    FROM cursos
    WHERE NOT EXISTS (SELECT 1 FROM cursos_ensino WHERE cursos_ensino.nome = cursos.nome)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Migrar dados de matriculas para matriculas_ensino se a tabela matriculas existir
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'matriculas') THEN
    INSERT INTO matriculas_ensino (pessoa_id, curso_id, status, data_matricula, data_conclusao, nota_final, observacoes)
    SELECT m.pessoa_id, 
           ce.id,
           m.status, m.data_matricula, m.data_conclusao, m.nota_final, m.observacoes
    FROM matriculas m
    JOIN cursos c ON c.id = m.curso_id
    JOIN cursos_ensino ce ON ce.nome = c.nome
    WHERE NOT EXISTS (SELECT 1 FROM matriculas_ensino WHERE matriculas_ensino.pessoa_id = m.pessoa_id AND matriculas_ensino.curso_id = ce.id)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ========================================
-- 4. HABILITAR RLS NAS NOVAS TABELAS
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
DROP POLICY IF EXISTS "Admins podem gerenciar perfis" ON profiles;
CREATE POLICY "Admins podem gerenciar perfis" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pessoas p 
      JOIN profiles prof ON p.profile_id = prof.id
      WHERE p.user_id = auth.uid() AND prof.code = 'admin'
    )
  );

DROP POLICY IF EXISTS "Qualquer um pode ver perfis ativos" ON profiles;
CREATE POLICY "Qualquer um pode ver perfis ativos" ON profiles
  FOR SELECT USING (active = true);

-- Políticas RLS para permissions
DROP POLICY IF EXISTS "Admins podem gerenciar permissões" ON permissions;
CREATE POLICY "Admins podem gerenciar permissões" ON permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pessoas p 
      JOIN profiles prof ON p.profile_id = prof.id
      WHERE p.user_id = auth.uid() AND prof.code = 'admin'
    )
  );

DROP POLICY IF EXISTS "Qualquer um pode ver permissões" ON permissions;
CREATE POLICY "Qualquer um pode ver permissões" ON permissions
  FOR SELECT USING (true);

-- Políticas RLS para profile_permissions
DROP POLICY IF EXISTS "Admins podem gerenciar permissões de perfil" ON profile_permissions;
CREATE POLICY "Admins podem gerenciar permissões de perfil" ON profile_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pessoas p 
      JOIN profiles prof ON p.profile_id = prof.id
      WHERE p.user_id = auth.uid() AND prof.code = 'admin'
    )
  );

DROP POLICY IF EXISTS "Qualquer um pode ver permissões de perfil" ON profile_permissions;
CREATE POLICY "Qualquer um pode ver permissões de perfil" ON profile_permissions
  FOR SELECT USING (true);

-- ========================================
-- 5. FUNÇÕES PARA VERIFICAR PERMISSÕES
-- ========================================

-- Função principal para verificar permissões
CREATE OR REPLACE FUNCTION user_has_permission(user_uuid uuid, permission_code text)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pessoas pe
    JOIN profiles prof ON pe.profile_id = prof.id
    JOIN profile_permissions pp ON prof.id = pp.profile_id
    JOIN permissions perm ON pp.permission_id = perm.id
    WHERE pe.user_id = user_uuid
      AND perm.code = permission_code
      AND pp.granted = true
      AND prof.active = true
  );
END;
$$;

-- Função para verificar se é admin (atualizada)
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_has_permission(auth.uid(), 'admin.manage_system');
$$;

-- Função para obter o perfil do usuário
CREATE OR REPLACE FUNCTION get_user_profile()
RETURNS text
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT prof.code
    FROM pessoas p
    JOIN profiles prof ON p.profile_id = prof.id
    WHERE p.user_id = auth.uid()
    LIMIT 1
  );
END;
$$;

-- ========================================
-- 6. TRIGGER PARA UPDATED_AT
-- ========================================

-- Trigger para atualizar updated_at nas novas tabelas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();