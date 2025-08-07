-- Criar usuário admin para jocksan.marcos@gmail.com
INSERT INTO public.usuarios_admin (user_id, email, nome, papel, ativo)
VALUES (
  'dummy-user-id', -- Este será substituído quando o usuário se registrar
  'jocksan.marcos@gmail.com',
  'Jocksan Marcos',
  'admin',
  true
)
ON CONFLICT (email) DO UPDATE SET
  ativo = true,
  papel = 'admin',
  nome = 'Jocksan Marcos';

-- Comentário: O usuário precisará se registrar com a senha Luckas@2025 pela interface de login