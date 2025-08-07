-- Inserir perfis de segurança com todos os campos obrigatórios
INSERT INTO security_profiles (name, display_name, description, level, is_system, color, icon, active) 
VALUES 
  ('admin', 'Administrador', 'Acesso total ao sistema', 100, true, '#ef4444', 'Shield', true),
  ('coordenador', 'Coordenador', 'Acesso de coordenação e supervisão', 80, true, '#f59e0b', 'Crown', true),
  ('lider', 'Líder', 'Acesso de liderança e gestão', 60, true, '#3b82f6', 'Users', true),
  ('membro', 'Membro', 'Acesso básico de membro', 40, true, '#10b981', 'User', true),
  ('visitante', 'Visitante', 'Acesso limitado para visitantes', 20, true, '#6b7280', 'Eye', true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  level = EXCLUDED.level,
  color = EXCLUDED.color,
  icon = EXCLUDED.icon;

-- Associar todas as permissões ao perfil admin
DO $$
DECLARE
    admin_profile_id UUID;
    permission_id UUID;
BEGIN
    SELECT id INTO admin_profile_id FROM security_profiles WHERE name = 'admin';
    
    FOR permission_id IN SELECT id FROM security_permissions LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id, granted)
        VALUES (admin_profile_id, permission_id, true)
        ON CONFLICT (profile_id, permission_id) DO UPDATE SET granted = true;
    END LOOP;
END $$;

-- Dar permissões básicas aos outros perfis
DO $$
DECLARE
    profile_record RECORD;
    permission_record RECORD;
BEGIN
    -- Coordenador - quase todas as permissões exceto admin sensível
    SELECT id INTO profile_record.id FROM security_profiles WHERE name = 'coordenador';
    FOR permission_record IN 
        SELECT id FROM security_permissions 
        WHERE NOT (module_name = 'admin' AND is_sensitive = true)
    LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id, granted)
        VALUES (profile_record.id, permission_record.id, true)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
    
    -- Líder - permissões para gestão básica
    SELECT id INTO profile_record.id FROM security_profiles WHERE name = 'lider';
    FOR permission_record IN 
        SELECT id FROM security_permissions 
        WHERE module_name IN ('dashboard', 'celulas', 'agenda', 'ensino', 'pessoas', 'comunicacao')
        AND action_name IN ('read', 'create', 'update')
        AND is_sensitive = false
    LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id, granted)
        VALUES (profile_record.id, permission_record.id, true)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
    
    -- Membro - acesso básico
    SELECT id INTO profile_record.id FROM security_profiles WHERE name = 'membro';
    FOR permission_record IN 
        SELECT id FROM security_permissions 
        WHERE (module_name = 'dashboard' AND action_name = 'read')
        OR module_name = 'portal_aluno'
        OR (module_name = 'agenda' AND action_name = 'read')
    LOOP
        INSERT INTO security_profile_permissions (profile_id, permission_id, granted)
        VALUES (profile_record.id, permission_record.id, true)
        ON CONFLICT (profile_id, permission_id) DO NOTHING;
    END LOOP;
END $$;