-- Create or replace function to check if a specific user is a sede admin
CREATE OR REPLACE FUNCTION public.is_sede_admin(uid uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  result_count INTEGER;
BEGIN
  -- Check if the provided user is a sede admin
  IF uid IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Count matching records
  SELECT COUNT(*) INTO result_count
  FROM public.usuarios_admin ua
  JOIN public.igrejas i ON i.id = ua.igreja_id
  WHERE ua.user_id = uid 
  AND i.tipo = 'Sede'
  AND ua.ativo = true
  AND ua.papel = 'admin';
  
  -- Return true if found at least one record
  RETURN result_count > 0;
END;
$$;