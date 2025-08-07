import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Globe,
  LayoutDashboard,
  GraduationCap,
  Settings,
  Menu,
  User,
  LogOut,
  Bell,
  ChevronRight,
  Home
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationArea {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  description: string;
  visibleToRoles: string[];
  color: string;
  badge?: string;
}

const GlobalNavigationHub = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { role: userRole } = useUserRole();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Definição das áreas principais da plataforma
  const navigationAreas: NavigationArea[] = [
    {
      id: 'site',
      label: 'Site',
      icon: Globe,
      route: '/',
      description: 'Página institucional da igreja',
      visibleToRoles: ['all'],
      color: 'hsl(var(--primary))',
    },
    {
      id: 'gestao',
      label: 'Gestão Eclesiástica',
      icon: LayoutDashboard,
      route: '/dashboard',
      description: 'Dashboard administrativo e gestão',
      visibleToRoles: ['administrador_geral', 'tesoureiro', 'secretario', 'supervisor_regional', 'coordenador_ensino'],
      color: 'hsl(142, 76%, 36%)',
    },
    {
      id: 'ead',
      label: 'Kerigma EAD',
      icon: GraduationCap,
      route: '/portal-do-aluno',
      description: 'Portal de ensino e discipulado',
      visibleToRoles: ['aluno', 'discipulador', 'supervisor_regional', 'coordenador_ensino', 'administrador_geral'],
      color: 'hsl(262, 83%, 58%)',
    },
    {
      id: 'admin',
      label: 'Administração',
      icon: Settings,
      route: '/admin',
      description: 'Painel técnico avançado',
      visibleToRoles: ['administrador_geral'],
      color: 'hsl(24, 95%, 53%)',
      badge: 'Admin',
    }
  ];

  // Filtrar áreas baseado no papel do usuário
  const getVisibleAreas = () => {
    if (!user) return [navigationAreas[0]]; // Apenas site público
    
    return navigationAreas.filter(area => {
      if (area.visibleToRoles.includes('all')) return true;
      return area.visibleToRoles.includes(userRole || '');
    });
  };

  const visibleAreas = getVisibleAreas();

  // Detectar área atual baseada na rota
  const getCurrentArea = () => {
    const currentPath = location.pathname;
    
    // Mapear rotas específicas
    if (currentPath.startsWith('/admin')) return 'admin';
    if (currentPath.startsWith('/portal-do-aluno')) return 'ead';
    if (currentPath.startsWith('/dashboard')) return 'gestao';
    return 'site';
  };

  const currentAreaId = getCurrentArea();
  const currentArea = navigationAreas.find(area => area.id === currentAreaId);

  // Gerar breadcrumbs dinâmicos
  const getBreadcrumbs = (): Array<{ label: string; href?: string }> => {
    const path = location.pathname;
    const breadcrumbs: Array<{ label: string; href?: string }> = [{ label: 'Início', href: '/' }];
    
    if (currentArea && currentArea.id !== 'site') {
      breadcrumbs.push({ 
        label: currentArea.label, 
        href: currentArea.route 
      });
      
      // Adicionar breadcrumbs específicos baseados na rota
      if (path.includes('/dashboard')) {
        const query = new URLSearchParams(location.search);
        const module = query.get('module');
        if (module) {
          const moduleNames: Record<string, string> = {
            'pessoas': 'Pessoas',
            'celulas': 'Células',
            'ensino': 'Ensino',
            'financeiro': 'Financeiro',
            'patrimonio': 'Patrimônio',
            'agenda': 'Agenda',
            'missoes': 'Missões'
          };
          breadcrumbs.push({ label: moduleNames[module] || module });
        }
      }
    }
    
    return breadcrumbs;
  };

  // Menu do usuário
  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
            <AvatarFallback className="text-xs">
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <p className="text-sm font-medium leading-none">
              {user?.user_metadata?.nome || user?.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
            {userRole && (
              <Badge variant="outline" className="w-fit text-xs">
                {userRole.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/perfil')}>
          <User className="mr-2 h-4 w-4" />
          <span>Meu Perfil</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair da Conta</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // Navegação por tabs para desktop
  const TabNavigation = () => {
    if (visibleAreas.length <= 1) return null;
    
    return (
      <div className="hidden md:block">
        <Tabs value={currentAreaId} onValueChange={(value) => {
          const area = navigationAreas.find(a => a.id === value);
          if (area) navigate(area.route);
        }}>
          <TabsList className="bg-muted/50 h-12">
            {visibleAreas.map((area) => (
              <TabsTrigger
                key={area.id}
                value={area.id}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm transition-all duration-300",
                  "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground",
                  "data-[state=active]:shadow-sm"
                )}
                style={{
                  '--area-color': area.color
                } as React.CSSProperties}
              >
                <area.icon className="w-4 h-4" />
                <span className="font-medium">{area.label}</span>
                {area.badge && (
                  <Badge variant="secondary" className="text-xs ml-1">
                    {area.badge}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    );
  };

  // Menu mobile
  const MobileMenu = () => (
    <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header do menu */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <img 
                src="/lovable-uploads/bc242042-58e4-4851-9498-4ee1590379da.png" 
                alt="CBN Kerigma" 
                className="h-8 w-auto"
              />
              <div>
                <h3 className="font-semibold">Kerigma EAD</h3>
                <p className="text-xs text-muted-foreground">Menu Principal</p>
              </div>
            </div>
          </div>

          {/* Links públicos */}
          <div className="p-4">
            <h4 className="font-medium mb-3 text-sm">Navegação</h4>
            <div className="space-y-1">
              {[
                { label: 'Início', route: '/', icon: Home },
                { label: 'Sobre Nós', route: '/sobre', icon: User },
                { label: 'Células', route: '/celulas', icon: Globe },
                { label: 'Agenda', route: '/agenda', icon: LayoutDashboard },
                { label: 'Galeria', route: '/galeria', icon: GraduationCap },
                { label: 'Dízimos', route: '/dizimos', icon: Settings },
                { label: 'Contato', route: '/contato', icon: Settings }
              ].map((item) => (
                <Button
                  key={item.route}
                  variant="ghost"
                  className="w-full justify-start h-10 px-3"
                  onClick={() => {
                    navigate(item.route);
                    setIsMenuOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Áreas administrativas (se logado) */}
          {user && visibleAreas.filter(area => area.id !== 'site').length > 0 && (
            <div className="px-4 pb-4">
              <h4 className="font-medium mb-3 text-sm">Painel Administrativo</h4>
              <div className="space-y-1">
                {visibleAreas
                  .filter(area => area.id !== 'site')
                  .map((area) => (
                    <Button
                      key={area.id}
                      variant={currentAreaId === area.id ? "secondary" : "ghost"}
                      className="w-full justify-start h-12 px-3"
                      onClick={() => {
                        navigate(area.route);
                        setIsMenuOpen(false);
                      }}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                        style={{ backgroundColor: area.color }}
                      >
                        <area.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{area.label}</div>
                        <div className="text-xs text-muted-foreground">{area.description}</div>
                      </div>
                      {area.badge && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {area.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
              </div>
            </div>
          )}

          {/* Footer do menu */}
          <div className="mt-auto p-4 border-t">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium">Tema</span>
              <ThemeToggle />
            </div>
            
            {user ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  {user.user_metadata?.nome || user.email}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    signOut();
                    setIsMenuOpen(false);
                  }}
                  className="w-full"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <Button
                asChild
                size="sm"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                <Link to="/auth">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Link>
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {/* Header Principal */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 min-w-0">
              <img 
                src="/lovable-uploads/bc242042-58e4-4851-9498-4ee1590379da.png" 
                alt="CBN Kerigma" 
                className="h-10 w-auto dark:hidden flex-shrink-0"
              />
              <img 
                src="/lovable-uploads/015a0ed5-c570-46f4-9209-fb831d08b3d2.png" 
                alt="CBN Kerigma" 
                className="h-10 w-auto hidden dark:block flex-shrink-0"
              />
              {!isMobile && (
                <div className="hidden lg:block ml-2">
                  <div className="text-sm font-semibold">CBN Kerigma</div>
                  <div className="text-xs text-muted-foreground">Centro Bíblico Kerigma</div>
                </div>
              )}
            </Link>

            {/* Centro - Navegação por Tabs */}
            <div className="flex-1 flex justify-center px-4">
              <TabNavigation />
            </div>

            {/* Direita - Actions */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle - Desktop */}
              <div className="hidden md:block">
                <ThemeToggle />
              </div>

              {/* Notificações - Apenas se logado */}
              {user && (
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Bell className="w-4 h-4" />
                </Button>
              )}

              {/* User Menu ou Login */}
              {user ? (
                <UserMenu />
              ) : (
                <Button asChild size="sm" className="hidden md:flex">
                  <Link to="/auth">Entrar</Link>
                </Button>
              )}

              {/* Menu Mobile */}
              <MobileMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Breadcrumbs - Apenas para áreas internas */}
      {currentAreaId !== 'site' && (
        <nav className="border-b bg-muted/30 relative z-30">
          <div className="container mx-auto px-4 py-3">
            <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
              {getBreadcrumbs().map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <ChevronRight className="w-3 h-3 mx-2" />}
                  {crumb.href ? (
                    <Link 
                      to={crumb.href} 
                      className="hover:text-foreground transition-colors font-medium"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-foreground font-semibold">{crumb.label}</span>
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

export default GlobalNavigationHub;