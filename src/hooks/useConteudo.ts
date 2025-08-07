import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface ConteudoSite {
  id: string;
  chave: string;
  titulo: string;
  valor: string;
  tipo: 'texto' | 'textarea' | 'html';
  categoria?: string;
  descricao?: string;
  created_at: string;
  updated_at: string;
}

export const useConteudo = () => {
  const [conteudos, setConteudos] = useState<ConteudoSite[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchConteudos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('conteudo_site')
        .select('*')
        .order('categoria', { ascending: true })
        .order('titulo', { ascending: true });

      if (error) throw error;
      setConteudos((data || []) as ConteudoSite[]);
    } catch (error) {
      console.error('Erro ao carregar conteúdos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar conteúdos do site",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConteudo = async (id: string, valor: string) => {
    try {
      const { data, error } = await supabase
        .from('conteudo_site')
        .update({ valor })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setConteudos(prev => prev.map(item => 
        item.id === id ? { ...item, valor } : item
      ));
      
      toast({
        title: "Sucesso",
        description: "Conteúdo atualizado com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conteúdo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createConteudo = async (conteudo: Omit<ConteudoSite, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('conteudo_site')
        .insert([conteudo])
        .select()
        .single();

      if (error) throw error;

      setConteudos(prev => [...prev, data as ConteudoSite]);
      toast({
        title: "Sucesso",
        description: "Conteúdo criado com sucesso",
      });
      
      return data;
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conteúdo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteConteudo = async (id: string) => {
    try {
      const { error } = await supabase
        .from('conteudo_site')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setConteudos(prev => prev.filter(item => item.id !== id));
      toast({
        title: "Sucesso",
        description: "Conteúdo removido com sucesso",
      });
    } catch (error) {
      console.error('Erro ao deletar conteúdo:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conteúdo",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Hook para buscar conteúdo específico por chave
  const getConteudoPorChave = (chave: string, valorPadrao: string = '') => {
    const conteudo = conteudos.find(item => item.chave === chave);
    return conteudo?.valor || valorPadrao;
  };

  useEffect(() => {
    fetchConteudos();
  }, []);

  return {
    conteudos,
    loading,
    fetchConteudos,
    updateConteudo,
    createConteudo,
    deleteConteudo,
    getConteudoPorChave,
  };
};

// Hook específico para uso nas páginas públicas
export const useConteudoPagina = () => {
  const [conteudos, setConteudos] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConteudos = async () => {
      try {
        const { data, error } = await supabase
          .from('conteudo_site')
          .select('chave, valor');

        if (error) throw error;

        const conteudosMap = data.reduce((acc, item) => {
          acc[item.chave] = item.valor;
          return acc;
        }, {} as Record<string, string>);

        setConteudos(conteudosMap);
      } catch (error) {
        console.error('Erro ao carregar conteúdos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConteudos();

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('conteudo-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conteudo_site'
        },
        () => {
          fetchConteudos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getConteudo = (chave: string, valorPadrao: string = '') => {
    return conteudos[chave] || valorPadrao;
  };

  return { getConteudo, loading };
};