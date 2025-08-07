import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Evento {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim?: string;
  local: string;
  endereco?: string;
  tipo: string;
  recorrente: boolean;
  recorrencia_tipo?: string;
  publico: boolean;
  capacidade?: number;
  inscricoes_abertas: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useEventos = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchEventos = async () => {
    setLoading(true);
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_inicio');

      if (error) throw error;
      setEventos(data || []);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
      setIsLoading(false);
    }
  };

  const createEvento = async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Obter igreja_id do usuário logado
      const { data: igrejaDados } = await supabase.rpc('get_user_igreja_id');
      
      const { data, error } = await supabase
        .from('eventos')
        .insert([{
          ...evento,
          igreja_id: igrejaDados
        }])
        .select()
        .single();

      if (error) throw error;

      setEventos(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateEvento = async (id: string, updates: Partial<Evento>) => {
    try {
      const { data, error } = await supabase
        .from('eventos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setEventos(prev => prev.map(evento => evento.id === id ? data : evento));
      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEventos(prev => prev.filter(evento => evento.id !== id));
      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso",
      });
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir evento",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return {
    eventos,
    loading,
    isLoading,
    error,
    createEvento,
    updateEvento,
    deleteEvento,
    refetch: fetchEventos,
  };
};