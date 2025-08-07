-- Criar enum para papéis da igreja
CREATE TYPE papel_igreja AS ENUM (
  'membro_comum',
  'novo_convertido', 
  'aluno',
  'discipulador',
  'lider_celula',
  'supervisor_regional',
  'coordenador_ensino',
  'tesoureiro',
  'secretario',
  'coordenador_agenda',
  'comunicacao',
  'administrador_geral',
  'visitante_externo'
);

-- Criar enum para módulos do sistema
CREATE TYPE modulo_sistema AS ENUM (
  'pessoas',
  'ensino', 
  'celulas',
  'financas',
  'agenda',
  'comunicacao',
  'portal_aluno',
  'dashboard_estrategico',
  'escalas',
  'galeria',
  'patrimonio',
  'missoes'
);

-- Criar enum para ações/permissões
CREATE TYPE acao_permissao AS ENUM (
  'visualizar',
  'criar',
  'editar',
  'excluir',
  'aprovar',
  'exportar',
  'gerenciar',
  'administrar'
);

-- Criar tabela de papéis
CREATE TABLE papeis_igreja (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo papel_igreja NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  nivel_hierarquia INTEGER NOT NULL DEFAULT 1,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de módulos
CREATE TABLE modulos_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo modulo_sistema NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  icone TEXT,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de permissões granulares
CREATE TABLE permissoes_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  papel_id UUID REFERENCES papeis_igreja(id) ON DELETE CASCADE,
  modulo_id UUID REFERENCES modulos_sistema(id) ON DELETE CASCADE,
  acao acao_permissao NOT NULL,
  condicoes JSONB DEFAULT '{}',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(papel_id, modulo_id, acao)
);

-- Atualizar tabela pessoas para incluir papel
ALTER TABLE pessoas ADD COLUMN papel_igreja papel_igreja DEFAULT 'membro_comum';

-- Inserir dados iniciais dos papéis
INSERT INTO papeis_igreja (codigo, nome, descricao, nivel_hierarquia) VALUES
('membro_comum', 'Membro Comum', 'Membro regular da igreja', 1),
('novo_convertido', 'Novo Convertido', 'Pessoa recém convertida', 1),
('aluno', 'Aluno', 'Aluno do ensino', 2),
('discipulador', 'Discipulador', 'Responsável por discipular novos membros', 3),
('lider_celula', 'Líder de Célula', 'Líder responsável por uma célula', 4),
('supervisor_regional', 'Supervisor Regional', 'Supervisor de múltiplas células', 5),
('coordenador_ensino', 'Coordenador de Ensino', 'Coordenador da área de ensino', 5),
('tesoureiro', 'Tesoureiro', 'Responsável pelas finanças', 5),
('secretario', 'Secretário(a)', 'Responsável pela secretaria', 4),
('coordenador_agenda', 'Coordenador de Agenda', 'Responsável pela agenda e eventos', 4),
('comunicacao', 'Comunicação', 'Equipe de comunicação', 4),
('administrador_geral', 'Administrador Geral', 'Acesso total ao sistema', 10),
('visitante_externo', 'Visitante Externo', 'Visitante com acesso limitado', 0);

-- Inserir dados iniciais dos módulos
INSERT INTO modulos_sistema (codigo, nome, descricao, icone, ordem) VALUES
('pessoas', 'Pessoas', 'Gestão de membros e visitantes', 'Users', 1),
('ensino', 'Ensino', 'Cursos e educação cristã', 'GraduationCap', 2),
('celulas', 'Células', 'Gestão de células', 'Home', 3),
('financas', 'Finanças', 'Controle financeiro', 'DollarSign', 4),
('agenda', 'Agenda', 'Eventos e programações', 'Calendar', 5),
('comunicacao', 'Comunicação', 'Avisos e notificações', 'MessageCircle', 6),
('portal_aluno', 'Portal do Aluno', 'Portal educacional', 'BookOpen', 7),
('dashboard_estrategico', 'Dashboard Estratégico', 'Visão geral e indicadores', 'BarChart3', 8),
('escalas', 'Escalas', 'Escalas de voluntários', 'Clock', 9),
('galeria', 'Galeria', 'Fotos e eventos', 'Image', 10),
('patrimonio', 'Patrimônio', 'Gestão de bens', 'Package', 11),
('missoes', 'Missões', 'Trabalho missionário', 'Globe', 12);

-- Inserir permissões para cada papel (amostra das principais)

-- Membro comum - Portal do Aluno
INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
SELECT p.id, m.id, 'visualizar'::acao_permissao
FROM papeis_igreja p, modulos_sistema m 
WHERE p.codigo = 'membro_comum' AND m.codigo = 'portal_aluno';

-- Novo convertido - Portal do Aluno (limitado)
INSERT INTO permissoes_sistema (papel_id, modulo_id, acao, condicoes) 
SELECT p.id, m.id, 'visualizar'::acao_permissao, '{"trilha": "inicial"}'::jsonb
FROM papeis_igreja p, modulos_sistema m 
WHERE p.codigo = 'novo_convertido' AND m.codigo = 'portal_aluno';

