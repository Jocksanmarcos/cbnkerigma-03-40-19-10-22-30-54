-- Inserir cursos de ensino de exemplo
INSERT INTO public.cursos_ensino (nome, descricao, categoria, nivel, carga_horaria, material_didatico, publico_alvo, ativo) VALUES
('Fundamentos da Fé', 'Curso básico sobre os fundamentos da fé cristã', 'discipulado', 'iniciante', 40, '[{"tipo": "apostila", "nome": "Manual do Discípulo"}]', ARRAY['novos_convertidos', 'visitantes'], true),
('Liderança Cristã', 'Desenvolvimento de habilidades de liderança', 'lideranca', 'intermediario', 60, '[{"tipo": "livro", "nome": "Liderança com Propósito"}]', ARRAY['lideres', 'discipuladores'], true),
('Escola de Líderes DNA - Módulo 1', 'Primeiro módulo da formação de líderes', 'discipulado', 'intermediario', 80, '[{"tipo": "apostila", "nome": "DNA da Liderança"}]', ARRAY['lideres_em_formacao'], true),
('Evangelismo Pessoal', 'Técnicas e estratégias de evangelismo', 'evangelismo', 'iniciante', 30, '[{"tipo": "manual", "nome": "Como Compartilhar a Fé"}]', ARRAY['membros', 'lideres'], true);

-- Inserir badges de ensino
INSERT INTO public.badges_ensino (nome, descricao, criterios, pontos_recompensa, cor, icon, ativo) VALUES
('Primeiro Passo', 'Concluiu o primeiro curso', '{"tipo": "curso_concluido", "quantidade": 1}', 100, '#4CAF50', '🎯', true),
('Estudioso', 'Concluiu 3 cursos', '{"tipo": "curso_concluido", "quantidade": 3}', 300, '#2196F3', '📚', true),
('Líder em Formação', 'Concluiu curso de liderança', '{"tipo": "curso_especifico", "curso": "lideranca"}', 200, '#FF9800', '👑', true),
('Evangelista', 'Concluiu curso de evangelismo', '{"tipo": "curso_especifico", "categoria": "evangelismo"}', 150, '#9C27B0', '📢', true),
('Dedicado', 'Frequência acima de 90%', '{"tipo": "frequencia", "minimo": 90}', 250, '#FFD700', '⭐', true),
('Nota Máxima', 'Obteve nota máxima em uma avaliação', '{"tipo": "nota", "minimo": 100}', 200, '#E91E63', '🏆', true);

-- Inserir turmas de ensino
INSERT INTO public.turmas_ensino (nome_turma, curso_id, data_inicio, data_fim, status, vagas_total, vagas_ocupadas) 
SELECT 
  c.nome || ' - Turma ' || (ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY c.id)),
  c.id,
  CURRENT_DATE - INTERVAL '30 days',
  CURRENT_DATE + INTERVAL '60 days',
  'em_andamento',
  20,
  CASE WHEN ROW_NUMBER() OVER (PARTITION BY c.id ORDER BY c.id) = 1 THEN 15 ELSE 8 END
FROM cursos_ensino c;

-- Matricular o usuário admin em alguns cursos
INSERT INTO public.matriculas_ensino (pessoa_id, turma_id, status, data_matricula, frequencia_percentual, nota_final)
SELECT 
  p.id,
  t.id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) = 1 THEN 'concluido'
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) = 2 THEN 'cursando'
    ELSE 'matriculado'
  END,
  CURRENT_DATE - INTERVAL '25 days',
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) = 1 THEN 95
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) = 2 THEN 80
    ELSE 0
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) = 1 THEN 9.5
    ELSE NULL
  END
FROM pessoas p, turmas_ensino t
WHERE p.email = 'admin@cbnkerigma.org.br'
LIMIT 3;

-- Criar progresso nas trilhas DNA para o usuário admin
INSERT INTO public.progresso_trilhas_dna (pessoa_id, trilha_id, etapa_atual, etapas_concluidas, status, data_inicio)
SELECT 
  p.id,
  t.id,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) <= 2 THEN 3
    ELSE 1
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) <= 2 THEN ARRAY[1,2,3]
    ELSE ARRAY[1]
  END,
  CASE 
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) = 1 THEN 'concluido'
    WHEN ROW_NUMBER() OVER (ORDER BY t.id) <= 3 THEN 'em_andamento'
    ELSE 'nao_iniciado'
  END,
  CURRENT_DATE - INTERVAL '20 days'
FROM pessoas p, trilhas_dna t
WHERE p.email = 'admin@cbnkerigma.org.br'
LIMIT 4;

-- Adicionar conquistas para o usuário admin
INSERT INTO public.conquistas_ensino (pessoa_id, badge_id, pontos_ganhos, data_conquista)
SELECT 
  p.id,
  b.id,
  b.pontos_recompensa,
  CURRENT_DATE - INTERVAL (FLOOR(RANDOM() * 20) || ' days')::INTERVAL
FROM pessoas p, badges_ensino b
WHERE p.email = 'admin@cbnkerigma.org.br'
AND b.nome IN ('Primeiro Passo', 'Nota Máxima', 'Dedicado');