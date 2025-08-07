-- Adicionar política RLS para permitir que admins atualizem contatos
CREATE POLICY "Apenas admins podem atualizar contatos" 
ON public.contatos 
FOR UPDATE 
USING (EXISTS ( 
  SELECT 1 
  FROM usuarios_admin 
  WHERE user_id = auth.uid() 
  AND ativo = true
));