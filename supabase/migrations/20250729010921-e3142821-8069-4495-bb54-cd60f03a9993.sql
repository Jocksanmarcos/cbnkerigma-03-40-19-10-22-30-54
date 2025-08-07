-- Verificar se existe pessoa com esse email e criar se necessário
INSERT INTO public.pessoas (
  nome_completo,
  email,
  tipo_pessoa,
  estado_espiritual,
  situacao
) VALUES (
  'Jocksan Marcos',
  'jocksan.marcos@gmail.com',
  'membro',
  'membro',
  'ativo'
) ON CONFLICT (email) DO UPDATE SET
  situacao = 'ativo',
  tipo_pessoa = 'membro',
  updated_at = now();

-- Verificar se já existe na tabela usuarios_admin e remover ou marcar como inativo
UPDATE public.usuarios_admin 
SET ativo = false, papel = 'editor'
WHERE email = 'jocksan.marcos@gmail.com';