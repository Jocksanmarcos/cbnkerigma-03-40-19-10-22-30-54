-- Criar tabela turmas_ensino para planejamento acadêmico
CREATE TABLE public.turmas_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_turma TEXT NOT NULL,
  curso_id UUID NOT NULL REFERENCES public.cursos_ensino(id) ON DELETE CASCADE,
  professor_responsavel TEXT NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE,
  dias_semana TEXT[] NOT NULL DEFAULT '{}',
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  local_tipo TEXT NOT NULL CHECK (local_tipo IN ('presencial', 'online', 'hibrido')),
  local_endereco TEXT,
  link_online TEXT,
  capacidade_maxima INTEGER NOT NULL DEFAULT 20,
  lista_espera BOOLEAN NOT NULL DEFAULT false,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'planejado' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela matriculas_ensino para controle de matrículas
CREATE TABLE public.matriculas_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  turma_id UUID NOT NULL REFERENCES public.turmas_ensino(id) ON DELETE CASCADE,
  data_matricula DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'matriculado' CHECK (status IN ('matriculado', 'cursando', 'concluido', 'desistente', 'transferido')),
  nota_final DECIMAL(3,1),
  frequencia_percentual DECIMAL(5,2) NOT NULL DEFAULT 0,
  certificado_emitido BOOLEAN NOT NULL DEFAULT false,
  certificado_url TEXT,
  data_conclusao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, turma_id)
);

-- Criar tabela presencas_aula para controle de presença
CREATE TABLE public.presencas_aula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula_id UUID NOT NULL REFERENCES public.matriculas_ensino(id) ON DELETE CASCADE,
  data_aula DATE NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT false,
  justificativa TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela trilhas_formacao para trilhas de ensino
CREATE TABLE public.trilhas_formacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  etapas JSONB NOT NULL DEFAULT '[]',
  publico_alvo TEXT[] DEFAULT '{}',
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela progresso_trilhas para acompanhar progresso dos alunos
CREATE TABLE public.progresso_trilhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  trilha_id UUID NOT NULL REFERENCES public.trilhas_formacao(id) ON DELETE CASCADE,
  etapa_atual INTEGER NOT NULL DEFAULT 1,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'pausado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, trilha_id)
);

-- Habilitar RLS
ALTER TABLE public.turmas_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matriculas_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas_aula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trilhas_formacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_trilhas ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para turmas_ensino
CREATE POLICY "Admins e líderes podem gerenciar turmas de ensino" ON public.turmas_ensino
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_admin 
      WHERE user_id = auth.uid() 
      AND ativo = true 
      AND papel IN ('admin', 'lider')
    )
  );

CREATE POLICY "Qualquer um pode ver turmas ativas" ON public.turmas_ensino
  FOR SELECT USING (status IN ('planejado', 'em_andamento'));

-- Criar políticas RLS para matriculas_ensino
CREATE POLICY "Admins e líderes podem gerenciar matrículas de ensino" ON public.matriculas_ensino
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_admin 
      WHERE user_id = auth.uid() 
      AND ativo = true 
      AND papel IN ('admin', 'lider')
    )
  );

CREATE POLICY "Pessoas podem ver próprias matrículas" ON public.matriculas_ensino
  FOR SELECT USING (
    pessoa_id IN (
      SELECT id FROM public.pessoas WHERE user_id = auth.uid()
    )
  );

-- Criar políticas RLS para presencas_aula
CREATE POLICY "Admins e líderes podem gerenciar presenças" ON public.presencas_aula
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.usuarios_admin 
      WHERE user_id = auth.uid() 
      AND ativo = true 
      AND papel IN ('admin', 'lider')
    )
  );

-- Criar políticas RLS para trilhas_formacao
CREATE POLICY "Admins podem gerenciar trilhas de formação" ON public.trilhas_formacao
  FOR ALL USING (is_admin_user())
  WITH CHECK (is_admin_user());

CREATE POLICY "Qualquer um pode ver trilhas ativas" ON public.trilhas_formacao
  FOR SELECT USING (ativa = true);

-- Criar políticas RLS para progresso_trilhas
CREATE POLICY "Admins podem gerenciar progresso de trilhas" ON public.progresso_trilhas
  FOR ALL USING (is_admin_user());

CREATE POLICY "Pessoas podem ver próprio progresso" ON public.progresso_trilhas
  FOR SELECT USING (
    pessoa_id IN (
      SELECT id FROM public.pessoas WHERE user_id = auth.uid()
    )
  );

-- Criar triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

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

CREATE TRIGGER update_progresso_trilhas_updated_at
  BEFORE UPDATE ON public.progresso_trilhas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar função para obter estatísticas de ensino
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
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.cursos_ensino WHERE ativo = true)::BIGINT,
    (SELECT COUNT(*) FROM public.turmas_ensino WHERE status = 'em_andamento')::BIGINT,
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