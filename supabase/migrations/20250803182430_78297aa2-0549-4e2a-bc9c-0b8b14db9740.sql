-- Continuar com RLS policies e dados iniciais

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

-- Inserir trilhas DNA básicas
INSERT INTO trilhas_dna (nome, descricao, etapas, nivel_requerido, ordem, icone, cor) VALUES
('Trilha do Novo Convertido', 'Primeiros passos na fé cristã', 
'[
  {"nome": "Identidade em Cristo", "descricao": "Descobrindo quem você é em Cristo", "conteudo": "Estudo sobre identidade cristã"},
  {"nome": "Vida de Oração", "descricao": "Aprendendo a orar", "conteudo": "Fundamentos da oração"},
  {"nome": "Palavra de Deus", "descricao": "Como ler e estudar a Bíblia", "conteudo": "Hermenêutica básica"},
  {"nome": "Comunhão", "descricao": "Importância da igreja local", "conteudo": "Vida em comunidade"},
  {"nome": "Evangelismo", "descricao": "Compartilhando a fé", "conteudo": "Primeiros passos no evangelismo"}
]'::jsonb, 'iniciante', 1, '👶', '#22c55e')
ON CONFLICT DO NOTHING;

INSERT INTO trilhas_dna (nome, descricao, etapas, nivel_requerido, ordem, icone, cor) VALUES
('Trilha do Discípulo', 'Crescimento espiritual e maturidade', 
'[
  {"nome": "Disciplina Espiritual", "descricao": "Desenvolvendo hábitos cristãos", "conteudo": "Disciplinas fundamentais"},
  {"nome": "Caráter Cristão", "descricao": "Fruto do Espírito", "conteudo": "Desenvolvimento do caráter"},
  {"nome": "Dons Espirituais", "descricao": "Descobrindo seus dons", "conteudo": "Identificação e uso dos dons"},
  {"nome": "Serviço Cristão", "descricao": "Servindo no Reino", "conteudo": "Áreas de ministério"},
  {"nome": "Liderança Servidora", "descricao": "Princípios de liderança cristã", "conteudo": "Fundamentos da liderança"}
]'::jsonb, 'intermediario', 2, '📖', '#3b82f6')
ON CONFLICT DO NOTHING;

INSERT INTO trilhas_dna (nome, descricao, etapas, nivel_requerido, ordem, icone, cor) VALUES
('Trilha do Líder', 'Preparação para liderança', 
'[
  {"nome": "Visão de Liderança", "descricao": "O chamado para liderar", "conteudo": "Vocação e chamado"},
  {"nome": "Comunicação Eficaz", "descricao": "Habilidades de comunicação", "conteudo": "Técnicas de comunicação"},
  {"nome": "Discipulado", "descricao": "Formando outros discípulos", "conteudo": "Estratégias de discipulado"},
  {"nome": "Gestão de Conflitos", "descricao": "Resolvendo problemas", "conteudo": "Mediação e reconciliação"},
  {"nome": "Multiplicação", "descricao": "Formando novos líderes", "conteudo": "Sucessão e crescimento"}
]'::jsonb, 'avancado', 3, '👑', '#8b5cf6')
ON CONFLICT DO NOTHING;

-- Inserir badges de ensino se não existirem
INSERT INTO badges_ensino (nome, descricao, criterios, pontos_recompensa, cor, icon) VALUES
('Primeiro Passo', 'Completou seu primeiro estudo', '{"trilha_etapa": 1}', 50, '#22c55e', '👶'),
('Estudioso', 'Completou 5 estudos', '{"estudos_completos": 5}', 100, '#3b82f6', '📚'),
('Dedicado', 'Completou uma trilha completa', '{"trilha_completa": 1}', 200, '#8b5cf6', '🏆'),
('Multiplicador', 'Formou seu primeiro discípulo', '{"discipulo_formado": 1}', 300, '#f59e0b', '👥'),
('Líder', 'Assumiu posição de liderança', '{"posicao_lideranca": true}', 500, '#ef4444', '👑')
ON CONFLICT (nome) DO NOTHING;