-- Criar política para permitir visualização pública de células ativas
CREATE POLICY "Ver células ativas publicamente" 
ON public.celulas 
FOR SELECT 
USING (ativa = true);