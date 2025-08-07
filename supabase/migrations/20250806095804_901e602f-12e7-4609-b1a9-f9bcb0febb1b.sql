-- Criar tabela para bloqueios de datas acadêmicas
CREATE TABLE IF NOT EXISTS public.bloqueios_academicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'bloqueio' CHECK (tipo IN ('bloqueio', 'evento', 'feriado')),
  cor TEXT NOT NULL DEFAULT '#ef4444',
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.bloqueios_academicos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins podem gerenciar bloqueios acadêmicos" 
ON public.bloqueios_academicos 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel IN ('admin', 'lider')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel IN ('admin', 'lider')
  )
);

CREATE POLICY "Qualquer um pode ver bloqueios ativos" 
ON public.bloqueios_academicos 
FOR SELECT 
USING (ativo = true);

-- Criar tabela para alocação de professores
CREATE TABLE IF NOT EXISTS public.professor_disponibilidade (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID NOT NULL,
  dia_semana TEXT NOT NULL CHECK (dia_semana IN ('segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo')),
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.professor_disponibilidade ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins podem gerenciar disponibilidade professores" 
ON public.professor_disponibilidade 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel IN ('admin', 'lider')
  )
);

-- Criar função para verificar conflitos de horário
CREATE OR REPLACE FUNCTION verificar_conflitos_turma(
  p_professor_responsavel TEXT,
  p_dias_semana TEXT[],
  p_horario_inicio TIME,
  p_horario_fim TIME,
  p_data_inicio DATE,
  p_data_fim DATE,
  p_turma_id UUID DEFAULT NULL
) RETURNS TABLE(
  tipo_conflito TEXT,
  descricao TEXT,
  gravidade INTEGER
) AS $$
BEGIN
  -- Verificar conflitos com outras turmas do mesmo professor
  RETURN QUERY
  SELECT 
    'professor_ocupado'::TEXT as tipo_conflito,
    'Professor já tem turma agendada no mesmo horário'::TEXT as descricao,
    3::INTEGER as gravidade
  FROM turmas_ensino t
  WHERE t.professor_responsavel = p_professor_responsavel
    AND t.status IN ('planejado', 'em_andamento')
    AND (p_turma_id IS NULL OR t.id != p_turma_id)
    AND t.dias_semana && p_dias_semana
    AND t.horario_inicio < p_horario_fim
    AND t.horario_fim > p_horario_inicio
    AND (
      (t.data_inicio <= p_data_fim AND t.data_fim >= p_data_inicio) OR
      (p_data_inicio <= t.data_fim AND p_data_fim >= t.data_inicio)
    );

  -- Verificar conflitos com bloqueios acadêmicos
  RETURN QUERY
  SELECT 
    'data_bloqueada'::TEXT as tipo_conflito,
    b.titulo || ' - ' || COALESCE(b.descricao, 'Data não disponível para aulas')::TEXT as descricao,
    CASE WHEN b.tipo = 'bloqueio' THEN 3 ELSE 2 END::INTEGER as gravidade
  FROM bloqueios_academicos b
  WHERE b.ativo = true
    AND b.data_inicio <= p_data_fim
    AND b.data_fim >= p_data_inicio;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bloqueios_academicos_updated_at
  BEFORE UPDATE ON public.bloqueios_academicos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professor_disponibilidade_updated_at
  BEFORE UPDATE ON public.professor_disponibilidade
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();