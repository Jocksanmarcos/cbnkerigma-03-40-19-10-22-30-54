-- Criar tabela para inscrições da newsletter
CREATE TABLE IF NOT EXISTS public.newsletter_inscricoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  interesses TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.newsletter_inscricoes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Qualquer um pode se inscrever"
ON public.newsletter_inscricoes
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins podem ver todas as inscrições"
ON public.newsletter_inscricoes
FOR SELECT
USING (public.is_admin_user());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_newsletter_inscricoes_updated_at
BEFORE UPDATE ON public.newsletter_inscricoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();