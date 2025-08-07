-- Corrigir a função is_sede_admin para verificar corretamente
CREATE OR REPLACE FUNCTION public.is_sede_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
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
    AND ua.papel = 'admin'
  );
END;
$$;