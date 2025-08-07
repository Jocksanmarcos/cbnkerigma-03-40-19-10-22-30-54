import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Campanha {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: string;
  meta_valor: number;
  valor_atual: number;
  data_inicio: string;
  data_fim: string;
  ativa: boolean;
  imagem_url?: string;
  created_at: string;
  updated_at?: string;
}

export const useCampanhas = () => {
  const [campanhas, setCampanhas] = useState<Campanha[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCampanhas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campanhas_arrecadacao')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCampanhas(data || []);
    } catch (error) {
      console.error('Erro ao buscar campanhas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as campanhas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCampanha = async (campanha: Omit<Campanha, 'id' | 'created_at' | 'updated_at' | 'valor_atual'>) => {
    try {
      const { data, error } = await supabase
        .from('campanhas_arrecadacao')
        .insert([{
          ...campanha,
          valor_atual: 0
        }])
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCampanhas(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Campanha criada com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a campanha",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCampanha = async (id: string, updates: Partial<Campanha>) => {
    try {
      const { data, error } = await supabase
        .from('campanhas_arrecadacao')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setCampanhas(prev => prev.map(campanha => 
        campanha.id === id ? data : campanha
      ));

      toast({
        title: "Sucesso",
        description: "Campanha atualizada com sucesso",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar campanha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a campanha",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCampanha = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campanhas_arrecadacao')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setCampanhas(prev => prev.filter(campanha => campanha.id !== id));
      toast({
        title: "Sucesso",
        description: "Campanha excluída com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir campanha:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a campanha",
        variant: "destructive",
      });
      throw error;
    }
  };

  const calcularProgresso = (valorAtual: number, metaValor: number) => {
    return metaValor > 0 ? Math.min((valorAtual / metaValor) * 100, 100) : 0;
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const isEncerrada = (dataFim: string) => {
    return new Date(dataFim) < new Date();
  };

  const diasRestantes = (dataFim: string) => {
    const hoje = new Date();
    const fim = new Date(dataFim);
    const diffTime = fim.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  useEffect(() => {
    fetchCampanhas();
  }, []);

  return {
    campanhas,
    loading,
    isLoading: loading, // Alias para compatibilidade
    createCampanha,
    updateCampanha,
    deleteCampanha,
    refetch: fetchCampanhas,
    calcularProgresso,
    formatarValor,
    isEncerrada,
    diasRestantes,
  };
};