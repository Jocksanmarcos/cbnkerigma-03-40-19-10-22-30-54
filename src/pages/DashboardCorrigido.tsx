import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PageLayout } from '@/components/ui/page-layout';
import { ModernDashboard } from '@/components/dashboard/ModernDashboard';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DashboardCorrigido = () => {
  const { isAuthenticated, loading, user, signOut } = useAuth();
  const navigate = useNavigate();

  // Proteção de rota - redirecionar se não autenticado
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <PageLayout
        title="Dashboard"
        description="Carregando dashboard..."
        maxWidth="7xl"
      >
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  // Não renderizar nada se não autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <PageLayout
      title="Gestão Eclesiástica"
      description="Dashboard Administrativo"
      actions={
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/configuracoes')}
            title="Configurações"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => signOut()}
            title="Sair"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      }
      maxWidth="7xl"
    >
      {/* Header personalizado */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center shadow-lg">
            <LayoutDashboard className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              Kerigma Hub
            </h1>
            <p className="text-muted-foreground">Gestão Eclesiástica Inteligente</p>
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <div className="mb-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-2xl border border-border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Bem-vindo, {user?.email?.split('@')[0]}!
            </h2>
            <p className="text-muted-foreground">
              Gerencie sua igreja com inteligência artificial e tecnologia moderna
            </p>
          </div>
        </div>
      </div>

      {/* Conteúdo do Dashboard - ModernDashboard sem seus próprios headers */}
      <div className="dashboard-content">
        <ModernDashboard isEmbedded={true} />
      </div>
    </PageLayout>
  );
};

export default DashboardCorrigido;