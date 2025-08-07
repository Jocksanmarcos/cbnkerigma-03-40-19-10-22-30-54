import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Pessoa {
  id: string;
  nome_completo: string;
  foto_url?: string;
  sexo?: 'masculino' | 'feminino';
  data_nascimento?: string;
  estado_civil?: 'solteiro' | 'casado' | 'divorciado' | 'viuvo' | 'uniao_estavel';
  cpf?: string;
  rg?: string;
  email?: string;
  telefone_celular?: string;
  telefone_whatsapp?: string;
  telefone_residencial?: string;
  
  // Endereço
  cep?: string;
  endereco_rua?: string;
  endereco_numero?: string;
  endereco_bairro?: string;
  endereco_cidade?: string;
  endereco_uf?: string;
  endereco_complemento?: string;
  
  // Profissional/Educacional
  profissao?: string;
  escolaridade?: 'fundamental_incompleto' | 'fundamental_completo' | 'medio_incompleto' | 'medio_completo' | 'superior_incompleto' | 'superior_completo' | 'pos_graduacao' | 'mestrado' | 'doutorado';
  
  // Redes Sociais
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  
  // Campos Espirituais
  data_primeira_visita?: string;
  estado_espiritual: 'visitante' | 'novo_convertido' | 'batizado' | 'membro_ativo' | 'em_acompanhamento' | 'lider_treinamento' | 'lider' | 'pastor';
  data_conversao?: string;
  data_batismo?: string;
  recebido_por_id?: string;
  discipulador_atual_id?: string;
  status_discipulado: 'nao_iniciado' | 'em_andamento' | 'concluido' | 'pausado';
  cargo_funcao?: string;
  ministerio_atuacao?: string[];
  observacoes_pastorais?: string;
  
  // Novos Campos de Formação e Ensino
  status_formacao?: 'Visitante' | 'Novo convertido' | 'Aluno' | 'Em formação' | 'Líder em treinamento' | 'Líder formado';
  aulas_concluidas?: number;
  ultimo_acesso_portal?: string;
  pontuacao_gamificada?: number;
  medalhas?: string[];
  ranking_na_celula?: number;
  discipulador_id?: string;
  papel_na_celula?: 'Membro' | 'Anfitrião' | 'Auxiliar' | 'Líder' | 'Supervisor' | 'Discipulador';
  celula_atual_id?: string;
  
  // Campos de Integração
  celula_id?: string;
  
  // Classificações
  tipo_pessoa: 'membro' | 'visitante' | 'voluntario' | 'pastor' | 'obreiro' | 'lider';
  situacao: 'ativo' | 'inativo' | 'transferido' | 'desligado';
  
  // Metadados
  created_at: string;
  updated_at: string;
}

export interface HistoricoPessoa {
  id: string;
  pessoa_id: string;
  tipo_evento: 'conversao' | 'batismo' | 'mudanca_celula' | 'mudanca_discipulador' | 'mudanca_cargo' | 'mudanca_status' | 'transferencia' | 'desligamento';
  descricao: string;
  valor_anterior?: string;
  valor_novo?: string;
  usuario_responsavel?: string;
  created_at: string;
}

export interface RelacionamentoFamiliar {
  id: string;
  pessoa_id: string;
  parente_id: string;
  tipo_relacionamento: 'pai' | 'mae' | 'filho' | 'filha' | 'conjuge' | 'irmao' | 'irma' | 'avo' | 'avo_fem' | 'neto' | 'neta' | 'tio' | 'tia' | 'primo' | 'prima';
  created_at: string;
}

