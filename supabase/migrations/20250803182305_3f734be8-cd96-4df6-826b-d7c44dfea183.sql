-- Remover função existente para recriá-la
DROP FUNCTION IF EXISTS obter_ranking_ensino();

-- Criar tabelas para o sistema de trilhas DNA
CREATE TABLE IF NOT EXISTS trilhas_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  etapas JSONB NOT NULL DEFAULT '[]',
  nivel_requerido TEXT DEFAULT 'iniciante',
  ordem INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  icone TEXT DEFAULT '🎯',
  cor TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de progresso nas trilhas DNA
CREATE TABLE IF NOT EXISTS progresso_trilhas_dna (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  trilha_id UUID NOT NULL REFERENCES trilhas_dna(id) ON DELETE CASCADE,
  etapa_atual INTEGER DEFAULT 1,
  etapas_concluidas JSONB DEFAULT '[]',
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  status TEXT DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'pausado', 'cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pessoa_id, trilha_id)
);

-- Tabela para turmas de ensino
CREATE TABLE IF NOT EXISTS turmas_ensino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_turma TEXT NOT NULL,
  curso_id UUID NOT NULL REFERENCES cursos_ensino(id) ON DELETE CASCADE,
  instrutor_id UUID REFERENCES pessoas(id),
  data_inicio DATE NOT NULL,
  data_fim DATE,
  horario_inicio TIME,
  horario_fim TIME,
  dias_semana TEXT[] DEFAULT '{}',
  local TEXT,
  capacidade_maxima INTEGER DEFAULT 30,
  status TEXT DEFAULT 'planejada' CHECK (status IN ('planejada', 'em_andamento', 'concluida', 'cancelada')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para matrículas no ensino
CREATE TABLE IF NOT EXISTS matriculas_ensino (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES turmas_ensino(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'matriculado' CHECK (status IN ('matriculado', 'cursando', 'concluido', 'cancelado', 'transferido')),
  data_matricula DATE DEFAULT CURRENT_DATE,
  data_inicio_curso DATE,
  data_conclusao DATE,
  nota_final NUMERIC(4,2),
  frequencia_percentual NUMERIC(5,2) DEFAULT 0,
  certificado_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(pessoa_id, turma_id)
);

-- Recriar função para obter ranking do ensino
CREATE OR REPLACE FUNCTION obter_ranking_ensino()
RETURNS TABLE (
  pessoa_id UUID,
  nome TEXT,
  total_pontos INTEGER,
  badges_count INTEGER,
  cursos_concluidos INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.nome_completo,
    COALESCE(SUM(ce.pontos_ganhos), 0)::INTEGER as total_pontos,
    COUNT(DISTINCT ce.badge_id)::INTEGER as badges_count,
    COUNT(DISTINCT CASE WHEN me.status = 'concluido' THEN me.id END)::INTEGER as cursos_concluidos
  FROM pessoas p
  LEFT JOIN conquistas_ensino ce ON p.id = ce.pessoa_id
  LEFT JOIN matriculas_ensino me ON p.id = me.pessoa_id
  GROUP BY p.id, p.nome_completo
  HAVING COALESCE(SUM(ce.pontos_ganhos), 0) > 0
  ORDER BY total_pontos DESC, badges_count DESC, cursos_concluidos DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;