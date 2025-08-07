import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Voluntario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  areas_interesse: string[];
  disponibilidade: string;
  experiencia?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo' | 'afastado';
  created_at: string;
  updated_at: string;
}

export interface NovoVoluntario {
  nome: string;
  email: string;
  telefone?: string;
  areas_interesse: string[];
  disponibilidade: string;
  experiencia?: string;
  observacoes?: string;
}

export const useVoluntarios = () => {
  const [voluntarios, setVoluntarios] = useState<Voluntario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchVoluntarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVoluntarios(data as Voluntario[] || []);
    } catch (error) {
      console.error('Erro ao buscar voluntários:', error);
      toast({
        title: "Erro ao carregar voluntários",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const criarVoluntario = async (novoVoluntario: NovoVoluntario) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('voluntarios')
        .insert([novoVoluntario])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Cadastro realizado com sucesso",
        description: "Obrigado por se voluntariar! Entraremos em contato em breve.",
      });

      await fetchVoluntarios();
      return data;
    } catch (error) {
      console.error('Erro ao criar voluntário:', error);
      toast({
        title: "Erro ao realizar cadastro",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarStatus = async (id: string, status: 'ativo' | 'inativo' | 'afastado') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('voluntarios')
        .update({ status })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Status atualizado",
        description: "O status do voluntário foi atualizado com sucesso.",
      });

      await fetchVoluntarios();
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

  useEffect(() => {
    fetchVoluntarios();
  }, []);

  return {
    voluntarios,
    isLoading,
    fetchVoluntarios,
    criarVoluntario,
    atualizarStatus
  };
};