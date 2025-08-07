-- Corrigir problemas de segurança das funções
-- Recriar função verificar_permissao com search_path seguro
CREATE OR REPLACE FUNCTION verificar_permissao(
  user_email TEXT,
  modulo_codigo modulo_sistema,
  acao_desejada acao_permissao
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  tem_permissao BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.pessoas pe
    JOIN public.papeis_igreja pa ON pa.codigo = pe.papel_igreja
    JOIN public.permissoes_sistema ps ON ps.papel_id = pa.id
    JOIN public.modulos_sistema ms ON ms.id = ps.modulo_id
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

-- Recriar função obter_papel_usuario com search_path seguro
CREATE OR REPLACE FUNCTION obter_papel_usuario(user_email TEXT)
RETURNS papel_igreja
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  papel_resultado papel_igreja;
BEGIN
  SELECT pe.papel_igreja INTO papel_resultado
  FROM public.pessoas pe
  WHERE pe.email = user_email
  LIMIT 1;
  
  RETURN COALESCE(papel_resultado, 'membro_comum'::papel_igreja);
END;
$$;

-- Inserir permissões básicas para todos os papéis
DO $$
DECLARE
  papel_rec RECORD;
  modulo_rec RECORD;
BEGIN
  -- Para cada papel e módulo, inserir permissões básicas conforme especificado
  
  -- Membro comum - Portal do Aluno
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, 'visualizar'::acao_permissao
  FROM papeis_igreja p, modulos_sistema m 
  WHERE p.codigo = 'membro_comum' AND m.codigo = 'portal_aluno'
  ON CONFLICT DO NOTHING;

  -- Novo convertido - Portal do Aluno (limitado)
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao, condicoes) 
  SELECT p.id, m.id, 'visualizar'::acao_permissao, '{"trilha": "inicial"}'::jsonb
  FROM papeis_igreja p, modulos_sistema m 
  WHERE p.codigo = 'novo_convertido' AND m.codigo = 'portal_aluno'
  ON CONFLICT DO NOTHING;

  -- Aluno - Portal do Aluno e Ensino
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, 'visualizar'::acao_permissao
  FROM papeis_igreja p, modulos_sistema m 
  WHERE p.codigo = 'aluno' AND m.codigo IN ('portal_aluno', 'ensino')
  ON CONFLICT DO NOTHING;

  -- Discipulador - Pessoas (limitado), Portal do Aluno
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao, condicoes) 
  SELECT p.id, m.id, 'visualizar'::acao_permissao, '{"scope": "discipulos"}'::jsonb
  FROM papeis_igreja p, modulos_sistema m 
  WHERE p.codigo = 'discipulador' AND m.codigo = 'pessoas'
  ON CONFLICT DO NOTHING;

  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, 'visualizar'::acao_permissao
  FROM papeis_igreja p, modulos_sistema m 
  WHERE p.codigo = 'discipulador' AND m.codigo = 'portal_aluno'
  ON CONFLICT DO NOTHING;

  -- Líder de Célula - Células, Pessoas (limitado)
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, a::acao_permissao
  FROM papeis_igreja p, modulos_sistema m, 
  UNNEST(ARRAY['visualizar', 'editar']) AS a
  WHERE p.codigo = 'lider_celula' AND m.codigo = 'celulas'
  ON CONFLICT DO NOTHING;

  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao, condicoes) 
  SELECT p.id, m.id, 'visualizar'::acao_permissao, '{"scope": "celula"}'::jsonb
  FROM papeis_igreja p, modulos_sistema m 
  WHERE p.codigo = 'lider_celula' AND m.codigo = 'pessoas'
  ON CONFLICT DO NOTHING;

  -- Supervisor Regional - Células, Pessoas, Ensino, Dashboard
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, a::acao_permissao
  FROM papeis_igreja p, modulos_sistema m, 
  UNNEST(ARRAY['visualizar', 'editar', 'aprovar']) AS a
  WHERE p.codigo = 'supervisor_regional' AND m.codigo IN ('celulas', 'pessoas', 'ensino', 'dashboard_estrategico')
  ON CONFLICT DO NOTHING;

  -- Tesoureiro - Apenas Finanças
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, a::acao_permissao
  FROM papeis_igreja p, modulos_sistema m, 
  UNNEST(ARRAY['visualizar', 'criar', 'editar', 'exportar']) AS a
  WHERE p.codigo = 'tesoureiro' AND m.codigo = 'financas'
  ON CONFLICT DO NOTHING;

  -- Secretário - Pessoas, Agenda
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, a::acao_permissao
  FROM papeis_igreja p, modulos_sistema m, 
  UNNEST(ARRAY['visualizar', 'criar', 'editar']) AS a
  WHERE p.codigo = 'secretario' AND m.codigo IN ('pessoas', 'agenda')
  ON CONFLICT DO NOTHING;

  -- Coordenador de Agenda - Agenda, Escalas
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, a::acao_permissao
  FROM papeis_igreja p, modulos_sistema m, 
  UNNEST(ARRAY['visualizar', 'criar', 'editar', 'gerenciar']) AS a
  WHERE p.codigo = 'coordenador_agenda' AND m.codigo IN ('agenda', 'escalas')
  ON CONFLICT DO NOTHING;

  -- Coordenador de Ensino - Ensino, Pessoas (progresso), Dashboard
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, a::acao_permissao
  FROM papeis_igreja p, modulos_sistema m, 
  UNNEST(ARRAY['visualizar', 'criar', 'editar', 'gerenciar']) AS a
  WHERE p.codigo = 'coordenador_ensino' AND m.codigo IN ('ensino', 'dashboard_estrategico')
  ON CONFLICT DO NOTHING;

  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao, condicoes) 
  SELECT p.id, m.id, 'visualizar'::acao_permissao, '{"scope": "progresso_ensino"}'::jsonb
  FROM papeis_igreja p, modulos_sistema m 
  WHERE p.codigo = 'coordenador_ensino' AND m.codigo = 'pessoas'
  ON CONFLICT DO NOTHING;

  -- Comunicação - Comunicação
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, a::acao_permissao
  FROM papeis_igreja p, modulos_sistema m, 
  UNNEST(ARRAY['visualizar', 'criar', 'editar', 'gerenciar']) AS a
  WHERE p.codigo = 'comunicacao' AND m.codigo = 'comunicacao'
  ON CONFLICT DO NOTHING;

  -- Administrador Geral - Todos os módulos, todas as ações
  INSERT INTO permissoes_sistema (papel_id, modulo_id, acao) 
  SELECT p.id, m.id, a::acao_permissao
  FROM papeis_igreja p, modulos_sistema m, 
  UNNEST(ARRAY['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar', 'administrar']) AS a
  WHERE p.codigo = 'administrador_geral'
  ON CONFLICT DO NOTHING;

  -- Visitante externo - Sem permissões específicas (apenas público)
  
END $$;