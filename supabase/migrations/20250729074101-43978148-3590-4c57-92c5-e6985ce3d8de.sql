-- Tabela de cursos
CREATE TABLE public.cursos_ensino (
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
CREATE TABLE public.turmas_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID NOT NULL REFERENCES public.cursos_ensino(id) ON DELETE CASCADE,
  nome_turma TEXT NOT NULL,
  professor_responsavel TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  dias_semana TEXT[] NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  local_tipo TEXT NOT NULL DEFAULT 'presencial',
  local_endereco TEXT,
  link_online TEXT,
  capacidade_maxima INTEGER DEFAULT 30,
  lista_espera BOOLEAN DEFAULT true,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'planejada',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de matrículas
CREATE TABLE public.matriculas_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas_ensino(id) ON DELETE CASCADE,
  data_matricula DATE DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'matriculado',
  nota_final NUMERIC,
  frequencia_percentual NUMERIC DEFAULT 0,
  certificado_emitido BOOLEAN DEFAULT false,
  certificado_url TEXT,
  data_conclusao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, turma_id)
);

-- Tabela de presença nas aulas
CREATE TABLE public.presencas_aula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula_id UUID NOT NULL REFERENCES public.matriculas_ensino(id) ON DELETE CASCADE,
  data_aula DATE NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT false,
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de avaliações
CREATE TABLE public.avaliacoes_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula_id UUID NOT NULL REFERENCES public.matriculas_ensino(id) ON DELETE CASCADE,
  tipo_avaliacao TEXT NOT NULL,
  nota NUMERIC,
  data_avaliacao DATE DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de trilhas de formação
CREATE TABLE public.trilhas_formacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  etapas JSONB NOT NULL DEFAULT '[]'::jsonb,
  publico_alvo TEXT[],
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de progresso na trilha
CREATE TABLE public.progresso_trilha (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  trilha_id UUID NOT NULL REFERENCES public.trilhas_formacao(id) ON DELETE CASCADE,
  etapa_atual INTEGER DEFAULT 0,
  data_inicio DATE DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, trilha_id)
);

-- Enable RLS
ALTER TABLE public.cursos_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.turmas_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trilhas_formacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_trilha ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins podem gerenciar cursos ensino" 
ON public.cursos_ensino 
FOR ALL 
USING (EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true));

CREATE POLICY "Qualquer um pode ver cursos ativos" 
ON public.cursos_ensino 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar turmas ensino" 
ON public.turmas_ensino 
FOR ALL 
USING (EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true));

CREATE POLICY "Qualquer um pode ver turmas ativas" 
ON public.turmas_ensino 
FOR SELECT 
USING (status IN ('ativa', 'inscricoes_abertas'));

CREATE POLICY "Admins podem gerenciar matrículas ensino" 
ON public.matriculas_ensino 
FOR ALL 
USING (EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true));

CREATE POLICY "Usuários podem ver suas próprias matrículas" 
ON public.matriculas_ensino 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM pessoas WHERE id = matriculas_ensino.pessoa_id AND user_id = auth.uid()));

CREATE POLICY "Admins podem gerenciar presenças" 
ON public.presencas_aula 
FOR ALL 
USING (EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true));

CREATE POLICY "Admins podem gerenciar avaliações ensino" 
ON public.avaliacoes_ensino 
FOR ALL 
USING (EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true));

CREATE POLICY "Admins podem gerenciar trilhas" 
ON public.trilhas_formacao 
FOR ALL 
USING (EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true));

CREATE POLICY "Qualquer um pode ver trilhas ativas" 
ON public.trilhas_formacao 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Admins podem gerenciar progresso trilha" 
ON public.progresso_trilha 
FOR ALL 
USING (EXISTS (SELECT 1 FROM usuarios_admin WHERE user_id = auth.uid() AND ativo = true));

CREATE POLICY "Usuários podem ver seu próprio progresso" 
ON public.progresso_trilha 
FOR SELECT 
USING (EXISTS (SELECT 1 FROM pessoas WHERE id = progresso_trilha.pessoa_id AND user_id = auth.uid()));

-- Triggers para updated_at
CREATE TRIGGER update_cursos_ensino_updated_at
BEFORE UPDATE ON public.cursos_ensino
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_turmas_ensino_updated_at
BEFORE UPDATE ON public.turmas_ensino
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matriculas_ensino_updated_at
BEFORE UPDATE ON public.matriculas_ensino
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trilhas_formacao_updated_at
BEFORE UPDATE ON public.trilhas_formacao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_progresso_trilha_updated_at
BEFORE UPDATE ON public.progresso_trilha
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para calcular estatísticas de ensino
CREATE OR REPLACE FUNCTION public.obter_estatisticas_ensino()
RETURNS TABLE(
  total_cursos BIGINT,
  total_turmas_ativas BIGINT,
  total_alunos_matriculados BIGINT,
  total_alunos_concluidos BIGINT,
  taxa_conclusao NUMERIC,
  alunos_por_status JSONB,
  cursos_por_categoria JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.cursos_ensino WHERE ativo = true)::BIGINT,
    (SELECT COUNT(*) FROM public.turmas_ensino WHERE status IN ('ativa', 'inscricoes_abertas'))::BIGINT,
    (SELECT COUNT(*) FROM public.matriculas_ensino WHERE status IN ('matriculado', 'cursando'))::BIGINT,
    (SELECT COUNT(*) FROM public.matriculas_ensino WHERE status = 'concluido')::BIGINT,
    CASE 
      WHEN (SELECT COUNT(*) FROM public.matriculas_ensino) > 0 THEN
        (SELECT COUNT(*) FROM public.matriculas_ensino WHERE status = 'concluido')::DECIMAL / 
        (SELECT COUNT(*) FROM public.matriculas_ensino)::DECIMAL * 100
      ELSE 0
    END,
    (SELECT jsonb_object_agg(status, count) 
     FROM (
       SELECT status, COUNT(*) as count 
       FROM public.matriculas_ensino 
       GROUP BY status
     ) sub),
    (SELECT jsonb_object_agg(categoria, count) 
     FROM (
       SELECT categoria, COUNT(*) as count 
       FROM public.cursos_ensino 
       WHERE ativo = true
       GROUP BY categoria
     ) sub);
END;
$$;