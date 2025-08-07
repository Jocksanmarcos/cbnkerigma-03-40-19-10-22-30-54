-- Corrigir problemas de segurança nas funções
-- Recriar função handle_updated_at com search_path correto
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Recriar função handle_new_user com search_path correto
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';