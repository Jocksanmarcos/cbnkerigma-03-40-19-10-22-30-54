-- Criar tabelas para módulos e lições
CREATE TABLE IF NOT EXISTS public.modulos_curso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 1,
  duracao_estimada INTEGER DEFAULT 0, -- em horas
  objetivos TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.licoes_modulo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modulo_id UUID NOT NULL REFERENCES public.modulos_curso(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  conteudo JSONB DEFAULT '{}',
  video_url TEXT,
  ordem INTEGER NOT NULL DEFAULT 1,
  tipo TEXT NOT NULL DEFAULT 'teoria', -- teoria, pratica, avaliacao
  tarefas JSONB DEFAULT '[]',
  recursos_extras JSONB DEFAULT '[]',
  duracao_estimada INTEGER DEFAULT 30, -- em minutos
  pontos INTEGER DEFAULT 10, -- para gamificação
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.progresso_curso (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  modulo_atual_id UUID REFERENCES public.modulos_curso(id),
  licao_atual_id UUID REFERENCES public.licoes_modulo(id),
  pontos_totais INTEGER DEFAULT 0,
  licoes_concluidas INTEGER DEFAULT 0,
  percentual_conclusao DECIMAL DEFAULT 0,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_ultima_atividade TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status TEXT DEFAULT 'em_andamento',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, curso_id)
);

-- Habilitar RLS
ALTER TABLE public.modulos_curso ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licoes_modulo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_curso ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para modulos_curso
CREATE POLICY "Admins podem gerenciar módulos" ON public.modulos_curso
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_admin 
      WHERE user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Qualquer um pode ver módulos ativos" ON public.modulos_curso
  FOR SELECT USING (ativo = true);

-- Políticas RLS para licoes_modulo
CREATE POLICY "Admins podem gerenciar lições" ON public.licoes_modulo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_admin 
      WHERE user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Qualquer um pode ver lições ativas" ON public.licoes_modulo
  FOR SELECT USING (ativo = true);

-- Políticas RLS para progresso_curso
CREATE POLICY "Admins podem ver todo progresso" ON public.progresso_curso
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_admin 
      WHERE user_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Pessoas podem ver seu próprio progresso" ON public.progresso_curso
  FOR SELECT USING (
    pessoa_id IN (
      SELECT id FROM public.pessoas WHERE email = auth.jwt()->>'email'
    )
  );

CREATE POLICY "Admins podem gerenciar progresso" ON public.progresso_curso
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_admin 
      WHERE user_id = auth.uid() AND ativo = true
    )
  );

-- Triggers para updated_at
CREATE TRIGGER update_modulos_curso_updated_at
  BEFORE UPDATE ON public.modulos_curso
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licoes_modulo_updated_at
  BEFORE UPDATE ON public.licoes_modulo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progresso_curso_updated_at
  BEFORE UPDATE ON public.progresso_curso
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir o curso Escola de Líderes DNA
INSERT INTO public.cursos (nome, descricao, categoria, nivel, carga_horaria, emite_certificado, ativo)
VALUES (
  'Escola de Líderes DNA',
  'Curso completo de formação de líderes com base no DNA da igreja, cobrindo células, liderança e evangelismo.',
  'Escola de Líderes',
  'intermediario',
  40,
  true,
  true
) ON CONFLICT DO NOTHING;

-- Inserir trilha de formação
INSERT INTO public.trilhas_formacao (nome, descricao, publico_alvo, ativa)
VALUES (
  'Formação de Líderes DNA',
  'Trilha completa para formação de líderes de células e ministério',
  ARRAY['lideres', 'lideres_em_treinamento'],
  true
) ON CONFLICT DO NOTHING;

-- Atualizar trilha com o curso (fazemos isso separadamente para garantir que o curso existe)
DO $$
DECLARE
  curso_id_var UUID;
  trilha_id_var UUID;
BEGIN
  -- Buscar o ID do curso
  SELECT id INTO curso_id_var FROM public.cursos WHERE nome = 'Escola de Líderes DNA';
  
  -- Buscar o ID da trilha
  SELECT id INTO trilha_id_var FROM public.trilhas_formacao WHERE nome = 'Formação de Líderes DNA';
  
  -- Atualizar a trilha com o curso se ambos existem
  IF curso_id_var IS NOT NULL AND trilha_id_var IS NOT NULL THEN
    UPDATE public.trilhas_formacao 
    SET cursos_sequencia = jsonb_build_array(
      jsonb_build_object(
        'id', curso_id_var,
        'nome', 'Escola de Líderes DNA',
        'ordem', 1
      )
    )
    WHERE id = trilha_id_var;
  END IF;
