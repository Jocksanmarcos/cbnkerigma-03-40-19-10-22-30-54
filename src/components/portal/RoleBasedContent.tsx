import React from 'react';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { usePermissions } from '@/hooks/usePermissions';

interface RoleBasedContentProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleBasedContent: React.FC<RoleBasedContentProps> = ({
  allowedRoles,
  children,
  fallback = null
}) => {
  const { loading: userRoleLoading } = useUserRole();
  const { userRole, loading: permissionsLoading } = usePermissions();

  const loading = userRoleLoading || permissionsLoading;

  if (loading) {
    return null; // ou um skeleton loader
  }

  if (userRole && allowedRoles.includes(userRole)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};