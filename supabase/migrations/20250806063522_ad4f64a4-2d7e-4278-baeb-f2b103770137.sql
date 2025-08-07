-- Verificar se os perfis existem e popular com permissões básicas
DO $$
DECLARE
    admin_profile_id UUID;
    membro_profile_id UUID;
    permission_record RECORD;
BEGIN
    -- Verificar se existe perfil de admin, se não, criar um básico
    SELECT id INTO admin_profile_id FROM security_profiles WHERE name = 'Admin' OR name = 'Administrador Geral' LIMIT 1;
    
    IF admin_profile_id IS NULL THEN
        INSERT INTO security_profiles (name, description, level) 
        VALUES ('Admin', 'Administrador do sistema', 100)
        RETURNING id INTO admin_profile_id;
    END IF;
    
    -- Verificar se existe perfil de membro
    SELECT id INTO membro_profile_id FROM security_profiles WHERE name = 'Membro' LIMIT 1;
    
    IF membro_profile_id IS NULL THEN
        INSERT INTO security_profiles (name, description, level) 
        VALUES ('Membro', 'Membro comum', 20)
        RETURNING id INTO membro_profile_id;
    END IF;
    
    -- Dar permissões básicas de admin
    FOR permission_record IN 
        SELECT id FROM security_permissions 
        WHERE module_name = 'admin' AND action_name = 'manage_system'
        LIMIT 5
    LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id)
        VALUES (admin_profile_id, permission_record.id)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
    
    -- Dar permissões básicas de membro
    FOR permission_record IN 
        SELECT id FROM security_permissions 
        WHERE module_name = 'dashboard' AND action_name = 'read'
        LIMIT 2
    LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id)
        VALUES (membro_profile_id, permission_record.id)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
    
END $$;