-- Primeiro, vamos corrigir a function handle_new_user para evitar conflitos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Só criar se não for admin existente e se não for usuário de teste
  IF NOT EXISTS (SELECT 1 FROM public.usuarios_admin WHERE user_id = NEW.id) 
     AND NEW.email NOT LIKE '%@kerigma.com' THEN
    -- Inserir novo usuário admin com papel 'editor' e status inativo por padrão
    INSERT INTO public.usuarios_admin (user_id, email, nome, papel, ativo, igreja_id)
    SELECT 
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
      'editor',
      false,  -- Usuários precisam ser ativados por um admin
      i.id
    FROM public.igrejas i 
    WHERE i.tipo = 'Sede' 
    LIMIT 1;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o usuário já existe, apenas retorna
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log do erro mas não falha
    RAISE WARNING 'Erro ao criar usuário automático: %', SQLERRM;
    RETURN NEW;
END;
$$;