END $$;

-- Inserir módulos do curso
DO $$
DECLARE
  curso_id_var UUID;
BEGIN
  -- Buscar o ID do curso
  SELECT id INTO curso_id_var FROM public.cursos WHERE nome = 'Escola de Líderes DNA';
  
  IF curso_id_var IS NOT NULL THEN
    -- Módulo 1: Fundamentos da Célula
    INSERT INTO public.modulos_curso (curso_id, nome, descricao, ordem, duracao_estimada, objetivos)
    VALUES (
      curso_id_var,
      'Fundamentos da Célula',
      'Compreendendo os princípios básicos das células e sua importância na igreja',
      1,
      8,
      ARRAY['Entender o conceito de célula', 'Conhecer a estrutura celular', 'Identificar os benefícios das células']
    );
    
    -- Módulo 2: Liderança Cristã
    INSERT INTO public.modulos_curso (curso_id, nome, descricao, ordem, duracao_estimada, objetivos)
    VALUES (
      curso_id_var,
      'Liderança Cristã',
      'Desenvolvendo habilidades de liderança baseadas nos princípios bíblicos',
      2,
      10,
      ARRAY['Desenvolver caráter cristão', 'Aprender técnicas de liderança', 'Formar outros líderes']
    );
    
    -- Módulo 3: Evangelismo e Multiplicação
    INSERT INTO public.modulos_curso (curso_id, nome, descricao, ordem, duracao_estimada, objetivos)
    VALUES (
      curso_id_var,
      'Evangelismo e Multiplicação',
      'Estratégias para evangelismo eficaz e multiplicação de células',
      3,
      12,
      ARRAY['Dominar técnicas de evangelismo', 'Planejar multiplicação', 'Formar novos líderes']
    );
    
    -- Módulo 4: Ministério Prático
    INSERT INTO public.modulos_curso (curso_id, nome, descricao, ordem, duracao_estimada, objetivos)
    VALUES (
      curso_id_var,
      'Ministério Prático',
      'Aplicação prática dos conhecimentos adquiridos no ministério',
      4,
      10,
      ARRAY['Aplicar conhecimentos na prática', 'Desenvolver habilidades ministeriais', 'Avaliar resultados']
    );
  END IF;
END $$;

-- Inserir lições detalhadas
DO $$
DECLARE
  modulo1_id UUID;
  modulo2_id UUID;
  modulo3_id UUID;
  modulo4_id UUID;
