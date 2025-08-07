-- Remover a política problemática que causa recursão infinita
DROP POLICY IF EXISTS "Apenas admins podem ver outros admins" ON public.usuarios_admin;

-- Criar uma nova política que permite ao usuário ver seu próprio registro
-- e também criar uma função segura para verificar se é admin
CREATE POLICY "Usuários podem ver seu próprio registro admin" 
ON public.usuarios_admin 
FOR SELECT 
USING (user_id = auth.uid());

-- Criar uma política separada que permite ver todos os registros para usuários já confirmados como admin
CREATE POLICY "Admins confirmados podem ver todos os registros" 
ON public.usuarios_admin 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin ua 
    WHERE ua.user_id = auth.uid() 
    AND ua.ativo = true 
    AND ua.papel = 'admin'
  )
);