import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

// Estrutura baseada nas tabelas existentes
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

export interface UserProfile {
  id: string;
  profile: Profile;
  permissions: Permission[];
}

export const useRBACUnified = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [profilePermissions, setProfilePermissions] = useState<ProfilePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Cache para otimização
  const [permissionsCache, setPermissionsCache] = useState<{[key: string]: {
    permissions: string[];
    profile: Profile | null;
    timestamp: number;
  }}>({});

  // Verificar se usuário tem permissão específica
  const userCan = useCallback((permissionCode: string): boolean => {
    if (!user) return false;
    return userPermissions.includes(permissionCode);
  }, [userPermissions, user]);

  // Verificar se usuário é admin
  const isAdmin = useCallback((): boolean => {
    return userCan('admin.manage_system');
  }, [userCan]);

  // Verificar por subject e action (baseado na estrutura real)
  const userCanPerform = useCallback((subject: string, action: string): boolean => {
    return userPermissions.some(perm => {
      const parts = perm.split('.');
      return parts.length >= 2 && parts[0] === subject && parts[1] === action;
    });
  }, [userPermissions]);

  // Carregar perfis disponíveis
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

  // Carregar permissões disponíveis
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
      // Verificar cache (válido por 5 minutos)
      const cached = permissionsCache[user.id];
      const cacheValid = cached && (Date.now() - cached.timestamp < 5 * 60 * 1000);
      
      if (cacheValid) {
        setUserPermissions(cached.permissions);
        setUserProfile(cached.profile);
        return;
      }

      // Carregar perfil do usuário da tabela pessoas
      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select(`
          profile_id,
          profiles!inner(*)
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (pessoaError && pessoaError.code !== 'PGRST116') {
        throw pessoaError;
      }

      if (pessoaData?.profiles) {
        const profile = pessoaData.profiles as Profile;
        setUserProfile(profile);

        // Carregar permissões do usuário baseadas no perfil
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('profile_permissions')
          .select(`
            granted,
            permissions!inner(subject, action)
          `)
          .eq('profile_id', pessoaData.profile_id)
          .eq('granted', true);

        if (permissionsError) throw permissionsError;

        const perms: string[] = [];
        permissionsData?.forEach((pp: any) => {
          if (pp.granted && pp.permissions) {
            const permission = `${pp.permissions.subject}.${pp.permissions.action}`;
            perms.push(permission);
          }
        });

        setUserPermissions([...new Set(perms)]);

        // Atualizar cache
        setPermissionsCache(prev => ({
          ...prev,
          [user.id]: {
            permissions: [...new Set(perms)],
            profile: profile,
            timestamp: Date.now()
          }
        }));
      } else {
        // Usuário sem perfil definido - dar permissões básicas
        setUserProfile(null);
        setUserPermissions(['events.view', 'content.view', 'gallery.view']);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil do usuário:', error);
      setUserProfile(null);
      setUserPermissions([]);
    }
  }, [user?.id, profiles, permissionsCache]);

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
          granted
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

      // Limpar cache se usuário atual foi afetado
      if (userProfile?.id === profileId) {
        setPermissionsCache(prev => {
          const newCache = { ...prev };
          delete newCache[user?.id || ''];
          return newCache;
        });
        await loadUserProfile();
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      return false;
    }
  }, [userProfile?.id, user?.id, loadUserProfile]);

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

  // Verificar se perfil tem permissão
  const profileHasPermission = useCallback((profileId: string, permissionId: string): boolean => {
    const pp = profilePermissions.find(
      pp => pp.profile_id === profileId && pp.permission_id === permissionId
    );
    return pp?.granted || false;
  }, [profilePermissions]);

  // Agrupar permissões por subject
  const getPermissionsBySubject = useCallback(() => {
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
        loadProfilePermissions()
      ]);
      setLoading(false);
    };

    loadData();
  }, [loadProfiles, loadPermissions, loadProfilePermissions]);

  // Carregar perfil do usuário quando dados básicos estiverem prontos
  useEffect(() => {
    if (!loading && user && profiles.length > 0) {
      loadUserProfile();
    }
  }, [loading, user, profiles.length, loadUserProfile]);

  return {
    // States
    profiles,
    permissions,
    profilePermissions,
    userPermissions,
    userProfile,
    loading,

    // Permission checks
    userCan,
    userCanPerform,
    isAdmin,
    
    // CRUD functions
    updateProfilePermission,
    createProfile,
    updateProfile,
    profileHasPermission,
    getPermissionsBySubject,
    
    // Data loading
    loadProfiles,
    loadPermissions,
    loadProfilePermissions,
    loadUserProfile
  };
};