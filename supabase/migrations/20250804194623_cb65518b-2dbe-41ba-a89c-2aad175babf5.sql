-- Apenas corrigir problemas de segurança: Function Search Path Mutable
-- Atualizar funções que estão sem SET search_path

-- 1. Corrigir função is_sede_admin
CREATE OR REPLACE FUNCTION public.is_sede_admin(uid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sede_count INTEGER;
BEGIN
  -- Check if user is in sede igreja
  SELECT COUNT(*) INTO sede_count
  FROM public.usuarios_admin ua
  JOIN public.igrejas i ON i.id = ua.igreja_id
  WHERE ua.user_id = uid 
  AND i.tipo = 'Sede'
  AND ua.ativo = true
  AND ua.papel = 'admin';
  
  -- Return true if found at least one record
  RETURN sede_count > 0;
END;
$function$;

-- 2. Corrigir função handle_new_user (adicionar search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserir novo usuário admin com papel 'editor' e status inativo por padrão
  INSERT INTO public.usuarios_admin (user_id, email, nome, papel, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    'editor',
    false  -- Usuários precisam ser ativados por um admin
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o usuário já existe, apenas retorna
    RETURN NEW;
END;
$function$;

-- 3. Corrigir função handle_updated_at (adicionar search_path)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;