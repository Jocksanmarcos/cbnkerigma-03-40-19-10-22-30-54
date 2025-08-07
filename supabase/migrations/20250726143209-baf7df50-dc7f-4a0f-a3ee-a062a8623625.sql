-- Criar um novo usuário administrativo para teste
INSERT INTO public.usuarios_admin (
  email, 
  nome, 
  papel, 
  ativo
) VALUES (
  'admin@cbnkerigma.org.br',
  'Administrador Teste',
  'admin',
  true
);