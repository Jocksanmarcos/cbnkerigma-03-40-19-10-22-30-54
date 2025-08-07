-- Corrigir problemas de segurança: Function Search Path Mutable
-- Atualizar funções que estão sem SET search_path

-- 1. Corrigir função is_sede_admin
CREATE OR REPLACE FUNCTION public.is_sede_admin(uid uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  sede_count INTEGER;
BEGIN
  -- Check if user is in sede igreja
  SELECT COUNT(*) INTO sede_count
  FROM public.usuarios_admin ua
  JOIN public.igrejas i ON i.id = ua.igreja_id
  WHERE ua.user_id = uid 
  AND i.tipo = 'Sede'
  AND ua.ativo = true
  AND ua.papel = 'admin';
  
  -- Return true if found at least one record
  RETURN sede_count > 0;
END;
$function$;

-- 2. Corrigir função handle_new_user (adicionar search_path)
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Inserir novo usuário admin com papel 'editor' e status inativo por padrão
  INSERT INTO public.usuarios_admin (user_id, email, nome, papel, ativo)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
    'editor',
    false  -- Usuários precisam ser ativados por um admin
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se o usuário já existe, apenas retorna
    RETURN NEW;
END;
$function$;

-- 3. Corrigir função handle_updated_at (adicionar search_path)
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 4. Criar usuários de teste para cada perfil
-- Admin geral
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_sso_user
) VALUES (
  gen_random_uuid(),
  'admin@kerigma.com',
  crypt('admin123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"nome": "Admin Sistema", "tipo_usuario": "admin"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Pastor/Líder
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_sso_user
) VALUES (
  gen_random_uuid(),
  'pastor@kerigma.com',
  crypt('pastor123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"nome": "Pastor Carlos Lima", "tipo_usuario": "pastor"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Aluno/Membro
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_sso_user
) VALUES (
  gen_random_uuid(),
  'aluno@kerigma.com',
  crypt('aluno123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"nome": "João Silva", "tipo_usuario": "aluno"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Líder de Célula
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  is_sso_user
) VALUES (
  gen_random_uuid(),
  'lider@kerigma.com',
  crypt('lider123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"nome": "Maria Santos", "tipo_usuario": "lider_celula"}',
  false
) ON CONFLICT (email) DO NOTHING;

-- Configurar usuários admin na tabela usuarios_admin
-- Buscar e inserir registros para os usuários criados
DO $$
DECLARE
  admin_user_id UUID;
  pastor_user_id UUID;
  igreja_sede_id UUID;
BEGIN
  -- Buscar IDs dos usuários
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@kerigma.com';
  SELECT id INTO pastor_user_id FROM auth.users WHERE email = 'pastor@kerigma.com';
  
  -- Buscar ou criar igreja sede
  SELECT id INTO igreja_sede_id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1;
  
  IF igreja_sede_id IS NULL THEN
    INSERT INTO public.igrejas (nome, tipo, endereco, telefone, email, ativa)
    VALUES ('Igreja Cristã Batista Nacional - Sede', 'Sede', 'Endereço Sede', '(11) 99999-9999', 'contato@kerigma.com', true)
    RETURNING id INTO igreja_sede_id;
  END IF;
  
  -- Inserir admin
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.usuarios_admin (user_id, email, nome, papel, ativo, igreja_id)
    VALUES (admin_user_id, 'admin@kerigma.com', 'Admin Sistema', 'admin', true, igreja_sede_id)
    ON CONFLICT (email) DO UPDATE SET ativo = true, papel = 'admin';
  END IF;
  
  -- Inserir pastor
  IF pastor_user_id IS NOT NULL THEN
    INSERT INTO public.usuarios_admin (user_id, email, nome, papel, ativo, igreja_id)
    VALUES (pastor_user_id, 'pastor@kerigma.com', 'Pastor Carlos Lima', 'admin', true, igreja_sede_id)
    ON CONFLICT (email) DO UPDATE SET ativo = true, papel = 'admin';
  END IF;
END $$;

-- Criar dados de teste básicos para pessoas
INSERT INTO public.pessoas (
  nome_completo,
  email,
  telefone,
  data_nascimento,
  tipo_pessoa,
  situacao,
  estado_espiritual,
  papel_igreja,
  igreja_id
) 
SELECT 
  'João Silva Aluno',
  'aluno@kerigma.com',
  '(11) 99999-1111',
  '1995-05-15',
  'membro',
  'ativo',
  'batizado',
  'aluno',
  id
FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.pessoas (
  nome_completo,
  email,
  telefone,
  data_nascimento,
  tipo_pessoa,
  situacao,
  estado_espiritual,
  papel_igreja,
  igreja_id
) 
SELECT 
  'Maria Santos Líder',
  'lider@kerigma.com',
  '(11) 99999-2222',
  '1980-03-20',
  'lider',
  'ativo',
  'batizado',
  'lider_celula',
  id
FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Criar célula de teste
INSERT INTO public.celulas (
  nome,
  lider,
  endereco,
  bairro,
  dia_semana,
  horario,
  telefone,
  ativa,
  igreja_id,
  lider_id
)
SELECT 
  'Célula Esperança',
  'Maria Santos Líder',
  'Rua das Flores, 123',
  'Centro',
  'Quarta-feira',
  '19:30:00',
  '(11) 99999-2222',
  true,
  igrejas.id,
  pessoas.id
FROM public.igrejas 
CROSS JOIN public.pessoas 
WHERE igrejas.tipo = 'Sede' 
AND pessoas.email = 'lider@kerigma.com'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Criar curso de teste
INSERT INTO public.cursos_ensino (
  nome,
  descricao,
  categoria,
  nivel,
  ativo,
  carga_horaria,
  emite_certificado
) VALUES (
  'Fundamentos da Fé',
  'Curso básico sobre os fundamentos da fé cristã',
  'discipulado',
  'iniciante',
  true,
  40,
  true
) ON CONFLICT DO NOTHING;

-- Criar evento de teste na agenda
INSERT INTO public.agenda_eventos (
  titulo,
  descricao,
  data_inicio,
  data_fim,
  local,
  tipo,
  publico,
  igreja_id
)
SELECT 
  'Culto de Domingo',
  'Culto dominical de adoração e palavra',
  NOW() + INTERVAL '3 days',
  NOW() + INTERVAL '3 days' + INTERVAL '2 hours',
  'Templo Principal',
  'culto',
  true,
  id
FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1
ON CONFLICT DO NOTHING;