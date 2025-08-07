import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContribuicaoFormData {
  nome: string;
  valor: number;
  tipo: 'dizimo' | 'oferta' | 'missoes' | 'obras';
  mensagem?: string;
  metodo_pagamento?: 'pix' | 'transferencia' | 'dinheiro' | 'cartao';
  campanha_id?: string;
  email?: string;
}

export const useContribuicoes = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const registrarContribuicao = async (dados: ContribuicaoFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('contribuicoes')
        .insert([{
          ...dados,
          metodo_pagamento: dados.metodo_pagamento || 'pix'
        }]);

      if (error) throw error;

      toast({
        title: "Contribuição registrada!",
        description: "Obrigado pela sua generosidade. Que Deus abençoe sua vida!",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao registrar contribuição:', error);
      toast({
        title: "Erro ao registrar contribuição",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const processarPagamentoCartao = async (dados: ContribuicaoFormData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-payment', {
        body: {
          nome: dados.nome,
          email: dados.email || 'anonimo@email.com',
          valor: dados.valor,
          tipo: dados.tipo,
          campanhaId: dados.campanha_id,
          mensagem: dados.mensagem
        }
      });

      if (error) throw error;

      return { 
        success: true, 
        clientSecret: data.client_secret,
        paymentIntentId: data.payment_intent_id 
      };
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  const confirmarPagamentoCartao = async (paymentIntentId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('confirm-stripe-payment', {
        body: { payment_intent_id: paymentIntentId }
      });

      if (error) throw error;

      if (data.contribution_status === 'confirmado') {
        toast({
          title: "Pagamento confirmado!",
          description: "Sua contribuição foi processada com sucesso. Obrigado!",
        });
      }

      return { success: true, status: data.status };
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Entre em contato conosco se o problema persistir.",
        variant: "destructive",
      });
      return { success: false, error };
    }
  };

  return {
    registrarContribuicao,
    processarPagamentoCartao,
    confirmarPagamentoCartao,
    isLoading
  };
};