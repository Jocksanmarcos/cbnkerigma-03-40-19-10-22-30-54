-- Create congregations table for multi-church architecture
CREATE TABLE IF NOT EXISTS public.congregacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tipo TEXT NOT NULL DEFAULT 'Filial', -- 'Sede' or 'Filial'
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  pastor_responsavel TEXT,
  igreja_mae_id UUID REFERENCES public.congregacoes(id),
  ativa BOOLEAN NOT NULL DEFAULT true,
  configuracoes JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for congregacoes
ALTER TABLE public.congregacoes ENABLE ROW LEVEL SECURITY;

-- Create policies for congregacoes
CREATE POLICY "Sede admins can view all congregations" ON public.congregacoes
  FOR SELECT USING (is_sede_admin());

CREATE POLICY "Sede admins can manage all congregations" ON public.congregacoes
  FOR ALL USING (is_sede_admin()) WITH CHECK (is_sede_admin());

-- Add congregacao_id to key tables
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);
ALTER TABLE public.celulas ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);
ALTER TABLE public.turmas_ensino ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);
ALTER TABLE public.lancamentos_financeiros ADD COLUMN IF NOT EXISTS congregacao_id UUID REFERENCES public.congregacoes(id);

-- Update existing RLS policies to include congregacao filter
DROP POLICY IF EXISTS "Acesso pessoas por igreja" ON public.pessoas;
CREATE POLICY "Acesso pessoas por igreja e congregação" ON public.pessoas
  FOR ALL USING (
    is_sede_admin() OR 
    (igreja_id = get_user_igreja_id()) OR 
    (igreja_id = get_pastor_missao_igreja_id()) OR
    (congregacao_id IN (
      SELECT id FROM public.congregacoes 
      WHERE igreja_id = get_user_igreja_id() OR igreja_id = get_pastor_missao_igreja_id()
    ))
  );

-- Insert seed data for congregations
INSERT INTO public.congregacoes (nome, slug, tipo, endereco, ativa) VALUES
  ('CBN Kerigma - Sede', 'sede-kerigma', 'Sede', 'Rua Principal, 123 - Centro', true),
  ('CBN Kerigma - Vila Nova', 'vila-nova', 'Filial', 'Av. das Flores, 456 - Vila Nova', true),
  ('CBN Kerigma - Jardins', 'jardins', 'Filial', 'Rua dos Jardins, 789 - Jardins', true)
ON CONFLICT (slug) DO NOTHING;

-- Create function to get user's congregacao
CREATE OR REPLACE FUNCTION public.get_user_congregacao_id()
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT p.congregacao_id 
    FROM public.pessoas p
    WHERE p.user_id = auth.uid() 
    LIMIT 1
  );
END;
$function$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_congregacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_congregacoes_updated_at
  BEFORE UPDATE ON public.congregacoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_congregacoes_updated_at();