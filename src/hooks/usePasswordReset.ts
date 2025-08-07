import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const usePasswordReset = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const sendPasswordResetEmail = async (email: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-password-reset-email', {
        body: { email }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitação processada!",
        description: "Se o email existir em nosso sistema, você receberá instruções para redefinir sua senha.",
      });

      return data;
    } catch (error: any) {
      console.error('Erro ao enviar email de reset:', error);
      
      // Verificar se é um erro de rate limit
      if (error.message.includes('rate_limit') || error.message.includes('429')) {
        toast({
          title: "Muitas tentativas",
          description: "Aguarde alguns minutos antes de solicitar novamente por motivos de segurança.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erro ao processar solicitação",
          description: "Tente novamente mais tarde ou entre em contato com o suporte.",
          variant: "destructive"
        });
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendPasswordResetEmail,
    loading
  };
};