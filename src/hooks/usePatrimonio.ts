import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CategoriaPatrimonio {
  id: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubcategoriaPatrimonio {
  id: string;
  nome: string;
  descricao?: string;
  categoria_id: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface Patrimonio {
  id: string;
  nome: string;
  codigo_patrimonio?: string;
  descricao?: string;
  categoria_id: string;
  subcategoria_id?: string;
  quantidade: number;
  data_aquisicao?: string;
  valor_unitario?: number;
  valor_total?: number;
  nota_fiscal_url?: string;
  localizacao_atual?: string;
  responsavel_id?: string;
  ministerio_relacionado?: string;
  estado_conservacao: 'novo' | 'bom' | 'usado' | 'danificado' | 'inservivel';
  status: 'em_uso' | 'em_manutencao' | 'emprestado' | 'encostado';
  data_ultima_manutencao?: string;
  data_proxima_manutencao?: string;
  fotos?: any[];
  documentos?: any[];
  link_externo?: string;
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  categoria?: CategoriaPatrimonio;
  subcategoria?: SubcategoriaPatrimonio;
  responsavel?: { nome_completo: string };
}

export interface EmprestimoPatrimonio {
  id: string;
  patrimonio_id: string;
  solicitante_id: string;
  data_retirada: string;
  data_prevista_devolucao: string;
  data_devolucao?: string;
  local_uso?: string;
  situacao_devolucao?: string;
  responsavel_liberacao_id?: string;
  responsavel_devolucao_id?: string;
  observacoes?: string;
  status: 'ativo' | 'devolvido' | 'atrasado';
  termo_pdf_url?: string;
  created_at: string;
  updated_at: string;
  patrimonio?: Patrimonio;
  solicitante?: { nome_completo: string };
  responsavel_liberacao?: { nome_completo: string };
}

export interface ManutencaoPatrimonio {
  id: string;
  patrimonio_id: string;
  data_manutencao: string;
  tipo_manutencao: 'preventiva' | 'corretiva' | 'revisao';
  descricao: string;
  valor_gasto?: number;
  responsavel_id?: string;
  empresa_responsavel?: string;
  comprovante_url?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  patrimonio?: Patrimonio;
  responsavel?: { nome_completo: string };
}

export const usePatrimonio = () => {
  const [categorias, setCategorias] = useState<CategoriaPatrimonio[]>([]);
  const [subcategorias, setSubcategorias] = useState<SubcategoriaPatrimonio[]>([]);
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [emprestimos, setEmprestimos] = useState<EmprestimoPatrimonio[]>([]);
  const [manutencoes, setManutencoes] = useState<ManutencaoPatrimonio[]>([]);
  const [loading, setLoading] = useState(false);
  const [estatisticas, setEstatisticas] = useState({
    total_patrimonios: 0,
    valor_total: 0,
    em_uso: 0,
    em_manutencao: 0,
    emprestados: 0,
    patrimonio_por_categoria: {} as Record<string, number>,
    patrimonio_por_estado: {} as Record<string, number>
  });
  const { toast } = useToast();

  // Fetch Categorias
  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias_patrimonio')
        .select('*')
        .eq('ativa', true)
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
    }
  };

  // Fetch Subcategorias
  const fetchSubcategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('subcategorias_patrimonio')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      setSubcategorias(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar subcategorias:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar subcategorias",
        variant: "destructive",
      });
    }
  };

  // Fetch Patrimônios
  const fetchPatrimonios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patrimonios')
        .select(`
          *,
          categoria:categorias_patrimonio(id, nome),
          subcategoria:subcategorias_patrimonio(id, nome),
          responsavel:pessoas(nome_completo)
        `)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatrimonios(data as Patrimonio[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar patrimônios:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar patrimônios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch Empréstimos
  const fetchEmprestimos = async () => {
    try {
      const { data, error } = await supabase
        .from('emprestimos_patrimonio')
        .select(`
          *,
          patrimonio:patrimonios(nome, codigo_patrimonio),
          solicitante:pessoas!emprestimos_patrimonio_solicitante_id_fkey(nome_completo),
          responsavel_liberacao:pessoas!emprestimos_patrimonio_responsavel_liberacao_id_fkey(nome_completo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmprestimos(data as EmprestimoPatrimonio[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar empréstimos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar empréstimos",
        variant: "destructive",
      });
    }
  };

  // Fetch Manutenções
  const fetchManutencoes = async () => {
    try {
      const { data, error } = await supabase
        .from('manutencoes_patrimonio')
        .select(`
          *,
          patrimonio:patrimonios(nome, codigo_patrimonio),
          responsavel:pessoas(nome_completo)
        `)
        .order('data_manutencao', { ascending: false });

      if (error) throw error;
      setManutencoes(data as ManutencaoPatrimonio[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar manutenções:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar manutenções",
        variant: "destructive",
      });
    }
  };

  // Calcular Estatísticas
  const calcularEstatisticas = async () => {
    try {
      const { data: patrimoniosData } = await supabase
        .from('patrimonios')
        .select(`
          valor_total,
          status,
          estado_conservacao,
          categoria:categorias_patrimonio(nome)
        `)
        .eq('ativo', true);

      if (patrimoniosData) {
        const total_patrimonios = patrimoniosData.length;
        const valor_total = patrimoniosData.reduce((sum, p) => sum + (p.valor_total || 0), 0);
        const em_uso = patrimoniosData.filter(p => p.status === 'em_uso').length;
        const em_manutencao = patrimoniosData.filter(p => p.status === 'em_manutencao').length;
        const emprestados = patrimoniosData.filter(p => p.status === 'emprestado').length;

        const patrimonio_por_categoria = patrimoniosData.reduce((acc, p) => {
          const categoria = p.categoria?.nome || 'Sem categoria';
          acc[categoria] = (acc[categoria] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const patrimonio_por_estado = patrimoniosData.reduce((acc, p) => {
          const estado = p.estado_conservacao;
          acc[estado] = (acc[estado] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setEstatisticas({
          total_patrimonios,
          valor_total,
          em_uso,
          em_manutencao,
          emprestados,
          patrimonio_por_categoria,
          patrimonio_por_estado
        });
      }
    } catch (error: any) {
      console.error('Erro ao calcular estatísticas:', error);
    }
  };

  // CRUD Patrimônio
  const createPatrimonio = async (patrimonio: Omit<Patrimonio, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('patrimonios')
        .insert([patrimonio])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Patrimônio criado com sucesso!",
      });

      await fetchPatrimonios();
      await calcularEstatisticas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar patrimônio:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar patrimônio",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updatePatrimonio = async (id: string, updates: Partial<Patrimonio>) => {
    try {
      const { data, error } = await supabase
        .from('patrimonios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Patrimônio atualizado com sucesso!",
      });

      await fetchPatrimonios();
      await calcularEstatisticas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar patrimônio:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar patrimônio",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deletePatrimonio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('patrimonios')
        .update({ ativo: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Patrimônio removido com sucesso!",
      });

      await fetchPatrimonios();
      await calcularEstatisticas();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover patrimônio:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover patrimônio",
        variant: "destructive",
      });
      return { error };
    }
  };

  // CRUD Empréstimo
  const createEmprestimo = async (emprestimo: Omit<EmprestimoPatrimonio, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('emprestimos_patrimonio')
        .insert([emprestimo])
        .select()
        .single();

      if (error) throw error;

      // Atualizar status do patrimônio para "emprestado"
      await supabase
        .from('patrimonios')
        .update({ status: 'emprestado' })
        .eq('id', emprestimo.patrimonio_id);

      toast({
        title: "Sucesso",
        description: "Empréstimo registrado com sucesso!",
      });

      await fetchEmprestimos();
      await fetchPatrimonios();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar empréstimo:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar empréstimo",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const devolverEmprestimo = async (id: string, data_devolucao: string, situacao_devolucao?: string) => {
    try {
      const { data, error } = await supabase
        .from('emprestimos_patrimonio')
        .update({ 
          status: 'devolvido', 
          data_devolucao,
          situacao_devolucao,
          responsavel_devolucao_id: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Atualizar status do patrimônio de volta para "em_uso"
      await supabase
        .from('patrimonios')
        .update({ status: 'em_uso' })
        .eq('id', data.patrimonio_id);

      toast({
        title: "Sucesso",
        description: "Devolução registrada com sucesso!",
      });

      await fetchEmprestimos();
      await fetchPatrimonios();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao registrar devolução:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar devolução",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // CRUD Manutenção
  const createManutencao = async (manutencao: Omit<ManutencaoPatrimonio, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('manutencoes_patrimonio')
        .insert([manutencao])
        .select()
        .single();

      if (error) throw error;

      // Atualizar data da última manutenção do patrimônio
      await supabase
        .from('patrimonios')
        .update({ 
          data_ultima_manutencao: manutencao.data_manutencao,
          status: manutencao.tipo_manutencao === 'corretiva' ? 'em_manutencao' : 'em_uso'
        })
        .eq('id', manutencao.patrimonio_id);

      toast({
        title: "Sucesso",
        description: "Manutenção registrada com sucesso!",
      });

      await fetchManutencoes();
      await fetchPatrimonios();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar manutenção:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar manutenção",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // Inicializar dados
  useEffect(() => {
    fetchCategorias();
    fetchSubcategorias();
    fetchPatrimonios();
    fetchEmprestimos();
    fetchManutencoes();
  }, []);

  useEffect(() => {
    if (patrimonios.length > 0) {
      calcularEstatisticas();
    }
  }, [patrimonios]);

  return {
    // Estados
    categorias,
    subcategorias,
    patrimonios,
    emprestimos,
    manutencoes,
    loading,
    estatisticas,
    
    // Funções de fetch
    fetchCategorias,
    fetchSubcategorias,
    fetchPatrimonios,
    fetchEmprestimos,
    fetchManutencoes,
    calcularEstatisticas,
    
    // CRUD Patrimônio
    createPatrimonio,
    updatePatrimonio,
    deletePatrimonio,
    
    // CRUD Empréstimo
    createEmprestimo,
    devolverEmprestimo,
    
    // CRUD Manutenção
    createManutencao
  };
};