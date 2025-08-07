-- Atualizar a tabela pessoas para vincular com auth.users através do email
UPDATE public.pessoas 
SET user_id = au.id
FROM auth.users au
WHERE pessoas.email = au.email 
AND pessoas.user_id IS NULL;

-- Verificar se ainda há registros sem user_id
-- (este comando é apenas informativo, não altera dados)
DO $$
DECLARE
    sem_user_id INTEGER;
BEGIN
    SELECT COUNT(*) INTO sem_user_id
    FROM public.pessoas 
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Registros na tabela pessoas sem user_id: %', sem_user_id;
END $$;