export interface Certificado {
  id: string;
  nome: string;
  descricao?: string;
  curso_id?: string;
  template_url?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface PessoaCertificado {
  id: string;
  pessoa_id: string;
  certificado_id: string;
  data_emissao: string;
  url_certificado?: string;
  created_at: string;
  certificado?: Certificado;
}

export interface HistoricoCelulaPessoa {
  id: string;
  pessoa_id: string;
  celula_id: string;
  data_entrada: string;
  data_saida?: string;
  papel?: 'Membro' | 'Anfitrião' | 'Auxiliar' | 'Líder' | 'Supervisor' | 'Discipulador';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface EstatisticasPessoas {
  total_pessoas: number;
  total_membros: number;
  total_visitantes: number;
  total_lideres: number;
  total_batizados: number;
  total_em_discipulado: number;
  crescimento_mes_atual: number;
  pessoas_por_grupo_etario: Record<string, number>;
  pessoas_por_estado_espiritual: Record<string, number>;
}

export const usePessoas = () => {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [estatisticas, setEstatisticas] = useState<EstatisticasPessoas | null>(null);
  const { toast } = useToast();

  const fetchPessoas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pessoas')
        .select('*')
        .order('nome_completo');

      if (error) throw error;
      setPessoas(data as Pessoa[] || []);
    } catch (error: any) {
      console.error('Erro ao buscar pessoas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pessoas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const { data, error } = await supabase
        .rpc('obter_estatisticas_pessoas');

      if (error) throw error;
      
      if (data && data.length > 0) {
        const stats = data[0];
        setEstatisticas({
          total_pessoas: Number(stats.total_pessoas),
          total_membros: Number(stats.total_membros),
          total_visitantes: Number(stats.total_visitantes),
          total_lideres: Number(stats.total_lideres),
          total_batizados: Number(stats.total_batizados),
          total_em_discipulado: Number(stats.total_em_discipulado),
          crescimento_mes_atual: Number(stats.crescimento_mes_atual),
          pessoas_por_grupo_etario: (stats.pessoas_por_grupo_etario as Record<string, number>) || {},
          pessoas_por_estado_espiritual: (stats.pessoas_por_estado_espiritual as Record<string, number>) || {},
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const createPessoa = async (pessoa: Omit<Pessoa, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Obter igreja_id do usuário logado
      const { data: igrejaDados } = await supabase.rpc('get_user_igreja_id');
      
      const { data, error } = await supabase
        .from('pessoas')
        .insert([{
          ...pessoa,
          igreja_id: igrejaDados
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pessoa criada com sucesso!",
      });

      await fetchPessoas();
      await fetchEstatisticas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar pessoa:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar pessoa",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updatePessoa = async (id: string, updates: Partial<Pessoa>) => {
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pessoa atualizada com sucesso!",
      });

      await fetchPessoas();
      await fetchEstatisticas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar pessoa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar pessoa",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deletePessoa = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pessoa removida com sucesso!",
      });

      await fetchPessoas();
      await fetchEstatisticas();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover pessoa:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover pessoa",
        variant: "destructive",
      });
      return { error };
    }
  };

  const fetchHistoricoPessoa = async (pessoaId: string): Promise<HistoricoPessoa[]> => {
    try {
      const { data, error } = await supabase
        .from('historico_pessoas')
        .select('*')
        .eq('pessoa_id', pessoaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data as HistoricoPessoa[]) || [];
    } catch (error: any) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  };

