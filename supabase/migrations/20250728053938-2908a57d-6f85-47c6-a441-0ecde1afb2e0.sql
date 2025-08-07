-- Criar tabela para categorias de cursos
CREATE TABLE public.categorias_cursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.categorias_cursos (nome, descricao) VALUES
('Discipulado', 'Cursos de formação de discípulos'),
('Formação', 'Cursos de formação ministerial'),
('Voluntariado', 'Cursos para voluntários'),
('Teológico', 'Cursos de teologia'),
('EBD', 'Escola Bíblica Dominical');

-- Habilitar RLS
ALTER TABLE public.categorias_cursos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode ver categorias ativas" 
ON public.categorias_cursos 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Admins podem gerenciar categorias" 
ON public.categorias_cursos 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));