-- Inserir usuário admin na tabela pessoas
INSERT INTO public.pessoas (
  user_id,
  nome_completo, 
  email,
  tipo_pessoa,
  situacao,
  estado_espiritual,
  papel_igreja,
  igreja_id
) VALUES (
  'e8105244-b334-4ccd-a943-9bf7382463f8',
  'Jocksan Marcos',
  'admin@cbnkerigma.org.br', 
  'membro',
  'ativo',
  'membro_ativo',
  'administrador_geral',
  'd49516eb-0044-44af-8108-1e5635dd3b99'
);