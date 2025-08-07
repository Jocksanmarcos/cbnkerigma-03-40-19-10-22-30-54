-- Verificar e corrigir políticas RLS para células
-- Permitir visualização pública de células ativas
DROP POLICY IF EXISTS "Ver células ativas publicamente" ON public.celulas;

CREATE POLICY "Ver células ativas publicamente" 
ON public.celulas 
FOR SELECT 
USING (ativa = true);