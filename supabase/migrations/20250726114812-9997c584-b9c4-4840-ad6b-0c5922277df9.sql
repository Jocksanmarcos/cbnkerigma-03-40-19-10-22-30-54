-- Corrigir problema de search_path removendo e recriando com CASCADE
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recriar os triggers que foram removidos
CREATE TRIGGER update_contatos_updated_at
  BEFORE UPDATE ON public.contatos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contribuicoes_updated_at
  BEFORE UPDATE ON public.contribuicoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_celulas_updated_at
  BEFORE UPDATE ON public.celulas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estudos_biblicos_updated_at
  BEFORE UPDATE ON public.estudos_biblicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usuarios_admin_updated_at
  BEFORE UPDATE ON public.usuarios_admin
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();