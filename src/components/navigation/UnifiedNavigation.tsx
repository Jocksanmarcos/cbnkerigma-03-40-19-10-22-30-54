import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Globe,
  LayoutDashboard,
  GraduationCap,
  Settings,
  Menu,
  User,
  LogOut,
  Bell,
  Search,
  Home,
  Users,
  Target,
  Calendar,
  DollarSign,
  MessageSquare,
  Camera,
  ChevronRight
} from 'lucide-react';

interface NavigationArea {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  badge?: string;
  requiredRoles: string[];
  color: string;
}

// Mapeamento de roles para compatibilidade
const roleMapping: Record<string, string[]> = {
  'administrador_geral': ['admin'],
  'coordenador_ensino': ['coordenador', 'supervisor', 'admin'],
  'supervisor_regional': ['supervisor', 'admin'],
  'discipulador': ['discipulador', 'supervisor', 'coordenador', 'admin'],
  'lider_celula': ['lider', 'supervisor', 'coordenador', 'admin'],
  'aluno': ['aluno', 'discipulador', 'supervisor', 'coordenador', 'admin'],
  'tesoureiro': ['tesoureiro', 'admin'],
  'secretario': ['secretario', 'admin'],
  'membro_comum': []
};

const UnifiedNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role: userRole } = useUserRole();
  const [isOpen, setIsOpen] = useState(false);

  // Definir todas as áreas do sistema
  const navigationAreas: NavigationArea[] = [
    {
      id: 'site',
      title: 'Site Principal',
      description: 'Página institucional e informações públicas',
      icon: Globe,
      route: '/',
      requiredRoles: [],
      color: 'bg-blue-500',
    },
    {
      id: 'dashboard',
      title: 'Dashboard',
      description: 'Gestão eclesiástica e administração',
      icon: LayoutDashboard,
      route: '/dashboard',
      requiredRoles: ['admin', 'lider', 'secretario', 'tesoureiro', 'coordenador', 'supervisor'],
      color: 'bg-green-500',
    },
    {
      id: 'portal',
      title: 'Portal EAD',
      description: 'Ensino e discipulado online',
      icon: GraduationCap,
      route: '/portal-do-aluno',
      requiredRoles: ['aluno', 'discipulador', 'supervisor', 'coordenador', 'admin'],
      color: 'bg-purple-500',
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Painel técnico e configurações',
      icon: Settings,
      route: '/admin',
      requiredRoles: ['admin'],
      color: 'bg-orange-500',
      badge: 'Tech'
    }
  ];

  // Filtrar áreas baseado no papel do usuário com mapeamento
  const availableAreas = navigationAreas.filter(area => {
    if (area.requiredRoles.length === 0) return true;
    
    const userMappedRoles = userRole ? roleMapping[userRole] || [] : [];
    return area.requiredRoles.some(role => userMappedRoles.includes(role));
  });

  // Detectar área atual baseada na rota
  const getCurrentArea = () => {
    const currentPath = location.pathname;
    return navigationAreas.find(area => {
      if (area.route === '/') return currentPath === '/';
      return currentPath.startsWith(area.route);
    }) || navigationAreas[0];
  };

  const currentArea = getCurrentArea();

  // Breadcrumbs dinâmicos
  const getBreadcrumbs = (): Array<{ label: string; href?: string }> => {
    const path = location.pathname;
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = [{ label: 'Início', href: '/' }];
    
    // Se estamos numa área específica
    if (currentArea.id !== 'site') {
      breadcrumbs.push({ 
        label: currentArea.title, 
        href: currentArea.route 
      });
      
      // Adicionar segmentos específicos das rotas
      if (path.includes('/dashboard')) {
        const query = new URLSearchParams(location.search);
        const tab = query.get('tab');
        if (tab) {
          const tabNames: Record<string, string> = {
            'pessoas': 'Pessoas',
            'celulas': 'Células',
            'ensino': 'Ensino',
            'financeiro': 'Financeiro',
            'patrimonio': 'Patrimônio',
            'agenda': 'Agenda'
          };
          breadcrumbs.push({ label: tabNames[tab] || tab, href: `/admin?tab=${tab}` });
        }
      }
    }
    
    return breadcrumbs;
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.nome || user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {userRole && (
              <Badge variant="outline" className="w-fit text-xs">
                {userRole}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/perfil')}>
          <User className="mr-2 h-4 w-4" />
          <span>Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Header Principal */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mr-6">
            <img 
              src="/lovable-uploads/bc242042-58e4-4851-9498-4ee1590379da.png" 
              alt="CBN Kerigma" 
              className="h-10 w-auto dark:hidden"
            />
            <img 
              src="/lovable-uploads/015a0ed5-c570-46f4-9209-fb831d08b3d2.png" 
              alt="CBN Kerigma" 
              className="h-10 w-auto hidden dark:block"
            />
          </Link>

          {/* Navigation Links - Desktop */}
          <nav className="hidden md:flex items-center gap-1 mr-6">
            <Button asChild variant="ghost" size="sm">
              <Link to="/sobre">Sobre</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/missoes">Missões</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/celulas">Células</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/agenda">Agenda</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/galeria">Galeria</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/dizimos">Dízimos</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link to="/contato">Contato</Link>
            </Button>
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

            {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            

            {/* Quick Access to Admin Areas - Authenticated Users */}
            {user && (
              <div className="hidden lg:flex items-center gap-1 ml-4 pl-4 border-l">
                {availableAreas.map((area) => {
                  if (area.id === 'site') return null;
                  return (
                    <Button
                      key={area.id}
                      variant={currentArea.id === area.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => navigate(area.route)}
                      className="gap-2"
                    >
                      <area.icon className="w-4 h-4" />
                      {area.title}
                      {area.badge && (
                        <Badge variant="secondary" className="text-xs ml-1">
                          {area.badge}
                        </Badge>
                      )}
                    </Button>
                  );
                })}
              </div>
            )}

            {/* Notifications */}
            {user && (
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
            )}

            {/* User Menu */}
            {user ? (
              <UserMenu />
            ) : (
              <Button asChild size="sm">
                <Link to="/auth">Entrar</Link>
              </Button>
            )}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="space-y-6 pt-6">
                  <div>
                    <h4 className="font-medium mb-3">Menu Principal</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Início', route: '/', icon: Home },
                        { label: 'Sobre', route: '/sobre', icon: Users },
                        { label: 'Missões', route: '/missoes', icon: Globe },
                        { label: 'Células', route: '/celulas', icon: Target },
                        { label: 'Agenda', route: '/agenda', icon: Calendar },
                        { label: 'Galeria', route: '/galeria', icon: Camera },
                        { label: 'Dízimos', route: '/dizimos', icon: DollarSign },
                        { label: 'Contato', route: '/contato', icon: MessageSquare }
                      ].map((item) => (
                        <Button
                          key={item.route}
                          variant="ghost"
                          className="w-full justify-start gap-2"
                          onClick={() => {
                            navigate(item.route);
                            setIsOpen(false);
                          }}
                        >
                          <item.icon className="w-4 h-4" />
                          {item.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {user && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-3">Painel Administrativo</h4>
                        <div className="space-y-2">
                          {availableAreas.map((area) => {
                            if (area.id === 'site') return null;
                            return (
                              <Button
                                key={area.id}
                                variant={currentArea.id === area.id ? "secondary" : "ghost"}
                                className="w-full justify-start gap-3"
                                onClick={() => {
                                  navigate(area.route);
                                  setIsOpen(false);
                                }}
                              >
                                <div className={`w-6 h-6 rounded ${area.color} flex items-center justify-center`}>
                                  <area.icon className="w-3 h-3 text-white" />
                                </div>
                                <span>{area.title}</span>
                                {area.badge && (
                                  <Badge variant="outline" className="ml-auto text-xs">
                                    {area.badge}
                                  </Badge>
                                )}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Breadcrumbs */}
      {currentArea.id !== 'site' && (
        <nav className="border-b bg-muted/50">
          <div className="container py-2">
            <ol className="flex items-center space-x-1 text-sm text-muted-foreground">
              {getBreadcrumbs().map((crumb, index) => (
                <li key={index} className="flex items-center">
                   {index > 0 && <ChevronRight className="w-4 h-4 mx-1" />}
                   {crumb.href ? (
                     <Link to={crumb.href} className="hover:text-foreground transition-colors">
                       {crumb.label}
                     </Link>
                   ) : (
                     <span className="text-foreground font-medium">{crumb.label}</span>
                   )}
                </li>
              ))}
            </ol>
          </div>
        </nav>
      )}
    </>
  );
};

export default UnifiedNavigation;