import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PedidoOracao {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  pedido: string;
  urgencia: 'normal' | 'urgente' | 'muito_urgente';
  categoria: string;
  publico: boolean;
  status: 'ativo' | 'respondido' | 'arquivado';
  created_at: string;
  updated_at: string;
}

export interface NovoPedidoOracao {
  nome: string;
  email?: string;
  telefone?: string;
  pedido: string;
  urgencia: 'normal' | 'urgente' | 'muito_urgente';
  categoria: string;
  publico: boolean;
}

export const usePedidosOracao = () => {
  const [pedidos, setPedidos] = useState<PedidoOracao[]>([]);
  const [pedidosPublicos, setPedidosPublicos] = useState<PedidoOracao[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchPedidos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos_oracao')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data as PedidoOracao[] || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPedidosPublicos = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos_oracao')
        .select('*')
        .eq('publico', true)
        .eq('status', 'ativo')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidosPublicos(data as PedidoOracao[] || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos públicos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const criarPedido = async (novoPedido: NovoPedidoOracao) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos_oracao')
        .insert([novoPedido])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pedido enviado com sucesso",
        description: "Sua solicitação foi recebida e será incluída em nossas orações.",
      });

      await fetchPedidos();
      await fetchPedidosPublicos();
      return data;
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro ao enviar pedido",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarStatus = async (id: string, status: 'ativo' | 'respondido' | 'arquivado') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('pedidos_oracao')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status do pedido foi atualizado com sucesso.",
      });

      await fetchPedidos();
      await fetchPedidosPublicos();
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

  const marcarComoRespondido = async (id: string) => {
    await atualizarStatus(id, 'respondido');
  };

  const arquivarPedido = async (id: string) => {
    await atualizarStatus(id, 'arquivado');
  };

  useEffect(() => {
    fetchPedidosPublicos();
  }, []);

  return {
    pedidos,
    pedidosPublicos,
    isLoading,
    fetchPedidos,
    fetchPedidosPublicos,
    criarPedido,
    marcarComoRespondido,
    arquivarPedido,
    atualizarStatus
  };
};