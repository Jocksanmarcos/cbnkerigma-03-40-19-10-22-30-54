-- Criação do módulo de ensino

-- Tabela de cursos
CREATE TABLE public.cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL DEFAULT 'discipulado',
  nivel TEXT NOT NULL DEFAULT 'iniciante',
  pre_requisitos TEXT[],
  material_didatico JSONB DEFAULT '[]'::jsonb,
  carga_horaria INTEGER,
  emite_certificado BOOLEAN DEFAULT true,
  publico_alvo TEXT[],
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de turmas
CREATE TABLE public.turmas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  professor_responsavel TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  dias_semana TEXT[] NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  local TEXT,
  link_online TEXT,
  capacidade_maxima INTEGER DEFAULT 30,
  observacoes TEXT,
  status TEXT DEFAULT 'planejada',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de matrículas
CREATE TABLE public.matriculas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'matriculado',
  data_matricula DATE DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  nota_final DECIMAL(3,1),
  frequencia_percentual DECIMAL(5,2) DEFAULT 0,
  observacoes TEXT,
  certificado_emitido BOOLEAN DEFAULT false,
  certificado_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, turma_id)
);

-- Tabela de aulas
CREATE TABLE public.aulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  turma_id UUID NOT NULL REFERENCES public.turmas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_aula DATE NOT NULL,
  conteudo JSONB DEFAULT '{}'::jsonb,
  material_aula TEXT[],
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de presença
CREATE TABLE public.presencas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula_id UUID NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  aula_id UUID NOT NULL REFERENCES public.aulas(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(matricula_id, aula_id)
);

-- Tabela de trilhas de formação
CREATE TABLE public.trilhas_formacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  publico_alvo TEXT[],
  cursos_sequencia JSONB NOT NULL DEFAULT '[]'::jsonb,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de progresso nas trilhas
CREATE TABLE public.progresso_trilhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  trilha_id UUID NOT NULL REFERENCES public.trilhas_formacao(id) ON DELETE CASCADE,
  etapa_atual INTEGER DEFAULT 0,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  status TEXT DEFAULT 'em_andamento',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, trilha_id)
);

-- Tabela de avaliações
CREATE TABLE public.avaliacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula_id UUID NOT NULL REFERENCES public.matriculas(id) ON DELETE CASCADE,
  tipo_avaliacao TEXT NOT NULL,
  nota DECIMAL(3,1),
  data_avaliacao DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.cursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trilhas_formacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_trilhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para cursos
CREATE POLICY "Qualquer um pode ver cursos ativos" 
ON public.cursos 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Apenas admins podem modificar cursos" 
ON public.cursos 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Políticas RLS para turmas
CREATE POLICY "Admins podem ver todas as turmas" 
ON public.turmas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Apenas admins podem modificar turmas" 
ON public.turmas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Políticas RLS para matrículas
CREATE POLICY "Admins podem ver todas as matrículas" 
ON public.matriculas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Apenas admins podem modificar matrículas" 
ON public.matriculas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Políticas similares para outras tabelas
CREATE POLICY "Admins podem gerenciar aulas" 
ON public.aulas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Admins podem gerenciar presenças" 
ON public.presencas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Qualquer um pode ver trilhas ativas" 
ON public.trilhas_formacao 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Apenas admins podem modificar trilhas" 
ON public.trilhas_formacao 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Admins podem gerenciar progresso trilhas" 
ON public.progresso_trilhas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Admins podem gerenciar avaliações" 
ON public.avaliacoes 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Triggers para updated_at
CREATE TRIGGER update_cursos_updated_at
  BEFORE UPDATE ON public.cursos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_turmas_updated_at
  BEFORE UPDATE ON public.turmas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matriculas_updated_at
  BEFORE UPDATE ON public.matriculas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aulas_updated_at
  BEFORE UPDATE ON public.aulas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trilhas_updated_at
  BEFORE UPDATE ON public.trilhas_formacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progresso_trilhas_updated_at
  BEFORE UPDATE ON public.progresso_trilhas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular estatísticas do ensino
CREATE OR REPLACE FUNCTION public.obter_estatisticas_ensino()
RETURNS TABLE(
  total_cursos BIGINT,
  total_turmas_ativas BIGINT,
  total_alunos_matriculados BIGINT,
  total_alunos_concluidos BIGINT,
  taxa_conclusao DECIMAL,
  alunos_por_status JSONB,
  cursos_por_categoria JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.cursos WHERE ativo = true)::BIGINT,
    (SELECT COUNT(*) FROM public.turmas WHERE status = 'em_andamento')::BIGINT,
    (SELECT COUNT(*) FROM public.matriculas WHERE status IN ('matriculado', 'cursando'))::BIGINT,
    (SELECT COUNT(*) FROM public.matriculas WHERE status = 'concluido')::BIGINT,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.matriculas) > 0 THEN
        (SELECT COUNT(*) FROM public.matriculas WHERE status = 'concluido')::DECIMAL / 
        (SELECT COUNT(*) FROM public.matriculas)::DECIMAL * 100
      ELSE 0
    END,
    (SELECT jsonb_object_agg(status, count) 
     FROM (
       SELECT status, COUNT(*) as count 
       FROM public.matriculas 
       GROUP BY status
     ) sub),
    (SELECT jsonb_object_agg(categoria, count) 
     FROM (
       SELECT categoria, COUNT(*) as count 
       FROM public.cursos 
       WHERE ativo = true
       GROUP BY categoria
     ) sub);
END;
$$;