import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ActionButton } from '@/components/ui/action-button';
import { 
  Users, 
  Calendar,
  DollarSign,
  TrendingUp,
  Heart,
  BookOpen,
  Building2,
  Camera,
  UserCheck,
  BarChart3,
  Menu,
  X,
  Settings,
  ArrowLeft
} from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
// CommandCenterLayout removed - using unified AppLayout
import { MetricsGrid } from './MetricsGrid';
import { QuickActions } from './QuickActions';
import { RecentActivity } from './RecentActivity';
import { CelulasManager } from '@/components/admin/CelulasManager';
import PessoasManager from '@/components/admin/PessoasManager';
import FinanceiroManager from '@/components/admin/FinanceiroManager';
import { PatrimonioManager } from '@/components/admin/PatrimonioManager';
import EnsinoManager from '@/components/admin/EnsinoManager';
import { MissoesManager } from '@/components/admin/MissoesManager';
import AgendaManager from '@/components/admin/AgendaManager';

interface ModernDashboardProps {
  isEmbedded?: boolean; // Para detectar se está dentro de PageLayout
}

export const ModernDashboard = ({ isEmbedded = false }: ModernDashboardProps = {}) => {
  const [activeModule, setActiveModule] = useState('visao-geral');
  const [showMobileNav, setShowMobileNav] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const dashboardModules = [
    { id: 'visao-geral', label: 'Visão Geral', icon: BarChart3 },
    { id: 'pessoas', label: 'Pessoas', icon: Users },
    { id: 'celulas', label: 'Células', icon: UserCheck },
    { id: 'ensino', label: 'Ensino', icon: BookOpen },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    { id: 'patrimonio', label: 'Patrimônio', icon: Building2 },
    { id: 'missoes', label: 'Missões', icon: Building2 },
    { id: 'agenda', label: 'Agenda', icon: Calendar },
    { id: 'midias', label: 'Mídias', icon: Camera }
  ];

  const renderModuleContent = () => {
    switch (activeModule) {
      case 'visao-geral':
        return (
          <div className="space-y-3 sm:space-y-4 md:space-y-6 lg:space-y-8">
            <MetricsGrid />
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
              <div className="lg:col-span-2 order-2 lg:order-1">
                <QuickActions />
              </div>
              <div className="lg:col-span-3 order-1 lg:order-2">
                <RecentActivity />
              </div>
            </div>
          </div>
        );
      case 'pessoas':
        return <PessoasManager />;
      case 'celulas':
        return <CelulasManager />;
      case 'ensino':
        return <EnsinoManager />;
      case 'financeiro':
        return <FinanceiroManager />;
      case 'patrimonio':
        return <PatrimonioManager />;
      case 'missoes':
        return <MissoesManager />;
      case 'agenda':
        return <AgendaManager />;
      case 'midias':
        return <div>Módulo de Mídias em desenvolvimento...</div>;
      default:
        return <div>Módulo não encontrado</div>;
    }
  };

  // Se está sendo usado de forma embebida (dentro de PageLayout), retorna apenas o conteúdo
  if (isEmbedded) {
    return (
      <div className="dashboard-embedded">
        {renderModuleContent()}
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex flex-col">
          {/* Mobile Navigation Toggle */}
          <div className="p-4 border-b bg-card/95 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-foreground">Dashboard</h2>
              <ActionButton
                variant="ghost"
                size="sm"
                onClick={() => setShowMobileNav(!showMobileNav)}
                icon={showMobileNav ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              />
            </div>
            
            {/* Mobile Navigation Tabs */}
            {showMobileNav && (
              <div className="mt-4 pt-4 border-t border-border">
                <div className="platform-grid-4">
                  {dashboardModules.map((module) => {
                    const Icon = module.icon;
                    const isActive = activeModule === module.id;
                    return (
                      <ActionButton
                        key={module.id}
                        variant={isActive ? "primary" : "outline"}
                        size="sm"
                        onClick={() => {
                          setActiveModule(module.id);
                          setShowMobileNav(false);
                        }}
                        className={`flex flex-col gap-1 h-auto py-3 ${
                          isActive ? '' : 'text-muted-foreground'
                        }`}
                        icon={<Icon className="h-4 w-4" />}
                      >
                        <span className="text-xs font-medium text-center">{module.label}</span>
                      </ActionButton>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <main className="flex-1 p-4">
            {renderModuleContent()}
          </main>
        </div>
      </div>
    );
  }

  // Desktop version - content only since AppLayout handles header/sidebar
  return (
    <div className="dashboard-content">
      {renderModuleContent()}
    </div>
  );
};