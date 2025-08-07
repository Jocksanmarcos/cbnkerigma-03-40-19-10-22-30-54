import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { JornadaMembroView } from '@/components/dashboard/JornadaMembroView';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Pessoas = () => {
  const { id } = useParams();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [pessoa, setPessoa] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (id && isAuthenticated) {
      fetchPessoa();
    }
  }, [id, isAuthenticated]);

  const fetchPessoa = async () => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setPessoa(data);
    } catch (error) {
      console.error('Erro ao buscar pessoa:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!pessoa) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Pessoa não encontrada</h1>
              <p className="text-muted-foreground">A pessoa solicitada não foi encontrada</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Pessoa não encontrada.</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Jornada 360° - {pessoa.nome_completo}</h1>
            <p className="text-muted-foreground">Acompanhamento completo do membro</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
        <JornadaMembroView pessoa={pessoa} />
      </div>
    </AppLayout>
  );
};

export default Pessoas;