BEGIN
  -- Buscar IDs dos módulos
  SELECT id INTO modulo1_id FROM public.modulos_curso WHERE nome = 'Fundamentos da Célula';
  SELECT id INTO modulo2_id FROM public.modulos_curso WHERE nome = 'Liderança Cristã';
  SELECT id INTO modulo3_id FROM public.modulos_curso WHERE nome = 'Evangelismo e Multiplicação';
  SELECT id INTO modulo4_id FROM public.modulos_curso WHERE nome = 'Ministério Prático';
  
  -- Lições do Módulo 1
  IF modulo1_id IS NOT NULL THEN
    INSERT INTO public.licoes_modulo (modulo_id, titulo, conteudo, ordem, tipo, tarefas, pontos, duracao_estimada)
    VALUES 
    (modulo1_id, 'O que é uma Célula?', '{"conceitos": ["Definição bíblica de célula", "Igreja no lar", "Comunidade cristã"], "reflexoes": ["Como Jesus ministrou em casas", "A igreja primitiva em Atos"]}', 1, 'teoria', '[{"titulo": "Reflexão Pessoal", "descricao": "Escreva sobre sua compreensão atual de célula", "tipo": "reflexao"}]', 15, 60),
    (modulo1_id, 'Estrutura da Célula', '{"topicos": ["Líder e liderança", "Anfitrião", "Participantes", "Multiplicação"], "exemplos": ["Modelos de células eficazes"]}', 2, 'teoria', '[{"titulo": "Mapeamento de Célula", "descricao": "Desenhe a estrutura ideal de uma célula", "tipo": "pratica"}]', 20, 45),
    (modulo1_id, 'Benefícios da Vida em Célula', '{"vantagens": ["Crescimento espiritual", "Relacionamentos", "Evangelismo", "Cuidado mútuo"]}', 3, 'teoria', '[{"titulo": "Testemunho", "descricao": "Compartilhe um benefício que você já experimentou", "tipo": "testemunho"}]', 15, 30);
  END IF;
  
  -- Lições do Módulo 2
  IF modulo2_id IS NOT NULL THEN
    INSERT INTO public.licoes_modulo (modulo_id, titulo, conteudo, ordem, tipo, tarefas, pontos, duracao_estimada)
    VALUES 
    (modulo2_id, 'Caráter do Líder', '{"principios": ["Integridade", "Humildade", "Amor", "Fidelidade"], "referencias": ["1 Timóteo 3:1-7", "Tito 1:5-9"]}', 1, 'teoria', '[{"titulo": "Auto-avaliação", "descricao": "Avalie seu caráter em cada área", "tipo": "avaliacao"}]', 25, 75),
    (modulo2_id, 'Desenvolvendo Habilidades', '{"habilidades": ["Comunicação", "Escuta ativa", "Resolução de conflitos", "Mentoria"]}', 2, 'pratica', '[{"titulo": "Role Play", "descricao": "Pratique uma situação de liderança", "tipo": "pratica"}]', 30, 90),
    (modulo2_id, 'Formação de Discípulos', '{"estrategias": ["Modelo de Jesus", "Investimento pessoal", "Multiplicação"], "ferramentas": ["Plano de discipulado"]}', 3, 'teoria', '[{"titulo": "Plano Pessoal", "descricao": "Crie um plano para formar um discípulo", "tipo": "projeto"}]', 35, 60);
  END IF;
  
  -- Lições do Módulo 3
  IF modulo3_id IS NOT NULL THEN
    INSERT INTO public.licoes_modulo (modulo_id, titulo, conteudo, ordem, tipo, tarefas, pontos, duracao_estimada)
    VALUES 
    (modulo3_id, 'Evangelismo Relacional', '{"conceitos": ["Construção de relacionamentos", "Testemunho pessoal", "Oração intercessória"], "tecnicas": ["Ponte relacional", "Convite natural"]}', 1, 'teoria', '[{"titulo": "Lista de Contatos", "descricao": "Faça uma lista de 10 pessoas para evangelizar", "tipo": "pratica"}]', 30, 60),
    (modulo3_id, 'Estratégias de Multiplicação', '{"planejamento": ["Identificação de líderes", "Treinamento", "Lançamento"], "cronograma": ["12 meses para multiplicar"]}', 2, 'teoria', '[{"titulo": "Plano de Multiplicação", "descricao": "Desenvolva um plano para sua célula", "tipo": "projeto"}]', 40, 90),
    (modulo3_id, 'Eventos Evangelísticos', '{"tipos": ["Festa na célula", "Projeto social", "Evento especial"], "organizacao": ["Planejamento", "Execução", "Follow-up"]}', 3, 'pratica', '[{"titulo": "Organize um Evento", "descricao": "Planeje e execute um evento evangelístico", "tipo": "projeto"}]', 50, 120);
  END IF;
  
  -- Lições do Módulo 4
  IF modulo4_id IS NOT NULL THEN
    INSERT INTO public.licoes_modulo (modulo_id, titulo, conteudo, ordem, tipo, tarefas, pontos, duracao_estimada)
    VALUES 
    (modulo4_id, 'Ministério na Prática', '{"areas": ["Liderança de célula", "Discipulado", "Evangelismo", "Cuidado pastoral"]}', 1, 'pratica', '[{"titulo": "Experiência Prática", "descricao": "Lidere uma reunião de célula", "tipo": "pratica"}]', 40, 120),
    (modulo4_id, 'Avaliação e Crescimento', '{"ferramentas": ["Auto-avaliação", "Feedback", "Plano de melhoria"], "metas": ["Crescimento pessoal", "Eficácia ministerial"]}', 2, 'avaliacao', '[{"titulo": "Projeto Final", "descricao": "Apresente seu plano ministerial", "tipo": "projeto"}]', 60, 90),
    (modulo4_id, 'Certificação e Próximos Passos', '{"certificacao": ["Requisitos", "Avaliação final"], "continuidade": ["Mentoria", "Formação avançada", "Multiplicação"]}', 3, 'avaliacao', '[{"titulo": "Compromisso", "descricao": "Assine seu compromisso como líder", "tipo": "compromisso"}]', 50, 60);
  END IF;
END $$;