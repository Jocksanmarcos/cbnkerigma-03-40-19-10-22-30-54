import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CategoriaFinanceira {
  id: string;
  nome: string;
  tipo: 'entrada' | 'saida';
  descricao?: string;
  cor: string;
  orcamento_mensal: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubcategoriaFinanceira {
  id: string;
  categoria_id: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
  categoria?: CategoriaFinanceira;
}

export interface ContaFinanceira {
  id: string;
  nome: string;
  tipo: 'banco' | 'caixa' | 'pix' | 'outros';
  banco?: string;
  agencia?: string;
  conta?: string;
  saldo_atual: number;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface LancamentoFinanceiro {
  id: string;
  tipo: 'entrada' | 'saida';
  descricao: string;
  valor: number;
  data_lancamento: string;
  forma_pagamento: 'dinheiro' | 'transferencia' | 'cartao' | 'pix' | 'boleto' | 'cheque';
  categoria_id: string;
  subcategoria_id?: string;
  conta_id: string;
  responsavel_id?: string;
  comprovante_url?: string;
  repeticao_mensal: boolean;
  observacoes?: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
  created_at: string;
  updated_at: string;
  categoria?: CategoriaFinanceira;
  subcategoria?: SubcategoriaFinanceira;
  conta?: ContaFinanceira;
}

export interface EstatisticasFinanceiras {
  total_entradas: number;
  total_saidas: number;
  saldo_total: number;
  entradas_mes_atual: number;
  saidas_mes_atual: number;
  saldo_mes_atual: number;
  crescimento_entradas: number;
  crescimento_saidas: number;
  categorias_mais_utilizadas: { categoria: string; total: number; cor: string }[];
  contas_saldos: { conta: string; saldo: number; tipo: string }[];
}

export const useFinanceiro = () => {
  const [categorias, setCategorias] = useState<CategoriaFinanceira[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaFinanceira[]>([]);
  const [contas, setContas] = useState<ContaFinanceira[]>([]);
  const [lancamentos, setLancamentos] = useState<LancamentoFinanceiro[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasFinanceiras | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch Categorias
  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      setCategorias(data as CategoriaFinanceira[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar categorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar categorias financeiras",
        variant: "destructive",
      });
    }
  };

  // Fetch Subcategorias
  const fetchSubcategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategorias_financeiras')
        .select(`
          *,
          categoria:categorias_financeiras(*)
        `)
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      setSubcategorias(data as SubcategoriaFinanceira[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar subcategorias:', error);
    }
  };

  // Fetch Contas
  const fetchContas = async () => {
    try {
      const { data, error } = await supabase
        .from('contas_financeiras')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      setContas(data as ContaFinanceira[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar contas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar contas financeiras",
        variant: "destructive",
      });
    }
  };

  // Fetch Lançamentos
  const fetchLancamentos = async (filtros?: { 
    dataInicio?: string; 
    dataFim?: string; 
    categoria?: string; 
    tipo?: string 
  }) => {
    try {
      let query = supabase
        .from('lancamentos_financeiros')
        .select(`
          *,
          categoria:categorias_financeiras(*),
          subcategoria:subcategorias_financeiras(*),
          conta:contas_financeiras(*)
        `)
        .order('data_lancamento', { ascending: false });

      if (filtros?.dataInicio) {
        query = query.gte('data_lancamento', filtros.dataInicio);
      }
      if (filtros?.dataFim) {
        query = query.lte('data_lancamento', filtros.dataFim);
      }
      if (filtros?.categoria) {
        query = query.eq('categoria_id', filtros.categoria);
      }
      if (filtros?.tipo) {
        query = query.eq('tipo', filtros.tipo);
      }

      const { data, error } = await query;

      if (error) throw error;
      setLancamentos(data as LancamentoFinanceiro[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar lançamentos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar lançamentos financeiros",
        variant: "destructive",
      });
    }
  };

  // Calcular Estatísticas
  const calcularEstatisticas = async () => {
    try {
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const mesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

      // Buscar todos os lançamentos confirmados
      const { data: lancamentos, error } = await supabase
        .from('lancamentos_financeiros')
        .select(`
          *,
          categoria:categorias_financeiras(nome, cor)
        `)
        .eq('status', 'confirmado');

      if (error) throw error;

      const lancamentosConfirmados = lancamentos || [];
      
      // Calcular totais gerais
      const totalEntradas = lancamentosConfirmados
        .filter(l => l.tipo === 'entrada')
        .reduce((sum, l) => sum + Number(l.valor), 0);
      
      const totalSaidas = lancamentosConfirmados
        .filter(l => l.tipo === 'saida')
        .reduce((sum, l) => sum + Number(l.valor), 0);

      // Calcular totais do mês atual
      const lancamentosMesAtual = lancamentosConfirmados
        .filter(l => new Date(l.data_lancamento) >= inicioMes);
      
      const entradasMesAtual = lancamentosMesAtual
        .filter(l => l.tipo === 'entrada')
        .reduce((sum, l) => sum + Number(l.valor), 0);
      
      const saidasMesAtual = lancamentosMesAtual
        .filter(l => l.tipo === 'saida')
        .reduce((sum, l) => sum + Number(l.valor), 0);

      // Calcular totais do mês anterior
      const lancamentosMesAnterior = lancamentosConfirmados
        .filter(l => {
          const data = new Date(l.data_lancamento);
          return data >= mesAnterior && data <= fimMesAnterior;
        });
      
      const entradasMesAnterior = lancamentosMesAnterior
        .filter(l => l.tipo === 'entrada')
        .reduce((sum, l) => sum + Number(l.valor), 0);
      
      const saidasMesAnterior = lancamentosMesAnterior
        .filter(l => l.tipo === 'saida')
        .reduce((sum, l) => sum + Number(l.valor), 0);

      // Calcular crescimento
      const crescimentoEntradas = entradasMesAnterior > 0 
        ? ((entradasMesAtual - entradasMesAnterior) / entradasMesAnterior) * 100 
        : 0;
      
      const crescimentoSaidas = saidasMesAnterior > 0 
        ? ((saidasMesAtual - saidasMesAnterior) / saidasMesAnterior) * 100 
        : 0;

      // Categorias mais utilizadas
      const categoriaStats = lancamentosMesAtual.reduce((acc, l) => {
        const categoria = l.categoria?.nome || 'Sem categoria';
        const cor = l.categoria?.cor || '#6366f1';
        if (!acc[categoria]) {
          acc[categoria] = { total: 0, cor };
        }
        acc[categoria].total += Number(l.valor);
        return acc;
      }, {} as Record<string, { total: number; cor: string }>);

      const categoriasMaisUtilizadas = Object.entries(categoriaStats)
        .map(([categoria, stats]) => ({ categoria, ...stats }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      // Buscar saldos das contas
      const { data: contasData } = await supabase
        .from('contas_financeiras')
        .select('nome, saldo_atual, tipo')
        .eq('ativa', true);

      const contasSaldos = contasData?.map(conta => ({
        conta: conta.nome,
        saldo: Number(conta.saldo_atual),
        tipo: conta.tipo
      })) || [];

      setEstatisticas({
        total_entradas: totalEntradas,
        total_saidas: totalSaidas,
        saldo_total: totalEntradas - totalSaidas,
        entradas_mes_atual: entradasMesAtual,
        saidas_mes_atual: saidasMesAtual,
        saldo_mes_atual: entradasMesAtual - saidasMesAtual,
        crescimento_entradas: crescimentoEntradas,
        crescimento_saidas: crescimentoSaidas,
        categorias_mais_utilizadas: categoriasMaisUtilizadas,
        contas_saldos: contasSaldos
      });

    } catch (error: any) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  };

  // CRUD Operações
  const createLancamento = async (lancamento: Omit<LancamentoFinanceiro, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Obter igreja_id do usuário logado
      const { data: igrejaDados } = await supabase.rpc('get_user_igreja_id');
      
      const { data, error } = await supabase
        .from('lancamentos_financeiros')
        .insert([{
          ...lancamento,
          igreja_id: igrejaDados
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Lançamento criado com sucesso!",
      });

      await fetchLancamentos();
      await fetchContas();
      await calcularEstatisticas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar lançamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar lançamento",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateLancamento = async (id: string, updates: Partial<LancamentoFinanceiro>) => {
    try {
      const { data, error } = await supabase
        .from('lancamentos_financeiros')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Lançamento atualizado com sucesso!",
      });

      await fetchLancamentos();
      await fetchContas();
      await calcularEstatisticas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar lançamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar lançamento",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteLancamento = async (id: string) => {
    try {
      const { error } = await supabase
        .from('lancamentos_financeiros')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Lançamento removido com sucesso!",
      });

      await fetchLancamentos();
      await fetchContas();
      await calcularEstatisticas();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover lançamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover lançamento",
        variant: "destructive",
      });
      return { error };
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCategorias(),
        fetchSubcategorias(),
        fetchContas(),
        fetchLancamentos(),
        calcularEstatisticas()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    categorias,
    subcategorias,
    contas,
    lancamentos,
    estatisticas,
    loading,
    fetchCategorias,
    fetchSubcategorias,
    fetchContas,
    fetchLancamentos,
    calcularEstatisticas,
    createLancamento,
    updateLancamento,
    deleteLancamento,
  };
};