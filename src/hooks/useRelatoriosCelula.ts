import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RelatoriosCelula {
  id: string;
  celula_id: string;
  data_reuniao: string;
  tipo_reuniao: 'semanal' | 'especial' | 'multiplicacao';
  presentes: number;
  visitantes: number;
  criancas: number;
  decisoes: number;
  ofertas: number;
  estudo_aplicado?: string;
  atividades_realizadas?: string[];
  proximos_passos?: string;
  observacoes?: string;
  relator_id?: string;
  created_at: string;
  updated_at: string;
  celula?: any;
  relator?: any;
}

export interface PresencaCelula {
  id: string;
  relatorio_id: string;
  pessoa_id: string;
  presente: boolean;
  tipo_participacao: 'membro' | 'visitante' | 'crianca';
  observacoes?: string;
  created_at: string;
  pessoa?: any;
}

export const useRelatoriosCelula = () => {
  const [relatorios, setRelatorios] = useState<RelatoriosCelula[]>([]);
  const [presencas, setPresencas] = useState<PresencaCelula[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRelatorios = async () => {
    try {
      const { data, error } = await supabase
        .from('relatorios_celula')
        .select(`
          *,
          celula:celulas(id, nome, lider),
          relator:pessoas!relatorios_celula_relator_id_fkey(id, nome_completo)
        `)
        .order('data_reuniao', { ascending: false });

      if (error) throw error;
      setRelatorios((data as RelatoriosCelula[]) || []);
    } catch (error: any) {
      console.error('Erro ao buscar relatórios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios",
        variant: "destructive",
      });
    }
  };

  const fetchPresencasPorRelatorio = async (relatorioId: string) => {
    try {
      const { data, error } = await supabase
        .from('presencas_celula')
        .select(`
          *,
          pessoa:pessoas(id, nome_completo, tipo_pessoa)
        `)
        .eq('relatorio_id', relatorioId)
        .order('tipo_participacao');

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar presenças:', error);
      return [];
    }
  };

  const createRelatorio = async (relatorio: Omit<RelatoriosCelula, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('relatorios_celula')
        .insert([relatorio])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relatório criado com sucesso!",
      });

      await fetchRelatorios();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar relatório",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateRelatorio = async (id: string, updates: Partial<RelatoriosCelula>) => {
    try {
      const { data, error } = await supabase
        .from('relatorios_celula')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relatório atualizado com sucesso!",
      });

      await fetchRelatorios();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar relatório",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const adicionarPresenca = async (presenca: Omit<PresencaCelula, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('presencas_celula')
        .insert([presenca])
        .select()
        .single();

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao adicionar presença:', error);
      return { data: null, error };
    }
  };

  const adicionarPresencasLote = async (presencas: Omit<PresencaCelula, 'id' | 'created_at'>[]) => {
    try {
      const { data, error } = await supabase
        .from('presencas_celula')
        .insert(presencas)
        .select();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Presenças registradas com sucesso!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao adicionar presenças:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar presenças",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const obterEstatisticasCelula = async (celulaId: string, dataInicio: string, dataFim: string) => {
    try {
      const { data, error } = await supabase
        .from('relatorios_celula')
        .select('*')
        .eq('celula_id', celulaId)
        .gte('data_reuniao', dataInicio)
        .lte('data_reuniao', dataFim);

      if (error) throw error;

      const relatorios = data || [];
      const totalReunoes = relatorios.length;
      const mediaPresentes = totalReunoes > 0 ? relatorios.reduce((acc, r) => acc + r.presentes, 0) / totalReunoes : 0;
      const totalVisitantes = relatorios.reduce((acc, r) => acc + r.visitantes, 0);
      const totalDecisoes = relatorios.reduce((acc, r) => acc + r.decisoes, 0);
      const totalOfertas = relatorios.reduce((acc, r) => acc + (r.ofertas || 0), 0);

      return {
        totalReunoes,
        mediaPresentes: Math.round(mediaPresentes),
        totalVisitantes,
        totalDecisoes,
        totalOfertas
      };
    } catch (error: any) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        totalReunoes: 0,
        mediaPresentes: 0,
        totalVisitantes: 0,
        totalDecisoes: 0,
        totalOfertas: 0
      };
    }
  };

  const obterIndicadoresSaude = async (celulaId: string) => {
    try {
      // Buscar últimos 3 meses
      const dataInicio = new Date();
      dataInicio.setMonth(dataInicio.getMonth() - 3);
      
      const { data, error } = await supabase
        .from('relatorios_celula')
        .select('*')
        .eq('celula_id', celulaId)
        .gte('data_reuniao', dataInicio.toISOString().split('T')[0])
        .order('data_reuniao', { ascending: false });

      if (error) throw error;

      const relatorios = data || [];
      
      // Calcular indicadores de saúde
      const frequenciaReunoes = relatorios.length / 12 * 100; // % de reuniões realizadas
      const crescimentoNumerico = relatorios.length > 0 ? 
        ((relatorios[0]?.presentes || 0) - (relatorios[relatorios.length - 1]?.presentes || 0)) / 3 : 0;
      const evangelismo = relatorios.reduce((acc, r) => acc + r.visitantes, 0) / 3; // Visitantes por mês
      const decisoes = relatorios.reduce((acc, r) => acc + r.decisoes, 0) / 3; // Decisões por mês

      return {
        frequenciaReunoes: Math.min(100, frequenciaReunoes),
        crescimentoNumerico,
        evangelismo,
        decisoes,
        saude: (frequenciaReunoes + (evangelismo > 0 ? 25 : 0) + (decisoes > 0 ? 25 : 0)) / 3
      };
    } catch (error: any) {
      console.error('Erro ao obter indicadores de saúde:', error);
      return {
        frequenciaReunoes: 0,
        crescimentoNumerico: 0,
        evangelismo: 0,
        decisoes: 0,
        saude: 0
      };
    }
  };

  useEffect(() => {
    fetchRelatorios();
  }, []);

  return {
    relatorios,
    presencas,
    loading,
    fetchRelatorios,
    fetchPresencasPorRelatorio,
    createRelatorio,
    updateRelatorio,
    adicionarPresenca,
    adicionarPresencasLote,
    obterEstatisticasCelula,
    obterIndicadoresSaude,
  };
};