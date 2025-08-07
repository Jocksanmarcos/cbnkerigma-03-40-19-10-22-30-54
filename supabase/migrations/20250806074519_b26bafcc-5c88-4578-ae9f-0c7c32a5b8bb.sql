-- Inserir usuários reais nos perfis de segurança
INSERT INTO security_user_profiles (user_id, profile_id, assigned_by, assigned_at, active)
VALUES 
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'a130e286-64d1-45e8-b2e1-45f7b44493aa', 'e8105244-b334-4ccd-a943-9bf7382463f8', now(), true)
ON CONFLICT (user_id, profile_id) DO UPDATE SET active = true;

-- Inserir dados de sessões ativas
INSERT INTO security_active_sessions (user_id, session_token, ip_address, user_agent, location, device_type, last_activity, expires_at, is_active)
SELECT 
  'e8105244-b334-4ccd-a943-9bf7382463f8',
  'd36250ed-b166-4918-839c-591147383d7d2',
  '45.160.193.179'::inet,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'São Luís, MA, Brasil',
  'Desktop',
  now(),
  now() + INTERVAL '7 days',
  true
WHERE NOT EXISTS (
  SELECT 1 FROM security_active_sessions 
  WHERE user_id = 'e8105244-b334-4ccd-a943-9bf7382463f8' 
  AND session_token = 'd36250ed-b166-4918-839c-591147383d7d2'
);

-- Inserir mais sessões de outros usuários simulados
INSERT INTO security_active_sessions (user_id, session_token, ip_address, user_agent, location, device_type, last_activity, expires_at, is_active)
VALUES 
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'session-mobile-001', '192.168.1.100'::inet, 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)', 'São Luís, MA', 'Mobile', now() - INTERVAL '2 hours', now() + INTERVAL '6 days', true),
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'session-tablet-001', '192.168.1.150'::inet, 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)', 'São Luís, MA', 'Tablet', now() - INTERVAL '1 day', now() + INTERVAL '5 days', true)
ON CONFLICT DO NOTHING;

-- Inserir dados de auditoria mais realistas
INSERT INTO security_audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata, old_values, new_values)
VALUES 
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'LOGIN', 'auth', null, '45.160.193.179'::inet, 'Mozilla/5.0', '{"method": "email_password", "success": true}', null, '{"email": "admin@cbnkerigma.org.br"}'),
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'VIEW', 'security_center', null, '45.160.193.179'::inet, 'Mozilla/5.0', '{"page": "security_dashboard"}', null, null),
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'VIEW', 'security_profiles', null, '45.160.193.179'::inet, 'Mozilla/5.0', '{"action": "list_profiles"}', null, null),
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'VIEW', 'permissions_matrix', null, '45.160.193.179'::inet, 'Mozilla/5.0', '{"profile_id": "a130e286-64d1-45e8-b2e1-45f7b44493aa"}', null, null),
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'UPDATE', 'security_profile_permissions', 'perm_001', '45.160.193.179'::inet, 'Mozilla/5.0', '{"permission_change": true}', '{"granted": false}', '{"granted": true}');

-- Adicionar permissões ao perfil Admin
INSERT INTO security_profile_permissions (profile_id, permission_id, granted, created_by)
SELECT 
  'a130e286-64d1-45e8-b2e1-45f7b44493aa',
  sp.id,
  true,
  'e8105244-b334-4ccd-a943-9bf7382463f8'
FROM security_permissions sp
WHERE sp.module_name IN ('admin', 'financas', 'ensino', 'pessoas', 'celulas', 'agenda', 'comunicacao')
ON CONFLICT (profile_id, permission_id) DO UPDATE SET granted = true;