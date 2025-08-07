import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface PerfilAluno {
  id: string;
  nome_completo: string;
  email: string;
  estado_espiritual?: string;
  data_nascimento?: string;
  celula_atual?: string;
  discipulador?: string;
  pontuacao_total: number;
  nivel_atual: string;
  conquistas_total: number;
  cursos_concluidos: number;
  certificados_obtidos: number;
  posicao_ranking?: number;
}

export interface ProgressoTrilha {
  id: string;
  trilha_id: string;
  trilha_nome: string;
  etapa_atual: number;
  total_etapas: number;
  percentual_conclusao: number;
  status: string;
  data_inicio: string;
  data_conclusao?: string;
  proxima_aula?: string;
}

export interface CursoAluno {
  id: string;
  matricula_id: string;
  curso_nome: string;
  turma_nome: string;
  progresso_percentual: number;
  status: string;
  nota_atual?: number;
  frequencia_percentual: number;
  data_inicio: string;
  data_conclusao?: string;
  certificado_url?: string;
  proxima_aula?: {
    data: string;
    titulo: string;
    local: string;
  };
}

export interface ConquistaAluno {
  id: string;
  badge_nome: string;
  badge_descricao: string;
  badge_icon: string;
  badge_cor: string;
  pontos_ganhos: number;
  data_conquista: string;
  categoria: string;
}

export interface RankingItem {
  posicao: number;
  pessoa_id: string;
  nome: string;
  pontos_total: number;
  badges_count: number;
  cursos_concluidos: number;
  é_usuario_atual: boolean;
}

export interface NotificacaoAluno {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'aula' | 'certificado' | 'conquista' | 'geral';
  lida: boolean;
  data_criacao: string;
  acao_url?: string;
}

export interface ProximaEtapa {
  tipo: 'aula' | 'trilha' | 'avaliacao' | 'certificado';
  titulo: string;
  descricao: string;
  data_sugerida?: string;
  prioridade: 'alta' | 'media' | 'baixa';
  acao_url?: string;
}

