import React from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const SmartBreadcrumbs = () => {
  const location = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const path = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const hash = location.hash.replace('#', '');

    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Início', href: '/', icon: Home }
    ];

    // Site Principal
    if (path === '/') {
      return [{ label: 'Kerigma EAD', icon: Home }];
    }

    // Dashboard
    if (path.startsWith('/dashboard')) {
      breadcrumbs.push({ label: 'Gestão Eclesiástica', href: '/dashboard' });
      
      if (tab) {
        const tabLabels: { [key: string]: string } = {
          'pessoas': 'Pessoas',
          'celulas': 'Células',
          'eventos': 'Eventos',
          'financeiro': 'Financeiro',
          'ensino': 'Ensino',
          'relatorios': 'Relatórios',
          'configuracoes': 'Configurações'
        };
        breadcrumbs.push({ label: tabLabels[tab] || tab });
      }
    }

    // Portal do Aluno
    if (path.startsWith('/portal-do-aluno')) {
      breadcrumbs.push({ label: 'Portal Kerigma EAD', href: '/portal-do-aluno' });
      
      if (hash) {
        const hashLabels: { [key: string]: string } = {
          'cursos': 'Meus Cursos',
          'discipulado': 'Discipulado',
          'painel-discipulador': 'Painel do Discipulador',
          'painel-supervisor': 'Painel do Supervisor',
          'painel-indicadores': 'Indicadores da Liderança',
          'certificados': 'Certificados',
          'gamificacao': 'Gamificação'
        };
        breadcrumbs.push({ label: hashLabels[hash] || hash });
      }
    }

    // Admin
    if (path.startsWith('/admin')) {
      breadcrumbs.push({ label: 'Painel Técnico', href: '/admin' });
      
      if (tab) {
        const tabLabels: { [key: string]: string } = {
          'performance': 'Performance',
          'monitoring': 'Monitoramento',
          'analytics': 'Analytics',
          'whatsapp': 'WhatsApp',
          'notifications': 'Notificações',
          'settings': 'Configurações'
        };
        breadcrumbs.push({ label: tabLabels[tab] || tab });
      }
    }

    // Outras páginas específicas
    const specificPages: { [key: string]: string } = {
      '/auth': 'Login',
      '/perfil': 'Meu Perfil',
      '/configuracoes': 'Configurações',
      '/sobre': 'Sobre',
      '/contato': 'Contato',
      '/agenda': 'Agenda',
      '/celulas': 'Células',
      '/dizimos': 'Dízimos e Ofertas',
      '/ensino': 'Ensino',
      '/galeria': 'Galeria',
      '/pedidos-oracao': 'Pedidos de Oração',
      '/primeira-vez': 'Primeira Vez'
    };

    if (specificPages[path]) {
      breadcrumbs.push({ label: specificPages[path] });
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground px-4 py-2 border-b bg-muted/30">
      {breadcrumbs.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <ChevronRight className="w-4 h-4" />}
          
          {item.href ? (
            <Link
              to={item.href}
              className="flex items-center gap-1 hover:text-foreground transition-colors"
            >
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </Link>
          ) : (
            <span className={`flex items-center gap-1 ${index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}`}>
              {item.icon && <item.icon className="w-4 h-4" />}
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default SmartBreadcrumbs;