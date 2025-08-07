import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface EstudoBiblico {
  id: string;
  titulo: string;
  descricao?: string;
  versiculo_chave?: string;
  semana_inicio: string;
  semana_fim: string;
  arquivo_url?: string;
  arquivo_nome?: string;
  arquivo_tamanho?: string;
  downloads?: number;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useEstudos = () => {
  const [estudos, setEstudos] = useState<EstudoBiblico[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEstudos = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('estudos_biblicos')
        .select('*')
        .order('semana_inicio', { ascending: false });

      if (error) throw error;
      setEstudos(data || []);
    } catch (err) {
      console.error('Erro ao buscar estudos:', err);
      setError('Erro ao carregar estudos');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const createEstudo = async (estudo: Omit<EstudoBiblico, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('estudos_biblicos')
        .insert([estudo])
        .select()
        .single();

      if (error) throw error;

      setEstudos(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Estudo criado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar estudo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar estudo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEstudo = async (id: string, updates: Partial<EstudoBiblico>) => {
    try {
      const { data, error } = await supabase
        .from('estudos_biblicos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEstudos(prev => prev.map(estudo => estudo.id === id ? data : estudo));
      toast({
        title: "Sucesso",
        description: "Estudo atualizado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar estudo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar estudo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEstudo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('estudos_biblicos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEstudos(prev => prev.filter(estudo => estudo.id !== id));
      toast({
        title: "Sucesso",
        description: "Estudo excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir estudo:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir estudo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const baixarEstudo = async (estudo: EstudoBiblico) => {
    toast({
      title: "Download iniciado!",
      description: `Baixando o estudo: ${estudo.titulo}`,
    });
    
    await updateEstudo(estudo.id, { 
      downloads: (estudo.downloads || 0) + 1 
    });
  };

  useEffect(() => {
    fetchEstudos();
  }, []);

  return {
    estudos,
    loading,
    isLoading,
    error,
    createEstudo,
    updateEstudo,
    deleteEstudo,
    baixarEstudo,
    refetch: fetchEstudos,
  };
};