export const usePortalAluno = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [perfil, setPerfil] = useState<PerfilAluno | null>(null);
  const [trilhas, setTrilhas] = useState<ProgressoTrilha[]>([]);
  const [cursos, setCursos] = useState<CursoAluno[]>([]);
  const [conquistas, setConquistas] = useState<ConquistaAluno[]>([]);
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [notificacoes, setNotificacoes] = useState<NotificacaoAluno[]>([]);
  const [proximasEtapas, setProximasEtapas] = useState<ProximaEtapa[]>([]);
  const [loading, setLoading] = useState(true);

  // Buscar perfil do aluno
  const fetchPerfil = async () => {
    if (!user?.email) return;

    try {
      const { data: pessoa, error } = await supabase
        .from('pessoas')
        .select(`
          id,
          nome_completo,
          email,
          estado_espiritual,
          data_nascimento
        `)
        .eq('email', user.email)
        .maybeSingle();

      if (error) throw error;

      if (pessoa) {
        // Buscar estatísticas de gamificação
        const { data: stats } = await supabase
          .from('conquistas_ensino')
          .select('pontos_ganhos')
          .eq('pessoa_id', pessoa.id);

        const pontuacao_total = stats?.reduce((acc, item) => acc + item.pontos_ganhos, 0) || 0;
        const conquistas_total = stats?.length || 0;

        // Buscar cursos concluídos
        const { data: matriculas } = await supabase
          .from('matriculas_ensino')
          .select('id, status')
          .eq('pessoa_id', pessoa.id);

        const cursos_concluidos = matriculas?.filter(m => m.status === 'concluido').length || 0;

        // Definir nível baseado na pontuação
        let nivel_atual = 'Iniciante';
        if (pontuacao_total >= 1000) nivel_atual = 'Avançado';
        else if (pontuacao_total >= 500) nivel_atual = 'Intermediário';

        setPerfil({
          id: pessoa.id,
          nome_completo: pessoa.nome_completo,
          email: pessoa.email,
          estado_espiritual: pessoa.estado_espiritual,
          data_nascimento: pessoa.data_nascimento,
          pontuacao_total,
          nivel_atual,
          conquistas_total,
          cursos_concluidos,
          certificados_obtidos: cursos_concluidos, // Por simplicidade
        });
      }
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  // Buscar progresso das trilhas DNA
  const fetchTrilhas = async () => {
    if (!perfil?.id) return;

    try {
      const { data, error } = await supabase
        .from('progresso_trilhas_dna')
        .select(`
          id,
          trilha_id,
          etapa_atual,
          etapas_concluidas,
          data_inicio,
          data_conclusao,
          status,
          trilha:trilhas_dna(nome, etapas)
        `)
        .eq('pessoa_id', perfil.id);

      if (error) throw error;

      const trilhasFormatadas = data?.map(item => ({
        id: item.id,
        trilha_id: item.trilha_id,
        trilha_nome: item.trilha?.nome || 'Trilha',
        etapa_atual: item.etapa_atual,
        total_etapas: Array.isArray(item.trilha?.etapas) ? item.trilha.etapas.length : 5,
        percentual_conclusao: Math.round((item.etapa_atual / (Array.isArray(item.trilha?.etapas) ? item.trilha.etapas.length : 5)) * 100),
        status: item.status,
        data_inicio: item.data_inicio,
        data_conclusao: item.data_conclusao,
        proxima_aula: 'Próxima etapa da trilha'
      })) || [];

      setTrilhas(trilhasFormatadas);
    } catch (error: any) {
      console.error('Erro ao buscar trilhas:', error);
    }
  };

  // Buscar cursos do aluno
  const fetchCursos = async () => {
    if (!perfil?.id) return;

    try {
      const { data, error } = await supabase
        .from('matriculas_ensino')
        .select(`
          id,
          status,
          nota_final,
          frequencia_percentual,
          data_matricula,
          data_conclusao,
          certificado_url,
          turma:turmas_ensino(
            nome_turma,
            data_inicio,
            curso:cursos_ensino(nome)
          )
        `)
        .eq('pessoa_id', perfil.id);

      if (error) throw error;

      const cursosFormatados = data?.map(matricula => ({
        id: matricula.id,
        matricula_id: matricula.id,
        curso_nome: matricula.turma?.curso?.nome || 'Curso',
        turma_nome: matricula.turma?.nome_turma || 'Turma',
        progresso_percentual: matricula.status === 'concluido' ? 100 : 
                             matricula.status === 'cursando' ? 60 : 30,
        status: matricula.status,
        nota_atual: matricula.nota_final,
        frequencia_percentual: matricula.frequencia_percentual,
        data_inicio: matricula.data_matricula,
        data_conclusao: matricula.data_conclusao,
        certificado_url: matricula.certificado_url,
      })) || [];

      setCursos(cursosFormatados);
    } catch (error: any) {
      console.error('Erro ao buscar cursos:', error);
    }
  };

  // Buscar conquistas do aluno
  const fetchConquistas = async () => {
    if (!perfil?.id) return;

    try {
      const { data, error } = await supabase
        .from('conquistas_ensino')
        .select(`
          id,
          pontos_ganhos,
          data_conquista,
          badge:badges_ensino(
            nome,
            descricao,
            icon,
            cor
          )
        `)
        .eq('pessoa_id', perfil.id)
        .order('data_conquista', { ascending: false });

      if (error) throw error;

      const conquistasFormatadas = data?.map(conquista => ({
        id: conquista.id,
        badge_nome: conquista.badge?.nome || 'Badge',
        badge_descricao: conquista.badge?.descricao || '',
        badge_icon: conquista.badge?.icon || '🏆',
        badge_cor: conquista.badge?.cor || '#6366f1',
        pontos_ganhos: conquista.pontos_ganhos,
        data_conquista: conquista.data_conquista,
        categoria: 'ensino'
      })) || [];

      setConquistas(conquistasFormatadas);
    } catch (error: any) {
      console.error('Erro ao buscar conquistas:', error);
    }
  };

  // Buscar notificações do aluno
  const fetchNotificacoes = async () => {
    if (!perfil?.id) return;

    try {
      // Como a tabela notificacoes pode ter estrutura diferente, 
      // vamos usar a tabela de alertas_ia temporariamente
      const { data, error } = await supabase
        .from('alertas_ia')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const notificacoesFormatadas = data?.map(alert => ({
        id: alert.id,
        titulo: alert.titulo,
        mensagem: alert.descricao,
        tipo: 'geral' as 'aula' | 'certificado' | 'conquista' | 'geral',
        lida: alert.resolvido,
        data_criacao: alert.created_at,
        acao_url: undefined,
      })) || [];

      setNotificacoes(notificacoesFormatadas);
    } catch (error: any) {
      console.error('Erro ao buscar notificações:', error);
    }
  };

  // Buscar ranking
  const fetchRanking = async () => {
    try {
      const { data, error } = await supabase.rpc('obter_ranking_ensino');

      if (error) throw error;

      const rankingFormatado = data?.map((item, index) => ({
        posicao: index + 1,
        pessoa_id: item.pessoa_id,
        nome: item.nome,
        pontos_total: item.total_pontos,
        badges_count: item.badges_count,
        cursos_concluidos: item.cursos_concluidos,
        é_usuario_atual: item.pessoa_id === perfil?.id
      })) || [];

      setRanking(rankingFormatado);

      // Atualizar posição no perfil
      if (perfil) {
        const posicaoUsuario = rankingFormatado.find(r => r.é_usuario_atual)?.posicao;
        setPerfil(prev => prev ? { ...prev, posicao_ranking: posicaoUsuario } : null);
      }
    } catch (error: any) {
      console.error('Erro ao buscar ranking:', error);
    }
  };

  // Gerar próximas etapas sugeridas
  const gerarProximasEtapas = () => {
    const etapas: ProximaEtapa[] = [];

    // Verificar trilhas em andamento
    trilhas.forEach(trilha => {
      if (trilha.status === 'em_andamento' && trilha.percentual_conclusao < 100) {
        etapas.push({
          tipo: 'trilha',
          titulo: `Continuar ${trilha.trilha_nome}`,
          descricao: `Você está na etapa ${trilha.etapa_atual} de ${trilha.total_etapas}`,
          prioridade: 'alta',
        });
      }
    });

    // Verificar cursos em andamento
    cursos.forEach(curso => {
      if (curso.status === 'cursando') {
        etapas.push({
          tipo: 'aula',
          titulo: `Continuar ${curso.curso_nome}`,
          descricao: `Progresso atual: ${curso.progresso_percentual}%`,
          prioridade: 'media',
        });
      }
    });

    // Sugerir novos cursos se não há nenhum em andamento
    if (cursos.filter(c => c.status === 'cursando').length === 0) {
      etapas.push({
        tipo: 'aula',
        titulo: 'Iniciar novo curso',
        descricao: 'Explore nossos cursos disponíveis e continue sua jornada de aprendizado',
        prioridade: 'media',
        acao_url: '/ensino'
      });
    }

    setProximasEtapas(etapas.slice(0, 3)); // Máximo 3 sugestões
  };

  // Marcar notificação como lida (usando alertas_ia)
  const marcarNotificacaoLida = async (notificacaoId: string) => {
    try {
      const { error } = await supabase
        .from('alertas_ia')
        .update({ resolvido: true })
        .eq('id', notificacaoId);

      if (error) throw error;

      setNotificacoes(prev => 
        prev.map(n => n.id === notificacaoId ? { ...n, lida: true } : n)
      );
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao marcar notificação como lida",
        variant: "destructive",
      });
    }
  };

  // Marcar todas as notificações como lidas (usando alertas_ia)
  const marcarTodasLidas = async () => {
    try {
      const { error } = await supabase
        .from('alertas_ia')
        .update({ resolvido: true })
        .eq('resolvido', false);

      if (error) throw error;

      setNotificacoes(prev => 
        prev.map(n => ({ ...n, lida: true }))
      );

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao marcar notificações como lidas",
        variant: "destructive",
      });
    }
  };

  // Carregar todos os dados
  const loadData = async () => {
    setLoading(true);
    try {
      await fetchPerfil();
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados dependentes após perfil estar disponível
  const loadDependentData = async () => {
    if (perfil?.id) {
      try {
        await Promise.all([
          fetchTrilhas(),
          fetchCursos(),
          fetchConquistas(),
          fetchRanking(),
          fetchNotificacoes(),
        ]);
        gerarProximasEtapas();
      } catch (error) {
        console.error('Erro ao carregar dados dependentes:', error);
      }
    }
  };

  // Efeitos
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  useEffect(() => {
    if (perfil?.id) {
      loadDependentData();
    }
  }, [perfil?.id]);

  useEffect(() => {
    gerarProximasEtapas();
  }, [trilhas, cursos]);

  // Função para recarregar todos os dados
  const refetchData = async () => {
    await loadData();
    if (perfil?.id) {
      await loadDependentData();
    }
  };

  return {
    perfil,
    trilhas,
    cursos,
    conquistas,
    ranking,
    notificacoes,
    proximasEtapas,
    loading,
    marcarNotificacaoLida,
    marcarTodasLidas,
    refetchData: () => {
      loadData().then(() => {
        if (perfil?.id) {
          loadDependentData();
        }
      });
    },
  };
};