-- Fix: Remover trigger existente antes de recriá-lo
DROP TRIGGER IF EXISTS security_profiles_updated_at ON public.security_profiles;

-- Criar permissões específicas para perfis padrão
DO $$
DECLARE
    admin_profile_id UUID;
    coordenador_profile_id UUID;
    lider_profile_id UUID;
    membro_profile_id UUID;
    permission_record RECORD;
BEGIN
    -- Obter IDs dos perfis
    SELECT id INTO admin_profile_id FROM security_profiles WHERE name = 'Administrador Geral';
    SELECT id INTO coordenador_profile_id FROM security_profiles WHERE name = 'Coordenador';
    SELECT id INTO lider_profile_id FROM security_profiles WHERE name = 'Líder';
    SELECT id INTO membro_profile_id FROM security_profiles WHERE name = 'Membro';
    
    -- Dar todas as permissões ao Administrador Geral
    FOR permission_record IN SELECT id FROM security_permissions LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id)
        VALUES (admin_profile_id, permission_record.id)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
    
    -- Permissões do Coordenador (quase todas exceto admin)
    FOR permission_record IN 
        SELECT id FROM security_permissions 
        WHERE module_name != 'admin' OR action_name = 'read'
    LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id)
        VALUES (coordenador_profile_id, permission_record.id)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
    
    -- Permissões do Líder (módulos básicos)
    FOR permission_record IN 
        SELECT id FROM security_permissions 
        WHERE module_name IN ('dashboard', 'celulas', 'agenda', 'ensino', 'pessoas') 
        AND action_name IN ('read', 'create', 'update')
    LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id)
        VALUES (lider_profile_id, permission_record.id)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
    
    -- Permissões do Membro (acesso básico)
    FOR permission_record IN 
        SELECT id FROM security_permissions 
        WHERE (module_name = 'dashboard' AND action_name = 'read')
        OR (module_name = 'portal_aluno')
        OR (module_name = 'agenda' AND action_name = 'read')
    LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id)
        VALUES (membro_profile_id, permission_record.id)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
END $$;