import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Lider {
  id: string;
  nome: string;
  cargo: string;
  descricao?: string;
  foto_url?: string;
  ordem: number;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface LiderFormData {
  nome: string;
  cargo: string;
  descricao?: string;
  foto_url?: string;
  ordem: number;
  ativo?: boolean;
}

export const useLideranca = () => {
  const [lideres, setLideres] = useState<Lider[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLideres = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('lideranca')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) throw error;
      setLideres(data || []);
    } catch (error) {
      console.error('Erro ao carregar líderes:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar líderes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarLider = async (dados: LiderFormData) => {
    try {
      const { data, error } = await supabase
        .from('lideranca')
        .insert([{
          ...dados,
          ativo: dados.ativo ?? true
        }])
        .select()
        .single();

      if (error) throw error;

      setLideres(prev => [...prev, data].sort((a, b) => a.ordem - b.ordem));
      toast({
        title: "Sucesso",
        description: "Líder criado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar líder:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar líder",
        variant: "destructive",
      });
      throw error;
    }
  };

  const atualizarLider = async (id: string, updates: Partial<LiderFormData>) => {
    try {
      const { data, error } = await supabase
        .from('lideranca')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLideres(prev => prev.map(lider => 
        lider.id === id ? data : lider
      ).sort((a, b) => a.ordem - b.ordem));
      
      toast({
        title: "Sucesso",
        description: "Líder atualizado com sucesso",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar líder:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar líder",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deletarLider = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lideranca')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setLideres(prev => prev.filter(lider => lider.id !== id));
      toast({
        title: "Sucesso",
        description: "Líder removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar líder:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover líder",
        variant: "destructive",
      });
      throw error;
    }
  };

  const fetchLideresAtivos = async () => {
    try {
      const { data, error } = await supabase
        .from('lideranca')
        .select('*')
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao carregar líderes ativos:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchLideres();
  }, []);

  return {
    lideres,
    loading,
    criarLider,
    atualizarLider,
    deletarLider,
    fetchLideresAtivos,
    refetch: fetchLideres
  };
};