import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RelatoriosData {
  totalPorCategoria: Record<string, number>;
  crescimentoMensal: Array<{ mes: string; total: number; crescimento: number }>;
  batizadosNoPeriodo: number;
  discipuladoConcluido: number;
  pessoasSemCelula: number;
  pessoasSemDiscipulado: number;
  distribuicaoIdade: Record<string, number>;
  estatusEspiritual: Record<string, number>;
}

export const useRelatoriosPessoas = (dataInicio?: string, dataFim?: string) => {
  const [dados, setDados] = useState<RelatoriosData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const gerarRelatorios = async () => {
    try {
      setLoading(true);
      
      // Total por categoria
      const { data: categorias } = await supabase
        .from('pessoas')
        .select('tipo_pessoa, situacao')
        .eq('situacao', 'ativo');

      const totalPorCategoria = categorias?.reduce((acc, pessoa) => {
        acc[pessoa.tipo_pessoa] = (acc[pessoa.tipo_pessoa] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      // Crescimento mensal (últimos 12 meses)
      const crescimentoMensal = [];
      for (let i = 11; i >= 0; i--) {
        const data = new Date();
        data.setMonth(data.getMonth() - i);
        const mesAno = data.toISOString().slice(0, 7);
        
        const { data: crescimento } = await supabase
          .from('pessoas')
          .select('created_at')
          .gte('created_at', `${mesAno}-01`)
          .lt('created_at', `${mesAno}-32`)
          .eq('situacao', 'ativo');

        // Total até o final do mês
        const { data: totalAteData } = await supabase
          .from('pessoas')
          .select('created_at')
          .lte('created_at', `${mesAno}-31`)
          .eq('situacao', 'ativo');

        const crescimentoMes = crescimento?.length || 0;
        const totalMes = totalAteData?.length || 0;
        
        crescimentoMensal.push({
          mes: data.toLocaleString('pt-BR', { month: 'short', year: 'numeric' }),
          total: totalMes,
          crescimento: crescimentoMes
        });
      }

      // Batizados no período
      let batizadosQuery = supabase
        .from('pessoas')
        .select('data_batismo')
        .not('data_batismo', 'is', null)
        .eq('situacao', 'ativo');

      if (dataInicio) {
        batizadosQuery = batizadosQuery.gte('data_batismo', dataInicio);
      }
      if (dataFim) {
        batizadosQuery = batizadosQuery.lte('data_batismo', dataFim);
      }

      const { data: batizados } = await batizadosQuery;
      const batizadosNoPeriodo = batizados?.length || 0;

      // Discipulado concluído
      const { data: discipulado } = await supabase
        .from('pessoas')
        .select('status_discipulado')
        .eq('status_discipulado', 'concluido')
        .eq('situacao', 'ativo');

      const discipuladoConcluido = discipulado?.length || 0;

      // Pessoas sem célula
      const { data: semCelula } = await supabase
        .from('pessoas')
        .select('celula_id')
        .is('celula_id', null)
        .eq('situacao', 'ativo');

      const pessoasSemCelula = semCelula?.length || 0;

      // Pessoas sem discipulado
      const { data: semDiscipulado } = await supabase
        .from('pessoas')
        .select('status_discipulado')
        .eq('status_discipulado', 'nao_iniciado')
        .eq('situacao', 'ativo');

      const pessoasSemDiscipulado = semDiscipulado?.length || 0;

      // Distribuição por idade
      const { data: todasPessoas } = await supabase
        .from('pessoas')
        .select('data_nascimento')
        .eq('situacao', 'ativo')
        .not('data_nascimento', 'is', null);

      const distribuicaoIdade = todasPessoas?.reduce((acc, pessoa) => {
        if (pessoa.data_nascimento) {
          const idade = new Date().getFullYear() - new Date(pessoa.data_nascimento).getFullYear();
          let faixa = 'Não informado';
          
          if (idade <= 12) faixa = 'Criança (0-12)';
          else if (idade <= 17) faixa = 'Adolescente (13-17)';
          else if (idade <= 30) faixa = 'Jovem (18-30)';
          else if (idade <= 60) faixa = 'Adulto (31-60)';
          else faixa = 'Idoso (60+)';
          
          acc[faixa] = (acc[faixa] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Status espiritual
      const { data: statusEspiritual } = await supabase
        .from('pessoas')
        .select('estado_espiritual')
        .eq('situacao', 'ativo');

      const estatusEspiritual = statusEspiritual?.reduce((acc, pessoa) => {
        acc[pessoa.estado_espiritual] = (acc[pessoa.estado_espiritual] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      setDados({
        totalPorCategoria,
        crescimentoMensal,
        batizadosNoPeriodo,
        discipuladoConcluido,
        pessoasSemCelula,
        pessoasSemDiscipulado,
        distribuicaoIdade,
        estatusEspiritual
      });

    } catch (error: any) {
      console.error('Erro ao gerar relatórios:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatórios de pessoas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    gerarRelatorios();
  }, [dataInicio, dataFim]);

  return {
    dados,
    loading,
    gerarRelatorios
  };
};