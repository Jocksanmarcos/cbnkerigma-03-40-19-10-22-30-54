-- Atualizar o usuário com user_id correto para ativo e admin
UPDATE public.usuarios_admin 
SET ativo = true, papel = 'admin'
WHERE user_id = 'e8105244-b334-4ccd-a943-9bf7382463f8' 
  AND email = 'admin@cbnkerigma.org.br';

-- Remover o registro duplicado sem user_id
DELETE FROM public.usuarios_admin 
WHERE user_id IS NULL 
  AND email = 'admin@cbnkerigma.org.br';