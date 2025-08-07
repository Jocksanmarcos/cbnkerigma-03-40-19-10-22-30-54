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

-- Função para obter ranking do ensino
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

-- Inserir trilhas DNA básicas
INSERT INTO trilhas_dna (nome, descricao, etapas, nivel_requerido, ordem, icone, cor) VALUES
('Trilha do Novo Convertido', 'Primeiros passos na fé cristã', 
'[
  {"nome": "Identidade em Cristo", "descricao": "Descobrindo quem você é em Cristo", "conteudo": "Estudo sobre identidade cristã"},
  {"nome": "Vida de Oração", "descricao": "Aprendendo a orar", "conteudo": "Fundamentos da oração"},
  {"nome": "Palavra de Deus", "descricao": "Como ler e estudar a Bíblia", "conteudo": "Hermenêutica básica"},
  {"nome": "Comunhão", "descricao": "Importância da igreja local", "conteudo": "Vida em comunidade"},
  {"nome": "Evangelismo", "descricao": "Compartilhando a fé", "conteudo": "Primeiros passos no evangelismo"}
]'::jsonb, 'iniciante', 1, '👶', '#22c55e'),

('Trilha do Discípulo', 'Crescimento espiritual e maturidade', 
'[
  {"nome": "Disciplina Espiritual", "descricao": "Desenvolvendo hábitos cristãos", "conteudo": "Disciplinas fundamentais"},
  {"nome": "Caráter Cristão", "descricao": "Fruto do Espírito", "conteudo": "Desenvolvimento do caráter"},
  {"nome": "Dons Espirituais", "descricao": "Descobrindo seus dons", "conteudo": "Identificação e uso dos dons"},
  {"nome": "Serviço Cristão", "descricao": "Servindo no Reino", "conteudo": "Áreas de ministério"},
  {"nome": "Liderança Servidora", "descricao": "Princípios de liderança cristã", "conteudo": "Fundamentos da liderança"}
]'::jsonb, 'intermediario', 2, '📖', '#3b82f6'),

('Trilha do Líder', 'Preparação para liderança', 
'[
  {"nome": "Visão de Liderança", "descricao": "O chamado para liderar", "conteudo": "Vocação e chamado"},
  {"nome": "Comunicação Eficaz", "descricao": "Habilidades de comunicação", "conteudo": "Técnicas de comunicação"},
  {"nome": "Discipulado", "descricao": "Formando outros discípulos", "conteudo": "Estratégias de discipulado"},
  {"nome": "Gestão de Conflitos", "descricao": "Resolvendo problemas", "conteudo": "Mediação e reconciliação"},
  {"nome": "Multiplicação", "descricao": "Formando novos líderes", "conteudo": "Sucessão e crescimento"}
]'::jsonb, 'avancado', 3, '👑', '#8b5cf6');

-- Inserir badges de ensino
INSERT INTO badges_ensino (nome, descricao, criterios, pontos_recompensa, cor, icon) VALUES
('Primeiro Passo', 'Completou seu primeiro estudo', '{"trilha_etapa": 1}', 50, '#22c55e', '👶'),
('Estudioso', 'Completou 5 estudos', '{"estudos_completos": 5}', 100, '#3b82f6', '📚'),
('Dedicado', 'Completou uma trilha completa', '{"trilha_completa": 1}', 200, '#8b5cf6', '🏆'),
('Multiplicador', 'Formou seu primeiro discípulo', '{"discipulo_formado": 1}', 300, '#f59e0b', '👥'),
('Líder', 'Assumiu posição de liderança', '{"posicao_lideranca": true}', 500, '#ef4444', '👑');

-- RLS policies
ALTER TABLE trilhas_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE progresso_trilhas_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE turmas_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas_ensino ENABLE ROW LEVEL SECURITY;

-- Políticas para trilhas_dna
CREATE POLICY "Qualquer um pode ver trilhas ativas" ON trilhas_dna 
FOR SELECT USING (ativa = true);

CREATE POLICY "Admins podem gerenciar trilhas" ON trilhas_dna 
FOR ALL USING (is_admin_user());

-- Políticas para progresso_trilhas_dna
CREATE POLICY "Usuários podem ver próprio progresso" ON progresso_trilhas_dna 
FOR SELECT USING (
  pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()) OR is_admin_user()
);

CREATE POLICY "Sistema pode inserir progresso" ON progresso_trilhas_dna 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar próprio progresso" ON progresso_trilhas_dna 
FOR UPDATE USING (
  pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()) OR is_admin_user()
);

-- Políticas para turmas_ensino
CREATE POLICY "Qualquer um pode ver turmas" ON turmas_ensino 
FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar turmas" ON turmas_ensino 
FOR ALL USING (is_admin_user());

-- Políticas para matriculas_ensino
CREATE POLICY "Usuários podem ver próprias matrículas" ON matriculas_ensino 
FOR SELECT USING (
  pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()) OR is_admin_user()
);

CREATE POLICY "Sistema pode criar matrículas" ON matriculas_ensino 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar matrículas" ON matriculas_ensino 
FOR ALL USING (is_admin_user());