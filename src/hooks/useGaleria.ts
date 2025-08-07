import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface GaleriaItem {
  id: string;
  titulo: string;
  descricao?: string;
  categoria?: string;
  url_imagem: string;
  url_thumbnail?: string;
  data_evento?: string;
  destaque?: boolean;
  ordem?: number;
  evento_id?: string;
  created_at: string;
}

export const useGaleria = () => {
  const [items, setItems] = useState<GaleriaItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('galeria_fotos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar galeria:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar itens da galeria",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (item: Omit<GaleriaItem, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('galeria_fotos')
        .insert([item])
        .select()
        .single();
      
      if (error) {
        throw error;
      }

      setItems(prev => [data, ...prev]);
      toast({
        title: "Sucesso",
        description: "Item adicionado à galeria",
      });
      return data;
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast({
        title: "Erro",
        description: `Erro ao adicionar item à galeria: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateItem = async (id: string, updates: Partial<GaleriaItem>) => {
    try {
      const { data, error } = await supabase
        .from('galeria_fotos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data : item));
      toast({
        title: "Sucesso",
        description: "Item atualizado",
      });
      return data;
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar item",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('galeria_fotos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Item removido da galeria",
      });
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover item",
        variant: "destructive",
      });
      throw error;
    }
  };

   const uploadImage = async (file: File) => {
     try {
       const fileExt = file.name.split('.').pop();
       const fileName = `${Date.now()}.${fileExt}`;
       const filePath = `galeria/${fileName}`;

       const { error: uploadError } = await supabase.storage
         .from('galeria')
         .upload(filePath, file);

       if (uploadError) {
         throw uploadError;
       }

       const { data: { publicUrl } } = supabase.storage
         .from('galeria')
         .getPublicUrl(filePath);
       return publicUrl;
     } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao fazer upload da imagem: ${error.message || 'Erro desconhecido'}`,
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    uploadImage,
  };
};