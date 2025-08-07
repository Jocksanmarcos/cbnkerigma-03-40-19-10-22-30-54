-- Criar usuário admin diretamente no sistema de auth
-- Vamos verificar primeiro se o usuário já existe
DO $$
DECLARE
    user_exists boolean;
BEGIN
    -- Verificar se já existe um usuário com esse email no auth.users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'contato@cbnkerigma.org.br') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Inserir usuário diretamente na tabela auth.users
        INSERT INTO auth.users (
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            role
        ) VALUES (
            'contato@cbnkerigma.org.br',
            crypt('Kerigma@2025#', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"nome": "Administrador CBN Kerigma"}'::jsonb,
            'authenticated'
        );
    END IF;
    
    -- Atualizar o registro na tabela usuarios_admin para garantir que está vinculado
    UPDATE public.usuarios_admin 
    SET user_id = (SELECT id FROM auth.users WHERE email = 'contato@cbnkerigma.org.br')
    WHERE email = 'contato@cbnkerigma.org.br' AND user_id IS NULL;
END
$$;