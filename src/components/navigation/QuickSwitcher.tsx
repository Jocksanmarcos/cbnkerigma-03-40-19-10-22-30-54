import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import {
  Search,
  Globe,
  LayoutDashboard,
  GraduationCap,
  Settings,
  Users,
  Target,
  Calendar,
  DollarSign,
  BookOpen,
  BarChart3,
  MessageSquare,
  Bell,
  Shield,
  Zap,
  User,
  FileText,
  Camera,
  Heart,
  ChevronRight
} from 'lucide-react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  category: string;
  keywords: string[];
  requiredRoles?: string[];
  badge?: string;
}

const QuickSwitcher = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { role: userRole } = useUserRole();

  // Atalho de teclado para abrir o switcher
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const quickActions: QuickAction[] = [
    // Site Principal
    {
      id: 'home',
      title: 'Página Inicial',
      description: 'Voltar ao site principal',
      icon: Globe,
      route: '/',
      category: 'Site',
      keywords: ['home', 'início', 'principal', 'site']
    },
    {
      id: 'sobre',
      title: 'Sobre Nós',
      description: 'História e missão da CBN Kerigma',
      icon: User,
      route: '/sobre',
      category: 'Site',
      keywords: ['sobre', 'história', 'missão', 'visão']
    },
    {
      id: 'contato',
      title: 'Contato',
      description: 'Entre em contato conosco',
      icon: MessageSquare,
      route: '/contato',
      category: 'Site',
      keywords: ['contato', 'falar', 'conversar', 'dúvida']
    },

    // Dashboard - Gestão Eclesiástica
    {
      id: 'dashboard',
      title: 'Dashboard Principal',
      description: 'Visão geral da gestão eclesiástica',
      icon: LayoutDashboard,
      route: '/dashboard',
      category: 'Gestão',
      keywords: ['dashboard', 'painel', 'gestão', 'administração'],
      requiredRoles: ['admin', 'lider', 'secretario', 'tesoureiro']
    },
    {
      id: 'pessoas',
      title: 'Gestão de Pessoas',
      description: 'Cadastro e acompanhamento de membros',
      icon: Users,
      route: '/dashboard?tab=pessoas',
      category: 'Gestão',
      keywords: ['pessoas', 'membros', 'cadastro', 'usuários'],
      requiredRoles: ['admin', 'lider', 'secretario']
    },
    {
      id: 'celulas',
      title: 'Células',
      description: 'Gerenciar células e lideranças',
      icon: Target,
      route: '/dashboard?tab=celulas',
      category: 'Gestão',
      keywords: ['células', 'grupos', 'liderança', 'multiplicação'],
      requiredRoles: ['admin', 'lider', 'coordenador']
    },
    {
      id: 'eventos',
      title: 'Eventos',
      description: 'Agenda e organização de eventos',
      icon: Calendar,
      route: '/dashboard?tab=eventos',
      category: 'Gestão',
      keywords: ['eventos', 'agenda', 'programação', 'atividades'],
      requiredRoles: ['admin', 'lider', 'coordenador']
    },
    {
      id: 'financeiro',
      title: 'Financeiro',
      description: 'Controle financeiro e contribuições',
      icon: DollarSign,
      route: '/dashboard?tab=financeiro',
      category: 'Gestão',
      keywords: ['financeiro', 'dinheiro', 'dízimo', 'oferta', 'contribuição'],
      requiredRoles: ['admin', 'tesoureiro']
    },

    // Portal Kerigma EAD
    {
      id: 'portal',
      title: 'Portal Kerigma EAD',
      description: 'Plataforma de ensino e discipulado',
      icon: GraduationCap,
      route: '/portal-do-aluno',
      category: 'Ensino',
      keywords: ['portal', 'ensino', 'ead', 'curso', 'discipulado'],
      requiredRoles: ['aluno', 'discipulador', 'supervisor', 'coordenador', 'admin']
    },
    {
      id: 'meus-cursos',
      title: 'Meus Cursos',
      description: 'Acompanhar progresso dos cursos',
      icon: BookOpen,
      route: '/portal-do-aluno#cursos',
      category: 'Ensino',
      keywords: ['cursos', 'aulas', 'progresso', 'certificado'],
      requiredRoles: ['aluno', 'discipulador', 'supervisor', 'coordenador', 'admin']
    },
    {
      id: 'discipulado',
      title: 'Discipulado',
      description: 'Acompanhamento de discipulado',
      icon: Users,
      route: '/portal-do-aluno#discipulado',
      category: 'Ensino',
      keywords: ['discipulado', 'mentoria', 'acompanhamento'],
      requiredRoles: ['discipulador', 'supervisor', 'coordenador', 'admin']
    },

    // Admin - Painel Técnico
    {
      id: 'admin',
      title: 'Painel Técnico',
      description: 'Configurações avançadas do sistema',
      icon: Settings,
      route: '/admin',
      category: 'Técnico',
      keywords: ['admin', 'configuração', 'técnico', 'sistema'],
      requiredRoles: ['admin'],
      badge: 'Admin'
    },
    {
      id: 'analytics',
      title: 'Analytics Avançado',
      description: 'Análise de dados e métricas',
      icon: BarChart3,
      route: '/admin?tab=analytics',
      category: 'Técnico',
      keywords: ['analytics', 'dados', 'métricas', 'estatísticas'],
      requiredRoles: ['admin']
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Manager',
      description: 'Gerenciar mensagens WhatsApp',
      icon: MessageSquare,
      route: '/admin?tab=whatsapp',
      category: 'Técnico',
      keywords: ['whatsapp', 'mensagem', 'comunicação'],
      requiredRoles: ['admin']
    },
    {
      id: 'notifications',
      title: 'Central de Notificações',
      description: 'Enviar notificações aos usuários',
      icon: Bell,
      route: '/admin?tab=notifications',
      category: 'Técnico',
      keywords: ['notificação', 'aviso', 'comunicado'],
      requiredRoles: ['admin']
    },
    {
      id: 'monitoring',
      title: 'Monitoramento',
      description: 'Saúde e performance do sistema',
      icon: Shield,
      route: '/admin?tab=monitoring',
      category: 'Técnico',
      keywords: ['monitoramento', 'saúde', 'sistema', 'performance'],
      requiredRoles: ['admin']
    },

    // Páginas Específicas
    {
      id: 'galeria',
      title: 'Galeria',
      description: 'Fotos e vídeos dos eventos',
      icon: Camera,
      route: '/galeria',
      category: 'Mídia',
      keywords: ['galeria', 'fotos', 'imagens', 'vídeos', 'eventos']
    },
    {
      id: 'oracao',
      title: 'Pedidos de Oração',
      description: 'Enviar e acompanhar pedidos de oração',
      icon: Heart,
      route: '/pedidos-oracao',
      category: 'Espiritual',
      keywords: ['oração', 'pedido', 'intercessão', 'orar']
    },
    {
      id: 'primeira-vez',
      title: 'Primeira Vez',
      description: 'Informações para visitantes',
      icon: User,
      route: '/primeira-vez',
      category: 'Site',
      keywords: ['primeira', 'visitante', 'novo', 'primeira vez']
    }
  ];

  // Filtrar ações baseado no papel do usuário
  const getAvailableActions = () => {
    return quickActions.filter(action => {
      if (!action.requiredRoles) return true;
      return action.requiredRoles.includes(userRole?.toLowerCase() || '') || userRole?.toLowerCase() === 'admin';
    });
  };

  const availableActions = getAvailableActions();

  // Agrupar ações por categoria
  const groupedActions = availableActions.reduce((groups, action) => {
    const category = action.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(action);
    return groups;
  }, {} as Record<string, QuickAction[]>);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Digite para buscar ou navegar..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          
          {Object.entries(groupedActions).map(([category, actions]) => (
            <div key={category}>
              <CommandGroup heading={category}>
                {actions.map((action) => (
                  <CommandItem
                    key={action.id}
                    value={`${action.title} ${action.description} ${action.keywords.join(' ')}`}
                    onSelect={() => runCommand(() => navigate(action.route))}
                    className="flex items-center gap-3 p-3"
                  >
                    <action.icon className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{action.title}</span>
                        {action.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {action.badge}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </div>
          ))}
          
          <CommandGroup heading="Ações Rápidas">
            <CommandItem
              onSelect={() => runCommand(() => navigate('/perfil'))}
              className="flex items-center gap-3 p-3"
            >
              <User className="w-4 h-4" />
              <div>
                <div className="font-medium">Meu Perfil</div>
                <div className="text-xs text-muted-foreground">Gerenciar informações pessoais</div>
              </div>
            </CommandItem>
            <CommandItem
              onSelect={() => runCommand(() => navigate('/configuracoes'))}
              className="flex items-center gap-3 p-3"
            >
              <Settings className="w-4 h-4" />
              <div>
                <div className="font-medium">Configurações</div>
                <div className="text-xs text-muted-foreground">Preferências do sistema</div>
              </div>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default QuickSwitcher;