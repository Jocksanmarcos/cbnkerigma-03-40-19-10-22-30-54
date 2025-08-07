import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ModernDashboard } from '@/components/dashboard/ModernDashboard';

const Dashboard = () => {
  const { isAuthenticated, loading } = useAuth();
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Não renderizar nada se não autenticado
  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Painel principal de controle</p>
        </div>
        <ModernDashboard isEmbedded={true} />
      </div>
    </AppLayout>
  );
};

export default Dashboard;