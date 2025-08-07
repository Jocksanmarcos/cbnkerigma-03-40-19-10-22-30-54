import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut, loading, isAdmin, adminCheckDone } = useAuth();
  const { userRole } = usePermissions();

  const navigationItems = [
    { name: "Início", href: "/" },
    { name: "Sobre Nós", href: "/sobre" },
    { name: "Células", href: "/celulas" },
    { name: "Agenda", href: "/agenda" },
    { name: "Galeria", href: "/galeria" },
    { name: "Dízimos", href: "/dizimos" },
    { name: "Contato", href: "/contato" },
  ];

  const getIntelligentRedirect = () => {
    if (!user || !adminCheckDone) return null;
    
    // Prioridade: Admin → Portal EAD → Dashboard básico
    if (isAdmin) return "/admin";
    
    // Roles que podem acessar portal EAD
    const portalRoles = ['aluno', 'discipulador', 'supervisor_regional', 'coordenador_ensino'];
    if (userRole && portalRoles.includes(userRole)) {
      return "/portal-do-aluno";
    }
    
    return "/dashboard";
  };

  const getButtonLabel = () => {
    if (!user || !adminCheckDone) return "Área do Usuário";
    
    if (isAdmin) return "Painel Admin";
    
    const portalRoles = ['aluno', 'discipulador', 'supervisor_regional', 'coordenador_ensino'];
    if (userRole && portalRoles.includes(userRole)) {
      return "Portal EAD";
    }
    
    return "Dashboard";
  };

  return (
    <header className="bg-card/95 backdrop-blur-md shadow-card sticky top-0 z-50 border-b border-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/lovable-uploads/a03af474-aad0-4143-ab17-5a06cbc0facc.png" 
              alt="CBN Kerigma" 
              className="h-12 w-auto transition-all duration-300 group-hover:scale-105 block dark:hidden"
            />
            <img 
              src="/lovable-uploads/97cc1598-652f-4e93-ade4-31d414783461.png" 
              alt="CBN Kerigma" 
              className="h-12 w-auto transition-all duration-300 group-hover:scale-105 hidden dark:block"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-foreground hover:text-primary transition-all duration-300 font-medium relative group story-link"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Theme Toggle, Auth & Mobile Menu Button */}
          <div className="flex items-center space-x-4">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {/* Auth Buttons - Desktop */}
            <div className="hidden lg:flex items-center space-x-3">
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-muted-foreground">
                    Olá, {user.user_metadata?.nome || user.email?.split('@')[0]}
                  </span>
                  {user && adminCheckDone && getIntelligentRedirect() && (
                    <Link to={getIntelligentRedirect()!}>
                      <Button variant="outline" size="sm">
                        {getButtonLabel()}
                      </Button>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={signOut}
                    disabled={loading}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm" className="flex items-center space-x-1">
                    <User className="w-4 h-4" />
                    <span>Entrar</span>
                  </Button>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden bg-card border-t border-border animate-fade-in">
            <nav className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="block px-4 py-2 text-foreground hover:text-primary hover:bg-accent transition-colors duration-300"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="px-4 py-2 border-t border-border mt-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-foreground">Tema</span>
                  <ThemeToggle />
                </div>
              </div>
              
              <div className="px-4 py-2 border-t border-border">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">
                      Olá, {user.user_metadata?.nome || user.email?.split('@')[0]}
                    </div>
                    {adminCheckDone && getIntelligentRedirect() && (
                      <Link to={getIntelligentRedirect()!} onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" size="sm" className="w-full mb-2">
                          {getButtonLabel()}
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        signOut();
                        setIsMenuOpen(false);
                      }}
                      disabled={loading}
                      className="w-full flex items-center justify-center space-x-1"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sair</span>
                    </Button>
                  </div>
                ) : (
                  <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full flex items-center justify-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Entrar</span>
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};