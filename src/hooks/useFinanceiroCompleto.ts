import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFinanceiro } from './useFinanceiro';
import type { 
  CategoriaFinanceira, 
  SubcategoriaFinanceira, 
  ContaFinanceira, 
  LancamentoFinanceiro 
} from './useFinanceiro';

interface TransferenciaEntreContas {
  conta_origem_id: string;
  conta_destino_id: string;
  valor: number;
  descricao: string;
  data_transferencia: string;
}

export const useFinanceiroCompleto = () => {
  const baseFinanceiro = useFinanceiro();
  const { toast } = useToast();
  const [uploadingFile, setUploadingFile] = useState(false);

  // CRUD Categorias
  const createCategoria = async (categoria: Omit<CategoriaFinanceira, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .insert([categoria])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });

      await baseFinanceiro.fetchCategorias();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCategoria = async (id: string, updates: Partial<CategoriaFinanceira>) => {
    try {
      const { data, error } = await supabase
        .from('categorias_financeiras')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });

      await baseFinanceiro.fetchCategorias();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCategoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categorias_financeiras')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso!",
      });

      await baseFinanceiro.fetchCategorias();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover categoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover categoria",
        variant: "destructive",
      });
      return { error };
    }
  };

  // CRUD Subcategorias
  const createSubcategoria = async (subcategoria: Omit<SubcategoriaFinanceira, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('subcategorias_financeiras')
        .insert([subcategoria])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subcategoria criada com sucesso!",
      });

      await baseFinanceiro.fetchSubcategorias();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar subcategoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar subcategoria",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteSubcategoria = async (id: string) => {
    try {
      const { error } = await supabase
        .from('subcategorias_financeiras')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subcategoria removida com sucesso!",
      });

      await baseFinanceiro.fetchSubcategorias();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover subcategoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover subcategoria",
        variant: "destructive",
      });
      return { error };
    }
  };

  // CRUD Contas
  const createConta = async (conta: Omit<ContaFinanceira, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('contas_financeiras')
        .insert([conta])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta criada com sucesso!",
      });

      await baseFinanceiro.fetchContas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar conta",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateConta = async (id: string, updates: Partial<ContaFinanceira>) => {
    try {
      const { data, error } = await supabase
        .from('contas_financeiras')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta atualizada com sucesso!",
      });

      await baseFinanceiro.fetchContas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar conta",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteConta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_financeiras')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Conta removida com sucesso!",
      });

      await baseFinanceiro.fetchContas();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover conta",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Upload de Comprovantes
  const uploadComprovante = async (file: File, lancamentoId?: string) => {
    try {
      setUploadingFile(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `comprovantes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes-financeiros')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obter URL pública do arquivo
      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes-financeiros')
        .getPublicUrl(filePath);

      toast({
        title: "Sucesso",
        description: "Comprovante enviado com sucesso!",
      });

      return { data: { url: publicUrl, path: filePath }, error: null };
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar comprovante",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setUploadingFile(false);
    }
  };

  // Transferência entre contas
  const transferirEntreContas = async (transferencia: TransferenciaEntreContas) => {
    try {
      // Criar lançamento de saída na conta origem
      const lancamentoSaida = {
        tipo: 'saida' as const,
        descricao: `Transferência para ${transferencia.conta_destino_id} - ${transferencia.descricao}`,
        valor: transferencia.valor,
        data_lancamento: transferencia.data_transferencia,
        forma_pagamento: 'transferencia' as const,
        categoria_id: '', // Precisamos de uma categoria padrão para transferências
        conta_id: transferencia.conta_origem_id,
        status: 'confirmado' as const,
        repeticao_mensal: false
      };

      // Criar lançamento de entrada na conta destino
      const lancamentoEntrada = {
        tipo: 'entrada' as const,
        descricao: `Transferência de ${transferencia.conta_origem_id} - ${transferencia.descricao}`,
        valor: transferencia.valor,
        data_lancamento: transferencia.data_transferencia,
        forma_pagamento: 'transferencia' as const,
        categoria_id: '', // Precisamos de uma categoria padrão para transferências
        conta_id: transferencia.conta_destino_id,
        status: 'confirmado' as const,
        repeticao_mensal: false
      };

      // Buscar categoria padrão para transferências ou criar uma
      let { data: categoriaTransferencia } = await supabase
        .from('categorias_financeiras')
        .select('id')
        .eq('nome', 'Transferências')
        .eq('tipo', 'entrada')
        .maybeSingle();

      if (!categoriaTransferencia) {
        // Criar categoria padrão para transferências
        const { data: novaCategoria } = await supabase
          .from('categorias_financeiras')
          .insert({
            nome: 'Transferências',
            tipo: 'entrada',
            descricao: 'Categoria padrão para transferências entre contas',
            cor: '#6366f1',
            orcamento_mensal: 0,
            ativa: true
          })
          .select('id')
          .single();
        
        categoriaTransferencia = novaCategoria;
      }

      lancamentoSaida.categoria_id = categoriaTransferencia?.id || '';
      lancamentoEntrada.categoria_id = categoriaTransferencia?.id || '';

      // Obter igreja_id do usuário logado
      const { data: igrejaDados } = await supabase.rpc('get_user_igreja_id');

      // Executar as transações
      const { error: errorSaida } = await supabase
        .from('lancamentos_financeiros')
        .insert([{
          ...lancamentoSaida,
          igreja_id: igrejaDados
        }]);

      if (errorSaida) throw errorSaida;

      const { error: errorEntrada } = await supabase
        .from('lancamentos_financeiros')
        .insert([{
          ...lancamentoEntrada,
          igreja_id: igrejaDados
        }]);

      if (errorEntrada) throw errorEntrada;

      toast({
        title: "Sucesso",
        description: "Transferência realizada com sucesso!",
      });

      // Atualizar dados
      await Promise.all([
        baseFinanceiro.fetchLancamentos(),
        baseFinanceiro.fetchContas(),
        baseFinanceiro.calcularEstatisticas()
      ]);

      return { error: null };
    } catch (error: any) {
      console.error('Erro na transferência:', error);
      toast({
        title: "Erro",
        description: "Erro ao realizar transferência",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Exportar relatórios
  const exportarRelatorio = async (formato: 'pdf' | 'excel' | 'csv', filtros?: any) => {
    try {
      // Buscar dados para exportação
      const { data: lancamentos, error } = await supabase
        .from('lancamentos_financeiros')
        .select(`
          *,
          categoria:categorias_financeiras(nome),
          subcategoria:subcategorias_financeiras(nome),
          conta:contas_financeiras(nome)
        `)
        .order('data_lancamento', { ascending: false });

      if (error) throw error;

      if (formato === 'csv') {
        // Gerar CSV
        const csvData = lancamentos?.map(l => ({
          Data: l.data_lancamento,
          Tipo: l.tipo,
          Descrição: l.descricao,
          Valor: l.valor,
          Categoria: l.categoria?.nome || '',
          Subcategoria: l.subcategoria?.nome || '',
          Conta: l.conta?.nome || '',
          Status: l.status,
          'Forma de Pagamento': l.forma_pagamento
        })) || [];

        const csvContent = [
          Object.keys(csvData[0] || {}).join(';'),
          ...csvData.map(row => Object.values(row).join(';'))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        toast({
          title: "Sucesso",
          description: "Relatório CSV baixado com sucesso!",
        });
      } else {
        toast({
          title: "Info",
          description: `Exportação em ${formato.toUpperCase()} será implementada em breve.`,
        });
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório",
        variant: "destructive",
      });
      return { error };
    }
  };

  return {
    ...baseFinanceiro,
    // CRUD operations
    createCategoria,
    updateCategoria,
    deleteCategoria,
    createSubcategoria,
    deleteSubcategoria,
    createConta,
    updateConta,
    deleteConta,
    // File upload
    uploadComprovante,
    uploadingFile,
    // Transferências
    transferirEntreContas,
    // Exportação
    exportarRelatorio
  };
};