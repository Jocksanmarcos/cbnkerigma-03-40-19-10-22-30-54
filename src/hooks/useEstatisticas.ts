import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Estatistica {
  id: string;
  chave: string;
  valor: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

export const useEstatisticas = () => {
  const [estatisticas, setEstatisticas] = useState<Estatistica[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEstatisticas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('estatisticas_site')
        .select('*')
        .order('chave');

      if (error) throw error;
      setEstatisticas(data || []);
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      setError('Erro ao carregar estatísticas');
    } finally {
      setLoading(false);
    }
  };

  const updateEstatistica = async (chave: string, valor: string) => {
    try {
      const { data, error } = await supabase
        .from('estatisticas_site')
        .update({ valor })
        .eq('chave', chave)
        .select()
        .single();

      if (error) throw error;

      setEstatisticas(prev => 
        prev.map(est => est.chave === chave ? data : est)
      );
      
      toast({
        title: "Sucesso",
        description: "Estatística atualizada com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar estatística:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar estatística",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getEstatisticaPorChave = (chave: string) => {
    return estatisticas.find(est => est.chave === chave)?.valor || '0';
  };

  useEffect(() => {
    fetchEstatisticas();
  }, []);

  return {
    estatisticas,
    loading,
    error,
    updateEstatistica,
    getEstatisticaPorChave,
    refetch: fetchEstatisticas,
  };
};