import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SecurityProfile {
  id: string;
  name: string;
  display_name: string;
  description: string;
  level: number;
  color: string;
  icon: string;
  active: boolean;
  is_system: boolean;
}

interface SecurityPermission {
  id: string;
  action_name: string;
  module_name: string;
  resource_type?: string;
  description: string;
  is_sensitive: boolean;
}

interface ProfilePermission {
  profile_id: string;
  permission_id: string;
  granted: boolean;
}

export const useRBAC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<SecurityProfile[]>([]);
  const [permissions, setPermissions] = useState<SecurityPermission[]>([]);
  const [profilePermissions, setProfilePermissions] = useState<ProfilePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Verificar se usuário tem permissão específica
  const userCan = useCallback((action: string, subject: string, resourceType?: string): boolean => {
    if (!user) return false;
    
    const permissionKey = resourceType 
      ? `${subject}.${action}.${resourceType}`
      : `${subject}.${action}`;
    
    return userPermissions.includes(permissionKey);
  }, [userPermissions, user]);

  // Verificar se usuário é admin
  const isAdmin = useCallback((): boolean => {
    return userCan('manage', 'admin', 'system');
  }, [userCan]);

  // Carregar perfis de segurança
  const loadProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('security_profiles')
        .select('*')
        .eq('active', true)
        .order('level', { ascending: false });

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
    }
  }, []);

  // Carregar permissões
  const loadPermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('security_permissions')
        .select('*')
        .order('module_name, action_name');

      if (error) throw error;
      setPermissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    }
  }, []);

  // Carregar associações perfil-permissão
  const loadProfilePermissions = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('security_profile_permissions')
        .select('profile_id, permission_id, granted');

      if (error) throw error;
      setProfilePermissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar permissões de perfis:', error);
    }
  }, []);

  // Carregar permissões do usuário atual
  const loadUserPermissions = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('security_user_profiles')
        .select(`
          security_profiles!inner(
            security_profile_permissions!inner(
              granted,
              security_permissions!inner(
                action_name,
                module_name,
                resource_type
              )
            )
          )
        `)
        .eq('user_id', user.id)
        .eq('active', true);

      if (error) throw error;

      const perms: string[] = [];
      data?.forEach((userProfile: any) => {
        userProfile.security_profiles?.security_profile_permissions?.forEach((pp: any) => {
          if (pp.granted) {
            const perm = pp.security_permissions;
            const key = perm.resource_type 
              ? `${perm.module_name}.${perm.action_name}.${perm.resource_type}`
              : `${perm.module_name}.${perm.action_name}`;
            perms.push(key);
          }
        });
      });

      setUserPermissions([...new Set(perms)]);
    } catch (error) {
      console.error('Erro ao carregar permissões do usuário:', error);
    }
  }, [user?.id]);

  // Atualizar permissão de um perfil
  const updateProfilePermission = useCallback(async (
    profileId: string, 
    permissionId: string, 
    granted: boolean
  ) => {
    try {
      const { error } = await supabase
        .from('security_profile_permissions')
        .upsert({
          profile_id: profileId,
          permission_id: permissionId,
          granted,
          granted_at: new Date().toISOString(),
          granted_by: user?.id
        });

      if (error) throw error;

      // Atualizar estado local
      setProfilePermissions(prev => {
        const existing = prev.find(pp => 
          pp.profile_id === profileId && pp.permission_id === permissionId
        );
        
        if (existing) {
          return prev.map(pp => 
            pp.profile_id === profileId && pp.permission_id === permissionId
              ? { ...pp, granted }
              : pp
          );
        } else {
          return [...prev, { profile_id: profileId, permission_id: permissionId, granted }];
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      return false;
    }
  }, [user?.id]);

  // Criar novo perfil
  const createProfile = useCallback(async (profileData: Omit<SecurityProfile, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('security_profiles')
        .insert(profileData)
        .select()
        .single();

      if (error) throw error;

      setProfiles(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Erro ao criar perfil:', error);
      return null;
    }
  }, []);

  // Atualizar perfil
  const updateProfile = useCallback(async (id: string, updates: Partial<SecurityProfile>) => {
    try {
      const { data, error } = await supabase
        .from('security_profiles')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProfiles(prev => prev.map(p => p.id === id ? data : p));
      return data;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return null;
    }
  }, []);

  // Excluir perfil
  const deleteProfile = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('security_profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProfiles(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (error) {
      console.error('Erro ao excluir perfil:', error);
      return false;
    }
  }, []);

  // Verificar se perfil tem permissão
  const profileHasPermission = useCallback((profileId: string, permissionId: string): boolean => {
    const pp = profilePermissions.find(
      pp => pp.profile_id === profileId && pp.permission_id === permissionId
    );
    return pp?.granted || false;
  }, [profilePermissions]);

  // Agrupar permissões por módulo
  const getPermissionsByModule = useCallback(() => {
    const grouped: Record<string, SecurityPermission[]> = {};
    permissions.forEach(permission => {
      if (!grouped[permission.module_name]) {
        grouped[permission.module_name] = [];
      }
      grouped[permission.module_name].push(permission);
    });
    return grouped;
  }, [permissions]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadProfiles(),
        loadPermissions(),
        loadProfilePermissions(),
        loadUserPermissions()
      ]);
      setLoading(false);
    };

    loadData();
  }, [loadProfiles, loadPermissions, loadProfilePermissions, loadUserPermissions]);

  return {
    // States
    profiles,
    permissions,
    profilePermissions,
    userPermissions,
    loading,

    // Functions
    userCan,
    isAdmin,
    loadProfiles,
    loadPermissions,
    loadProfilePermissions,
    loadUserPermissions,
    updateProfilePermission,
    createProfile,
    updateProfile,
    deleteProfile,
    profileHasPermission,
    getPermissionsByModule
  };
};