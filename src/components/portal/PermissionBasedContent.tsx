import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { ModuloSistema, AcaoPermissao } from '@/hooks/useUserRole';

interface PermissionBasedContentProps {
  modulo: ModuloSistema;
  acao: AcaoPermissao;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  conditions?: Record<string, any>;
}

export const PermissionBasedContent: React.FC<PermissionBasedContentProps> = ({
  modulo,
  acao,
  children,
  fallback = null,
  conditions = {}
}) => {
  const { hasPermission, hasConditionalPermission, loading } = usePermissions();

  if (loading) {
    return null; // ou um skeleton loader
  }

  // Se há condições específicas, usa hasConditionalPermission
  const hasAccess = Object.keys(conditions).length > 0 
    ? hasConditionalPermission(modulo, acao, conditions)
    : hasPermission(modulo, acao);

  if (hasAccess) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface ModuleAccessWrapperProps {
  modulo: ModuloSistema;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ModuleAccessWrapper: React.FC<ModuleAccessWrapperProps> = ({
  modulo,
  children,
  fallback = null
}) => {
  return (
    <PermissionBasedContent
      modulo={modulo}
      acao="visualizar"
      fallback={fallback}
    >
      {children}
    </PermissionBasedContent>
  );
};

interface ActionButtonProps {
  modulo: ModuloSistema;
  acao: AcaoPermissao;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  modulo,
  acao,
  children,
  className = '',
  onClick,
  disabled = false
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(modulo, acao)) {
    return null;
  }

  return (
    <button
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const AdminOnly: React.FC<AdminOnlyProps> = ({
  children,
  fallback = null
}) => {
  const { isAdmin, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (isAdmin()) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

interface LeaderOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LeaderOnly: React.FC<LeaderOnlyProps> = ({
  children,
  fallback = null
}) => {
  const { isLeader, loading } = usePermissions();

  if (loading) {
    return null;
  }

  if (isLeader()) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};