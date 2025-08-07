import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface EventoConfirmacao {
  id: string;
  evento_id: string;
  user_id: string;
  confirmado: boolean;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface EventoDoacao {
  id: string;
  evento_id: string;
  user_id?: string;
  nome_doador?: string;
  email_doador?: string;
  valor: number;
  tipo_doacao: 'dinheiro' | 'material' | 'servico';
  descricao?: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  metodo_pagamento?: string;
  comprovante_url?: string;
  created_at: string;
  updated_at: string;
}

export interface EventoPedidoOracao {
  id: string;
  evento_id: string;
  user_id?: string;
  nome_solicitante: string;
  email_solicitante?: string;
  telefone_solicitante?: string;
  pedido: string;
  publico: boolean;
  status: 'ativo' | 'atendido' | 'cancelado';
  created_at: string;
  updated_at: string;
}

export const useEventoInteractions = () => {
  const [loading, setLoading] = useState(false);
  const [confirmacoes, setConfirmacoes] = useState<{ [key: string]: boolean }>({});

  // Buscar confirmações do usuário
  const fetchUserConfirmacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('evento_confirmacoes')
        .select('evento_id, confirmado')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;

      const confirmacaoMap = data?.reduce((acc, conf) => {
        acc[conf.evento_id] = conf.confirmado;
        return acc;
      }, {} as { [key: string]: boolean }) || {};

      setConfirmacoes(confirmacaoMap);
    } catch (error) {
      console.error('Erro ao buscar confirmações:', error);
    }
  };

  // Confirmar presença em evento
  const confirmarPresenca = async (eventoId: string, observacoes?: string) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('evento_confirmacoes')
        .upsert({
          evento_id: eventoId,
          user_id: userData.user.id,
          confirmado: true,
          observacoes
        }, {
          onConflict: 'evento_id,user_id'
        });

      if (error) throw error;

      setConfirmacoes(prev => ({ ...prev, [eventoId]: true }));
      
      toast({
        title: "Presença confirmada!",
        description: "Sua participação foi registrada com sucesso.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao confirmar presença:', error);
      toast({
        title: "Erro",
        description: "Não foi possível confirmar sua presença.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Cancelar confirmação
  const cancelarConfirmacao = async (eventoId: string) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('evento_confirmacoes')
        .delete()
        .eq('evento_id', eventoId)
        .eq('user_id', userData.user.id);

      if (error) throw error;

      setConfirmacoes(prev => ({ ...prev, [eventoId]: false }));
      
      toast({
        title: "Presença cancelada",
        description: "Sua participação foi cancelada.",
      });

      return true;
    } catch (error) {
      console.error('Erro ao cancelar confirmação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cancelar sua presença.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Criar doação para evento
  const criarDoacao = async (doacao: Omit<EventoDoacao, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const dadosDoacao = {
        ...doacao,
        user_id: userData.user?.id || null
      };

      const { data, error } = await supabase
        .from('evento_doacoes')
        .insert([dadosDoacao])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Doação registrada!",
        description: "Sua doação foi registrada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar doação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar a doação.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Criar pedido de oração
  const criarPedidoOracao = async (pedido: Omit<EventoPedidoOracao, 'id' | 'created_at' | 'updated_at'>) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      const dadosPedido = {
        ...pedido,
        user_id: userData.user?.id || null
      };

      const { data, error } = await supabase
        .from('evento_pedidos_oracao')
        .insert([dadosPedido])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pedido registrado!",
        description: "Seu pedido de oração foi registrado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar pedido de oração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível registrar o pedido.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar doações de um evento
  const fetchDoacoesEvento = async (eventoId: string) => {
    try {
      const { data, error } = await supabase
        .from('evento_doacoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar doações:', error);
      return [];
    }
  };

  // Buscar pedidos de oração de um evento
  const fetchPedidosOracaoEvento = async (eventoId: string) => {
    try {
      const { data, error } = await supabase
        .from('evento_pedidos_oracao')
        .select('*')
        .eq('evento_id', eventoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar pedidos de oração:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchUserConfirmacoes();
  }, []);

  return {
    loading,
    confirmacoes,
    confirmarPresenca,
    cancelarConfirmacao,
    criarDoacao,
    criarPedidoOracao,
    fetchDoacoesEvento,
    fetchPedidosOracaoEvento,
    fetchUserConfirmacoes
  };
};