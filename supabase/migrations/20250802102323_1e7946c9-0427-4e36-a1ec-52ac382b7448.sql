-- Verificar e corrigir a função is_sede_admin
-- Primeiro vamos verificar se está funcionando com debug
CREATE OR REPLACE FUNCTION public.is_sede_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result_count INTEGER;
  current_user_id UUID;
BEGIN
  -- Pegar o ID do usuário atual
  current_user_id := auth.uid();
  
  -- Debug: verificar se temos o user_id
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Fazer a consulta e contar os resultados
  SELECT COUNT(*) INTO result_count
  FROM public.usuarios_admin ua
  JOIN public.igrejas i ON i.id = ua.igreja_id
  WHERE ua.user_id = current_user_id 
  AND i.tipo = 'Sede'
  AND ua.ativo = true
  AND ua.papel = 'admin';
  
  -- Retornar true se encontrou pelo menos um registro
  RETURN result_count > 0;
END;
$$;