import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CursoEnsino {
  id: string;
  nome: string;
  descricao?: string;
  categoria: string;
  nivel: string;
  pre_requisitos?: string[];
  material_didatico: any;
  carga_horaria?: number;
  emite_certificado: boolean;
  publico_alvo?: string[];
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TurmaEnsino {
  id: string;
  curso_id: string;
  nome_turma: string;
  professor_responsavel: string;
  data_inicio: string;
  data_fim?: string;
  dias_semana: string[];
  horario_inicio: string;
  horario_fim: string;
  local_tipo: string;
  local_endereco?: string;
  link_online?: string;
  capacidade_maxima: number;
  lista_espera: boolean;
  observacoes?: string;
  status: string;
  created_at: string;
  updated_at: string;
  curso?: CursoEnsino;
}

export interface MatriculaEnsino {
  id: string;
  pessoa_id: string;
  turma_id: string;
  data_matricula: string;
  status: string;
  nota_final?: number;
  frequencia_percentual: number;
  certificado_emitido: boolean;
  certificado_url?: string;
  data_conclusao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  pessoa?: any;
  turma?: TurmaEnsino;
}

export interface PresencaAula {
  id: string;
  matricula_id: string;
  data_aula: string;
  presente: boolean;
  justificativa?: string;
  created_at: string;
}

export interface AvaliacaoEnsino {
  id: string;
  matricula_id: string;
  tipo_avaliacao: string;
  nota?: number;
  data_avaliacao: string;
  observacoes?: string;
  created_at: string;
}

export interface TrilhaFormacao {
  id: string;
  nome: string;
  descricao?: string;
  etapas?: any;
  publico_alvo?: string[];
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProgressoTrilha {
  id: string;
  pessoa_id: string;
  trilha_id: string;
  etapa_atual: number;
  data_inicio: string;
  data_conclusao?: string;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  pessoa?: any;
  trilha?: TrilhaFormacao;
}

export interface EstatisticasEnsino {
  total_cursos: number;
  total_turmas_ativas: number;
  total_alunos_matriculados: number;
  total_alunos_concluidos: number;
  taxa_conclusao: number;
  alunos_por_status: Record<string, number>;
  cursos_por_categoria: Record<string, number>;
}

export const useEnsinoCompleto = () => {
  const [cursos, setCursos] = useState<CursoEnsino[]>([]);
  const [turmas, setTurmas] = useState<TurmaEnsino[]>([]);
  const [matriculas, setMatriculas] = useState<MatriculaEnsino[]>([]);
  const [trilhas, setTrilhas] = useState<TrilhaFormacao[]>([]);
  const [progressos, setProgressos] = useState<ProgressoTrilha[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasEnsino | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // ===== CURSOS =====
  const fetchCursos = async () => {
    try {
      const { data, error } = await supabase
        .from('cursos_ensino')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCursos(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar cursos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cursos",
        variant: "destructive",
      });
    }
  };

  const createCurso = async (curso: Omit<CursoEnsino, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('cursos_ensino')
        .insert([curso])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Curso criado com sucesso!",
      });

      await fetchCursos();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar curso:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar curso",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateCurso = async (id: string, updates: Partial<CursoEnsino>) => {
    try {
      const { data, error } = await supabase
        .from('cursos_ensino')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Curso atualizado com sucesso!",
      });

      await fetchCursos();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar curso:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar curso",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteCurso = async (id: string) => {
    try {
      const { error } = await supabase
        .from('cursos_ensino')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Curso removido com sucesso!",
      });

      await fetchCursos();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover curso:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover curso",
        variant: "destructive",
      });
      return { error };
    }
  };

  // ===== TURMAS =====
  const fetchTurmas = async () => {
    try {
      const { data, error } = await supabase
        .from('turmas_ensino')
        .select(`
          *,
          curso:cursos_ensino(*)
        `)
        .order('data_inicio', { ascending: false });

      if (error) throw error;
      setTurmas(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar turmas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar turmas",
        variant: "destructive",
      });
    }
  };

  const createTurma = async (turma: Omit<TurmaEnsino, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('turmas_ensino')
        .insert([turma])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Turma criada com sucesso!",
      });

      await fetchTurmas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar turma:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar turma",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateTurma = async (id: string, updates: Partial<TurmaEnsino>) => {
    try {
      const { data, error } = await supabase
        .from('turmas_ensino')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Turma atualizada com sucesso!",
      });

      await fetchTurmas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar turma:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar turma",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const deleteTurma = async (id: string) => {
    try {
      const { error } = await supabase
        .from('turmas_ensino')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Turma removida com sucesso!",
      });

      await fetchTurmas();
      return { error: null };
    } catch (error: any) {
      console.error('Erro ao remover turma:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover turma",
        variant: "destructive",
      });
      return { error };
    }
  };

  // ===== MATRÍCULAS =====
  const fetchMatriculas = async () => {
    try {
      const { data, error } = await supabase
        .from('matriculas_ensino')
        .select(`
          *,
          pessoa:pessoas(*),
          turma:turmas_ensino(*, curso:cursos_ensino(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMatriculas(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar matrículas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar matrículas",
        variant: "destructive",
      });
    }
  };

  const createMatricula = async (matricula: Omit<MatriculaEnsino, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('matriculas_ensino')
        .insert([matricula])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Matrícula realizada com sucesso!",
      });

      await fetchMatriculas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar matrícula:', error);
      toast({
        title: "Erro",
        description: "Erro ao realizar matrícula",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  const updateMatricula = async (id: string, updates: Partial<MatriculaEnsino>) => {
    try {
      const { data, error } = await supabase
        .from('matriculas_ensino')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Matrícula atualizada com sucesso!",
      });

      await fetchMatriculas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao atualizar matrícula:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar matrícula",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // ===== TRILHAS =====
  const fetchTrilhas = async () => {
    try {
      const { data, error } = await supabase
        .from('trilhas_formacao')
        .select('*')
        .order('nome');

      if (error) throw error;
      setTrilhas(data || []);
    } catch (error: any) {
      console.error('Erro ao buscar trilhas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar trilhas",
        variant: "destructive",
      });
    }
  };

  const createTrilha = async (trilha: Omit<TrilhaFormacao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('trilhas_formacao')
        .insert([trilha])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Trilha criada com sucesso!",
      });

      await fetchTrilhas();
      return { data, error: null };
    } catch (error: any) {
      console.error('Erro ao criar trilha:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar trilha",
        variant: "destructive",
      });
      return { data: null, error };
    }
  };

  // ===== ESTATÍSTICAS =====
  const fetchEstatisticas = async () => {
    try {
      const { data, error } = await supabase.rpc('obter_estatisticas_ensino');

      if (error) throw error;
      
      if (data && data.length > 0) {
        const stats = data[0];
        setEstatisticas({
          total_cursos: Number(stats.total_cursos),
          total_turmas_ativas: Number(stats.total_turmas_ativas),
          total_alunos_matriculados: Number(stats.total_alunos_matriculados),
          total_alunos_concluidos: Number(stats.total_alunos_concluidos),
          taxa_conclusao: Number(stats.taxa_conclusao),
          alunos_por_status: (stats.alunos_por_status as Record<string, number>) || {},
          cursos_por_categoria: (stats.cursos_por_categoria as Record<string, number>) || {},
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchCursos(),
        fetchTurmas(),
        fetchMatriculas(),
        fetchTrilhas(),
        fetchEstatisticas(),
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    // Estados
    cursos,
    turmas,
    matriculas,
    trilhas,
    progressos,
    estatisticas,
    loading,
    
    // Métodos de Cursos
    createCurso,
    updateCurso,
    deleteCurso,
    fetchCursos,
    
    // Métodos de Turmas
    createTurma,
    updateTurma,
    deleteTurma,
    fetchTurmas,
    
    // Métodos de Matrículas
    createMatricula,
    updateMatricula,
    fetchMatriculas,
    
    // Métodos de Trilhas
    createTrilha,
    fetchTrilhas,
    
    // Estatísticas
    fetchEstatisticas,
  };
};