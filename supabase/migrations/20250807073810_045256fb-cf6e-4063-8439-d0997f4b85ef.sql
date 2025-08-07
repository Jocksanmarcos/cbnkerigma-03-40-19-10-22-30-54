-- GRANDE CONSOLIDAÇÃO DO BANCO DE DADOS KERIGMA HUB
-- Eliminando duplicações e estabelecendo a Fonte Única de Verdade

-- ========================================
-- 1. CONSOLIDAÇÃO DA TABELA PESSOAS
-- ========================================

-- Migrar dados de membros para pessoas (se houver campos únicos)
UPDATE pessoas SET 
  data_batismo = COALESCE(pessoas.data_batismo, (
    SELECT m.data_batismo FROM membros m WHERE m.email = pessoas.email LIMIT 1
  )),
  estado_civil = COALESCE(pessoas.estado_civil, (
    SELECT m.estado_civil FROM membros m WHERE m.email = pessoas.email LIMIT 1
  ))
WHERE EXISTS (SELECT 1 FROM membros WHERE email = pessoas.email);

-- Migrar dados de voluntarios para pessoas
UPDATE pessoas SET 
  observacoes = COALESCE(pessoas.observacoes, '') || CASE 
    WHEN EXISTS (SELECT 1 FROM voluntarios v WHERE v.email = pessoas.email) 
    THEN ' | Voluntário: ' || (SELECT array_to_string(v.areas_interesse, ', ') FROM voluntarios v WHERE v.email = pessoas.email LIMIT 1)
    ELSE ''
  END
WHERE EXISTS (SELECT 1 FROM voluntarios WHERE email = pessoas.email);

-- Adicionar campos necessários à tabela pessoas se não existirem
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS papel_igreja text DEFAULT 'membro_comum';
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS nivel_acesso integer DEFAULT 1;
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS profile_id uuid;

-- Migrar dados administrativos para pessoas
UPDATE pessoas SET 
  papel_igreja = COALESCE((
    SELECT ua.papel FROM usuarios_admin ua WHERE ua.user_id = pessoas.user_id LIMIT 1
  ), 'membro_comum'),
  nivel_acesso = CASE 
    WHEN EXISTS (SELECT 1 FROM usuarios_admin ua WHERE ua.user_id = pessoas.user_id AND ua.papel = 'admin') THEN 5
    WHEN EXISTS (SELECT 1 FROM usuarios_admin ua WHERE ua.user_id = pessoas.user_id AND ua.papel = 'lider') THEN 3
    ELSE 1
  END;

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
  ('education.manage', 'Gerenciar Ensino', 'education', 'manage')
ON CONFLICT (code) DO NOTHING;

-- Associar permissões aos perfis
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
  AND perm.code IN ('people.view', 'people.manage', 'cells.view', 'cells.manage', 'education.view')
ON CONFLICT (profile_id, permission_id) DO NOTHING;

-- Atualizar pessoas com perfis
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

-- Migrar dados de cursos para cursos_ensino
INSERT INTO cursos_ensino (nome, descricao, categoria, nivel, carga_horaria, ativo, material_didatico, pre_requisitos, publico_alvo, emite_certificado)
SELECT nome, descricao, categoria, nivel, carga_horaria, ativo, material_didatico, pre_requisitos, publico_alvo, emite_certificado
FROM cursos
WHERE NOT EXISTS (SELECT 1 FROM cursos_ensino WHERE cursos_ensino.nome = cursos.nome)
ON CONFLICT DO NOTHING;

-- Migrar dados de matriculas para matriculas_ensino
INSERT INTO matriculas_ensino (pessoa_id, curso_id, status, data_matricula, data_conclusao, nota_final, observacoes)
SELECT m.pessoa_id, 
       (SELECT ce.id FROM cursos_ensino ce WHERE ce.nome = (SELECT c.nome FROM cursos c WHERE c.id = m.curso_id LIMIT 1) LIMIT 1),
       m.status, m.data_matricula, m.data_conclusao, m.nota_final, m.observacoes
FROM matriculas m
WHERE NOT EXISTS (SELECT 1 FROM matriculas_ensino WHERE matriculas_ensino.pessoa_id = m.pessoa_id)
ON CONFLICT DO NOTHING;

-- ========================================
-- 4. CRIAR TRIGGERS DE ATUALIZAÇÃO
-- ========================================

-- Trigger para atualizar updated_at nas novas tabelas
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 5. HABILITAR RLS NAS NOVAS TABELAS
-- ========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para profiles
CREATE POLICY "Admins podem gerenciar perfis" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pessoas p 
      JOIN profiles prof ON p.profile_id = prof.id
      WHERE p.user_id = auth.uid() AND prof.code = 'admin'
    )
  );

CREATE POLICY "Qualquer um pode ver perfis ativos" ON profiles
  FOR SELECT USING (active = true);

-- Políticas RLS para permissions
CREATE POLICY "Admins podem gerenciar permissões" ON permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pessoas p 
      JOIN profiles prof ON p.profile_id = prof.id
      WHERE p.user_id = auth.uid() AND prof.code = 'admin'
    )
  );

CREATE POLICY "Qualquer um pode ver permissões" ON permissions
  FOR SELECT USING (true);

-- Políticas RLS para profile_permissions
CREATE POLICY "Admins podem gerenciar permissões de perfil" ON profile_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pessoas p 
      JOIN profiles prof ON p.profile_id = prof.id
      WHERE p.user_id = auth.uid() AND prof.code = 'admin'
    )
  );

CREATE POLICY "Qualquer um pode ver permissões de perfil" ON profile_permissions
  FOR SELECT USING (true);

-- ========================================
-- 6. FUNÇÃO PARA VERIFICAR PERMISSÕES
-- ========================================

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

-- Função para verificar se é admin
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT user_has_permission(auth.uid(), 'admin.manage_system');
$$;