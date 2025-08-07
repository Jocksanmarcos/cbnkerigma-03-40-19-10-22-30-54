import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RelatorioMensal {
  mes: string;
  ano: number;
  total_dizimos: number;
  total_ofertas: number;
  total_missoes: number;
  total_obras: number;
  total_geral: number;
  quantidade_contribuicoes: number;
}

export interface ContribuicaoPorTipo {
  tipo: string;
  total: number;
  quantidade: number;
  percentual: number;
}

export interface EstatisticasFinanceiras {
  totalArrecadado: number;
  totalContribuicoes: number;
  mediaMensal: number;
  crescimentoMensal: number;
  distribuicaoPorTipo: ContribuicaoPorTipo[];
  relatóriosMensais: RelatorioMensal[];
}

export const useRelatoriosFinanceiros = () => {
  const [estatisticas, setEstatisticas] = useState<EstatisticasFinanceiras | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRelatorios = async (anoSelecionado?: number) => {
    setIsLoading(true);
    try {
      const ano = anoSelecionado || new Date().getFullYear();
      
      // Buscar contribuições confirmadas do ano
      const { data: contribuicoes, error } = await supabase
        .from('contribuicoes')
        .select(`
          *,
          campanhas_arrecadacao(titulo, tipo)
        `)
        .eq('status', 'confirmado')
        .gte('created_at', `${ano}-01-01`)
        .lt('created_at', `${ano + 1}-01-01`);

      if (error) throw error;

      // Processar dados para relatórios
      const dadosProcessados = processarDadosFinanceiros(contribuicoes || []);
      setEstatisticas(dadosProcessados);

    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
      toast({
        title: "Erro ao carregar relatórios",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processarDadosFinanceiros = (contribuicoes: any[]): EstatisticasFinanceiras => {
    const totalArrecadado = contribuicoes.reduce((total, c) => total + Number(c.valor), 0);
    const totalContribuicoes = contribuicoes.length;

    // Agrupar por tipo
    const porTipo: Record<string, { total: number; quantidade: number }> = {};
    
    contribuicoes.forEach(c => {
      const tipo = c.tipo;
      if (!porTipo[tipo]) {
        porTipo[tipo] = { total: 0, quantidade: 0 };
      }
      porTipo[tipo].total += Number(c.valor);
      porTipo[tipo].quantidade += 1;
    });

    const distribuicaoPorTipo: ContribuicaoPorTipo[] = Object.entries(porTipo).map(([tipo, dados]) => ({
      tipo,
      total: dados.total,
      quantidade: dados.quantidade,
      percentual: totalArrecadado > 0 ? (dados.total / totalArrecadado) * 100 : 0
    }));

    // Agrupar por mês
    const porMes: Record<string, RelatorioMensal> = {};
    
    contribuicoes.forEach(c => {
      const data = new Date(c.created_at);
      const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      if (!porMes[chave]) {
        porMes[chave] = {
          mes: data.toLocaleDateString('pt-BR', { month: 'long' }),
          ano: data.getFullYear(),
          total_dizimos: 0,
          total_ofertas: 0,
          total_missoes: 0,
          total_obras: 0,
          total_geral: 0,
          quantidade_contribuicoes: 0
        };
      }

      const valor = Number(c.valor);
      const tipoKey = `total_${c.tipo}` as keyof RelatorioMensal;
      if (typeof porMes[chave][tipoKey] === 'number') {
        (porMes[chave] as any)[tipoKey] += valor;
      }
      porMes[chave].total_geral += valor;
      porMes[chave].quantidade_contribuicoes += 1;
    });

    const relatóriosMensais = Object.values(porMes).sort((a, b) => {
      const dataA = new Date(`${a.ano}-${a.mes.padStart(2, '0')}-01`);
      const dataB = new Date(`${b.ano}-${b.mes.padStart(2, '0')}-01`);
      return dataA.getTime() - dataB.getTime();
    });

    // Calcular média mensal e crescimento
    const mediaMensal = totalArrecadado / Math.max(relatóriosMensais.length, 1);
    const crescimentoMensal = relatóriosMensais.length >= 2 
      ? ((relatóriosMensais[relatóriosMensais.length - 1].total_geral - relatóriosMensais[relatóriosMensais.length - 2].total_geral) / Math.max(relatóriosMensais[relatóriosMensais.length - 2].total_geral, 1)) * 100
      : 0;

    return {
      totalArrecadado,
      totalContribuicoes,
      mediaMensal,
      crescimentoMensal,
      distribuicaoPorTipo,
      relatóriosMensais
    };
  };

  const exportarRelatorio = async (formato: 'pdf' | 'excel') => {
    // Implementar exportação de relatórios
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `Exportação em ${formato.toUpperCase()} será implementada em breve.`,
    });
  };

  useEffect(() => {
    fetchRelatorios();
  }, []);

  return {
    estatisticas,
    isLoading,
    fetchRelatorios,
    exportarRelatorio
  };
};