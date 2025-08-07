-- Corrigir funções com search_path mutable
CREATE OR REPLACE FUNCTION public.get_user_igreja_id()
RETURNS UUID 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = 'public'
AS $$
BEGIN
  RETURN (
    SELECT igreja_id 
    FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_sede_admin()
RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER 
STABLE
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.usuarios_admin ua
    JOIN public.igrejas i ON i.id = ua.igreja_id
    WHERE ua.user_id = auth.uid() 
    AND i.tipo = 'Sede'
    AND ua.ativo = true
  );
END;
$$;

-- Adicionar coluna igreja_id às tabelas existentes que precisam de segmentação
ALTER TABLE public.pessoas ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES public.igrejas(id);
ALTER TABLE public.celulas ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES public.igrejas(id);
ALTER TABLE public.lancamentos_financeiros ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES public.igrejas(id);
ALTER TABLE public.eventos ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES public.igrejas(id);

-- Atualizar registros existentes para a sede
UPDATE public.pessoas SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1) WHERE igreja_id IS NULL;
UPDATE public.celulas SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1) WHERE igreja_id IS NULL;
UPDATE public.lancamentos_financeiros SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1) WHERE igreja_id IS NULL;
UPDATE public.eventos SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1) WHERE igreja_id IS NULL;

-- Tornar igreja_id obrigatório nas tabelas principais
ALTER TABLE public.pessoas ALTER COLUMN igreja_id SET NOT NULL;
ALTER TABLE public.celulas ALTER COLUMN igreja_id SET NOT NULL;
ALTER TABLE public.lancamentos_financeiros ALTER COLUMN igreja_id SET NOT NULL;
ALTER TABLE public.eventos ALTER COLUMN igreja_id SET NOT NULL;