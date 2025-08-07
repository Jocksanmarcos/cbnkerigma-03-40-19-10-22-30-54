import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Users, 
  BookOpenCheck, 
  Settings,
  HeartHandshake,
  Calendar,
  BarChart3,
  MessageSquareMore,
  Shield,
  Building2
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';

const navLinks = [
  { href: "/dashboard", icon: Home, label: "Dashboard", public: true },
  { href: "/dashboard/pessoas", icon: Users, label: "Pessoas", roles: ['administrador_geral', 'secretario'] },
  { href: "/dashboard/celulas", icon: HeartHandshake, label: "Células", roles: ['administrador_geral', 'supervisor_regional'] },
  { href: "/admin/ensino", icon: BookOpenCheck, label: "Ensino", roles: ['administrador_geral', 'coordenador_ensino'] },
  { href: "/admin/agenda", icon: Calendar, label: "Agenda", roles: ['administrador_geral', 'secretario'] },
  { href: "/admin/financeiro", icon: BarChart3, label: "Financeiro", roles: ['administrador_geral', 'tesoureiro'] },
  { href: "/admin/comunicacao", icon: MessageSquareMore, label: "Comunicação", roles: ['administrador_geral'] },
  { href: "/admin/missoes", icon: Building2, label: "Missões", roles: ['administrador_geral'] },
];

const bottomLinks = [
  { href: "/admin/seguranca", icon: Shield, label: "Segurança", roles: ['administrador_geral'] },
  { href: "/admin/configuracoes", icon: Settings, label: "Configurações", roles: ['administrador_geral'] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { userRole } = usePermissions();

  const hasAccess = (link: any) => {
    if (link.public) return true;
    if (!link.roles) return true;
    if (isAdmin) return true;
    return link.roles.includes(userRole);
  };

  const visibleNavLinks = navLinks.filter(hasAccess);
  const visibleBottomLinks = bottomLinks.filter(hasAccess);

  return (
    <aside className="hidden w-14 flex-col border-r bg-background sm:flex">
      <div className="flex h-full flex-col">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          <Link 
            to="/dashboard" 
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground"
          >
            <span className="text-sm font-bold">K</span>
            <span className="sr-only">Kerigma Hub</span>
          </Link>
          
          <TooltipProvider>
            {visibleNavLinks.map((link) => (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <Link
                    to={link.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground",
                      location.pathname === link.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
        
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 py-4">
          <TooltipProvider>
            {visibleBottomLinks.map((link) => (
              <Tooltip key={link.label}>
                <TooltipTrigger asChild>
                  <Link
                    to={link.href}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground",
                      location.pathname === link.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    <link.icon className="h-5 w-5" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">{link.label}</TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>
      </div>
    </aside>
  );
};