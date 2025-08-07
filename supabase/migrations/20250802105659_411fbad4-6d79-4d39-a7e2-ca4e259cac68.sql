-- Recreate function with better debugging and simplified logic
CREATE OR REPLACE FUNCTION public.is_sede_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count INTEGER;
  sede_count INTEGER;
  admin_count INTEGER;
BEGIN
  -- Log the input
  RAISE LOG 'is_sede_admin called with uid: %', uid;
  
  -- Check if uid is null
  IF uid IS NULL THEN
    RAISE LOG 'is_sede_admin: uid is null, returning false';
    RETURN FALSE;
  END IF;
  
  -- Check if user exists in usuarios_admin
  SELECT COUNT(*) INTO user_count
  FROM public.usuarios_admin 
  WHERE user_id = uid;
  
  RAISE LOG 'is_sede_admin: found % usuarios_admin records for uid %', user_count, uid;
  
  -- Check if user is active admin
  SELECT COUNT(*) INTO admin_count
  FROM public.usuarios_admin 
  WHERE user_id = uid 
  AND ativo = true 
  AND papel = 'admin';
  
  RAISE LOG 'is_sede_admin: found % active admin records for uid %', admin_count, uid;
  
  -- Check if user is in sede igreja
  SELECT COUNT(*) INTO sede_count
  FROM public.usuarios_admin ua
  JOIN public.igrejas i ON i.id = ua.igreja_id
  WHERE ua.user_id = uid 
  AND i.tipo = 'Sede'
  AND ua.ativo = true
  AND ua.papel = 'admin';
  
  RAISE LOG 'is_sede_admin: found % sede admin records for uid %', sede_count, uid;
  
  -- Return true if found at least one record
  RETURN sede_count > 0;
END;
$$;