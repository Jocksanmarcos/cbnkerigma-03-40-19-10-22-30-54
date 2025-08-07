import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, GraduationCap, LayoutDashboard } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  route: string;
  icon: React.ComponentType<any>;
  requiredRoles?: string[];
}

// Inner component that uses router hooks
const SmartNavigationInner: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole, loading } = usePermissions();
  const { isAuthenticated, isAdmin } = useAuth();

  console.log('SmartNavigation render:', { userRole, loading, isAuthenticated, isAdmin, location: location.pathname });

  const navigationItems: NavigationItem[] = [
    {
      label: '🌐 Site',
      route: '/',
      icon: Globe,
    },
    {
      label: '🎓 Portal EAD',
      route: '/portal-do-aluno',
      icon: GraduationCap,
      requiredRoles: ['aluno', 'discipulador', 'supervisor_regional', 'coordenador_ensino', 'administrador_geral'],
    },
    {
      label: '📊 Dashboard',
      route: '/admin',
      icon: LayoutDashboard,
      requiredRoles: ['administrador_geral', 'tesoureiro', 'supervisor_regional', 'secretario'],
    },
  ];

  if (loading) {
    return (
      <div className="bg-card/95 backdrop-blur-md border-b border-border/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-2">
            <div className="text-xs text-muted-foreground">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  const hasPermission = (item: NavigationItem): boolean => {
    if (!item.requiredRoles) return true;
    if (!isAuthenticated) return false;
    if (isAdmin) return true;
    return item.requiredRoles.includes(userRole || '');
  };

  const visibleItems = navigationItems.filter(hasPermission);

  if (visibleItems.length <= 1) {
    return null;
  }

  const getCurrentTab = () => {
    const currentPath = location.pathname;
    if (currentPath.startsWith('/portal-do-aluno')) return '/portal-do-aluno';
    if (currentPath.startsWith('/admin') || currentPath.startsWith('/dashboard')) return '/admin';
    return '/';
  };

  const handleTabChange = (value: string) => {
    navigate(value);
  };

  return (
    <div className="bg-card/95 backdrop-blur-md border-b border-border/40 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-2">
          <Tabs value={getCurrentTab()} onValueChange={handleTabChange} className="w-full max-w-md">
            <TabsList className="grid w-full grid-cols-3 gap-1 bg-muted/50">
              {visibleItems.map((item) => (
                <TabsTrigger
                  key={item.route}
                  value={item.route}
                  className={cn(
                    "flex items-center gap-2 text-xs sm:text-sm transition-all duration-300",
                    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                    "data-[state=active]:shadow-sm"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label.replace(/🌐|🎓|📊/g, '').trim()}</span>
                  <span className="sm:hidden">{item.label.match(/🌐|🎓|📊/)?.[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

// Wrapper component with error handling
export const SmartNavigation: React.FC = () => {
  try {
    return <SmartNavigationInner />;
  } catch (error) {
    console.error('SmartNavigation error:', error);
    // Return null instead of crashing the app
    return null;
  }
};

export default SmartNavigation;