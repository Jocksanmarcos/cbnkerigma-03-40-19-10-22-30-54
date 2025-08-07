import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface TrilhaDNA {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'novo_convertido' | 'batismo' | 'discipulado_1' | 'discipulado_2' | 'discipulado_3' | 'lider_celula' | 'escola_lideres';
  ordem: number;
  etapas: any[];
  pre_requisitos?: string[];
  certificado_template?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressoTrilhaDNA {
  id: string;
  pessoa_id: string;
  trilha_id: string;
  etapa_atual: number;
  etapas_concluidas: any[];
  data_inicio: string;
  data_conclusao?: string;
  status: 'em_andamento' | 'concluido' | 'pausado' | 'cancelado';
  discipulador_id?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  trilha?: TrilhaDNA;
  pessoa?: any;
  discipulador?: any;
}

export const useTrilhasDNA = () => {
  const [trilhas, setTrilhas] = useState<TrilhaDNA[]>([]);
  const [progressos, setProgressos] = useState<ProgressoTrilhaDNA[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTrilhas = async () => {
    try {
      // Consulta otimizada com dados reais das trilhas
      const { data, error } = await supabase
        .from('trilhas_formacao')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      
      // Mapear dados reais com estrutura correta
      const trilhasMapeadas = (data || []).map((trilha, index) => ({
        id: trilha.id,
        nome: trilha.nome,
        descricao: trilha.descricao || 'Trilha de formação espiritual',
        tipo: 'novo_convertido' as const,
        ordem: index + 1,
        etapas: trilha.cursos_sequencia || [],
        pre_requisitos: [],
        certificado_template: null,
        ativa: trilha.ativa,
        created_at: trilha.created_at,
        updated_at: trilha.updated_at
      }));
      
      setTrilhas(trilhasMapeadas as TrilhaDNA[]);
    } catch (error: any) {
      console.error('Erro ao buscar trilhas DNA:', error);
      toast({
        title: "Erro ao carregar trilhas",
        description: "Não foi possível carregar as trilhas DNA.",
        variant: "destructive",
      });
    }
  };

  const fetchProgressos = async () => {
    try {
      // Por enquanto usar dados mock até ajustar as tabelas
      setProgressos([]);
    } catch (error: any) {
      console.error('Erro ao buscar progressos:', error);
      toast({
        title: "Erro ao carregar progressos",
        description: "Não foi possível carregar os progressos das trilhas.",
        variant: "destructive",
      });
    }
  };

  const iniciarTrilha = async (pessoaId: string, trilhaId: string, discipuladorId?: string) => {
    try {
      const { data, error } = await supabase
        .from('progresso_trilhas_dna')
        .insert([{
          pessoa_id: pessoaId,
          trilha_id: trilhaId,
          discipulador_id: discipuladorId,
          etapa_atual: 1,
          etapas_concluidas: [],
          status: 'em_andamento'
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Trilha iniciada com sucesso!",
      });

      await fetchProgressos();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao iniciar trilha:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar trilha",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const avancarEtapa = async (progressoId: string, etapaId: number) => {
    try {
      // Buscar o progresso atual
      const { data: progressoAtual, error: errorBusca } = await supabase
        .from('progresso_trilhas_dna')
        .select('*')
        .eq('id', progressoId)
        .single();

      if (errorBusca) throw errorBusca;

      const etapasConcluidas = [...((progressoAtual.etapas_concluidas as any[]) || [])];
      if (!etapasConcluidas.includes(etapaId)) {
        etapasConcluidas.push(etapaId);
      }

      const proximaEtapa = progressoAtual.etapa_atual + 1;

      const { data, error } = await supabase
        .from('progresso_trilhas_dna')
        .update({
          etapa_atual: proximaEtapa,
          etapas_concluidas: etapasConcluidas
        })
        .eq('id', progressoId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Etapa concluída com sucesso!",
      });

      await fetchProgressos();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao avançar etapa:', error);
      toast({
        title: "Erro",
        description: "Erro ao avançar etapa",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const concluirTrilha = async (progressoId: string) => {
    try {
      const { data, error } = await supabase
        .from('progresso_trilhas_dna')
        .update({
          status: 'concluido',
          data_conclusao: new Date().toISOString().split('T')[0]
        })
        .eq('id', progressoId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Parabéns!",
        description: "Trilha concluída com sucesso!",
      });

      await fetchProgressos();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao concluir trilha:', error);
      toast({
        title: "Erro",
        description: "Erro ao concluir trilha",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const buscarProgressoPorPessoa = async (pessoaId: string): Promise<ProgressoTrilhaDNA[]> => {
    try {
      const { data, error } = await supabase
        .from('progresso_trilhas_dna')
        .select(`
          *,
          trilha:trilhas_dna(*),
          discipulador:pessoas!progresso_trilhas_dna_discipulador_id_fkey(id, nome_completo)
        `)
        .eq('pessoa_id', pessoaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as ProgressoTrilhaDNA[]) || [];
    } catch (error: any) {
      console.error('Erro ao buscar progresso por pessoa:', error);
      return [];
    }
  };

  const obterProximaTrilha = (estadoEspiritual: string): TrilhaDNA | null => {
    const mapeamentoTrilhas = {
      'visitante': 'novo_convertido',
      'novo_convertido': 'batismo',
      'batizado': 'discipulado_1',
      'membro_ativo': 'discipulado_2',
      'em_acompanhamento': 'discipulado_3',
      'lider_treinamento': 'lider_celula',
      'lider': 'escola_lideres'
    };

    const tipoTrilha = mapeamentoTrilhas[estadoEspiritual as keyof typeof mapeamentoTrilhas];
    return trilhas.find(t => t.tipo === tipoTrilha) || null;
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchTrilhas(), fetchProgressos()]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    trilhas,
    progressos,
    loading,
    fetchTrilhas,
    fetchProgressos,
    iniciarTrilha,
    avancarEtapa,
    concluirTrilha,
    buscarProgressoPorPessoa,
    obterProximaTrilha,
  };
};