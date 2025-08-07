import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Espaco {
  id: string;
  nome: string;
  descricao?: string;
  capacidade: number;
  recursos: string[];
  disponivel: boolean;
  created_at: string;
  updated_at: string;
}

export interface ReservaEspaco {
  id: string;
  espaco_id: string;
  nome_responsavel: string;
  email_responsavel: string;
  telefone_responsavel?: string;
  evento_titulo: string;
  data_inicio: string;
  data_fim: string;
  observacoes?: string;
  status: 'pendente' | 'aprovado' | 'rejeitado' | 'cancelado';
  created_at: string;
  updated_at: string;
  espacos?: Espaco;
}

export interface NovaReserva {
  espaco_id: string;
  nome_responsavel: string;
  email_responsavel: string;
  telefone_responsavel?: string;
  evento_titulo: string;
  data_inicio: string;
  data_fim: string;
  observacoes?: string;
}

export const useReservasEspacos = () => {
  const [espacos, setEspacos] = useState<Espaco[]>([]);
  const [reservas, setReservas] = useState<ReservaEspaco[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchEspacos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('espacos')
        .select('*')
        .eq('disponivel', true)
        .order('nome');

      if (error) throw error;
      setEspacos(data as Espaco[] || []);
    } catch (error) {
      console.error('Erro ao buscar espaços:', error);
      toast({
        title: "Erro ao carregar espaços",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReservas = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservas_espacos')
        .select(`
          *,
          espacos(*)
        `)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setReservas(data as ReservaEspaco[] || []);
    } catch (error) {
      console.error('Erro ao buscar reservas:', error);
      toast({
        title: "Erro ao carregar reservas",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const criarReserva = async (novaReserva: NovaReserva) => {
    setIsLoading(true);
    try {
      // Verificar disponibilidade
      const { data: conflitos, error: conflitosError } = await supabase
        .from('reservas_espacos')
        .select('*')
        .eq('espaco_id', novaReserva.espaco_id)
        .in('status', ['aprovado', 'pendente'])
        .or(`data_inicio.lte.${novaReserva.data_fim},data_fim.gte.${novaReserva.data_inicio}`);

      if (conflitosError) throw conflitosError;

      if (conflitos && conflitos.length > 0) {
        toast({
          title: "Conflito de horário",
          description: "O espaço já possui uma reserva para esse período.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('reservas_espacos')
        .insert([novaReserva])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Reserva solicitada com sucesso",
        description: "Sua solicitação será analisada e você receberá uma confirmação em breve.",
      });

      await fetchReservas();
      return data;
    } catch (error) {
      console.error('Erro ao criar reserva:', error);
      toast({
        title: "Erro ao solicitar reserva",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarStatusReserva = async (id: string, status: 'aprovado' | 'rejeitado' | 'cancelado') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('reservas_espacos')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status da reserva foi atualizado com sucesso.",
      });

      await fetchReservas();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const verificarDisponibilidade = async (espaco_id: string, data_inicio: string, data_fim: string) => {
    try {
      const { data: conflitos, error } = await supabase
        .from('reservas_espacos')
        .select('*')
        .eq('espaco_id', espaco_id)
        .in('status', ['aprovado', 'pendente'])
        .or(`data_inicio.lte.${data_fim},data_fim.gte.${data_inicio}`);

      if (error) throw error;
      return (conflitos?.length || 0) === 0;
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchEspacos();
  }, []);

  return {
    espacos,
    reservas,
    isLoading,
    fetchEspacos,
    fetchReservas,
    criarReserva,
    atualizarStatusReserva,
    verificarDisponibilidade
  };
};