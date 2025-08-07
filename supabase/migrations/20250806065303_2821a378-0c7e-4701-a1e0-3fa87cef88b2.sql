-- Corrigir warnings de segurança: Adicionar search_path seguro às funções
-- Atualizar função handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  -- Inserir novo registro em pessoas quando usuário se registra
  INSERT INTO public.pessoas (
    user_id, 
    email, 
    nome_completo,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, apenas retorna
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log erro mas não falha o processo de registro
    RAISE WARNING 'Erro ao criar perfil de pessoa: %', SQLERRM;
    RETURN NEW;
END;
$$;