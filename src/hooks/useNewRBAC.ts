import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Profile {
  id: string;
  name: string;
  display_name: string;
  description: string;
  level: number;
  color: string;
  icon: string;
  active: boolean;
  is_system: boolean;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  action: string;
  subject: string;
  resource_type?: string;
  description: string;
  is_sensitive: boolean;
  created_at: string;
}

export interface ProfilePermission {
  id: string;
  profile_id: string;
  permission_id: string;
  granted: boolean;
  granted_at: string;
  granted_by?: string;
}

export const useNewRBAC = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [profilePermissions, setProfilePermissions] = useState<ProfilePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
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
    return userCan('manage', 'system') || userCan('manage', 'security');
  }, [userCan]);

  // Carregar perfis de segurança
  const loadProfiles = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
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
        .from('permissions')
        .select('*')
        .order('subject, action');

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
        .from('profile_permissions')
        .select('*');

      if (error) throw error;
      setProfilePermissions(data || []);
    } catch (error) {
      console.error('Erro ao carregar permissões de perfis:', error);
    }
  }, []);

  // Carregar perfil e permissões do usuário atual
  const loadUserProfile = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Carregar perfil do usuário
      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select(`
          profile_id,
          profiles!inner(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (pessoaError && pessoaError.code !== 'PGRST116') {
        throw pessoaError;
      }

      if (pessoaData?.profiles) {
        setUserProfile(pessoaData.profiles as Profile);

        // Carregar permissões do usuário baseadas no perfil
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('profile_permissions')
          .select(`
            granted,
            permissions!inner(
              action,
              subject,
              resource_type
            )
          `)
          .eq('profile_id', pessoaData.profile_id)
          .eq('granted', true);

        if (permissionsError) throw permissionsError;

        const perms: string[] = [];
        permissionsData?.forEach((pp: any) => {
          if (pp.granted && pp.permissions) {
            const perm = pp.permissions;
            const key = perm.resource_type 
              ? `${perm.subject}.${perm.action}.${perm.resource_type}`
              : `${perm.subject}.${perm.action}`;
            perms.push(key);
          }
        });

        setUserPermissions([...new Set(perms)]);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      setUserProfile(null);
      setUserPermissions([]);
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
        .from('profile_permissions')
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
          return [...prev, { 
            id: crypto.randomUUID(),
            profile_id: profileId, 
            permission_id: permissionId, 
            granted,
            granted_at: new Date().toISOString(),
            granted_by: user?.id
          }];
        }
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      return false;
    }
  }, [user?.id]);

  // Criar novo perfil
  const createProfile = useCallback(async (profileData: Omit<Profile, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
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
  const updateProfile = useCallback(async (id: string, updates: Partial<Profile>) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
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
        .from('profiles')
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
    const grouped: Record<string, Permission[]> = {};
    permissions.forEach(permission => {
      if (!grouped[permission.subject]) {
        grouped[permission.subject] = [];
      }
      grouped[permission.subject].push(permission);
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
        loadUserProfile()
      ]);
      setLoading(false);
    };

    loadData();
  }, [loadProfiles, loadPermissions, loadProfilePermissions, loadUserProfile]);

  return {
    // States
    profiles,
    permissions,
    profilePermissions,
    userPermissions,
    userProfile,
    loading,

    // Functions
    userCan,
    isAdmin,
    loadProfiles,
    loadPermissions,
    loadProfilePermissions,
    loadUserProfile,
    updateProfilePermission,
    createProfile,
    updateProfile,
    deleteProfile,
    profileHasPermission,
    getPermissionsByModule
  };
};