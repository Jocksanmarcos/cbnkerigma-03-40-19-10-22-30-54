import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ContatoFormData {
  nome: string;
  email: string;
  telefone?: string;
  assunto: string;
  mensagem: string;
}

export const useContatos = () => {
  const [contatos, setContatos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchContatos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('contatos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContatos(data || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contatos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContato = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('contatos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setContatos(prev => prev.map(contato => contato.id === id ? data : contato));
      toast({
        title: "Sucesso",
        description: "Status do contato atualizado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar contato:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar contato: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const enviarContato = async (dados: ContatoFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('contatos')
        .insert([{
          ...dados,
          status: 'novo'  // Mudado de 'pendente' para 'novo'
        }]);

      if (error) throw error;

      toast({
        title: "Mensagem enviada!",
        description: "Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.",
      });

      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar contato:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro ao enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContatos();
  }, []);

  return {
    contatos,
    loading,
    enviarContato,
    updateContato,
    isLoading,
  };
};