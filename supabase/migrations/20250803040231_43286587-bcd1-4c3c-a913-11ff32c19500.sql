-- Criar registro na tabela pessoas para o usuário admin
INSERT INTO public.pessoas (
  user_id,
  nome_completo, 
  email,
  tipo_pessoa,
  situacao,
  estado_espiritual,
  papel_igreja
) VALUES (
  'e8105244-b334-4ccd-a943-9bf7382463f8',
  'Jocksan Marcos',
  'admin@cbnkerigma.org.br', 
  'membro',
  'ativo',
  'membro',
  'admin'
) ON CONFLICT (email) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  nome_completo = EXCLUDED.nome_completo;