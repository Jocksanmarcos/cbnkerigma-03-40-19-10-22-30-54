-- Inserir usuários reais nos perfis de segurança
INSERT INTO security_user_profiles (user_id, profile_id, assigned_by, assigned_at, active)
VALUES 
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'a130e286-64d1-45e8-b2e1-45f7b44493aa', 'e8105244-b334-4ccd-a943-9bf7382463f8', now(), true)
ON CONFLICT (user_id, profile_id) DO UPDATE SET active = true;

-- Inserir dados de sessões ativas
INSERT INTO security_active_sessions (user_id, session_id, ip_address, user_agent, last_activity, expires_at)
SELECT 
  'e8105244-b334-4ccd-a943-9bf7382463f8',
  'd36250ed-b166-4918-839c-591147383d7d2',
  '45.160.193.179',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  now(),
  now() + INTERVAL '7 days'
WHERE NOT EXISTS (
  SELECT 1 FROM security_active_sessions 
  WHERE user_id = 'e8105244-b334-4ccd-a943-9bf7382463f8' 
  AND session_id = 'd36250ed-b166-4918-839c-591147383d7d2'
);

-- Inserir dados de auditoria
INSERT INTO security_audit_logs (user_id, action, resource_type, resource_id, ip_address, user_agent, metadata, old_values, new_values)
VALUES 
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'LOGIN', 'auth', null, '45.160.193.179', 'Mozilla/5.0', '{"method": "email_password"}', null, '{"email": "admin@cbnkerigma.org.br"}'),
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'SELECT', 'security_profiles', null, '45.160.193.179', 'Mozilla/5.0', '{"action": "view_security_center"}', null, null),
  ('e8105244-b334-4ccd-a943-9bf7382463f8', 'SELECT', 'security_permissions', null, '45.160.193.179', 'Mozilla/5.0', '{"action": "view_permissions_matrix"}', null, null);

-- Atualizar estatísticas
UPDATE security_profiles SET 
  updated_at = now()
WHERE id IN (
  'a130e286-64d1-45e8-b2e1-45f7b44493aa',
  'de651cfe-b1cd-485a-ba7d-e83e82037c7b',
  '8e4b62a3-bf60-4471-8859-b969eba9c065'
);