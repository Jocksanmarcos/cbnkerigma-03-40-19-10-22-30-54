-- Criar tabela para redes e ministérios
CREATE TABLE public.redes_ministerios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT NOT NULL DEFAULT '#6366f1',
  lider_responsavel TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.redes_ministerios ENABLE ROW LEVEL SECURITY;

-- Políticas para redes_ministerios
CREATE POLICY "Admins e líderes podem gerenciar redes e ministérios" 
ON public.redes_ministerios 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel IN ('admin', 'lider')
  )
);

CREATE POLICY "Qualquer um pode ver redes e ministérios ativos" 
ON public.redes_ministerios 
FOR SELECT 
USING (ativa = true);

-- Trigger para updated_at
CREATE TRIGGER update_redes_ministerios_updated_at
  BEFORE UPDATE ON public.redes_ministerios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas redes/ministérios padrão
INSERT INTO public.redes_ministerios (nome, descricao, cor) VALUES
('Jovens', 'Ministério voltado para jovens de 18 a 30 anos', '#22c55e'),
('Casais', 'Ministério para casais e famílias', '#3b82f6'),
('Homens', 'Ministério masculino', '#8b5cf6'),
('Mulheres', 'Ministério feminino', '#ec4899'),
('Crianças', 'Ministério infantil', '#f59e0b'),
('Adolescentes', 'Ministério para adolescentes de 12 a 17 anos', '#06b6d4'),
('Idosos', 'Ministério da terceira idade', '#84cc16'),
('Famílias', 'Ministério familiar', '#f97316'),
('Profissionais', 'Ministério para profissionais', '#6366f1'),
('Universitários', 'Ministério para estudantes universitários', '#ef4444');