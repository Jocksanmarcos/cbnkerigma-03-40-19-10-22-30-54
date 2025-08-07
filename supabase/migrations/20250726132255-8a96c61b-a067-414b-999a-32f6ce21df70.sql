-- Criar função trigger para atualizar updated_at automaticamente em todas as tabelas
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger para updated_at em todas as tabelas que precisam
CREATE TRIGGER set_updated_at_celulas
  BEFORE UPDATE ON public.celulas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_contatos
  BEFORE UPDATE ON public.contatos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_contribuicoes
  BEFORE UPDATE ON public.contribuicoes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_estudos_biblicos
  BEFORE UPDATE ON public.estudos_biblicos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_eventos
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_usuarios_admin
  BEFORE UPDATE ON public.usuarios_admin
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Criar função trigger para criar automaticamente um usuário admin quando um usuário se registra
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para executar quando um novo usuário for criado
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Criar pelo menos um usuário admin super ativo (você pode ajustar o email conforme necessário)
-- Isso permitirá que o primeiro administrador aprove outros usuários
UPDATE public.usuarios_admin 
SET ativo = true, papel = 'admin' 
WHERE email = 'admin@cbnkerigma.com.br';