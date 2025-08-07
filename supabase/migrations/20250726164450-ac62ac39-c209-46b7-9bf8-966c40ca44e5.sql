-- Criar tabela para estatísticas da página inicial
CREATE TABLE public.estatisticas_site (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  valor TEXT NOT NULL,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.estatisticas_site ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode ver estatísticas" 
ON public.estatisticas_site 
FOR SELECT 
USING (true);

CREATE POLICY "Apenas admins podem modificar estatísticas" 
ON public.estatisticas_site 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() 
  AND ativo = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() 
  AND ativo = true
));

-- Inserir valores padrão
INSERT INTO public.estatisticas_site (chave, valor, descricao) VALUES
('celulas_ativas', '15+', 'Número de células ativas exibido na página inicial'),
('membros_ativos', '200+', 'Número de membros ativos exibido na página inicial'),
('anos_ministerio', '5+', 'Anos de ministério exibido na página inicial');

-- Trigger para updated_at
CREATE TRIGGER update_estatisticas_site_updated_at
BEFORE UPDATE ON public.estatisticas_site
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();