-- Discipulador - Pessoas (limitado), Portal do Aluno
INSERT INTO permissoes_sistema (papel_id, modulo_id, acao, condicoes) 
SELECT p.id, m.id, 'visualizar'::acao_permissao, '{"scope": "discipulos"}'::jsonb
FROM papeis_igreja p, modulos_sistema m 
WHERE p.codigo = 'discipulador' AND m.codigo = 'pessoas';

INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
SELECT p.id, m.id, 'visualizar'::acao_permissao
FROM papeis_igreja p, modulos_sistema m 
WHERE p.codigo = 'discipulador' AND m.codigo = 'portal_aluno';

-- Líder de Célula - Células, Pessoas (limitado)
INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
SELECT p.id, m.id, a::acao_permissao
FROM papeis_igreja p, modulos_sistema m, 
UNNEST(ARRAY['visualizar', 'editar']) AS a
WHERE p.codigo = 'lider_celula' AND m.codigo = 'celulas';

INSERT INTO permissoes_sistema (papel_id, modulo_id, acao, condicoes) 
SELECT p.id, m.id, 'visualizar'::acao_permissao, '{"scope": "celula"}'::jsonb
FROM papeis_igreja p, modulos_sistema m 
WHERE p.codigo = 'lider_celula' AND m.codigo = 'pessoas';

-- Tesoureiro - Apenas Finanças
INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
SELECT p.id, m.id, a::acao_permissao
FROM papeis_igreja p, modulos_sistema m, 
UNNEST(ARRAY['visualizar', 'criar', 'editar', 'exportar']) AS a
WHERE p.codigo = 'tesoureiro' AND m.codigo = 'financas';

-- Administrador Geral - Todos os módulos, todas as ações
INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
SELECT p.id, m.id, a::acao_permissao
FROM papeis_igreja p, modulos_sistema m, 
UNNEST(ARRAY['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar', 'administrar']) AS a
WHERE p.codigo = 'administrador_geral';

-- Secretário - Pessoas, Agenda
INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
SELECT p.id, m.id, a::acao_permissao
FROM papeis_igreja p, modulos_sistema m, 
UNNEST(ARRAY['visualizar', 'criar', 'editar']) AS a
WHERE p.codigo = 'secretario' AND m.codigo IN ('pessoas', 'agenda');

-- Coordenador de Ensino - Ensino, Pessoas (ver progresso), Dashboard
INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
SELECT p.id, m.id, a::acao_permissao
FROM papeis_igreja p, modulos_sistema m, 
UNNEST(ARRAY['visualizar', 'criar', 'editar', 'gerenciar']) AS a
WHERE p.codigo = 'coordenador_ensino' AND m.codigo = 'ensino';

INSERT INTO permissoes_sistema (papel_id, modulo_id, acao, condicoes) 
SELECT p.id, m.id, 'visualizar'::acao_permissao, '{"scope": "progresso_ensino"}'::jsonb
FROM papeis_igreja p, modulos_sistema m 
WHERE p.codigo = 'coordenador_ensino' AND m.codigo = 'pessoas';

-- Função para verificar permissões
CREATE OR REPLACE FUNCTION verificar_permissao(
  user_email TEXT,
  modulo_codigo modulo_sistema,
  acao_desejada acao_permissao
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  tem_permissao BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM pessoas pe
    JOIN papeis_igreja pa ON pa.codigo = pe.papel_igreja
    JOIN permissoes_sistema ps ON ps.papel_id = pa.id
    JOIN modulos_sistema ms ON ms.id = ps.modulo_id
    WHERE pe.email = user_email
      AND ms.codigo = modulo_codigo
      AND ps.acao = acao_desejada
      AND ps.ativo = TRUE
      AND pa.ativo = TRUE
      AND ms.ativo = TRUE
  ) INTO tem_permissao;
  
  RETURN tem_permissao;
END;
$$;

-- Função para obter papel do usuário por email
CREATE OR REPLACE FUNCTION obter_papel_usuario(user_email TEXT)
RETURNS papel_igreja
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  papel_resultado papel_igreja;
BEGIN
  SELECT pe.papel_igreja INTO papel_resultado
  FROM pessoas pe
  WHERE pe.email = user_email
  LIMIT 1;
  
  RETURN COALESCE(papel_resultado, 'membro_comum'::papel_igreja);
END;
$$;

-- RLS para tabelas de permissões
ALTER TABLE papeis_igreja ENABLE ROW LEVEL SECURITY;
ALTER TABLE modulos_sistema ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissoes_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode ver papéis ativos" ON papeis_igreja
  FOR SELECT USING (ativo = true);

CREATE POLICY "Qualquer um pode ver módulos ativos" ON modulos_sistema
  FOR SELECT USING (ativo = true);

CREATE POLICY "Admins podem gerenciar permissões" ON permissoes_sistema
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM pessoas 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
        AND papel_igreja = 'administrador_geral'
    )
  );

CREATE POLICY "Usuários podem ver próprias permissões" ON permissoes_sistema
  FOR SELECT USING (
    papel_id IN (
      SELECT pa.id 
      FROM pessoas pe
      JOIN papeis_igreja pa ON pa.codigo = pe.papel_igreja
      WHERE pe.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_papeis_igreja_updated_at
  BEFORE UPDATE ON papeis_igreja
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modulos_sistema_updated_at
  BEFORE UPDATE ON modulos_sistema
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();