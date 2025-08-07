-- Remover triggers problemáticos que referenciam colunas inexistentes
DROP TRIGGER IF EXISTS criar_historico_pessoa_trigger ON public.pessoas;
DROP FUNCTION IF EXISTS public.criar_historico_pessoa() CASCADE;

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