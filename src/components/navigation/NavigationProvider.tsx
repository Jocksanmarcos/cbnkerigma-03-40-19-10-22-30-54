import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';

interface NavigationContextType {
  currentArea: 'site' | 'portal' | 'admin';
  canAccess: (area: string) => boolean;
  navigationItems: NavigationItem[];
}

interface NavigationItem {
  id: string;
  label: string;
  route: string;
  icon: string;
  area: 'site' | 'portal' | 'admin';
  requiredRoles?: string[];
  visible: boolean;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

interface NavigationProviderProps {
  children: React.ReactNode;
}

// Create a separate component that uses router hooks inside the provider
const NavigationProviderInner: React.FC<NavigationProviderProps> = ({ children }) => {
  const location = useLocation();
  const { userRole, loading } = usePermissions();
  const { isAuthenticated, isAdmin } = useAuth();

  console.log('NavigationProvider render:', { userRole, loading, isAuthenticated, isAdmin, pathname: location.pathname });

  const [currentArea, setCurrentArea] = useState<'site' | 'portal' | 'admin'>('site');

  const navigationItems: NavigationItem[] = [
    {
      id: 'site',
      label: 'Site Principal',
      route: '/',
      icon: 'globe',
      area: 'site',
      visible: true,
    },
    {
      id: 'portal',
      label: 'Portal Kerigma EAD',
      route: '/portal-do-aluno',
      icon: 'graduation-cap',
      area: 'portal',
      requiredRoles: ['aluno', 'discipulador', 'supervisor_regional', 'coordenador_ensino', 'administrador_geral'],
      visible: false,
    },
    {
      id: 'admin',
      label: 'Painel Administrativo',
      route: '/admin',
      icon: 'layout-dashboard',
      area: 'admin',
      requiredRoles: ['administrador_geral', 'tesoureiro', 'supervisor_regional', 'secretario'],
      visible: false,
    },
  ];

  const canAccess = (area: string): boolean => {
    const item = navigationItems.find(nav => nav.area === area);
    if (!item || !item.requiredRoles) return true;
    if (!isAuthenticated) return false;
    if (isAdmin) return true;
    return item.requiredRoles.includes(userRole || '');
  };

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/portal-do-aluno')) {
      setCurrentArea('portal');
    } else if (path.startsWith('/admin') || path.startsWith('/dashboard')) {
      setCurrentArea('admin');
    } else {
      setCurrentArea('site');
    }
  }, [location.pathname]);

  // Atualizar visibilidade dos itens com base nas permissões
  const visibleNavigationItems = navigationItems.map(item => ({
    ...item,
    visible: !item.requiredRoles || canAccess(item.area),
  }));

  const value: NavigationContextType = {
    currentArea,
    canAccess,
    navigationItems: visibleNavigationItems,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

// Wrapper component that doesn't use router hooks directly
export const NavigationProvider: React.FC<NavigationProviderProps> = ({ children }) => {
  // Add error boundary behavior
  try {
    return <NavigationProviderInner>{children}</NavigationProviderInner>;
  } catch (error) {
    console.error('NavigationProvider error:', error);
    // Fallback: render children without navigation context
    return <>{children}</>;
  }
};

export default NavigationProvider;