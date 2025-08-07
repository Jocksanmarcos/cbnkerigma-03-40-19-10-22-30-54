-- Criar tabela para gerenciamento da liderança
CREATE TABLE public.lideranca (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  descricao TEXT,
  foto_url TEXT,
  ordem INTEGER DEFAULT 1,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lideranca ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode ver liderança ativa" 
ON public.lideranca 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Apenas admins podem modificar liderança" 
ON public.lideranca 
FOR ALL 
USING (EXISTS ( 
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
))
WITH CHECK (EXISTS ( 
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Trigger para update automático do updated_at
CREATE TRIGGER update_lideranca_updated_at
BEFORE UPDATE ON public.lideranca
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais baseados na página atual
INSERT INTO public.lideranca (nome, cargo, descricao, foto_url, ordem) VALUES
('Pr. João Silva', 'Pastor Principal', 'Liderando com amor e dedicação há 5 anos, focado no crescimento espiritual da igreja.', '/src/assets/pastor-joao-silva.jpg', 1),
('Pr. Maria Santos', 'Coordenação de Células', 'Responsável pelo desenvolvimento e crescimento do ministério de células.', '/src/assets/pastora-maria-santos.jpg', 2),
('Pr. Carlos Lima', 'Ministério de Ensino', 'Dedicado ao ensino da Palavra e formação de novos líderes.', '/src/assets/pastor-carlos-lima.jpg', 3);