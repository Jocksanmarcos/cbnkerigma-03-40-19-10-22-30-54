import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AgendaEvento {
  id: string;
  titulo: string;
  descricao?: string;
  tipo: 'publico' | 'celula' | 'ensino' | 'reuniao_interna' | 'pastoral';
  publico: boolean;
  data_inicio: string;
  data_fim?: string;
  local?: string;
  organizador_id?: string;
  status: 'agendado' | 'confirmado' | 'concluido' | 'cancelado';
  enviar_notificacao: boolean;
  visivel_para: string[];
  grupo: string;
  link_google_calendar?: string;
  imagem_url?: string;
  igreja_id: string;
  created_at: string;
  updated_at: string;
  organizador?: {
    nome_completo: string;
  };
}

export const useAgendaEventos = () => {
  const [eventos, setEventos] = useState<AgendaEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('agenda_eventos')
        .select(`
          *,
          organizador:pessoas!organizador_id(nome_completo)
        `)
        .order('data_inicio', { ascending: true });

      if (fetchError) throw fetchError;
      setEventos(data || []);
    } catch (err) {
      console.error('Erro ao buscar eventos:', err);
      setError('Erro ao carregar eventos');
    } finally {
      setLoading(false);
    }
  };

  const createEvento = async (evento: Omit<AgendaEvento, 'id' | 'created_at' | 'updated_at' | 'igreja_id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data: igreja } = await supabase
        .from('usuarios_admin')
        .select('igreja_id')
        .eq('user_id', userData.user.id)
        .single();

      if (!igreja) throw new Error('Igreja não encontrada');

      const { data, error } = await supabase
        .from('agenda_eventos')
        .insert([{ ...evento, igreja_id: igreja.igreja_id }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento criado com sucesso!",
      });

      await fetchEventos();
      return data;
    } catch (err) {
      console.error('Erro ao criar evento:', err);
      toast({
        title: "Erro",
        description: "Erro ao criar evento",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateEvento = async (id: string, updates: Partial<AgendaEvento>) => {
    try {
      const { data, error } = await supabase
        .from('agenda_eventos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento atualizado com sucesso!",
      });

      await fetchEventos();
      return data;
    } catch (err) {
      console.error('Erro ao atualizar evento:', err);
      toast({
        title: "Erro",
        description: "Erro ao atualizar evento",
        variant: "destructive",
      });
      throw err;
    }
  };

  const deleteEvento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('agenda_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Evento excluído com sucesso!",
      });

      await fetchEventos();
    } catch (err) {
      console.error('Erro ao excluir evento:', err);
      toast({
        title: "Erro",
        description: "Erro ao excluir evento",
        variant: "destructive",
      });
      throw err;
    }
  };

  const getEventosPublicos = () => {
    return eventos.filter(evento => evento.publico);
  };

  const getEventosPorTipo = (tipo: AgendaEvento['tipo']) => {
    return eventos.filter(evento => evento.tipo === tipo);
  };

  const getEventosProximos = (dias = 7) => {
    const hoje = new Date();
    const limite = new Date(hoje.getTime() + (dias * 24 * 60 * 60 * 1000));
    
    return eventos.filter(evento => {
      const dataEvento = new Date(evento.data_inicio);
      return dataEvento >= hoje && dataEvento <= limite;
    });
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  return {
    eventos,
    loading,
    error,
    fetchEventos,
    createEvento,
    updateEvento,
    deleteEvento,
    getEventosPublicos,
    getEventosPorTipo,
    getEventosProximos,
  };
};