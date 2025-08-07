export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      acoes_permissao: {
        Row: {
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
        }
        Insert: {
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
        }
        Update: {
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      agenda_eventos: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          enviar_notificacao: boolean
          grupo: string | null
          id: string
          igreja_id: string
          imagem_url: string | null
          link_google_calendar: string | null
          local: string | null
          organizador_id: string | null
          publico: boolean
          status: Database["public"]["Enums"]["status_evento_agenda"]
          tipo: Database["public"]["Enums"]["tipo_evento_agenda"]
          titulo: string
          updated_at: string
          visivel_para: string[] | null
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          enviar_notificacao?: boolean
          grupo?: string | null
          id?: string
          igreja_id: string
          imagem_url?: string | null
          link_google_calendar?: string | null
          local?: string | null
          organizador_id?: string | null
          publico?: boolean
          status?: Database["public"]["Enums"]["status_evento_agenda"]
          tipo?: Database["public"]["Enums"]["tipo_evento_agenda"]
          titulo: string
          updated_at?: string
          visivel_para?: string[] | null
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          enviar_notificacao?: boolean
          grupo?: string | null
          id?: string
          igreja_id?: string
          imagem_url?: string | null
          link_google_calendar?: string | null
          local?: string | null
          organizador_id?: string | null
          publico?: boolean
          status?: Database["public"]["Enums"]["status_evento_agenda"]
          tipo?: Database["public"]["Enums"]["tipo_evento_agenda"]
          titulo?: string
          updated_at?: string
          visivel_para?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_igreja"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_organizador"
            columns: ["organizador_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      alertas_ia: {
        Row: {
          ativo: boolean
          created_at: string
          dados_contexto: Json | null
          descricao: string
          entidade_id: string
          entidade_tipo: string
          id: string
          nivel_criticidade: number
          resolvido: boolean
          resolvido_em: string | null
          resolvido_por: string | null
          sugestoes_ia: Json | null
          tipo_alerta: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          dados_contexto?: Json | null
          descricao: string
          entidade_id: string
          entidade_tipo: string
          id?: string
          nivel_criticidade?: number
          resolvido?: boolean
          resolvido_em?: string | null
          resolvido_por?: string | null
          sugestoes_ia?: Json | null
          tipo_alerta: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          dados_contexto?: Json | null
          descricao?: string
          entidade_id?: string
          entidade_tipo?: string
          id?: string
          nivel_criticidade?: number
          resolvido?: boolean
          resolvido_em?: string | null
          resolvido_por?: string | null
          sugestoes_ia?: Json | null
          tipo_alerta?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          attachment_url: string | null
          author_id: string
          church_id: string | null
          content: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          target_audience: string[] | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          attachment_url?: string | null
          author_id: string
          church_id?: string | null
          content: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          target_audience?: string[] | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          attachment_url?: string | null
          author_id?: string
          church_id?: string | null
          content?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          target_audience?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      aulas: {
        Row: {
          conteudo: Json | null
          created_at: string
          data_aula: string
          descricao: string | null
          id: string
          material_aula: string[] | null
          observacoes: string | null
          titulo: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          conteudo?: Json | null
          created_at?: string
          data_aula: string
          descricao?: string | null
          id?: string
          material_aula?: string[] | null
          observacoes?: string | null
          titulo: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          conteudo?: Json | null
          created_at?: string
          data_aula?: string
          descricao?: string | null
          id?: string
          material_aula?: string[] | null
          observacoes?: string | null
          titulo?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aulas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes: {
        Row: {
          created_at: string
          data_avaliacao: string | null
          id: string
          matricula_id: string
          nota: number | null
          observacoes: string | null
          tipo_avaliacao: string
        }
        Insert: {
          created_at?: string
          data_avaliacao?: string | null
          id?: string
          matricula_id: string
          nota?: number | null
          observacoes?: string | null
          tipo_avaliacao: string
        }
        Update: {
          created_at?: string
          data_avaliacao?: string | null
          id?: string
          matricula_id?: string
          nota?: number | null
          observacoes?: string | null
          tipo_avaliacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      avaliacoes_ensino: {
        Row: {
          created_at: string
          data_avaliacao: string | null
          id: string
          matricula_id: string
          nota: number | null
          observacoes: string | null
          tipo_avaliacao: string
        }
        Insert: {
          created_at?: string
          data_avaliacao?: string | null
          id?: string
          matricula_id: string
          nota?: number | null
          observacoes?: string | null
          tipo_avaliacao: string
        }
        Update: {
          created_at?: string
          data_avaliacao?: string | null
          id?: string
          matricula_id?: string
          nota?: number | null
          observacoes?: string | null
          tipo_avaliacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_ensino_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas_ensino"
            referencedColumns: ["id"]
          },
        ]
      }
      badges_ensino: {
        Row: {
          ativo: boolean
          cor: string
          created_at: string
          criterios: Json
          descricao: string | null
          icon: string
          id: string
          nome: string
          pontos_recompensa: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cor?: string
          created_at?: string
          criterios?: Json
          descricao?: string | null
          icon?: string
          id?: string
          nome: string
          pontos_recompensa?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cor?: string
          created_at?: string
          criterios?: Json
          descricao?: string | null
          icon?: string
          id?: string
          nome?: string
          pontos_recompensa?: number
          updated_at?: string
        }
        Relationships: []
      }
      bloqueios_academicos: {
        Row: {
          ativo: boolean
          cor: string
          created_at: string
          created_by: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cor?: string
          created_at?: string
          created_by?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cor?: string
          created_at?: string
          created_by?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      campanhas_arrecadacao: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          id: string
          imagem_url: string | null
          meta_valor: number
          tipo: string | null
          titulo: string
          updated_at: string | null
          valor_atual: number | null
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          meta_valor: number
          tipo?: string | null
          titulo: string
          updated_at?: string | null
          valor_atual?: number | null
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          meta_valor?: number
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
          valor_atual?: number | null
        }
        Relationships: []
      }
      categorias_conteudo: {
        Row: {
          ativa: boolean
          cor: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias_cursos: {
        Row: {
          ativa: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias_eventos: {
        Row: {
          ativa: boolean
          cor: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias_financeiras: {
        Row: {
          ativa: boolean | null
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          orcamento_mensal: number | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          orcamento_mensal?: number | null
          tipo: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          orcamento_mensal?: number | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias_galeria: {
        Row: {
          ativa: boolean
          cor: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      categorias_patrimonio: {
        Row: {
          ativa: boolean
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      celula_participantes: {
        Row: {
          ativo: boolean | null
          celula_id: string
          created_at: string | null
          data_ingresso: string | null
          id: string
          papel_na_celula: string | null
          pessoa_id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          celula_id: string
          created_at?: string | null
          data_ingresso?: string | null
          id?: string
          papel_na_celula?: string | null
          pessoa_id: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          celula_id?: string
          created_at?: string | null
          data_ingresso?: string | null
          id?: string
          papel_na_celula?: string | null
          pessoa_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "celula_participantes_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celula_participantes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      celulas: {
        Row: {
          anfitriao: string | null
          anfitriao_id: string | null
          arvore_genealogica: string | null
          ativa: boolean | null
          auxiliar_id: string | null
          bairro: string
          celula_mae_id: string | null
          congregacao_id: string | null
          coordenador: string | null
          coordenador_id: string | null
          created_at: string
          data_inicio: string | null
          data_multiplicacao: string | null
          descricao: string | null
          dia_semana: string
          endereco: string
          frequencia_reunioes: string | null
          geracao: number | null
          horario: string
          id: string
          igreja_id: string
          latitude: number | null
          lider: string
          lider_em_treinamento: string | null
          lider_em_treinamento_id: string | null
          lider_id: string | null
          longitude: number | null
          membros_atual: number | null
          membros_maximo: number | null
          meta_decisoes_mes: number | null
          meta_membros: number | null
          meta_visitantes_mes: number | null
          multiplicando: boolean | null
          nome: string
          observacoes: string | null
          rede_id: string | null
          rede_ministerio: string | null
          status_celula: string | null
          supervisor: string | null
          supervisor_id: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          anfitriao?: string | null
          anfitriao_id?: string | null
          arvore_genealogica?: string | null
          ativa?: boolean | null
          auxiliar_id?: string | null
          bairro: string
          celula_mae_id?: string | null
          congregacao_id?: string | null
          coordenador?: string | null
          coordenador_id?: string | null
          created_at?: string
          data_inicio?: string | null
          data_multiplicacao?: string | null
          descricao?: string | null
          dia_semana: string
          endereco: string
          frequencia_reunioes?: string | null
          geracao?: number | null
          horario: string
          id?: string
          igreja_id: string
          latitude?: number | null
          lider: string
          lider_em_treinamento?: string | null
          lider_em_treinamento_id?: string | null
          lider_id?: string | null
          longitude?: number | null
          membros_atual?: number | null
          membros_maximo?: number | null
          meta_decisoes_mes?: number | null
          meta_membros?: number | null
          meta_visitantes_mes?: number | null
          multiplicando?: boolean | null
          nome: string
          observacoes?: string | null
          rede_id?: string | null
          rede_ministerio?: string | null
          status_celula?: string | null
          supervisor?: string | null
          supervisor_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          anfitriao?: string | null
          anfitriao_id?: string | null
          arvore_genealogica?: string | null
          ativa?: boolean | null
          auxiliar_id?: string | null
          bairro?: string
          celula_mae_id?: string | null
          congregacao_id?: string | null
          coordenador?: string | null
          coordenador_id?: string | null
          created_at?: string
          data_inicio?: string | null
          data_multiplicacao?: string | null
          descricao?: string | null
          dia_semana?: string
          endereco?: string
          frequencia_reunioes?: string | null
          geracao?: number | null
          horario?: string
          id?: string
          igreja_id?: string
          latitude?: number | null
          lider?: string
          lider_em_treinamento?: string | null
          lider_em_treinamento_id?: string | null
          lider_id?: string | null
          longitude?: number | null
          membros_atual?: number | null
          membros_maximo?: number | null
          meta_decisoes_mes?: number | null
          meta_membros?: number | null
          meta_visitantes_mes?: number | null
          multiplicando?: boolean | null
          nome?: string
          observacoes?: string | null
          rede_id?: string | null
          rede_ministerio?: string | null
          status_celula?: string | null
          supervisor?: string | null
          supervisor_id?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "celulas_celula_mae_id_fkey"
            columns: ["celula_mae_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celulas_congregacao_id_fkey"
            columns: ["congregacao_id"]
            isOneToOne: false
            referencedRelation: "congregacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "celulas_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_celulas_rede"
            columns: ["rede_id"]
            isOneToOne: false
            referencedRelation: "redes_celulas"
            referencedColumns: ["id"]
          },
        ]
      }
      certificados: {
        Row: {
          ativo: boolean | null
          created_at: string
          curso_id: string | null
          descricao: string | null
          id: string
          nome: string
          template_url: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          curso_id?: string | null
          descricao?: string | null
          id?: string
          nome: string
          template_url?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          curso_id?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          template_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificados_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos_ensino"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_pastoral: {
        Row: {
          contexto: Json | null
          criado_em: string
          id: string
          mensagem_usuario: string
          resposta_ia: string
          user_id: string
        }
        Insert: {
          contexto?: Json | null
          criado_em?: string
          id?: string
          mensagem_usuario: string
          resposta_ia: string
          user_id: string
        }
        Update: {
          contexto?: Json | null
          criado_em?: string
          id?: string
          mensagem_usuario?: string
          resposta_ia?: string
          user_id?: string
        }
        Relationships: []
      }
      chatbot_conversas: {
        Row: {
          contexto: Json | null
          created_at: string
          id: string
          mensagem_usuario: string
          resposta_ia: string
          satisfacao: number | null
          tempo_resposta: number | null
          updated_at: string
          usuario_email: string | null
          usuario_nome: string | null
        }
        Insert: {
          contexto?: Json | null
          created_at?: string
          id?: string
          mensagem_usuario: string
          resposta_ia: string
          satisfacao?: number | null
          tempo_resposta?: number | null
          updated_at?: string
          usuario_email?: string | null
          usuario_nome?: string | null
        }
        Update: {
          contexto?: Json | null
          created_at?: string
          id?: string
          mensagem_usuario?: string
          resposta_ia?: string
          satisfacao?: number | null
          tempo_resposta?: number | null
          updated_at?: string
          usuario_email?: string | null
          usuario_nome?: string | null
        }
        Relationships: []
      }
      chatbot_respostas_automaticas: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          palavra_chave: string
          resposta: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          palavra_chave: string
          resposta: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          palavra_chave?: string
          resposta?: string
          updated_at?: string
        }
        Relationships: []
      }
      chatbot_treinamentos: {
        Row: {
          categoria: string | null
          conteudo_estruturado: string | null
          conteudo_original: string
          created_at: string
          data_treinamento: string
          id: string
          palavras_chave: string[] | null
          relevancia: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          categoria?: string | null
          conteudo_estruturado?: string | null
          conteudo_original: string
          created_at?: string
          data_treinamento?: string
          id?: string
          palavras_chave?: string[] | null
          relevancia?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          categoria?: string | null
          conteudo_estruturado?: string | null
          conteudo_original?: string
          created_at?: string
          data_treinamento?: string
          id?: string
          palavras_chave?: string[] | null
          relevancia?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      communication_channel_members: {
        Row: {
          channel_id: string
          id: string
          is_muted: boolean | null
          joined_at: string
          last_read_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          is_muted?: boolean | null
          joined_at?: string
          last_read_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_channel_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_channels: {
        Row: {
          celula_id: string | null
          color: string | null
          created_at: string
          created_by: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          is_public: boolean
          ministry_id: string | null
          name: string
          turma_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          celula_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          ministry_id?: string | null
          name: string
          turma_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          celula_id?: string | null
          color?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          ministry_id?: string | null
          name?: string
          turma_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_channels_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_channels_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_messages: {
        Row: {
          attachment_name: string | null
          attachment_url: string | null
          channel_id: string
          content: string
          created_at: string
          edited_at: string | null
          id: string
          is_pinned: boolean | null
          message_type: string | null
          reply_to_id: string | null
          sender_id: string
          sent_at: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_url?: string | null
          channel_id: string
          content: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_pinned?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id: string
          sent_at?: string
        }
        Update: {
          attachment_name?: string | null
          attachment_url?: string | null
          channel_id?: string
          content?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_pinned?: boolean | null
          message_type?: string | null
          reply_to_id?: string | null
          sender_id?: string
          sent_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "communication_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_notificacoes: {
        Row: {
          configuracoes: Json
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          configuracoes?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          configuracoes?: Json
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      congregacoes: {
        Row: {
          ativa: boolean
          configuracoes: Json | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          igreja_mae_id: string | null
          nome: string
          pastor_responsavel: string | null
          slug: string
          telefone: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          configuracoes?: Json | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          igreja_mae_id?: string | null
          nome: string
          pastor_responsavel?: string | null
          slug: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          configuracoes?: Json | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          igreja_mae_id?: string | null
          nome?: string
          pastor_responsavel?: string | null
          slug?: string
          telefone?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "congregacoes_igreja_mae_id_fkey"
            columns: ["igreja_mae_id"]
            isOneToOne: false
            referencedRelation: "congregacoes"
            referencedColumns: ["id"]
          },
        ]
      }
      congregations: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          main_church_id: string | null
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          main_church_id?: string | null
          name: string
          settings?: Json | null
          slug: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          main_church_id?: string | null
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "congregations_main_church_id_fkey"
            columns: ["main_church_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
        ]
      }
      conquistas_ensino: {
        Row: {
          badge_id: string
          created_at: string
          data_conquista: string
          id: string
          pessoa_id: string
          pontos_ganhos: number
        }
        Insert: {
          badge_id: string
          created_at?: string
          data_conquista?: string
          id?: string
          pessoa_id: string
          pontos_ganhos?: number
        }
        Update: {
          badge_id?: string
          created_at?: string
          data_conquista?: string
          id?: string
          pessoa_id?: string
          pontos_ganhos?: number
        }
        Relationships: [
          {
            foreignKeyName: "conquistas_ensino_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges_ensino"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_financeiras: {
        Row: {
          agencia: string | null
          ativa: boolean | null
          banco: string | null
          conta: string | null
          created_at: string
          id: string
          nome: string
          saldo_atual: number | null
          tipo: string
          updated_at: string
        }
        Insert: {
          agencia?: string | null
          ativa?: boolean | null
          banco?: string | null
          conta?: string | null
          created_at?: string
          id?: string
          nome: string
          saldo_atual?: number | null
          tipo: string
          updated_at?: string
        }
        Update: {
          agencia?: string | null
          ativa?: boolean | null
          banco?: string | null
          conta?: string | null
          created_at?: string
          id?: string
          nome?: string
          saldo_atual?: number | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      contatos: {
        Row: {
          assunto: string
          created_at: string
          email: string
          id: string
          mensagem: string
          nome: string
          status: string | null
          telefone: string | null
          updated_at: string
        }
        Insert: {
          assunto: string
          created_at?: string
          email: string
          id?: string
          mensagem: string
          nome: string
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          assunto?: string
          created_at?: string
          email?: string
          id?: string
          mensagem?: string
          nome?: string
          status?: string | null
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      conteudo_site: {
        Row: {
          categoria: string | null
          chave: string
          created_at: string
          descricao: string | null
          id: string
          tipo: string
          titulo: string
          updated_at: string
          valor: string
        }
        Insert: {
          categoria?: string | null
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string
          titulo: string
          updated_at?: string
          valor: string
        }
        Update: {
          categoria?: string | null
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
          tipo?: string
          titulo?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      contribuicoes: {
        Row: {
          campanha_id: string | null
          comprovante_url: string | null
          created_at: string
          id: string
          mensagem: string | null
          metodo_pagamento: string | null
          nome: string
          pessoa_id: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          campanha_id?: string | null
          comprovante_url?: string | null
          created_at?: string
          id?: string
          mensagem?: string | null
          metodo_pagamento?: string | null
          nome: string
          pessoa_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          campanha_id?: string | null
          comprovante_url?: string | null
          created_at?: string
          id?: string
          mensagem?: string | null
          metodo_pagamento?: string | null
          nome?: string
          pessoa_id?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "contribuicoes_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas_arrecadacao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contribuicoes_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      cursos: {
        Row: {
          ativo: boolean | null
          carga_horaria: number | null
          categoria: string
          created_at: string
          descricao: string | null
          emite_certificado: boolean | null
          id: string
          material_didatico: Json | null
          nivel: string
          nome: string
          pre_requisitos: string[] | null
          publico_alvo: string[] | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          carga_horaria?: number | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          emite_certificado?: boolean | null
          id?: string
          material_didatico?: Json | null
          nivel?: string
          nome: string
          pre_requisitos?: string[] | null
          publico_alvo?: string[] | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          carga_horaria?: number | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          emite_certificado?: boolean | null
          id?: string
          material_didatico?: Json | null
          nivel?: string
          nome?: string
          pre_requisitos?: string[] | null
          publico_alvo?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      cursos_ensino: {
        Row: {
          ativo: boolean | null
          carga_horaria: number | null
          categoria: string
          created_at: string
          descricao: string | null
          emite_certificado: boolean | null
          id: string
          material_didatico: Json | null
          nivel: string
          nome: string
          pre_requisitos: string[] | null
          publico_alvo: string[] | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          carga_horaria?: number | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          emite_certificado?: boolean | null
          id?: string
          material_didatico?: Json | null
          nivel?: string
          nome: string
          pre_requisitos?: string[] | null
          publico_alvo?: string[] | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          carga_horaria?: number | null
          categoria?: string
          created_at?: string
          descricao?: string | null
          emite_certificado?: boolean | null
          id?: string
          material_didatico?: Json | null
          nivel?: string
          nome?: string
          pre_requisitos?: string[] | null
          publico_alvo?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      data_requests: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          processed_at: string | null
          processed_by: string | null
          request_data: Json | null
          request_type: string
          response_data: Json | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_data?: Json | null
          request_type: string
          response_data?: Json | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          processed_at?: string | null
          processed_by?: string | null
          request_data?: Json | null
          request_type?: string
          response_data?: Json | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emprestimos_patrimonio: {
        Row: {
          created_at: string
          data_devolucao: string | null
          data_prevista_devolucao: string
          data_retirada: string
          id: string
          local_uso: string | null
          observacoes: string | null
          patrimonio_id: string
          responsavel_devolucao_id: string | null
          responsavel_liberacao_id: string | null
          situacao_devolucao: string | null
          solicitante_id: string
          status: string
          termo_pdf_url: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_devolucao?: string | null
          data_prevista_devolucao: string
          data_retirada: string
          id?: string
          local_uso?: string | null
          observacoes?: string | null
          patrimonio_id: string
          responsavel_devolucao_id?: string | null
          responsavel_liberacao_id?: string | null
          situacao_devolucao?: string | null
          solicitante_id: string
          status?: string
          termo_pdf_url?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_devolucao?: string | null
          data_prevista_devolucao?: string
          data_retirada?: string
          id?: string
          local_uso?: string | null
          observacoes?: string | null
          patrimonio_id?: string
          responsavel_devolucao_id?: string | null
          responsavel_liberacao_id?: string | null
          situacao_devolucao?: string | null
          solicitante_id?: string
          status?: string
          termo_pdf_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "emprestimos_patrimonio_patrimonio_id_fkey"
            columns: ["patrimonio_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprestimos_patrimonio_responsavel_devolucao_id_fkey"
            columns: ["responsavel_devolucao_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprestimos_patrimonio_responsavel_liberacao_id_fkey"
            columns: ["responsavel_liberacao_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emprestimos_patrimonio_solicitante_id_fkey"
            columns: ["solicitante_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      ensaios_ministerio: {
        Row: {
          ativo: boolean
          created_at: string
          data_ensaio: string
          duracao_estimada: number | null
          id: string
          lista_musicas_id: string | null
          local: string
          obrigatorio: boolean
          observacoes: string | null
          programacao_culto_id: string
          titulo: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_ensaio: string
          duracao_estimada?: number | null
          id?: string
          lista_musicas_id?: string | null
          local: string
          obrigatorio?: boolean
          observacoes?: string | null
          programacao_culto_id: string
          titulo: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_ensaio?: string
          duracao_estimada?: number | null
          id?: string
          lista_musicas_id?: string | null
          local?: string
          obrigatorio?: boolean
          observacoes?: string | null
          programacao_culto_id?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ensaios_ministerio_lista_musicas_id_fkey"
            columns: ["lista_musicas_id"]
            isOneToOne: false
            referencedRelation: "listas_musicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ensaios_ministerio_programacao_culto_id_fkey"
            columns: ["programacao_culto_id"]
            isOneToOne: false
            referencedRelation: "programacao_cultos"
            referencedColumns: ["id"]
          },
        ]
      }
      escala_voluntarios: {
        Row: {
          confirmado_em: string | null
          created_at: string
          escala_id: string
          id: string
          membro_id: string
          observacoes: string | null
          status: string
          substituido_por: string | null
          updated_at: string
        }
        Insert: {
          confirmado_em?: string | null
          created_at?: string
          escala_id: string
          id?: string
          membro_id: string
          observacoes?: string | null
          status?: string
          substituido_por?: string | null
          updated_at?: string
        }
        Update: {
          confirmado_em?: string | null
          created_at?: string
          escala_id?: string
          id?: string
          membro_id?: string
          observacoes?: string | null
          status?: string
          substituido_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escala_voluntarios_escala_id_fkey"
            columns: ["escala_id"]
            isOneToOne: false
            referencedRelation: "escalas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_voluntarios_membro_id_fkey"
            columns: ["membro_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escala_voluntarios_substituido_por_fkey"
            columns: ["substituido_por"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
        ]
      }
      escalas: {
        Row: {
          created_at: string
          criado_por: string
          data_evento: string
          descricao: string | null
          id: string
          nome: string
          numero_voluntarios_necessarios: number
          status: string
          tipo_escala: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          criado_por: string
          data_evento: string
          descricao?: string | null
          id?: string
          nome: string
          numero_voluntarios_necessarios?: number
          status?: string
          tipo_escala: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          criado_por?: string
          data_evento?: string
          descricao?: string | null
          id?: string
          nome?: string
          numero_voluntarios_necessarios?: number
          status?: string
          tipo_escala?: string
          updated_at?: string
        }
        Relationships: []
      }
      escalas_ministerio: {
        Row: {
          ativo: boolean
          created_at: string
          data_limite_confirmacao: string | null
          descricao: string | null
          id: string
          instrucoes_especiais: string | null
          materiais_necessarios: Json | null
          nome: string
          programacao_culto_id: string
          tipo_escala: Database["public"]["Enums"]["tipo_escala"]
          updated_at: string
          vagas_necessarias: number
          vagas_preenchidas: number
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_limite_confirmacao?: string | null
          descricao?: string | null
          id?: string
          instrucoes_especiais?: string | null
          materiais_necessarios?: Json | null
          nome: string
          programacao_culto_id: string
          tipo_escala: Database["public"]["Enums"]["tipo_escala"]
          updated_at?: string
          vagas_necessarias?: number
          vagas_preenchidas?: number
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_limite_confirmacao?: string | null
          descricao?: string | null
          id?: string
          instrucoes_especiais?: string | null
          materiais_necessarios?: Json | null
          nome?: string
          programacao_culto_id?: string
          tipo_escala?: Database["public"]["Enums"]["tipo_escala"]
          updated_at?: string
          vagas_necessarias?: number
          vagas_preenchidas?: number
        }
        Relationships: [
          {
            foreignKeyName: "escalas_ministerio_programacao_culto_id_fkey"
            columns: ["programacao_culto_id"]
            isOneToOne: false
            referencedRelation: "programacao_cultos"
            referencedColumns: ["id"]
          },
        ]
      }
      espacos: {
        Row: {
          capacidade: number
          created_at: string
          descricao: string | null
          disponivel: boolean
          id: string
          nome: string
          recursos: string[] | null
          updated_at: string
        }
        Insert: {
          capacidade?: number
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          nome: string
          recursos?: string[] | null
          updated_at?: string
        }
        Update: {
          capacidade?: number
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          nome?: string
          recursos?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      estatisticas_site: {
        Row: {
          chave: string
          created_at: string
          descricao: string | null
          id: string
          updated_at: string
          valor: string
        }
        Insert: {
          chave: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor: string
        }
        Update: {
          chave?: string
          created_at?: string
          descricao?: string | null
          id?: string
          updated_at?: string
          valor?: string
        }
        Relationships: []
      }
      estudos_biblicos: {
        Row: {
          arquivo_nome: string | null
          arquivo_tamanho: string | null
          arquivo_url: string | null
          ativo: boolean | null
          created_at: string
          descricao: string | null
          downloads: number | null
          id: string
          semana_fim: string
          semana_inicio: string
          titulo: string
          updated_at: string
          versiculo_chave: string | null
        }
        Insert: {
          arquivo_nome?: string | null
          arquivo_tamanho?: string | null
          arquivo_url?: string | null
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          downloads?: number | null
          id?: string
          semana_fim: string
          semana_inicio: string
          titulo: string
          updated_at?: string
          versiculo_chave?: string | null
        }
        Update: {
          arquivo_nome?: string | null
          arquivo_tamanho?: string | null
          arquivo_url?: string | null
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          downloads?: number | null
          id?: string
          semana_fim?: string
          semana_inicio?: string
          titulo?: string
          updated_at?: string
          versiculo_chave?: string | null
        }
        Relationships: []
      }
      evento_confirmacoes: {
        Row: {
          confirmado: boolean
          created_at: string
          evento_id: string
          id: string
          observacoes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          confirmado?: boolean
          created_at?: string
          evento_id: string
          id?: string
          observacoes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          confirmado?: boolean
          created_at?: string
          evento_id?: string
          id?: string
          observacoes?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evento_confirmacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "agenda_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_doacoes: {
        Row: {
          comprovante_url: string | null
          created_at: string
          descricao: string | null
          email_doador: string | null
          evento_id: string
          id: string
          metodo_pagamento: string | null
          nome_doador: string | null
          status: string
          tipo_doacao: string
          updated_at: string
          user_id: string | null
          valor: number
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string
          descricao?: string | null
          email_doador?: string | null
          evento_id: string
          id?: string
          metodo_pagamento?: string | null
          nome_doador?: string | null
          status?: string
          tipo_doacao?: string
          updated_at?: string
          user_id?: string | null
          valor: number
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string
          descricao?: string | null
          email_doador?: string | null
          evento_id?: string
          id?: string
          metodo_pagamento?: string | null
          nome_doador?: string | null
          status?: string
          tipo_doacao?: string
          updated_at?: string
          user_id?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "evento_doacoes_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "agenda_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      evento_pedidos_oracao: {
        Row: {
          created_at: string
          email_solicitante: string | null
          evento_id: string
          id: string
          nome_solicitante: string
          pedido: string
          publico: boolean
          status: string
          telefone_solicitante: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email_solicitante?: string | null
          evento_id: string
          id?: string
          nome_solicitante: string
          pedido: string
          publico?: boolean
          status?: string
          telefone_solicitante?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email_solicitante?: string | null
          evento_id?: string
          id?: string
          nome_solicitante?: string
          pedido?: string
          publico?: boolean
          status?: string
          telefone_solicitante?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evento_pedidos_oracao_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "agenda_eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      eventos: {
        Row: {
          capacidade: number | null
          created_at: string
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          endereco: string | null
          id: string
          igreja_id: string
          inscricoes_abertas: boolean | null
          local: string
          publico: boolean | null
          recorrencia_tipo: string | null
          recorrente: boolean | null
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          capacidade?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          endereco?: string | null
          id?: string
          igreja_id: string
          inscricoes_abertas?: boolean | null
          local: string
          publico?: boolean | null
          recorrencia_tipo?: string | null
          recorrente?: boolean | null
          tipo: string
          titulo: string
          updated_at?: string
        }
        Update: {
          capacidade?: number | null
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          endereco?: string | null
          id?: string
          igreja_id?: string
          inscricoes_abertas?: boolean | null
          local?: string
          publico?: boolean | null
          recorrencia_tipo?: string | null
          recorrente?: boolean | null
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
        ]
      }
      funcionalidades_modulo: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          modulo_id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          modulo_id: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          modulo_id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "funcionalidades_modulo_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_sistema"
            referencedColumns: ["id"]
          },
        ]
      }
      galeria_fotos: {
        Row: {
          categoria: string | null
          created_at: string
          data_evento: string | null
          descricao: string | null
          destaque: boolean | null
          evento_id: string | null
          id: string
          ordem: number | null
          titulo: string
          url_imagem: string
          url_thumbnail: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          evento_id?: string | null
          id?: string
          ordem?: number | null
          titulo: string
          url_imagem: string
          url_thumbnail?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string
          data_evento?: string | null
          descricao?: string | null
          destaque?: boolean | null
          evento_id?: string | null
          id?: string
          ordem?: number | null
          titulo?: string
          url_imagem?: string
          url_thumbnail?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "galeria_fotos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_celulas: {
        Row: {
          celula_id: string
          created_at: string
          dados_antigos: Json | null
          dados_novos: Json | null
          descricao: string
          id: string
          tipo_evento: string
          usuario_responsavel: string | null
        }
        Insert: {
          celula_id: string
          created_at?: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          descricao: string
          id?: string
          tipo_evento: string
          usuario_responsavel?: string | null
        }
        Update: {
          celula_id?: string
          created_at?: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          descricao?: string
          id?: string
          tipo_evento?: string
          usuario_responsavel?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_celulas_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_celulas_pessoas: {
        Row: {
          celula_id: string
          created_at: string
          data_entrada: string
          data_saida: string | null
          id: string
          observacoes: string | null
          papel: string | null
          pessoa_id: string
          updated_at: string
        }
        Insert: {
          celula_id: string
          created_at?: string
          data_entrada: string
          data_saida?: string | null
          id?: string
          observacoes?: string | null
          papel?: string | null
          pessoa_id: string
          updated_at?: string
        }
        Update: {
          celula_id?: string
          created_at?: string
          data_entrada?: string
          data_saida?: string | null
          id?: string
          observacoes?: string | null
          papel?: string | null
          pessoa_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_celulas_pessoas_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "historico_celulas_pessoas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_patrimonio: {
        Row: {
          created_at: string
          descricao: string
          id: string
          patrimonio_id: string
          tipo_evento: string
          usuario_responsavel: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          patrimonio_id: string
          tipo_evento: string
          usuario_responsavel?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          patrimonio_id?: string
          tipo_evento?: string
          usuario_responsavel?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_patrimonio_patrimonio_id_fkey"
            columns: ["patrimonio_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
        ]
      }
      historico_pessoas: {
        Row: {
          created_at: string
          descricao: string
          id: string
          pessoa_id: string
          tipo_evento: string
          usuario_responsavel: string | null
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          pessoa_id: string
          tipo_evento: string
          usuario_responsavel?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          pessoa_id?: string
          tipo_evento?: string
          usuario_responsavel?: string | null
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "historico_pessoas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      igrejas: {
        Row: {
          ativa: boolean | null
          cidade: string | null
          created_at: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          pastor_responsavel: string | null
          telefone: string | null
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativa?: boolean | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          pastor_responsavel?: string | null
          telefone?: string | null
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativa?: boolean | null
          cidade?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          pastor_responsavel?: string | null
          telefone?: string | null
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      lancamentos_financeiros: {
        Row: {
          categoria_id: string
          comprovante_url: string | null
          congregacao_id: string | null
          conta_id: string
          created_at: string
          data_lancamento: string
          descricao: string
          forma_pagamento: string
          id: string
          igreja_id: string
          observacoes: string | null
          repeticao_mensal: boolean | null
          responsavel_id: string | null
          status: string | null
          subcategoria_id: string | null
          tipo: string
          updated_at: string
          valor: number
        }
        Insert: {
          categoria_id: string
          comprovante_url?: string | null
          congregacao_id?: string | null
          conta_id: string
          created_at?: string
          data_lancamento?: string
          descricao: string
          forma_pagamento: string
          id?: string
          igreja_id: string
          observacoes?: string | null
          repeticao_mensal?: boolean | null
          responsavel_id?: string | null
          status?: string | null
          subcategoria_id?: string | null
          tipo: string
          updated_at?: string
          valor: number
        }
        Update: {
          categoria_id?: string
          comprovante_url?: string | null
          congregacao_id?: string | null
          conta_id?: string
          created_at?: string
          data_lancamento?: string
          descricao?: string
          forma_pagamento?: string
          id?: string
          igreja_id?: string
          observacoes?: string | null
          repeticao_mensal?: boolean | null
          responsavel_id?: string | null
          status?: string | null
          subcategoria_id?: string | null
          tipo?: string
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_financeiros_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_congregacao_id_fkey"
            columns: ["congregacao_id"]
            isOneToOne: false
            referencedRelation: "congregacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_conta_id_fkey"
            columns: ["conta_id"]
            isOneToOne: false
            referencedRelation: "contas_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "subcategorias_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      landing_pages: {
        Row: {
          analytics: Json | null
          ativa: boolean | null
          configuracoes: Json | null
          created_at: string
          data_publicacao: string | null
          descricao: string | null
          id: string
          seo_meta: Json | null
          slug: string
          status: string | null
          template_id: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          analytics?: Json | null
          ativa?: boolean | null
          configuracoes?: Json | null
          created_at?: string
          data_publicacao?: string | null
          descricao?: string | null
          id?: string
          seo_meta?: Json | null
          slug: string
          status?: string | null
          template_id?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          analytics?: Json | null
          ativa?: boolean | null
          configuracoes?: Json | null
          created_at?: string
          data_publicacao?: string | null
          descricao?: string | null
          id?: string
          seo_meta?: Json | null
          slug?: string
          status?: string | null
          template_id?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "landing_pages_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_site"
            referencedColumns: ["id"]
          },
        ]
      }
      licoes_modulo: {
        Row: {
          ativo: boolean | null
          conteudo: Json | null
          created_at: string
          duracao_estimada: number | null
          id: string
          modulo_id: string
          ordem: number
          pontos: number | null
          recursos_extras: Json | null
          tarefas: Json | null
          tipo: string
          titulo: string
          updated_at: string
          video_url: string | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo?: Json | null
          created_at?: string
          duracao_estimada?: number | null
          id?: string
          modulo_id: string
          ordem?: number
          pontos?: number | null
          recursos_extras?: Json | null
          tarefas?: Json | null
          tipo?: string
          titulo: string
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          ativo?: boolean | null
          conteudo?: Json | null
          created_at?: string
          duracao_estimada?: number | null
          id?: string
          modulo_id?: string
          ordem?: number
          pontos?: number | null
          recursos_extras?: Json | null
          tarefas?: Json | null
          tipo?: string
          titulo?: string
          updated_at?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "licoes_modulo_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_curso"
            referencedColumns: ["id"]
          },
        ]
      }
      lideranca: {
        Row: {
          ativo: boolean | null
          cargo: string
          created_at: string
          descricao: string | null
          foto_url: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          cargo: string
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: string
          created_at?: string
          descricao?: string | null
          foto_url?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      listas_musicas: {
        Row: {
          created_at: string
          id: string
          nome: string
          observacoes: string | null
          ordem_execucao: number
          programacao_culto_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          ordem_execucao?: number
          programacao_culto_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
          observacoes?: string | null
          ordem_execucao?: number
          programacao_culto_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listas_musicas_programacao_culto_id_fkey"
            columns: ["programacao_culto_id"]
            isOneToOne: false
            referencedRelation: "programacao_cultos"
            referencedColumns: ["id"]
          },
        ]
      }
      manutencoes_patrimonio: {
        Row: {
          comprovante_url: string | null
          created_at: string
          data_manutencao: string
          descricao: string
          empresa_responsavel: string | null
          id: string
          observacoes: string | null
          patrimonio_id: string
          responsavel_id: string | null
          tipo_manutencao: string
          updated_at: string
          valor_gasto: number | null
        }
        Insert: {
          comprovante_url?: string | null
          created_at?: string
          data_manutencao: string
          descricao: string
          empresa_responsavel?: string | null
          id?: string
          observacoes?: string | null
          patrimonio_id: string
          responsavel_id?: string | null
          tipo_manutencao: string
          updated_at?: string
          valor_gasto?: number | null
        }
        Update: {
          comprovante_url?: string | null
          created_at?: string
          data_manutencao?: string
          descricao?: string
          empresa_responsavel?: string | null
          id?: string
          observacoes?: string | null
          patrimonio_id?: string
          responsavel_id?: string | null
          tipo_manutencao?: string
          updated_at?: string
          valor_gasto?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "manutencoes_patrimonio_patrimonio_id_fkey"
            columns: ["patrimonio_id"]
            isOneToOne: false
            referencedRelation: "patrimonios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "manutencoes_patrimonio_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas: {
        Row: {
          certificado_emitido: boolean | null
          certificado_url: string | null
          created_at: string
          data_conclusao: string | null
          data_matricula: string | null
          frequencia_percentual: number | null
          id: string
          nota_final: number | null
          observacoes: string | null
          pessoa_id: string
          status: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_matricula?: string | null
          frequencia_percentual?: number | null
          id?: string
          nota_final?: number | null
          observacoes?: string | null
          pessoa_id: string
          status?: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_matricula?: string | null
          frequencia_percentual?: number | null
          id?: string
          nota_final?: number | null
          observacoes?: string | null
          pessoa_id?: string
          status?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas_ensino: {
        Row: {
          certificado_emitido: boolean | null
          certificado_url: string | null
          created_at: string
          data_conclusao: string | null
          data_matricula: string | null
          frequencia_percentual: number | null
          id: string
          nota_final: number | null
          observacoes: string | null
          pessoa_id: string
          status: string
          turma_id: string
          updated_at: string
        }
        Insert: {
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_matricula?: string | null
          frequencia_percentual?: number | null
          id?: string
          nota_final?: number | null
          observacoes?: string | null
          pessoa_id: string
          status?: string
          turma_id: string
          updated_at?: string
        }
        Update: {
          certificado_emitido?: boolean | null
          certificado_url?: string | null
          created_at?: string
          data_conclusao?: string | null
          data_matricula?: string | null
          frequencia_percentual?: number | null
          id?: string
          nota_final?: number | null
          observacoes?: string | null
          pessoa_id?: string
          status?: string
          turma_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_ensino_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriculas_ensino_turma_id_fkey"
            columns: ["turma_id"]
            isOneToOne: false
            referencedRelation: "turmas_ensino"
            referencedColumns: ["id"]
          },
        ]
      }
      membros: {
        Row: {
          atualizado_em: string | null
          cep: string | null
          cidade: string | null
          cpf: string | null
          criado_em: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          estado: string | null
          estado_civil: string | null
          foto: string | null
          funcao: string | null
          id: string
          membro_desde: string | null
          nome: string
          perfil_permissao_id: string | null
          sexo: string | null
          status: string | null
          telefone: string | null
          user_id: string | null
        }
        Insert: {
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto?: string | null
          funcao?: string | null
          id?: string
          membro_desde?: string | null
          nome: string
          perfil_permissao_id?: string | null
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Update: {
          atualizado_em?: string | null
          cep?: string | null
          cidade?: string | null
          cpf?: string | null
          criado_em?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          estado?: string | null
          estado_civil?: string | null
          foto?: string | null
          funcao?: string | null
          id?: string
          membro_desde?: string | null
          nome?: string
          perfil_permissao_id?: string | null
          sexo?: string | null
          status?: string | null
          telefone?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "membros_perfil_permissao_id_fkey"
            columns: ["perfil_permissao_id"]
            isOneToOne: false
            referencedRelation: "perfis_permissao"
            referencedColumns: ["id"]
          },
        ]
      }
      ministries: {
        Row: {
          church_id: string | null
          color: string | null
          contact_info: Json | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          leader_id: string | null
          location: string | null
          meeting_day: string | null
          meeting_time: string | null
          name: string
          requirements: string[] | null
          updated_at: string
        }
        Insert: {
          church_id?: string | null
          color?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          location?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name: string
          requirements?: string[] | null
          updated_at?: string
        }
        Update: {
          church_id?: string | null
          color?: string | null
          contact_info?: Json | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          leader_id?: string | null
          location?: string | null
          meeting_day?: string | null
          meeting_time?: string | null
          name?: string
          requirements?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ministries_leader_id_fkey"
            columns: ["leader_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      missoes: {
        Row: {
          ativa: boolean
          cidade: string | null
          contato_email: string | null
          contato_telefone: string | null
          created_at: string
          data_inicio: string | null
          descricao: string | null
          estado_provincia: string | null
          id: string
          igreja_responsavel_id: string | null
          membros_atual: number | null
          meta_membros: number | null
          nome: string
          observacoes: string | null
          orcamento_anual: number | null
          pais: string
          pastor_responsavel: string | null
          status: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cidade?: string | null
          contato_email?: string | null
          contato_telefone?: string | null
          created_at?: string
          data_inicio?: string | null
          descricao?: string | null
          estado_provincia?: string | null
          id?: string
          igreja_responsavel_id?: string | null
          membros_atual?: number | null
          meta_membros?: number | null
          nome: string
          observacoes?: string | null
          orcamento_anual?: number | null
          pais: string
          pastor_responsavel?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cidade?: string | null
          contato_email?: string | null
          contato_telefone?: string | null
          created_at?: string
          data_inicio?: string | null
          descricao?: string | null
          estado_provincia?: string | null
          id?: string
          igreja_responsavel_id?: string | null
          membros_atual?: number | null
          meta_membros?: number | null
          nome?: string
          observacoes?: string | null
          orcamento_anual?: number | null
          pais?: string
          pastor_responsavel?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      modulos_curso: {
        Row: {
          ativo: boolean | null
          created_at: string
          curso_id: string
          descricao: string | null
          duracao_estimada: number | null
          id: string
          nome: string
          objetivos: string[] | null
          ordem: number
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          curso_id: string
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          nome: string
          objetivos?: string[] | null
          ordem?: number
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          curso_id?: string
          descricao?: string | null
          duracao_estimada?: number | null
          id?: string
          nome?: string
          objetivos?: string[] | null
          ordem?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "modulos_curso_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      modulos_sistema: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      musicas_lista: {
        Row: {
          artista: string | null
          bpm: number | null
          cifra: string | null
          created_at: string
          id: string
          letra: string | null
          link_partitura: string | null
          link_playback: string | null
          link_video: string | null
          lista_id: string
          observacoes: string | null
          ordem: number
          tipo: string | null
          titulo: string
          tom_execucao: string | null
          tom_original: string | null
          updated_at: string
        }
        Insert: {
          artista?: string | null
          bpm?: number | null
          cifra?: string | null
          created_at?: string
          id?: string
          letra?: string | null
          link_partitura?: string | null
          link_playback?: string | null
          link_video?: string | null
          lista_id: string
          observacoes?: string | null
          ordem: number
          tipo?: string | null
          titulo: string
          tom_execucao?: string | null
          tom_original?: string | null
          updated_at?: string
        }
        Update: {
          artista?: string | null
          bpm?: number | null
          cifra?: string | null
          created_at?: string
          id?: string
          letra?: string | null
          link_partitura?: string | null
          link_playback?: string | null
          link_video?: string | null
          lista_id?: string
          observacoes?: string | null
          ordem?: number
          tipo?: string | null
          titulo?: string
          tom_execucao?: string | null
          tom_original?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "musicas_lista_lista_id_fkey"
            columns: ["lista_id"]
            isOneToOne: false
            referencedRelation: "listas_musicas"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_inscricoes: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          interesses: string | null
          nome: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          interesses?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          interesses?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          acao_requerida: boolean
          categoria: string
          conteudo: string
          created_at: string
          dados_contexto: Json | null
          id: string
          lida: boolean
          link_acao: string | null
          prioridade: number
          tipo: string
          titulo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          acao_requerida?: boolean
          categoria?: string
          conteudo: string
          created_at?: string
          dados_contexto?: Json | null
          id?: string
          lida?: boolean
          link_acao?: string | null
          prioridade?: number
          tipo?: string
          titulo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          acao_requerida?: boolean
          categoria?: string
          conteudo?: string
          created_at?: string
          dados_contexto?: Json | null
          id?: string
          lida?: boolean
          link_acao?: string | null
          prioridade?: number
          tipo?: string
          titulo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notificacoes_ensino: {
        Row: {
          created_at: string
          data_leitura: string | null
          destinatario_id: string | null
          id: string
          lida: boolean
          mensagem: string
          tipo: string
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_leitura?: string | null
          destinatario_id?: string | null
          id?: string
          lida?: boolean
          mensagem: string
          tipo?: string
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_leitura?: string | null
          destinatario_id?: string | null
          id?: string
          lida?: boolean
          mensagem?: string
          tipo?: string
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      notificacoes_usuarios: {
        Row: {
          acao_texto: string | null
          acao_url: string | null
          categoria: string
          created_at: string | null
          dados_extras: Json | null
          data_criacao: string | null
          data_leitura: string | null
          id: string
          lida: boolean | null
          mensagem: string
          tipo: string
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          acao_texto?: string | null
          acao_url?: string | null
          categoria?: string
          created_at?: string | null
          dados_extras?: Json | null
          data_criacao?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          tipo?: string
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          acao_texto?: string | null
          acao_url?: string | null
          categoria?: string
          created_at?: string | null
          dados_extras?: Json | null
          data_criacao?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          tipo?: string
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          celula_updates: boolean
          created_at: string
          ensino_updates: boolean
          evento_confirmations: boolean
          evento_reminders: boolean
          general_announcements: boolean
          id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          sound_enabled: boolean
          updated_at: string
          user_id: string
          vibration_enabled: boolean
        }
        Insert: {
          celula_updates?: boolean
          created_at?: string
          ensino_updates?: boolean
          evento_confirmations?: boolean
          evento_reminders?: boolean
          general_announcements?: boolean
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean
          updated_at?: string
          user_id: string
          vibration_enabled?: boolean
        }
        Update: {
          celula_updates?: boolean
          created_at?: string
          ensino_updates?: boolean
          evento_confirmations?: boolean
          evento_reminders?: boolean
          general_announcements?: boolean
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          sound_enabled?: boolean
          updated_at?: string
          user_id?: string
          vibration_enabled?: boolean
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          page_path: string
          referrer: string | null
          user_agent: string | null
          user_session: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          page_path: string
          referrer?: string | null
          user_agent?: string | null
          user_session: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          page_path?: string
          referrer?: string | null
          user_agent?: string | null
          user_session?: string
        }
        Relationships: []
      }
      paginas_editaveis: {
        Row: {
          ativa: boolean | null
          backup_elementos: Json | null
          created_at: string
          elementos: Json | null
          estilos: Json | null
          id: string
          nome: string
          rota: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          backup_elementos?: Json | null
          created_at?: string
          elementos?: Json | null
          estilos?: Json | null
          id?: string
          nome: string
          rota: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          backup_elementos?: Json | null
          created_at?: string
          elementos?: Json | null
          estilos?: Json | null
          id?: string
          nome?: string
          rota?: string
          updated_at?: string
        }
        Relationships: []
      }
      papeis_igreja: {
        Row: {
          ativo: boolean
          codigo: Database["public"]["Enums"]["papel_igreja"]
          created_at: string
          descricao: string | null
          id: string
          nivel_hierarquia: number
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          codigo: Database["public"]["Enums"]["papel_igreja"]
          created_at?: string
          descricao?: string | null
          id?: string
          nivel_hierarquia?: number
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          codigo?: Database["public"]["Enums"]["papel_igreja"]
          created_at?: string
          descricao?: string | null
          id?: string
          nivel_hierarquia?: number
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      participacao_eventos: {
        Row: {
          check_in_at: string | null
          created_at: string
          email: string
          evento_id: string
          id: string
          nome: string
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          check_in_at?: string | null
          created_at?: string
          email: string
          evento_id: string
          id?: string
          nome: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          check_in_at?: string | null
          created_at?: string
          email?: string
          evento_id?: string
          id?: string
          nome?: string
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participacao_eventos_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "eventos"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_celulas: {
        Row: {
          ativo: boolean | null
          celula_id: string
          created_at: string
          data_entrada: string | null
          email: string | null
          id: string
          nome: string
          status_espiritual: Json | null
          telefone: string | null
          tipo_participante: string | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          celula_id: string
          created_at?: string
          data_entrada?: string | null
          email?: string | null
          id?: string
          nome: string
          status_espiritual?: Json | null
          telefone?: string | null
          tipo_participante?: string | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          celula_id?: string
          created_at?: string
          data_entrada?: string | null
          email?: string | null
          id?: string
          nome?: string
          status_espiritual?: Json | null
          telefone?: string | null
          tipo_participante?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_celulas_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_ensaio: {
        Row: {
          created_at: string
          data_confirmacao: string | null
          ensaio_id: string
          id: string
          observacoes: string | null
          pessoa_id: string
          status_participacao: Database["public"]["Enums"]["status_participacao"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_confirmacao?: string | null
          ensaio_id: string
          id?: string
          observacoes?: string | null
          pessoa_id: string
          status_participacao?: Database["public"]["Enums"]["status_participacao"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_confirmacao?: string | null
          ensaio_id?: string
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          status_participacao?: Database["public"]["Enums"]["status_participacao"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_ensaio_ensaio_id_fkey"
            columns: ["ensaio_id"]
            isOneToOne: false
            referencedRelation: "ensaios_ministerio"
            referencedColumns: ["id"]
          },
        ]
      }
      participantes_escala: {
        Row: {
          created_at: string
          data_confirmacao: string | null
          data_convocacao: string
          data_presenca: string | null
          escala_id: string
          funcao: string
          id: string
          lembrete_enviado: boolean
          notificado: boolean
          observacoes: string | null
          pessoa_id: string
          status_participacao: Database["public"]["Enums"]["status_participacao"]
          substituido_por: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_confirmacao?: string | null
          data_convocacao?: string
          data_presenca?: string | null
          escala_id: string
          funcao: string
          id?: string
          lembrete_enviado?: boolean
          notificado?: boolean
          observacoes?: string | null
          pessoa_id: string
          status_participacao?: Database["public"]["Enums"]["status_participacao"]
          substituido_por?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_confirmacao?: string | null
          data_convocacao?: string
          data_presenca?: string | null
          escala_id?: string
          funcao?: string
          id?: string
          lembrete_enviado?: boolean
          notificado?: boolean
          observacoes?: string | null
          pessoa_id?: string
          status_participacao?: Database["public"]["Enums"]["status_participacao"]
          substituido_por?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "participantes_escala_escala_id_fkey"
            columns: ["escala_id"]
            isOneToOne: false
            referencedRelation: "escalas_ministerio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "participantes_escala_substituido_por_fkey"
            columns: ["substituido_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      passkey_credentials: {
        Row: {
          backup_eligible: boolean | null
          backup_state: boolean | null
          counter: number
          created_at: string
          credential_id: string
          device_name: string | null
          device_type: string | null
          id: string
          last_used_at: string | null
          public_key: string
          transports: string[] | null
          user_id: string
        }
        Insert: {
          backup_eligible?: boolean | null
          backup_state?: boolean | null
          counter?: number
          created_at?: string
          credential_id: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key: string
          transports?: string[] | null
          user_id: string
        }
        Update: {
          backup_eligible?: boolean | null
          backup_state?: boolean | null
          counter?: number
          created_at?: string
          credential_id?: string
          device_name?: string | null
          device_type?: string | null
          id?: string
          last_used_at?: string | null
          public_key?: string
          transports?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      pastores_missoes: {
        Row: {
          ativo: boolean
          created_at: string
          data_ordenacao: string | null
          email: string
          id: string
          missao_id: string
          nome: string
          papel: string
          telefone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          data_ordenacao?: string | null
          email: string
          id?: string
          missao_id: string
          nome: string
          papel?: string
          telefone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          data_ordenacao?: string | null
          email?: string
          id?: string
          missao_id?: string
          nome?: string
          papel?: string
          telefone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pastores_missoes_missao_id_fkey"
            columns: ["missao_id"]
            isOneToOne: false
            referencedRelation: "missoes"
            referencedColumns: ["id"]
          },
        ]
      }
      patrimonios: {
        Row: {
          ativo: boolean
          categoria_id: string
          codigo_patrimonio: string | null
          created_at: string
          data_aquisicao: string | null
          data_proxima_manutencao: string | null
          data_ultima_manutencao: string | null
          descricao: string | null
          documentos: Json | null
          estado_conservacao: string
          fotos: Json | null
          id: string
          link_externo: string | null
          localizacao_atual: string | null
          ministerio_relacionado: string | null
          nome: string
          nota_fiscal_url: string | null
          observacoes: string | null
          quantidade: number
          responsavel_id: string | null
          status: string
          subcategoria_id: string | null
          updated_at: string
          valor_total: number | null
          valor_unitario: number | null
        }
        Insert: {
          ativo?: boolean
          categoria_id: string
          codigo_patrimonio?: string | null
          created_at?: string
          data_aquisicao?: string | null
          data_proxima_manutencao?: string | null
          data_ultima_manutencao?: string | null
          descricao?: string | null
          documentos?: Json | null
          estado_conservacao?: string
          fotos?: Json | null
          id?: string
          link_externo?: string | null
          localizacao_atual?: string | null
          ministerio_relacionado?: string | null
          nome: string
          nota_fiscal_url?: string | null
          observacoes?: string | null
          quantidade?: number
          responsavel_id?: string | null
          status?: string
          subcategoria_id?: string | null
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Update: {
          ativo?: boolean
          categoria_id?: string
          codigo_patrimonio?: string | null
          created_at?: string
          data_aquisicao?: string | null
          data_proxima_manutencao?: string | null
          data_ultima_manutencao?: string | null
          descricao?: string | null
          documentos?: Json | null
          estado_conservacao?: string
          fotos?: Json | null
          id?: string
          link_externo?: string | null
          localizacao_atual?: string | null
          ministerio_relacionado?: string | null
          nome?: string
          nota_fiscal_url?: string | null
          observacoes?: string | null
          quantidade?: number
          responsavel_id?: string | null
          status?: string
          subcategoria_id?: string | null
          updated_at?: string
          valor_total?: number | null
          valor_unitario?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "patrimonios_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_patrimonio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonios_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patrimonios_subcategoria_id_fkey"
            columns: ["subcategoria_id"]
            isOneToOne: false
            referencedRelation: "subcategorias_patrimonio"
            referencedColumns: ["id"]
          },
        ]
      }
      pedidos_oracao: {
        Row: {
          categoria: string
          created_at: string
          email: string | null
          id: string
          nome: string
          pedido: string
          publico: boolean
          status: string
          telefone: string | null
          updated_at: string
          urgencia: string
        }
        Insert: {
          categoria?: string
          created_at?: string
          email?: string | null
          id?: string
          nome: string
          pedido: string
          publico?: boolean
          status?: string
          telefone?: string | null
          updated_at?: string
          urgencia?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string
          pedido?: string
          publico?: boolean
          status?: string
          telefone?: string | null
          updated_at?: string
          urgencia?: string
        }
        Relationships: []
      }
      perfil_permissoes: {
        Row: {
          concedida: boolean | null
          created_at: string
          id: string
          perfil_id: string
          permissao_id: string
        }
        Insert: {
          concedida?: boolean | null
          created_at?: string
          id?: string
          perfil_id: string
          permissao_id: string
        }
        Update: {
          concedida?: boolean | null
          created_at?: string
          id?: string
          perfil_id?: string
          permissao_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "perfil_permissoes_perfil_id_fkey"
            columns: ["perfil_id"]
            isOneToOne: false
            referencedRelation: "perfis_permissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfil_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis_permissao: {
        Row: {
          ativo: boolean | null
          created_at: string
          descricao: string | null
          id: string
          is_super_admin: boolean | null
          nome: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          is_super_admin?: boolean | null
          nome: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          descricao?: string | null
          id?: string
          is_super_admin?: boolean | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean
          resource_type: string | null
          subject: string
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          resource_type?: string | null
          subject: string
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          resource_type?: string | null
          subject?: string
        }
        Relationships: []
      }
      permissoes: {
        Row: {
          acao_id: string
          codigo: string
          created_at: string
          descricao: string | null
          funcionalidade_id: string
          id: string
          nome: string
        }
        Insert: {
          acao_id: string
          codigo: string
          created_at?: string
          descricao?: string | null
          funcionalidade_id: string
          id?: string
          nome: string
        }
        Update: {
          acao_id?: string
          codigo?: string
          created_at?: string
          descricao?: string | null
          funcionalidade_id?: string
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_acao_id_fkey"
            columns: ["acao_id"]
            isOneToOne: false
            referencedRelation: "acoes_permissao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissoes_funcionalidade_id_fkey"
            columns: ["funcionalidade_id"]
            isOneToOne: false
            referencedRelation: "funcionalidades_modulo"
            referencedColumns: ["id"]
          },
        ]
      }
      permissoes_sistema: {
        Row: {
          acao: Database["public"]["Enums"]["acao_permissao"]
          ativo: boolean
          condicoes: Json | null
          created_at: string
          id: string
          modulo_id: string | null
          papel_id: string | null
        }
        Insert: {
          acao: Database["public"]["Enums"]["acao_permissao"]
          ativo?: boolean
          condicoes?: Json | null
          created_at?: string
          id?: string
          modulo_id?: string | null
          papel_id?: string | null
        }
        Update: {
          acao?: Database["public"]["Enums"]["acao_permissao"]
          ativo?: boolean
          condicoes?: Json | null
          created_at?: string
          id?: string
          modulo_id?: string | null
          papel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "permissoes_sistema_modulo_id_fkey"
            columns: ["modulo_id"]
            isOneToOne: false
            referencedRelation: "modulos_sistema"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "permissoes_sistema_papel_id_fkey"
            columns: ["papel_id"]
            isOneToOne: false
            referencedRelation: "papeis_igreja"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas: {
        Row: {
          aulas_concluidas: number | null
          cargo_funcao: string | null
          celula_atual_id: string | null
          celula_id: string | null
          cep: string | null
          congregacao_id: string | null
          cpf: string | null
          created_at: string
          data_batismo: string | null
          data_conversao: string | null
          data_inicio_discipulado: string | null
          data_nascimento: string | null
          data_primeira_visita: string | null
          discipulador_id: string | null
          discipulando_ids: string[] | null
          email: string | null
          endereco_bairro: string | null
          endereco_cidade: string | null
          endereco_complemento: string | null
          endereco_numero: string | null
          endereco_rua: string | null
          endereco_uf: string | null
          escolaridade: string | null
          estado_civil: string | null
          estado_espiritual: string
          facebook: string | null
          foto_url: string | null
          id: string
          igreja_id: string
          instagram: string | null
          linkedin: string | null
          medalhas: string[] | null
          ministerio_atuacao: string[] | null
          nivel_lideranca: string | null
          nome_completo: string
          observacoes_pastorais: string | null
          papel_igreja: Database["public"]["Enums"]["papel_igreja"] | null
          papel_na_celula: string | null
          pontuacao_gamificada: number | null
          profile_id: string | null
          profissao: string | null
          pronto_para_liderar: boolean | null
          ranking_na_celula: number | null
          recebido_por_id: string | null
          rg: string | null
          sexo: string | null
          situacao: string
          status_discipulado: string | null
          status_formacao: string | null
          tags_pastorais: string[] | null
          telefone_celular: string | null
          telefone_residencial: string | null
          telefone_whatsapp: string | null
          tipo_pessoa: string
          ultimo_acesso_portal: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aulas_concluidas?: number | null
          cargo_funcao?: string | null
          celula_atual_id?: string | null
          celula_id?: string | null
          cep?: string | null
          congregacao_id?: string | null
          cpf?: string | null
          created_at?: string
          data_batismo?: string | null
          data_conversao?: string | null
          data_inicio_discipulado?: string | null
          data_nascimento?: string | null
          data_primeira_visita?: string | null
          discipulador_id?: string | null
          discipulando_ids?: string[] | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          endereco_uf?: string | null
          escolaridade?: string | null
          estado_civil?: string | null
          estado_espiritual?: string
          facebook?: string | null
          foto_url?: string | null
          id?: string
          igreja_id: string
          instagram?: string | null
          linkedin?: string | null
          medalhas?: string[] | null
          ministerio_atuacao?: string[] | null
          nivel_lideranca?: string | null
          nome_completo: string
          observacoes_pastorais?: string | null
          papel_igreja?: Database["public"]["Enums"]["papel_igreja"] | null
          papel_na_celula?: string | null
          pontuacao_gamificada?: number | null
          profile_id?: string | null
          profissao?: string | null
          pronto_para_liderar?: boolean | null
          ranking_na_celula?: number | null
          recebido_por_id?: string | null
          rg?: string | null
          sexo?: string | null
          situacao?: string
          status_discipulado?: string | null
          status_formacao?: string | null
          tags_pastorais?: string[] | null
          telefone_celular?: string | null
          telefone_residencial?: string | null
          telefone_whatsapp?: string | null
          tipo_pessoa?: string
          ultimo_acesso_portal?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aulas_concluidas?: number | null
          cargo_funcao?: string | null
          celula_atual_id?: string | null
          celula_id?: string | null
          cep?: string | null
          congregacao_id?: string | null
          cpf?: string | null
          created_at?: string
          data_batismo?: string | null
          data_conversao?: string | null
          data_inicio_discipulado?: string | null
          data_nascimento?: string | null
          data_primeira_visita?: string | null
          discipulador_id?: string | null
          discipulando_ids?: string[] | null
          email?: string | null
          endereco_bairro?: string | null
          endereco_cidade?: string | null
          endereco_complemento?: string | null
          endereco_numero?: string | null
          endereco_rua?: string | null
          endereco_uf?: string | null
          escolaridade?: string | null
          estado_civil?: string | null
          estado_espiritual?: string
          facebook?: string | null
          foto_url?: string | null
          id?: string
          igreja_id?: string
          instagram?: string | null
          linkedin?: string | null
          medalhas?: string[] | null
          ministerio_atuacao?: string[] | null
          nivel_lideranca?: string | null
          nome_completo?: string
          observacoes_pastorais?: string | null
          papel_igreja?: Database["public"]["Enums"]["papel_igreja"] | null
          papel_na_celula?: string | null
          pontuacao_gamificada?: number | null
          profile_id?: string | null
          profissao?: string | null
          pronto_para_liderar?: boolean | null
          ranking_na_celula?: number | null
          recebido_por_id?: string | null
          rg?: string | null
          sexo?: string | null
          situacao?: string
          status_discipulado?: string | null
          status_formacao?: string | null
          tags_pastorais?: string[] | null
          telefone_celular?: string | null
          telefone_residencial?: string | null
          telefone_whatsapp?: string | null
          tipo_pessoa?: string
          ultimo_acesso_portal?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_celula_atual_id_fkey"
            columns: ["celula_atual_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_congregacao_id_fkey"
            columns: ["congregacao_id"]
            isOneToOne: false
            referencedRelation: "congregacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_recebido_por_id_fkey"
            columns: ["recebido_por_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      pessoas_certificados: {
        Row: {
          certificado_id: string
          created_at: string
          data_emissao: string
          id: string
          pessoa_id: string
          url_certificado: string | null
        }
        Insert: {
          certificado_id: string
          created_at?: string
          data_emissao?: string
          id?: string
          pessoa_id: string
          url_certificado?: string | null
        }
        Update: {
          certificado_id?: string
          created_at?: string
          data_emissao?: string
          id?: string
          pessoa_id?: string
          url_certificado?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pessoas_certificados_certificado_id_fkey"
            columns: ["certificado_id"]
            isOneToOne: false
            referencedRelation: "certificados"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pessoas_certificados_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas: {
        Row: {
          aula_id: string
          created_at: string
          id: string
          justificativa: string | null
          matricula_id: string
          presente: boolean
        }
        Insert: {
          aula_id: string
          created_at?: string
          id?: string
          justificativa?: string | null
          matricula_id: string
          presente?: boolean
        }
        Update: {
          aula_id?: string
          created_at?: string
          id?: string
          justificativa?: string | null
          matricula_id?: string
          presente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "presencas_aula_id_fkey"
            columns: ["aula_id"]
            isOneToOne: false
            referencedRelation: "aulas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas_aula: {
        Row: {
          created_at: string
          data_aula: string
          id: string
          justificativa: string | null
          matricula_id: string
          presente: boolean
        }
        Insert: {
          created_at?: string
          data_aula: string
          id?: string
          justificativa?: string | null
          matricula_id: string
          presente?: boolean
        }
        Update: {
          created_at?: string
          data_aula?: string
          id?: string
          justificativa?: string | null
          matricula_id?: string
          presente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "presencas_aula_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "matriculas_ensino"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas_celula: {
        Row: {
          created_at: string
          id: string
          observacoes: string | null
          pessoa_id: string
          presente: boolean
          relatorio_id: string
          tipo_participacao: string
        }
        Insert: {
          created_at?: string
          id?: string
          observacoes?: string | null
          pessoa_id: string
          presente?: boolean
          relatorio_id: string
          tipo_participacao?: string
        }
        Update: {
          created_at?: string
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          presente?: boolean
          relatorio_id?: string
          tipo_participacao?: string
        }
        Relationships: [
          {
            foreignKeyName: "presencas_celula_relatorio_id_fkey"
            columns: ["relatorio_id"]
            isOneToOne: false
            referencedRelation: "relatorios_celula"
            referencedColumns: ["id"]
          },
        ]
      }
      privacy_consents: {
        Row: {
          consent_type: string
          consent_version: string
          created_at: string
          granted: boolean
          granted_at: string | null
          id: string
          ip_address: unknown | null
          revoked_at: string | null
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          consent_type: string
          consent_version?: string
          created_at?: string
          granted: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          revoked_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          consent_type?: string
          consent_version?: string
          created_at?: string
          granted?: boolean
          granted_at?: string | null
          id?: string
          ip_address?: unknown | null
          revoked_at?: string | null
          updated_at?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      professor_disponibilidade: {
        Row: {
          created_at: string
          dia_semana: string
          disponivel: boolean
          horario_fim: string
          horario_inicio: string
          id: string
          observacoes: string | null
          professor_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dia_semana: string
          disponivel?: boolean
          horario_fim: string
          horario_inicio: string
          id?: string
          observacoes?: string | null
          professor_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dia_semana?: string
          disponivel?: boolean
          horario_fim?: string
          horario_inicio?: string
          id?: string
          observacoes?: string | null
          professor_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_permissions: {
        Row: {
          granted: boolean
          granted_at: string
          granted_by: string | null
          id: string
          permission_id: string
          profile_id: string
        }
        Insert: {
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id: string
          profile_id: string
        }
        Update: {
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          color: string
          created_at: string
          description: string | null
          display_name: string
          icon: string
          id: string
          is_system: boolean
          level: number
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          description?: string | null
          display_name: string
          icon?: string
          id?: string
          is_system?: boolean
          level?: number
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string
          id?: string
          is_system?: boolean
          level?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      programacao_cultos: {
        Row: {
          ativo: boolean
          cor_tema: string | null
          created_at: string
          criado_por: string
          data_culto: string
          id: string
          igreja_id: string
          local: string | null
          observacoes: string | null
          tema_culto: string | null
          tipo_culto: Database["public"]["Enums"]["tipo_culto"]
          titulo: string
          updated_at: string
          versiculo_base: string | null
        }
        Insert: {
          ativo?: boolean
          cor_tema?: string | null
          created_at?: string
          criado_por: string
          data_culto: string
          id?: string
          igreja_id: string
          local?: string | null
          observacoes?: string | null
          tema_culto?: string | null
          tipo_culto: Database["public"]["Enums"]["tipo_culto"]
          titulo: string
          updated_at?: string
          versiculo_base?: string | null
        }
        Update: {
          ativo?: boolean
          cor_tema?: string | null
          created_at?: string
          criado_por?: string
          data_culto?: string
          id?: string
          igreja_id?: string
          local?: string | null
          observacoes?: string | null
          tema_culto?: string | null
          tipo_culto?: Database["public"]["Enums"]["tipo_culto"]
          titulo?: string
          updated_at?: string
          versiculo_base?: string | null
        }
        Relationships: []
      }
      progresso_curso: {
        Row: {
          created_at: string
          curso_id: string
          data_inicio: string | null
          data_ultima_atividade: string | null
          id: string
          licao_atual_id: string | null
          licoes_concluidas: number | null
          modulo_atual_id: string | null
          percentual_conclusao: number | null
          pessoa_id: string
          pontos_totais: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          curso_id: string
          data_inicio?: string | null
          data_ultima_atividade?: string | null
          id?: string
          licao_atual_id?: string | null
          licoes_concluidas?: number | null
          modulo_atual_id?: string | null
          percentual_conclusao?: number | null
          pessoa_id: string
          pontos_totais?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          curso_id?: string
          data_inicio?: string | null
          data_ultima_atividade?: string | null
          id?: string
          licao_atual_id?: string | null
          licoes_concluidas?: number | null
          modulo_atual_id?: string | null
          percentual_conclusao?: number | null
          pessoa_id?: string
          pontos_totais?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_curso_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_curso_licao_atual_id_fkey"
            columns: ["licao_atual_id"]
            isOneToOne: false
            referencedRelation: "licoes_modulo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_curso_modulo_atual_id_fkey"
            columns: ["modulo_atual_id"]
            isOneToOne: false
            referencedRelation: "modulos_curso"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_curso_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_trilha_formacao: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          etapa_atual: number | null
          id: string
          observacoes: string | null
          pessoa_id: string
          status: string
          trilha_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa_atual?: number | null
          id?: string
          observacoes?: string | null
          pessoa_id: string
          status?: string
          trilha_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa_atual?: number | null
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          status?: string
          trilha_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_trilha_formacao_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_trilha_formacao_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas_formacao"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_trilhas: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_inicio: string | null
          etapa_atual: number | null
          id: string
          observacoes: string | null
          pessoa_id: string
          status: string | null
          trilha_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa_atual?: number | null
          id?: string
          observacoes?: string | null
          pessoa_id: string
          status?: string | null
          trilha_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string | null
          etapa_atual?: number | null
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          status?: string | null
          trilha_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_trilhas_pessoa_id_fkey"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "progresso_trilhas_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas_formacao"
            referencedColumns: ["id"]
          },
        ]
      }
      progresso_trilhas_dna: {
        Row: {
          created_at: string
          data_conclusao: string | null
          data_inicio: string
          discipulador_id: string | null
          etapa_atual: number
          etapas_concluidas: Json
          id: string
          observacoes: string | null
          pessoa_id: string
          status: string
          trilha_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string
          discipulador_id?: string | null
          etapa_atual?: number
          etapas_concluidas?: Json
          id?: string
          observacoes?: string | null
          pessoa_id: string
          status?: string
          trilha_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string
          discipulador_id?: string | null
          etapa_atual?: number
          etapas_concluidas?: Json
          id?: string
          observacoes?: string | null
          pessoa_id?: string
          status?: string
          trilha_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_trilhas_dna_trilha_id_fkey"
            columns: ["trilha_id"]
            isOneToOne: false
            referencedRelation: "trilhas_dna"
            referencedColumns: ["id"]
          },
        ]
      }
      recursos_ministerio: {
        Row: {
          created_at: string
          descricao: string | null
          disponivel: boolean
          id: string
          localizacao: string | null
          nome: string
          observacoes: string | null
          responsavel_id: string | null
          tipo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          localizacao?: string | null
          nome: string
          observacoes?: string | null
          responsavel_id?: string | null
          tipo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          disponivel?: boolean
          id?: string
          localizacao?: string | null
          nome?: string
          observacoes?: string | null
          responsavel_id?: string | null
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recursos_ministerio_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      redes_celulas: {
        Row: {
          ativa: boolean | null
          coordenador_id: string | null
          cor: string | null
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          coordenador_id?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          coordenador_id?: string | null
          cor?: string | null
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      redes_ministerios: {
        Row: {
          ativa: boolean
          cor: string
          created_at: string
          descricao: string | null
          id: string
          lider_responsavel: string | null
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          lider_responsavel?: string | null
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          cor?: string
          created_at?: string
          descricao?: string | null
          id?: string
          lider_responsavel?: string | null
          nome?: string
          updated_at?: string
        }
        Relationships: []
      }
      relacionamentos_familiares: {
        Row: {
          created_at: string
          id: string
          parente_id: string
          pessoa_id: string
          tipo_relacionamento: string
        }
        Insert: {
          created_at?: string
          id?: string
          parente_id: string
          pessoa_id: string
          tipo_relacionamento: string
        }
        Update: {
          created_at?: string
          id?: string
          parente_id?: string
          pessoa_id?: string
          tipo_relacionamento?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_relacionamentos_parente"
            columns: ["parente_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_relacionamentos_pessoa"
            columns: ["pessoa_id"]
            isOneToOne: false
            referencedRelation: "membros"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios: {
        Row: {
          celula_id: string | null
          created_at: string | null
          criancas: number | null
          data_reuniao: string
          decisoes: number | null
          discipulados_iniciados: number | null
          id: string
          observacoes: string | null
          palavra_chave: string | null
          preenchido_por: string | null
          total_presentes: number | null
          updated_at: string | null
          visitantes: number | null
        }
        Insert: {
          celula_id?: string | null
          created_at?: string | null
          criancas?: number | null
          data_reuniao: string
          decisoes?: number | null
          discipulados_iniciados?: number | null
          id?: string
          observacoes?: string | null
          palavra_chave?: string | null
          preenchido_por?: string | null
          total_presentes?: number | null
          updated_at?: string | null
          visitantes?: number | null
        }
        Update: {
          celula_id?: string | null
          created_at?: string | null
          criancas?: number | null
          data_reuniao?: string
          decisoes?: number | null
          discipulados_iniciados?: number | null
          id?: string
          observacoes?: string | null
          palavra_chave?: string | null
          preenchido_por?: string | null
          total_presentes?: number | null
          updated_at?: string | null
          visitantes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_celula: {
        Row: {
          atividades_realizadas: string[] | null
          celula_id: string
          created_at: string
          criancas: number
          data_reuniao: string
          decisoes: number
          estudo_aplicado: string | null
          id: string
          observacoes: string | null
          ofertas: number | null
          presentes: number
          proximos_passos: string | null
          relator_id: string | null
          tipo_reuniao: string
          updated_at: string
          visitantes: number
        }
        Insert: {
          atividades_realizadas?: string[] | null
          celula_id: string
          created_at?: string
          criancas?: number
          data_reuniao: string
          decisoes?: number
          estudo_aplicado?: string | null
          id?: string
          observacoes?: string | null
          ofertas?: number | null
          presentes?: number
          proximos_passos?: string | null
          relator_id?: string | null
          tipo_reuniao?: string
          updated_at?: string
          visitantes?: number
        }
        Update: {
          atividades_realizadas?: string[] | null
          celula_id?: string
          created_at?: string
          criancas?: number
          data_reuniao?: string
          decisoes?: number
          estudo_aplicado?: string | null
          id?: string
          observacoes?: string | null
          ofertas?: number | null
          presentes?: number
          proximos_passos?: string | null
          relator_id?: string | null
          tipo_reuniao?: string
          updated_at?: string
          visitantes?: number
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_celula_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_semanais_celulas: {
        Row: {
          batismos_agendados: number | null
          celula_id: string
          created_at: string
          data_reuniao: string
          decisoes_cristo: number | null
          foto_url: string | null
          id: string
          motivos_oracao: string | null
          oferta_arrecadada: number | null
          palavra_ministrada: string | null
          presencas: Json | null
          status: string | null
          updated_at: string
          visitantes: Json | null
        }
        Insert: {
          batismos_agendados?: number | null
          celula_id: string
          created_at?: string
          data_reuniao: string
          decisoes_cristo?: number | null
          foto_url?: string | null
          id?: string
          motivos_oracao?: string | null
          oferta_arrecadada?: number | null
          palavra_ministrada?: string | null
          presencas?: Json | null
          status?: string | null
          updated_at?: string
          visitantes?: Json | null
        }
        Update: {
          batismos_agendados?: number | null
          celula_id?: string
          created_at?: string
          data_reuniao?: string
          decisoes_cristo?: number | null
          foto_url?: string | null
          id?: string
          motivos_oracao?: string | null
          oferta_arrecadada?: number | null
          palavra_ministrada?: string | null
          presencas?: Json | null
          status?: string | null
          updated_at?: string
          visitantes?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_semanais_celulas_celula_id_fkey"
            columns: ["celula_id"]
            isOneToOne: false
            referencedRelation: "celulas"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas_espacos: {
        Row: {
          created_at: string
          data_fim: string
          data_inicio: string
          email_responsavel: string
          espaco_id: string
          evento_titulo: string
          id: string
          nome_responsavel: string
          observacoes: string | null
          status: string
          telefone_responsavel: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim: string
          data_inicio: string
          email_responsavel: string
          espaco_id: string
          evento_titulo: string
          id?: string
          nome_responsavel: string
          observacoes?: string | null
          status?: string
          telefone_responsavel?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string
          data_inicio?: string
          email_responsavel?: string
          espaco_id?: string
          evento_titulo?: string
          id?: string
          nome_responsavel?: string
          observacoes?: string | null
          status?: string
          telefone_responsavel?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_espacos_espaco_id_fkey"
            columns: ["espaco_id"]
            isOneToOne: false
            referencedRelation: "espacos"
            referencedColumns: ["id"]
          },
        ]
      }
      reservas_recursos: {
        Row: {
          created_at: string
          data_reserva: string
          id: string
          observacoes: string | null
          programacao_culto_id: string
          recurso_id: string
          reservado_por: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_reserva?: string
          id?: string
          observacoes?: string | null
          programacao_culto_id: string
          recurso_id: string
          reservado_por: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_reserva?: string
          id?: string
          observacoes?: string | null
          programacao_culto_id?: string
          recurso_id?: string
          reservado_por?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservas_recursos_programacao_culto_id_fkey"
            columns: ["programacao_culto_id"]
            isOneToOne: false
            referencedRelation: "programacao_cultos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_recursos_recurso_id_fkey"
            columns: ["recurso_id"]
            isOneToOne: false
            referencedRelation: "recursos_ministerio"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservas_recursos_reservado_por_fkey"
            columns: ["reservado_por"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      security_active_sessions: {
        Row: {
          created_at: string
          device_type: string | null
          expires_at: string
          id: string
          ip_address: unknown | null
          is_active: boolean
          last_activity: string
          location: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type?: string | null
          expires_at: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          location?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: unknown | null
          is_active?: boolean
          last_activity?: string
          location?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_audit_logs: {
        Row: {
          action: string
          error_message: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          session_id: string | null
          severity: string
          success: boolean
          timestamp: string
          user_agent: string | null
          user_email: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          session_id?: string | null
          severity?: string
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          session_id?: string | null
          severity?: string
          success?: boolean
          timestamp?: string
          user_agent?: string | null
          user_email?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          ip_address: unknown | null
          location_data: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown | null
          location_data?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      security_notifications: {
        Row: {
          created_at: string
          id: string
          notification_type: string
          recipient: string
          security_event_id: string | null
          sent_at: string | null
          status: string
          template_used: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_type: string
          recipient: string
          security_event_id?: string | null
          sent_at?: string | null
          status?: string
          template_used: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_type?: string
          recipient?: string
          security_event_id?: string | null
          sent_at?: string | null
          status?: string
          template_used?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_notifications_security_event_id_fkey"
            columns: ["security_event_id"]
            isOneToOne: false
            referencedRelation: "security_events"
            referencedColumns: ["id"]
          },
        ]
      }
      security_permissions: {
        Row: {
          action_name: string
          created_at: string
          description: string | null
          id: string
          is_sensitive: boolean
          module_name: string
          resource_type: string | null
        }
        Insert: {
          action_name: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          module_name: string
          resource_type?: string | null
        }
        Update: {
          action_name?: string
          created_at?: string
          description?: string | null
          id?: string
          is_sensitive?: boolean
          module_name?: string
          resource_type?: string | null
        }
        Relationships: []
      }
      security_profile_permissions: {
        Row: {
          conditions: Json | null
          granted: boolean
          granted_at: string
          granted_by: string | null
          id: string
          permission_id: string
          profile_id: string
        }
        Insert: {
          conditions?: Json | null
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id: string
          profile_id: string
        }
        Update: {
          conditions?: Json | null
          granted?: boolean
          granted_at?: string
          granted_by?: string | null
          id?: string
          permission_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_profile_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "security_permissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "security_profile_permissions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "security_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      security_profiles: {
        Row: {
          active: boolean
          color: string
          created_at: string
          created_by: string | null
          description: string | null
          display_name: string
          icon: string
          id: string
          is_system: boolean
          level: number
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name: string
          icon?: string
          id?: string
          is_system?: boolean
          level?: number
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          color?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_name?: string
          icon?: string
          id?: string
          is_system?: boolean
          level?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      security_user_profiles: {
        Row: {
          active: boolean
          assigned_at: string
          assigned_by: string | null
          expires_at: string | null
          id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          profile_id: string
          user_id: string
        }
        Update: {
          active?: boolean
          assigned_at?: string
          assigned_by?: string | null
          expires_at?: string | null
          id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "security_user_profiles_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "security_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_cache: {
        Row: {
          created_at: string | null
          expires_at: string | null
          id: string
          result: Json
          slug: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          result: Json
          slug: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          id?: string
          result?: Json
          slug?: string
        }
        Relationships: []
      }
      seo_logs: {
        Row: {
          error_message: string | null
          id: string
          slug: string
          success: boolean | null
          timestamp: string | null
          uid: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          slug: string
          success?: boolean | null
          timestamp?: string | null
          uid?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          slug?: string
          success?: boolean | null
          timestamp?: string | null
          uid?: string | null
        }
        Relationships: []
      }
      service_opportunities: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          is_urgent: boolean | null
          ministry_id: string
          preferred_skills: string[] | null
          required_skills: string[] | null
          schedule_details: string | null
          slots_filled: number | null
          slots_needed: number | null
          time_commitment: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_urgent?: boolean | null
          ministry_id: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          schedule_details?: string | null
          slots_filled?: number | null
          slots_needed?: number | null
          time_commitment?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          is_urgent?: boolean | null
          ministry_id?: string
          preferred_skills?: string[] | null
          required_skills?: string[] | null
          schedule_details?: string | null
          slots_filled?: number | null
          slots_needed?: number | null
          time_commitment?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_opportunities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_opportunities_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      service_schedule_volunteers: {
        Row: {
          confirmed_at: string | null
          created_at: string
          id: string
          notes: string | null
          role: string
          schedule_id: string
          status: string | null
          substitute_for: string | null
          updated_at: string
          volunteer_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          role: string
          schedule_id: string
          status?: string | null
          substitute_for?: string | null
          updated_at?: string
          volunteer_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          role?: string
          schedule_id?: string
          status?: string | null
          substitute_for?: string | null
          updated_at?: string
          volunteer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_schedule_volunteers_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "service_schedules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_schedule_volunteers_substitute_for_fkey"
            columns: ["substitute_for"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_schedule_volunteers_volunteer_id_fkey"
            columns: ["volunteer_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      service_schedules: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          ministry_id: string
          notes: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          ministry_id: string
          notes?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          ministry_id?: string
          notes?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_schedules_ministry_id_fkey"
            columns: ["ministry_id"]
            isOneToOne: false
            referencedRelation: "ministries"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategorias_financeiras: {
        Row: {
          ativa: boolean | null
          categoria_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          categoria_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          categoria_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategorias_financeiras_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategorias_patrimonio: {
        Row: {
          ativa: boolean
          categoria_id: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          categoria_id: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          categoria_id?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategorias_patrimonio_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_patrimonio"
            referencedColumns: ["id"]
          },
        ]
      }
      templates_site: {
        Row: {
          ai_gerado: boolean | null
          ativo: boolean | null
          categoria: string
          codigo: string
          created_at: string
          descricao: string | null
          id: string
          nome: string
          preview: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          ai_gerado?: boolean | null
          ativo?: boolean | null
          categoria?: string
          codigo: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome: string
          preview?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          ai_gerado?: boolean | null
          ativo?: boolean | null
          categoria?: string
          codigo?: string
          created_at?: string
          descricao?: string | null
          id?: string
          nome?: string
          preview?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      trilhas_dna: {
        Row: {
          ativa: boolean
          certificado_template: string | null
          created_at: string
          descricao: string | null
          etapas: Json
          id: string
          nome: string
          ordem: number
          pre_requisitos: string[] | null
          tipo: string
          updated_at: string
        }
        Insert: {
          ativa?: boolean
          certificado_template?: string | null
          created_at?: string
          descricao?: string | null
          etapas?: Json
          id?: string
          nome: string
          ordem?: number
          pre_requisitos?: string[] | null
          tipo: string
          updated_at?: string
        }
        Update: {
          ativa?: boolean
          certificado_template?: string | null
          created_at?: string
          descricao?: string | null
          etapas?: Json
          id?: string
          nome?: string
          ordem?: number
          pre_requisitos?: string[] | null
          tipo?: string
          updated_at?: string
        }
        Relationships: []
      }
      trilhas_formacao: {
        Row: {
          ativa: boolean | null
          created_at: string
          cursos_sequencia: Json
          descricao: string | null
          id: string
          nome: string
          publico_alvo: string[] | null
          updated_at: string
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string
          cursos_sequencia?: Json
          descricao?: string | null
          id?: string
          nome: string
          publico_alvo?: string[] | null
          updated_at?: string
        }
        Update: {
          ativa?: boolean | null
          created_at?: string
          cursos_sequencia?: Json
          descricao?: string | null
          id?: string
          nome?: string
          publico_alvo?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      turmas: {
        Row: {
          capacidade_maxima: number | null
          created_at: string
          curso_id: string
          data_fim: string
          data_inicio: string
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id: string
          link_online: string | null
          local: string | null
          nome: string
          observacoes: string | null
          professor_responsavel: string
          status: string | null
          updated_at: string
        }
        Insert: {
          capacidade_maxima?: number | null
          created_at?: string
          curso_id: string
          data_fim: string
          data_inicio: string
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id?: string
          link_online?: string | null
          local?: string | null
          nome: string
          observacoes?: string | null
          professor_responsavel: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          capacidade_maxima?: number | null
          created_at?: string
          curso_id?: string
          data_fim?: string
          data_inicio?: string
          dias_semana?: string[]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          link_online?: string | null
          local?: string | null
          nome?: string
          observacoes?: string | null
          professor_responsavel?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos"
            referencedColumns: ["id"]
          },
        ]
      }
      turmas_ensino: {
        Row: {
          capacidade_maxima: number | null
          congregacao_id: string | null
          created_at: string
          curso_id: string
          data_fim: string | null
          data_inicio: string
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id: string
          link_online: string | null
          lista_espera: boolean | null
          local_endereco: string | null
          local_tipo: string
          nome_turma: string
          observacoes: string | null
          professor_responsavel: string
          status: string
          updated_at: string
        }
        Insert: {
          capacidade_maxima?: number | null
          congregacao_id?: string | null
          created_at?: string
          curso_id: string
          data_fim?: string | null
          data_inicio: string
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id?: string
          link_online?: string | null
          lista_espera?: boolean | null
          local_endereco?: string | null
          local_tipo?: string
          nome_turma: string
          observacoes?: string | null
          professor_responsavel: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacidade_maxima?: number | null
          congregacao_id?: string | null
          created_at?: string
          curso_id?: string
          data_fim?: string | null
          data_inicio?: string
          dias_semana?: string[]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          link_online?: string | null
          lista_espera?: boolean | null
          local_endereco?: string | null
          local_tipo?: string
          nome_turma?: string
          observacoes?: string | null
          professor_responsavel?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "turmas_ensino_congregacao_id_fkey"
            columns: ["congregacao_id"]
            isOneToOne: false
            referencedRelation: "congregacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turmas_ensino_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "cursos_ensino"
            referencedColumns: ["id"]
          },
        ]
      }
      user_mfa_settings: {
        Row: {
          backup_codes: string[] | null
          created_at: string | null
          id: string
          mfa_enabled: boolean | null
          phone_number: string | null
          preferred_method: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          mfa_enabled?: boolean | null
          phone_number?: string | null
          preferred_method?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          backup_codes?: string[] | null
          created_at?: string | null
          id?: string
          mfa_enabled?: boolean | null
          phone_number?: string | null
          preferred_method?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean
          id: string
          monthly_reports: boolean
          phone_number: string | null
          push_notifications: boolean
          sms_notifications: boolean
          updated_at: string
          user_id: string
          weekly_reports: boolean
          whatsapp_notifications: boolean
          whatsapp_number: string | null
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          monthly_reports?: boolean
          phone_number?: string | null
          push_notifications?: boolean
          sms_notifications?: boolean
          updated_at?: string
          user_id: string
          weekly_reports?: boolean
          whatsapp_notifications?: boolean
          whatsapp_number?: string | null
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          id?: string
          monthly_reports?: boolean
          phone_number?: string | null
          push_notifications?: boolean
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string
          weekly_reports?: boolean
          whatsapp_notifications?: boolean
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      user_push_tokens: {
        Row: {
          active: boolean
          created_at: string
          device_id: string | null
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          device_id?: string | null
          id?: string
          platform?: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          device_id?: string | null
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_skills_profile: {
        Row: {
          availability: Json | null
          background_check_date: string | null
          created_at: string
          emergency_contact: Json | null
          experience_areas: string[] | null
          id: string
          is_available: boolean | null
          notes: string | null
          preferred_ministries: string[] | null
          spiritual_gifts: string[] | null
          talents_interests: string[] | null
          training_completed: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          background_check_date?: string | null
          created_at?: string
          emergency_contact?: Json | null
          experience_areas?: string[] | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          preferred_ministries?: string[] | null
          spiritual_gifts?: string[] | null
          talents_interests?: string[] | null
          training_completed?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          background_check_date?: string | null
          created_at?: string
          emergency_contact?: Json | null
          experience_areas?: string[] | null
          id?: string
          is_available?: boolean | null
          notes?: string | null
          preferred_ministries?: string[] | null
          spiritual_gifts?: string[] | null
          talents_interests?: string[] | null
          training_completed?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_profile_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_permissoes: {
        Row: {
          concedida: boolean | null
          created_at: string
          id: string
          permissao_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          concedida?: boolean | null
          created_at?: string
          id?: string
          permissao_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          concedida?: boolean | null
          created_at?: string
          id?: string
          permissao_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuario_permissoes_permissao_id_fkey"
            columns: ["permissao_id"]
            isOneToOne: false
            referencedRelation: "permissoes"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_admin: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          igreja_id: string
          mfa_ativo: boolean | null
          nome: string
          papel: string
          perfil_ministerial: string | null
          ultimo_acesso: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          igreja_id: string
          mfa_ativo?: boolean | null
          nome: string
          papel?: string
          perfil_ministerial?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          igreja_id?: string
          mfa_ativo?: boolean | null
          nome?: string
          papel?: string
          perfil_ministerial?: string | null
          ultimo_acesso?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_admin_igreja_id_fkey"
            columns: ["igreja_id"]
            isOneToOne: false
            referencedRelation: "igrejas"
            referencedColumns: ["id"]
          },
        ]
      }
      voluntarios: {
        Row: {
          areas_interesse: string[]
          created_at: string
          disponibilidade: string
          email: string
          experiencia: string | null
          id: string
          nome: string
          observacoes: string | null
          status: string
          telefone: string | null
          updated_at: string
        }
        Insert: {
          areas_interesse: string[]
          created_at?: string
          disponibilidade: string
          email: string
          experiencia?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          areas_interesse?: string[]
          created_at?: string
          disponibilidade?: string
          email?: string
          experiencia?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: string
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          message: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          service_opportunity_id: string
          start_date: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          message?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_opportunity_id: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          message?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          service_opportunity_id?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "volunteer_applications_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_applications_service_opportunity_id_fkey"
            columns: ["service_opportunity_id"]
            isOneToOne: false
            referencedRelation: "service_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "volunteer_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "pessoas"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_messages: {
        Row: {
          campaign_id: string | null
          created_at: string | null
          error_message: string | null
          external_id: string | null
          id: string
          message: string
          phone: string
          priority: string | null
          status: string
          type: string
          updated_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message: string
          phone: string
          priority?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string | null
          error_message?: string | null
          external_id?: string | null
          id?: string
          message?: string
          phone?: string
          priority?: string | null
          status?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calcular_grupo_etario: {
        Args: { data_nascimento: string }
        Returns: string
      }
      can_access_admin_user: {
        Args: { user_record_user_id: string }
        Returns: boolean
      }
      can_access_own_admin_record: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      check_password_strength: {
        Args: { password: string }
        Returns: Json
      }
      check_suspicious_login: {
        Args: { p_user_id: string; p_ip_address: unknown; p_user_agent: string }
        Returns: boolean
      }
      cleanup_expired_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_seo_cache: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      criar_permissoes_automaticas: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      execute_query: {
        Args: { query_text: string }
        Returns: Json
      }
      export_user_data: {
        Args: { user_uuid: string }
        Returns: Json
      }
      generate_backup_codes: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_pastor_missao_id: {
        Args: { uid?: string }
        Returns: string
      }
      get_pastor_missao_igreja_id: {
        Args: { uid?: string }
        Returns: string
      }
      get_reset_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_site_url: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_congregacao_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_igreja_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_igreja_id_with_missao: {
        Args: { uid?: string }
        Returns: string
      }
      get_user_security_level: {
        Args: { user_uuid: string }
        Returns: number
      }
      has_security_permission: {
        Args: {
          user_uuid: string
          module_name: string
          action_name: string
          resource_type?: string
        }
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_any_admin: {
        Args: { uid?: string }
        Returns: boolean
      }
      is_pastor_missao: {
        Args: { uid?: string }
        Returns: boolean
      }
      is_security_admin: {
        Args: { user_uuid?: string }
        Returns: boolean
      }
      is_sede_admin: {
        Args: Record<PropertyKey, never> | { uid: string }
        Returns: boolean
      }
      log_security_audit: {
        Args: {
          p_user_id: string
          p_action: string
          p_resource_type: string
          p_resource_id?: string
          p_old_values?: Json
          p_new_values?: Json
          p_metadata?: Json
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_user_id: string
          p_event_type: string
          p_event_data?: Json
          p_ip_address?: unknown
          p_user_agent?: string
          p_location_data?: Json
        }
        Returns: string
      }
      obter_estatisticas_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_membros_ativos: number
          total_lideres: number
          aniversariantes_hoje: number
          novos_membros_30_dias: number
        }[]
      }
      obter_estatisticas_ensino: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_cursos: number
          total_turmas_ativas: number
          total_alunos_matriculados: number
          total_alunos_concluidos: number
          taxa_conclusao: number
          alunos_por_status: Json
          cursos_por_categoria: Json
        }[]
      }
      obter_estatisticas_multiplicacao: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_celulas_originais: number
          total_celulas_multiplicadas: number
          geracao_maxima: number
          celulas_por_geracao: Json
        }[]
      }
      obter_estatisticas_pessoas: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_pessoas: number
          total_membros: number
          total_visitantes: number
          total_lideres: number
          total_batizados: number
          total_em_discipulado: number
          crescimento_mes_atual: number
          pessoas_por_grupo_etario: Json
          pessoas_por_estado_espiritual: Json
        }[]
      }
      obter_papel_usuario: {
        Args: { user_email: string }
        Returns: Database["public"]["Enums"]["papel_igreja"]
      }
      obter_ranking_ensino: {
        Args: Record<PropertyKey, never>
        Returns: {
          pessoa_id: string
          nome: string
          total_pontos: number
          badges_count: number
          cursos_concluidos: number
        }[]
      }
      process_data_deletion: {
        Args: { request_id: string }
        Returns: boolean
      }
      user_has_permission: {
        Args: {
          user_uuid: string
          action_name: string
          subject_name: string
          resource_type_param?: string
        }
        Returns: boolean
      }
      verificar_conflitos_turma: {
        Args: {
          p_professor_responsavel: string
          p_dias_semana: string[]
          p_horario_inicio: string
          p_horario_fim: string
          p_data_inicio: string
          p_data_fim: string
          p_turma_id?: string
        }
        Returns: {
          tipo_conflito: string
          descricao: string
          gravidade: number
        }[]
      }
      verificar_permissao: {
        Args: {
          user_email: string
          modulo_codigo: Database["public"]["Enums"]["modulo_sistema"]
          acao_desejada: Database["public"]["Enums"]["acao_permissao"]
        }
        Returns: boolean
      }
    }
    Enums: {
      acao_permissao:
        | "visualizar"
        | "criar"
        | "editar"
        | "excluir"
        | "aprovar"
        | "exportar"
        | "gerenciar"
        | "administrar"
      modulo_sistema:
        | "pessoas"
        | "ensino"
        | "celulas"
        | "financas"
        | "agenda"
        | "comunicacao"
        | "portal_aluno"
        | "dashboard_estrategico"
        | "escalas"
        | "galeria"
        | "patrimonio"
        | "missoes"
      papel_igreja:
        | "membro_comum"
        | "novo_convertido"
        | "aluno"
        | "discipulador"
        | "lider_celula"
        | "supervisor_regional"
        | "coordenador_ensino"
        | "tesoureiro"
        | "secretario"
        | "coordenador_agenda"
        | "comunicacao"
        | "administrador_geral"
        | "visitante_externo"
      status_evento_agenda:
        | "agendado"
        | "confirmado"
        | "concluido"
        | "cancelado"
      status_participacao:
        | "convocado"
        | "confirmado"
        | "negado"
        | "substituido"
        | "presente"
        | "faltou"
      tipo_culto:
        | "domingo_manha"
        | "domingo_noite"
        | "quarta_oracao"
        | "sexta_jovens"
        | "especial"
        | "ensaio"
      tipo_escala:
        | "voluntarios"
        | "pregadores"
        | "ministerio_louvor"
        | "dancarinos"
        | "sonorizacao"
        | "multimidia"
        | "intercessao"
        | "recepcao"
        | "criancas"
        | "seguranca"
      tipo_evento_agenda:
        | "publico"
        | "celula"
        | "ensino"
        | "reuniao_interna"
        | "pastoral"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      acao_permissao: [
        "visualizar",
        "criar",
        "editar",
        "excluir",
        "aprovar",
        "exportar",
        "gerenciar",
        "administrar",
      ],
      modulo_sistema: [
        "pessoas",
        "ensino",
        "celulas",
        "financas",
        "agenda",
        "comunicacao",
        "portal_aluno",
        "dashboard_estrategico",
        "escalas",
        "galeria",
        "patrimonio",
        "missoes",
      ],
      papel_igreja: [
        "membro_comum",
        "novo_convertido",
        "aluno",
        "discipulador",
        "lider_celula",
        "supervisor_regional",
        "coordenador_ensino",
        "tesoureiro",
        "secretario",
        "coordenador_agenda",
        "comunicacao",
        "administrador_geral",
        "visitante_externo",
      ],
      status_evento_agenda: [
        "agendado",
        "confirmado",
        "concluido",
        "cancelado",
      ],
      status_participacao: [
        "convocado",
        "confirmado",
        "negado",
        "substituido",
        "presente",
        "faltou",
      ],
      tipo_culto: [
        "domingo_manha",
        "domingo_noite",
        "quarta_oracao",
        "sexta_jovens",
        "especial",
        "ensaio",
      ],
      tipo_escala: [
        "voluntarios",
        "pregadores",
        "ministerio_louvor",
        "dancarinos",
        "sonorizacao",
        "multimidia",
        "intercessao",
        "recepcao",
        "criancas",
        "seguranca",
      ],
      tipo_evento_agenda: [
        "publico",
        "celula",
        "ensino",
        "reuniao_interna",
        "pastoral",
      ],
    },
  },
} as const
