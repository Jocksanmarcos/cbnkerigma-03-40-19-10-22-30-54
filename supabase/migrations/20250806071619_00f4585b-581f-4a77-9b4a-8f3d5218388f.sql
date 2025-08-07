-- === POLÍTICAS RLS BÁSICAS PARA SISTEMA DE SEGURANÇA ===

-- Verificar se a função is_security_admin existe, se não, criar uma versão simples
CREATE OR REPLACE FUNCTION public.is_security_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verificar no novo sistema de segurança
  IF has_security_permission(user_uuid, 'admin', 'manage_system') THEN
    RETURN true;
  END IF;
  
  -- Fallback para o sistema antigo (compatibilidade)
  IF is_sede_admin(user_uuid) OR is_pastor_missao(user_uuid) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;

-- Implementar políticas básicas existentes nas tabelas de segurança
DO $$ 
BEGIN
  -- Ativar RLS nas tabelas de segurança se existirem
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.security_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Security admins can manage profiles" ON public.security_profiles;
    DROP POLICY IF EXISTS "Everyone can view active profiles" ON public.security_profiles;
    
    EXECUTE 'CREATE POLICY "Security admins can manage profiles" ON public.security_profiles
    FOR ALL USING (is_security_admin())';
    
    EXECUTE 'CREATE POLICY "Everyone can view active profiles" ON public.security_profiles
    FOR SELECT USING (active = true)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_permissions' AND table_schema = 'public') THEN
    ALTER TABLE public.security_permissions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Security admins can manage permissions" ON public.security_permissions;
    DROP POLICY IF EXISTS "Everyone can view permissions" ON public.security_permissions;
    
    EXECUTE 'CREATE POLICY "Security admins can manage permissions" ON public.security_permissions
    FOR ALL USING (is_security_admin())';
    
    EXECUTE 'CREATE POLICY "Everyone can view permissions" ON public.security_permissions
    FOR SELECT USING (true)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_profile_permissions' AND table_schema = 'public') THEN
    ALTER TABLE public.security_profile_permissions ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Security admins can manage profile permissions" ON public.security_profile_permissions;
    DROP POLICY IF EXISTS "Everyone can view profile permissions" ON public.security_profile_permissions;
    
    EXECUTE 'CREATE POLICY "Security admins can manage profile permissions" ON public.security_profile_permissions
    FOR ALL USING (is_security_admin())';
    
    EXECUTE 'CREATE POLICY "Everyone can view profile permissions" ON public.security_profile_permissions
    FOR SELECT USING (true)';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_user_profiles' AND table_schema = 'public') THEN
    ALTER TABLE public.security_user_profiles ENABLE ROW LEVEL SECURITY;
    
    DROP POLICY IF EXISTS "Security admins can manage user profiles" ON public.security_user_profiles;
    DROP POLICY IF EXISTS "Users can view own profiles" ON public.security_user_profiles;
    
    EXECUTE 'CREATE POLICY "Security admins can manage user profiles" ON public.security_user_profiles
    FOR ALL USING (is_security_admin())';
    
    EXECUTE 'CREATE POLICY "Users can view own profiles" ON public.security_user_profiles
    FOR SELECT USING (user_id = auth.uid() OR is_security_admin())';
  END IF;
END $$;