  const calcularGrupoEtario = (dataNascimento: string): string => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    
    if (idade <= 12) return 'crianca';
    if (idade <= 17) return 'adolescente';
    if (idade <= 30) return 'jovem';
    if (idade <= 60) return 'adulto';
    return 'idoso';
  };

  const calcularIdade = (dataNascimento: string): number => {
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mes = hoje.getMonth() - nascimento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
      idade--;
    }
    
    return idade;
  };

  // Funções para relacionamentos familiares
  const fetchRelacionamentosFamiliares = async (pessoaId: string): Promise<RelacionamentoFamiliar[]> => {
    try {
      const { data, error } = await supabase
        .from('relacionamentos_familiares')
        .select(`
          *,
          parente:pessoas(
            id,
            nome_completo,
            data_nascimento,
            sexo
          )
        `)
        .eq('pessoa_id', pessoaId);

      if (error) {
        console.warn('Erro ao buscar relacionamentos familiares:', error);
        return [];
      }
      return (data as any[]) || [];
    } catch (error: any) {
      console.error('Erro ao buscar relacionamentos:', error);
      return [];
    }
  };

  const createRelacionamentoFamiliar = async (relacionamento: Omit<RelacionamentoFamiliar, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('relacionamentos_familiares')
        .insert([relacionamento])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relacionamento familiar criado com sucesso!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar relacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar relacionamento familiar",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteRelacionamentoFamiliar = async (id: string) => {
    try {
      const { error } = await supabase
        .from('relacionamentos_familiares')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relacionamento familiar removido com sucesso!",
      });

      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover relacionamento:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover relacionamento familiar",
        variant: "destructive",
      });
      return { error };
    }
  };

  const buscarPessoasPorNome = async (nome: string): Promise<Pessoa[]> => {
    if (nome.length < 2) return [];
    
    try {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, data_nascimento, sexo, situacao')
        .ilike('nome_completo', `%${nome}%`)
        .eq('situacao', 'ativo')
        .limit(10);

      if (error) throw error;
      return (data as Pessoa[]) || [];
    } catch (error: any) {
      console.error('Erro ao buscar pessoas:', error);
      return [];
    }
  };

  const contarFamilias = async (): Promise<number> => {
    try {
      // Buscar todos os relacionamentos familiares ativos
      const { data: relacionamentos, error } = await supabase
        .from('relacionamentos_familiares')
        .select(`
          pessoa_id,
          parente_id,
          tipo_relacionamento,
          pessoa:pessoas(situacao),
          parente:pessoas(situacao)
        `);

      if (error) {
        console.warn('Erro ao buscar relacionamentos para contagem de famílias:', error);
        return 0;
      }

      // Filtrar apenas relacionamentos onde ambas pessoas estão ativas
      const relacionamentosAtivos = relacionamentos?.filter((rel: any) => 
        rel.pessoa?.situacao === 'ativo' && rel.parente?.situacao === 'ativo'
      ) || [];

      // Criar grupos de famílias baseado nos relacionamentos
      const familias = new Set<string>();
      const pessoasJaAgrupadas = new Set<string>();

      relacionamentosAtivos.forEach((rel: any) => {
        if (!pessoasJaAgrupadas.has(rel.pessoa_id) && !pessoasJaAgrupadas.has(rel.parente_id)) {
          // Criar um identificador único para a família (usar o menor ID como chave)
          const ids = [rel.pessoa_id, rel.parente_id].sort();
          const familiaId = ids.join('-');
          familias.add(familiaId);
          pessoasJaAgrupadas.add(rel.pessoa_id);
          pessoasJaAgrupadas.add(rel.parente_id);
        }
      });

      return familias.size;
    } catch (error: any) {
      console.error('Erro ao contar famílias:', error);
      return 0;
    }
  };

  // Funções para certificados
  const fetchCertificadosPessoa = async (pessoaId: string): Promise<PessoaCertificado[]> => {
    try {
      const { data, error } = await supabase
        .from('pessoas_certificados')
        .select(`
          *,
          certificado:certificados(*)
        `)
        .eq('pessoa_id', pessoaId)
        .order('data_emissao', { ascending: false });

      if (error) throw error;
      return (data as PessoaCertificado[]) || [];
    } catch (error: any) {
      console.error('Erro ao buscar certificados:', error);
      return [];
    }
  };

  const adicionarCertificadoPessoa = async (pessoaId: string, certificadoId: string) => {
    try {
      const { data, error } = await supabase
        .from('pessoas_certificados')
        .insert([{
          pessoa_id: pessoaId,
          certificado_id: certificadoId
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Certificado adicionado com sucesso!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao adicionar certificado:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar certificado",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // Funções para histórico de células
  const fetchHistoricoCelulas = async (pessoaId: string): Promise<HistoricoCelulaPessoa[]> => {
    try {
      const { data, error } = await supabase
        .from('historico_celulas_pessoas')
        .select(`
          *,
          celula:celulas(nome, lider, bairro)
        `)
        .eq('pessoa_id', pessoaId)
        .order('data_entrada', { ascending: false });

      if (error) throw error;
      return (data as HistoricoCelulaPessoa[]) || [];
    } catch (error: any) {
      console.error('Erro ao buscar histórico de células:', error);
      return [];
    }
  };

  const adicionarHistoricoCelula = async (historico: Omit<HistoricoCelulaPessoa, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('historico_celulas_pessoas')
        .insert([historico])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Histórico de célula adicionado com sucesso!",
      });

      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao adicionar histórico de célula:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar histórico de célula",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchPessoas();
    fetchEstatisticas();
  }, []);

  return {
    pessoas,
    loading,
    estatisticas,
    fetchPessoas,
    fetchEstatisticas,
    createPessoa,
    updatePessoa,
    deletePessoa,
    fetchHistoricoPessoa,
    calcularGrupoEtario,
    calcularIdade,
    fetchRelacionamentosFamiliares,
    createRelacionamentoFamiliar,
    deleteRelacionamentoFamiliar,
    buscarPessoasPorNome,
    contarFamilias,
    // Novas funções
    fetchCertificadosPessoa,
    adicionarCertificadoPessoa,
    fetchHistoricoCelulas,
    adicionarHistoricoCelula,
  };
};