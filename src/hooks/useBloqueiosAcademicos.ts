import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface BloqueioAcademico {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  tipo: 'bloqueio' | 'evento' | 'feriado';
  cor: string;
  ativo: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ConfliteTurma {
  tipo_conflito: string;
  descricao: string;
  gravidade: number;
}

export const useBloqueiosAcademicos = () => {
  const [bloqueios, setBloqueios] = useState<BloqueioAcademico[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBloqueios = async () => {
    try {
      const { data, error } = await supabase
        .from('bloqueios_academicos')
        .select('*')
        .eq('ativo', true)
        .order('data_inicio');

      if (error) throw error;
      setBloqueios((data || []) as BloqueioAcademico[]);
    } catch (error: any) {
      console.error('Erro ao buscar bloqueios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar bloqueios acadêmicos",
        variant: "destructive",
      });
    }
  };

  const createBloqueio = async (bloqueio: Omit<BloqueioAcademico, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    try {
      const { data, error } = await supabase
        .from('bloqueios_academicos')
        .insert([{
          ...bloqueio,
          created_by: (await supabase.auth.getUser()).data.user?.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bloqueio acadêmico criado com sucesso!",
      });

      await fetchBloqueios();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar bloqueio:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar bloqueio acadêmico",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateBloqueio = async (id: string, updates: Partial<BloqueioAcademico>) => {
    try {
      const { data, error } = await supabase
        .from('bloqueios_academicos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bloqueio acadêmico atualizado com sucesso!",
      });

      await fetchBloqueios();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar bloqueio:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar bloqueio acadêmico",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteBloqueio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bloqueios_academicos')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Bloqueio acadêmico removido com sucesso!",
      });

      await fetchBloqueios();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover bloqueio:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover bloqueio acadêmico",
        variant: "destructive",
      });
      return { error };
    }
  };

  const verificarConflitos = async (
    professorResponsavel: string,
    diasSemana: string[],
    horarioInicio: string,
    horarioFim: string,
    dataInicio: string,
    dataFim: string,
    turmaId?: string
  ): Promise<ConfliteTurma[]> => {
    try {
      const { data, error } = await supabase.rpc('verificar_conflitos_turma', {
        p_professor_responsavel: professorResponsavel,
        p_dias_semana: diasSemana,
        p_horario_inicio: horarioInicio,
        p_horario_fim: horarioFim,
        p_data_inicio: dataInicio,
        p_data_fim: dataFim,
        p_turma_id: turmaId || null
      });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Erro ao verificar conflitos:', error);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchBloqueios();
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    bloqueios,
    loading,
    createBloqueio,
    updateBloqueio,
    deleteBloqueio,
    verificarConflitos,
    fetchBloqueios
  };
};