-- Remover as políticas problemáticas
DROP POLICY IF EXISTS "Admins confirmados podem ver todos os registros" ON public.usuarios_admin;
DROP POLICY IF EXISTS "Usuários podem ver seu próprio registro admin" ON public.usuarios_admin;

-- Criar função security definer para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Criar função security definer para verificar acesso próprio
CREATE OR REPLACE FUNCTION public.can_access_own_admin_record()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Criar novas políticas usando as funções security definer
CREATE POLICY "Admins podem ver todos os registros"
ON public.usuarios_admin
FOR SELECT
USING (public.is_admin_user());

CREATE POLICY "Usuários podem ver seu próprio registro"
ON public.usuarios_admin
FOR SELECT
USING (user_id = auth.uid());