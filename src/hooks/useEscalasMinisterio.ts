import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type TipoEscala = 'voluntarios' | 'pregadores' | 'ministerio_louvor' | 'dancarinos' | 'sonorizacao' | 'multimidia' | 'intercessao' | 'recepcao' | 'criancas' | 'seguranca';
export type StatusParticipacao = 'convocado' | 'confirmado' | 'negado' | 'substituido' | 'presente' | 'faltou';
export type TipoCulto = 'domingo_manha' | 'domingo_noite' | 'quarta_oracao' | 'sexta_jovens' | 'especial' | 'ensaio';

export interface ProgramacaoCulto {
  id: string;
  titulo: string;
  data_culto: string;
  tipo_culto: TipoCulto;
  local: string;
  tema_culto?: string;
  versiculo_base?: string;
  observacoes?: string;
  cor_tema: string;
  igreja_id: string;
  criado_por: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface EscalaMinisterio {
  id: string;
  programacao_culto_id: string;
  tipo_escala: TipoEscala;
  nome: string;
  descricao?: string;
  vagas_necessarias: number;
  vagas_preenchidas: number;
  data_limite_confirmacao?: string;
  instrucoes_especiais?: string;
  materiais_necessarios: any;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  programacao_culto?: ProgramacaoCulto;
}

export interface ParticipanteEscala {
  id: string;
  escala_id: string;
  pessoa_id: string;
  funcao: string;
  status_participacao: StatusParticipacao;
  data_convocacao: string;
  data_confirmacao?: string;
  data_presenca?: string;
  substituido_por?: string;
  observacoes?: string;
  notificado: boolean;
  lembrete_enviado: boolean;
  created_at: string;
  updated_at: string;
  pessoa?: any;
  escala?: EscalaMinisterio & {
    programacao_culto?: ProgramacaoCulto;
  };
}

export interface MusicaLista {
  id: string;
  lista_id: string;
  titulo: string;
  artista?: string;
  tom_original?: string;
  tom_execucao?: string;
  bpm?: number;
  ordem: number;
  tipo: 'louvor' | 'adoracao' | 'entrada' | 'oferta' | 'saida' | 'especial';
  letra?: string;
  cifra?: string;
  link_video?: string;
  link_playback?: string;
  link_partitura?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ListaMusicas {
  id: string;
  programacao_culto_id: string;
  nome: string;
  ordem_execucao: number;
  observacoes?: string;
  musicas?: MusicaLista[];
  created_at?: string;
  updated_at?: string;
}

export interface EnsaioMinisterio {
  id: string;
  programacao_culto_id: string;
  titulo: string;
  data_ensaio: string;
  local: string;
  duracao_estimada: number;
  observacoes?: string;
  lista_musicas_id?: string;
  obrigatorio: boolean;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useEscalasMinisterio = () => {
  const [loading, setLoading] = useState(false);
  const [programacoes, setProgramacoes] = useState<ProgramacaoCulto[]>([]);
  const [escalas, setEscalas] = useState<EscalaMinisterio[]>([]);
  const [minhasEscalas, setMinhasEscalas] = useState<ParticipanteEscala[]>([]);

  // Buscar programações de culto
  const fetchProgramacoes = async (filtros?: { 
    data_inicio?: string; 
    data_fim?: string; 
    tipo_culto?: TipoCulto;
  }) => {
    try {
      setLoading(true);
      let query = supabase
        .from('programacao_cultos')
        .select('*')
        .eq('ativo', true)
        .order('data_culto', { ascending: true });

      if (filtros?.data_inicio) {
        query = query.gte('data_culto', filtros.data_inicio);
      }
      if (filtros?.data_fim) {
        query = query.lte('data_culto', filtros.data_fim);
      }
      if (filtros?.tipo_culto) {
        query = query.eq('tipo_culto', filtros.tipo_culto);
      }

      const { data, error } = await query;

      if (error) throw error;
      setProgramacoes(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar programações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as programações.",
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Criar programação de culto
  const criarProgramacao = async (dados: Omit<ProgramacaoCulto, 'id' | 'created_at' | 'updated_at' | 'criado_por'>) => {
    try {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('programacao_cultos')
        .insert([{
          ...dados,
          criado_por: userData.user.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Programação criada!",
        description: "A programação de culto foi criada com sucesso.",
      });

      await fetchProgramacoes();
      return data;
    } catch (error) {
      console.error('Erro ao criar programação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a programação.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar escalas
  const fetchEscalas = async (programacaoId?: string) => {
    try {
      let query = supabase
        .from('escalas_ministerio')
        .select(`
          *,
          programacao_culto:programacao_cultos(*)
        `)
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (programacaoId) {
        query = query.eq('programacao_culto_id', programacaoId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEscalas(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar escalas:', error);
      return [];
    }
  };

  // Criar escala
  const criarEscala = async (dados: Omit<EscalaMinisterio, 'id' | 'created_at' | 'updated_at' | 'vagas_preenchidas'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('escalas_ministerio')
        .insert([{
          ...dados,
          vagas_preenchidas: 0
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Escala criada!",
        description: "A escala foi criada com sucesso.",
      });

      await fetchEscalas();
      return data;
    } catch (error) {
      console.error('Erro ao criar escala:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a escala.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar minhas escalas (como participante)
  const fetchMinhasEscalas = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return [];

      // Primeiro buscar o ID da pessoa baseado no user_id
      const { data: pessoaData } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (!pessoaData) return [];

      const { data, error } = await supabase
        .from('participantes_escala')
        .select(`
          *,
          escala:escalas_ministerio(
            *,
            programacao_culto:programacao_cultos(*)
          ),
          pessoa:pessoas(nome_completo, telefone, email)
        `)
        .eq('pessoa_id', pessoaData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMinhasEscalas(data || []);
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar minhas escalas:', error);
      return [];
    }
  };

  // Convocar participante para escala
  const convocarParticipante = async (escalaId: string, pessoaId: string, funcao: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('participantes_escala')
        .insert([{
          escala_id: escalaId,
          pessoa_id: pessoaId,
          funcao,
          status_participacao: 'convocado' as StatusParticipacao
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar número de vagas preenchidas
      const { data: escalaAtual } = await supabase
        .from('escalas_ministerio')
        .select('vagas_preenchidas')
        .eq('id', escalaId)
        .single();

      if (escalaAtual) {
        await supabase
          .from('escalas_ministerio')
          .update({
            vagas_preenchidas: escalaAtual.vagas_preenchidas + 1
          })
          .eq('id', escalaId);
      }

      toast({
        title: "Participante convocado!",
        description: "O participante foi adicionado à escala.",
      });

      await fetchEscalas();
      return data;
    } catch (error) {
      console.error('Erro ao convocar participante:', error);
      toast({
        title: "Erro",
        description: "Não foi possível convocar o participante.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Confirmar participação
  const confirmarParticipacao = async (participanteId: string, status: StatusParticipacao, observacoes?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('participantes_escala')
        .update({
          status_participacao: status,
          data_confirmacao: status === 'confirmado' ? new Date().toISOString() : null,
          observacoes
        })
        .eq('id', participanteId)
        .select()
        .single();

      if (error) throw error;

      const statusText = {
        confirmado: 'confirmada',
        negado: 'negada',
        substituido: 'substituída'
      }[status] || 'atualizada';

      toast({
        title: "Participação atualizada!",
        description: `Sua participação foi ${statusText}.`,
      });

      await fetchMinhasEscalas();
      return data;
    } catch (error) {
      console.error('Erro ao confirmar participação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar sua participação.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar participantes de uma escala
  const fetchParticipantesEscala = async (escalaId: string) => {
    try {
      const { data, error } = await supabase
        .from('participantes_escala')
        .select(`
          *,
          pessoa:pessoas(nome_completo, telefone, email)
        `)
        .eq('escala_id', escalaId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar participantes:', error);
      return [];
    }
  };

  // Gerenciar lista de músicas
  const criarListaMusicas = async (programacaoId: string, nome: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listas_musicas')
        .insert([{
          programacao_culto_id: programacaoId,
          nome,
          ordem_execucao: 1
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Lista criada!",
        description: "A lista de músicas foi criada com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a lista de músicas.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Adicionar música à lista
  const adicionarMusica = async (listaId: string, musica: Omit<MusicaLista, 'id' | 'lista_id'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('musicas_lista')
        .insert([{
          ...musica,
          lista_id: listaId
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Música adicionada!",
        description: "A música foi adicionada à lista.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar música:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a música.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Buscar listas de músicas
  const fetchListasMusicas = async (programacaoId: string) => {
    try {
      const { data, error } = await supabase
        .from('listas_musicas')
        .select(`
          *,
          musicas:musicas_lista(*)
        `)
        .eq('programacao_culto_id', programacaoId)
        .order('ordem_execucao', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar listas:', error);
      return [];
    }
  };

  // Criar ensaio
  const criarEnsaio = async (dados: Omit<EnsaioMinisterio, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ensaios_ministerio')
        .insert([dados])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Ensaio criado!",
        description: "O ensaio foi agendado com sucesso.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao criar ensaio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ensaio.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramacoes();
    fetchMinhasEscalas();
  }, []);

  return {
    loading,
    programacoes,
    escalas,
    minhasEscalas,
    
    // Programação de cultos
    fetchProgramacoes,
    criarProgramacao,
    
    // Escalas
    fetchEscalas,
    criarEscala,
    convocarParticipante,
    confirmarParticipacao,
    fetchParticipantesEscala,
    
    // Minhas escalas
    fetchMinhasEscalas,
    
    // Listas de músicas
    criarListaMusicas,
    adicionarMusica,
    fetchListasMusicas,
    
    // Ensaios
    criarEnsaio
  };
};