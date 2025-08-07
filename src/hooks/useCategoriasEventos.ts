import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CategoriaEvento {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export const useCategoriasEventos = () => {
  const [categorias, setCategorias] = useState<CategoriaEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_eventos')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategoria = async (categoria: Omit<CategoriaEvento, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('categorias_eventos')
        .insert([categoria]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });

      await fetchCategorias();
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive",
      });
    }
  };

  const updateCategoria = async (id: string, updates: Partial<CategoriaEvento>) => {
    try {
      const { error } = await supabase
        .from('categorias_eventos')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });

      await fetchCategorias();
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
    }
  };

  const deleteCategoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias_eventos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!",
      });

      await fetchCategorias();
    } catch (error: any) {
      console.error('Erro ao remover categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover categoria",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return {
    categorias,
    loading,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    fetchCategorias,
  };
};