-- Inserir dados de exemplo para demonstrar as funcionalidades
-- Criar alguns cursos de exemplo se não existirem
INSERT INTO cursos_ensino (nome, descricao, categoria, nivel, carga_horaria) VALUES 
('DNA do Reino', 'Fundamentos da vida cristã', 'discipulado', 'iniciante', 40),
('Liderança Cristã', 'Desenvolvendo líderes segundo o coração de Deus', 'lideranca', 'intermediario', 60),
('Evangelismo Eficaz', 'Estratégias práticas para compartilhar o evangelho', 'evangelismo', 'intermediario', 30)
ON CONFLICT (nome) DO NOTHING;

-- Criar uma turma de exemplo
INSERT INTO turmas_ensino (nome_turma, curso_id, data_inicio, data_fim, horario_inicio, horario_fim, local, status)
SELECT 'DNA 2024.1', c.id, '2024-01-15', '2024-06-15', '19:00', '21:00', 'Auditório Principal', 'em_andamento'
FROM cursos_ensino c WHERE c.nome = 'DNA do Reino'
ON CONFLICT DO NOTHING;

-- Criar algumas notificações de exemplo
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT DEFAULT 'geral' CHECK (tipo IN ('aula', 'certificado', 'conquista', 'geral')),
  lida BOOLEAN DEFAULT false,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  acao_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS para notificações
ALTER TABLE notificacoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprias notificações" ON notificacoes 
FOR SELECT USING (
  pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()) OR is_admin_user()
);

CREATE POLICY "Sistema pode criar notificações" ON notificacoes 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar próprias notificações" ON notificacoes 
FOR UPDATE USING (
  pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()) OR is_admin_user()
);

-- Função para criar dados de demo para usuário
CREATE OR REPLACE FUNCTION criar_dados_demo_usuario(user_email TEXT)
RETURNS VOID AS $$
DECLARE
  pessoa_id_var UUID;
  trilha_id_var UUID;
  curso_id_var UUID;
  turma_id_var UUID;
  badge_id_var UUID;
BEGIN
  -- Buscar pessoa pelo email
  SELECT id INTO pessoa_id_var FROM pessoas WHERE email = user_email LIMIT 1;
  
  IF pessoa_id_var IS NULL THEN
    RETURN;
  END IF;
  
  -- Criar progresso em trilha DNA
  SELECT id INTO trilha_id_var FROM trilhas_dna WHERE nome = 'Trilha do Novo Convertido' LIMIT 1;
  
  IF trilha_id_var IS NOT NULL THEN
    INSERT INTO progresso_trilhas_dna (pessoa_id, trilha_id, etapa_atual, status, data_inicio)
    VALUES (pessoa_id_var, trilha_id_var, 3, 'em_andamento', CURRENT_DATE - INTERVAL '30 days')
    ON CONFLICT (pessoa_id, trilha_id) DO NOTHING;
  END IF;
  
  -- Criar matrícula em curso
  SELECT c.id, t.id INTO curso_id_var, turma_id_var 
  FROM cursos_ensino c
  JOIN turmas_ensino t ON t.curso_id = c.id
  WHERE c.nome = 'DNA do Reino' 
  LIMIT 1;
  
  IF turma_id_var IS NOT NULL THEN
    INSERT INTO matriculas_ensino (pessoa_id, turma_id, status, data_matricula, frequencia_percentual)
    VALUES (pessoa_id_var, turma_id_var, 'cursando', CURRENT_DATE - INTERVAL '20 days', 85.5)
    ON CONFLICT (pessoa_id, turma_id) DO NOTHING;
  END IF;
  
  -- Criar algumas conquistas
  SELECT id INTO badge_id_var FROM badges_ensino WHERE nome = 'Primeiro Passo' LIMIT 1;
  
  IF badge_id_var IS NOT NULL THEN
    INSERT INTO conquistas_ensino (pessoa_id, badge_id, pontos_ganhos, data_conquista)
    VALUES (pessoa_id_var, badge_id_var, 50, CURRENT_DATE - INTERVAL '25 days')
    ON CONFLICT DO NOTHING;
  END IF;
  
  SELECT id INTO badge_id_var FROM badges_ensino WHERE nome = 'Estudioso' LIMIT 1;
  
  IF badge_id_var IS NOT NULL THEN
    INSERT INTO conquistas_ensino (pessoa_id, badge_id, pontos_ganhos, data_conquista)
    VALUES (pessoa_id_var, badge_id_var, 100, CURRENT_DATE - INTERVAL '15 days')
    ON CONFLICT DO NOTHING;
  END IF;
  
  -- Criar notificações
  INSERT INTO notificacoes (pessoa_id, titulo, mensagem, tipo, data_criacao)
  VALUES 
    (pessoa_id_var, 'Nova aula disponível', 'A aula "Palavra de Deus" está disponível para você', 'aula', now() - INTERVAL '2 days'),
    (pessoa_id_var, 'Parabéns!', 'Você conquistou o badge "Estudioso"!', 'conquista', now() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;