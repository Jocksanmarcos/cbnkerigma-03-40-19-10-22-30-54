import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface PermissionConfig {
  module: string;
  action: string;
  resource?: string;
}

interface UserPermissions {
  canAccess: (permission: PermissionConfig) => boolean;
  hasRole: (role: string) => boolean;
  canManage: (resource: string) => boolean;
  permissions: string[];
  roles: string[];
  loading: boolean;
}

export const useAdvancedPermissions = (): UserPermissions => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserPermissions();
    } else {
      setPermissions([]);
      setRoles([]);
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      
      // Buscar permissões do usuário
      const { data: userPermissions, error: permError } = await supabase.rpc('execute_query', {
        query_text: `
          SELECT DISTINCT p.codigo as permission_code, pa.codigo as role_code
          FROM usuarios_admin ua
          LEFT JOIN papeis_sistema ps ON ps.user_email = (
            SELECT email FROM auth.users WHERE id = ua.user_id LIMIT 1
          )
          LEFT JOIN permissoes p ON p.id = ps.permissao_id
          LEFT JOIN papeis_igreja pa ON pa.codigo = ps.papel_codigo
          WHERE ua.user_id = '${user?.id}' AND ua.ativo = true
        `
      });

      if (permError) {
        console.error('Erro ao buscar permissões:', permError);
        return;
      }

      const userPerms = Array.isArray(userPermissions) ? userPermissions : [];
      
      // Extrair permissões e papéis
      const permissionCodes = userPerms
        .map((item: any) => item.permission_code)
        .filter(Boolean);
      
      const roleCodes = userPerms
        .map((item: any) => item.role_code)
        .filter(Boolean);

      // Adicionar permissões administrativas se for admin
      if (isAdmin) {
        permissionCodes.push(
          'admin.all',
          'users.manage',
          'content.manage',
          'system.config',
          'analytics.view',
          'notifications.send'
        );
        roleCodes.push('admin', 'lider');
      }

      setPermissions([...new Set(permissionCodes)]);
      setRoles([...new Set(roleCodes)]);
      
    } catch (error) {
      console.error('Erro ao carregar permissões:', error);
    } finally {
      setLoading(false);
    }
  };

  const canAccess = (permission: PermissionConfig): boolean => {
    if (!isAuthenticated) return false;
    
    // Admins têm acesso total
    if (isAdmin) return true;
    
    // Verificar permissão específica
    const permissionCode = permission.resource 
      ? `${permission.module}.${permission.action}.${permission.resource}`
      : `${permission.module}.${permission.action}`;
    
    // Verificar permissão exata
    if (permissions.includes(permissionCode)) return true;
    
    // Verificar permissão de módulo
    if (permissions.includes(`${permission.module}.all`)) return true;
    
    // Verificar permissão global de ação
    if (permissions.includes(`all.${permission.action}`)) return true;
    
    return false;
  };

  const hasRole = (role: string): boolean => {
    if (!isAuthenticated) return false;
    return roles.includes(role);
  };

  const canManage = (resource: string): boolean => {
    return canAccess({ module: resource, action: 'manage' });
  };

  return {
    canAccess,
    hasRole,
    canManage,
    permissions,
    roles,
    loading
  };
};

// Hook específico para UI condicional
export const useConditionalRender = () => {
  const permissions = useAdvancedPermissions();

  const RenderIfCan = ({ 
    permission, 
    children, 
    fallback = null 
  }: {
    permission: PermissionConfig;
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) => {
    if (permissions.canAccess(permission)) {
      return children as React.ReactElement;
    }
    return fallback as React.ReactElement;
  };

  const RenderIfRole = ({ 
    role, 
    children, 
    fallback = null 
  }: {
    role: string;
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }) => {
    if (permissions.hasRole(role)) {
      return children as React.ReactElement;
    }
    return fallback as React.ReactElement;
  };

  return {
    RenderIfCan,
    RenderIfRole,
    ...permissions
  };
};