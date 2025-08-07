import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CommunicationChannel {
  id: string;
  name: string;
  type: 'ministry' | 'cell_group' | 'class_group' | 'direct_message' | 'announcement';
  description?: string;
  is_public: boolean;
  is_active: boolean;
  created_by?: string;
  ministry_id?: string;
  celula_id?: string;
  turma_id?: string;
  icon: string;
  color: string;
  created_at: string;
  updated_at: string;
  member_count?: number;
  last_message?: string;
  last_message_at?: string;
}

export interface CommunicationMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment_url?: string;
  attachment_name?: string;
  is_pinned: boolean;
  reply_to_id?: string;
  edited_at?: string;
  sent_at: string;
  created_at: string;
  sender?: {
    id: string;
    nome_completo: string;
    email: string;
  };
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  target_audience: string[];
  expires_at?: string;
  is_active: boolean;
  church_id?: string;
  attachment_url?: string;
  views_count: number;
  created_at: string;
  updated_at: string;
  author?: {
    nome_completo: string;
  };
}

export const useComunicacao = () => {
  const [channels, setChannels] = useState<CommunicationChannel[]>([]);
  const [messages, setMessages] = useState<CommunicationMessage[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchChannels = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .select(`
          *,
          communication_channel_members(count)
        `)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setChannels((data || []) as CommunicationChannel[]);
    } catch (error) {
      console.error('Erro ao buscar canais:', error);
      toast({
        title: "Erro ao carregar canais",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (channelId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('communication_messages')
        .select(`
          *,
          sender:pessoas!sender_id(id, nome_completo, email)
        `)
        .eq('channel_id', channelId)
        .order('sent_at', { ascending: true })
        .limit(50);

      if (error) throw error;
      setMessages((data || []) as CommunicationMessage[]);
    } catch (error) {
      console.error('Erro ao buscar mensagens:', error);
      toast({
        title: "Erro ao carregar mensagens",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          author:pessoas!author_id(nome_completo)
        `)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.now()')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setAnnouncements((data || []) as Announcement[]);
    } catch (error) {
      console.error('Erro ao buscar avisos:', error);
      toast({
        title: "Erro ao carregar avisos",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createChannel = async (channelData: {
    name: string;
    type: string;
    description?: string;
    is_public?: boolean;
    ministry_id?: string;
    celula_id?: string;
    turma_id?: string;
    icon?: string;
    color?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('communication_channels')
        .insert([channelData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Canal criado com sucesso",
        description: "O canal de comunicação foi criado.",
      });

      await fetchChannels();
      return data;
    } catch (error) {
      console.error('Erro ao criar canal:', error);
      toast({
        title: "Erro ao criar canal",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const sendMessage = async (channelId: string, content: string, messageType: 'text' | 'image' | 'file' | 'system' = 'text') => {
    try {
      // Primeiro buscar o ID da pessoa baseado no usuário autenticado
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (pessoaError) throw pessoaError;

      const { data, error } = await supabase
        .from('communication_messages')
        .insert([{
          channel_id: channelId,
          sender_id: pessoaData.id,
          content,
          message_type: messageType
        }])
        .select(`
          *,
          sender:pessoas!sender_id(id, nome_completo, email)
        `)
        .single();

      if (error) throw error;

      // Adicionar mensagem à lista local
      setMessages(prev => [...prev, data as CommunicationMessage]);

      return data;
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createAnnouncement = async (announcementData: {
    title: string;
    content: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    target_audience?: string[];
    expires_at?: string;
    church_id?: string;
    attachment_url?: string;
  }) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (pessoaError) throw pessoaError;

      const { data, error } = await supabase
        .from('announcements')
        .insert([{
          ...announcementData,
          author_id: pessoaData.id
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Aviso criado com sucesso",
        description: "O aviso foi publicado.",
      });

      await fetchAnnouncements();
      return data;
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
      toast({
        title: "Erro ao criar aviso",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const joinChannel = async (channelId: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (pessoaError) throw pessoaError;

      const { error } = await supabase
        .from('communication_channel_members')
        .insert([{
          channel_id: channelId,
          user_id: pessoaData.id
        }]);

      if (error) throw error;

      toast({
        title: "Você entrou no canal",
        description: "Agora você pode participar das conversas.",
      });

      await fetchChannels();
    } catch (error) {
      console.error('Erro ao entrar no canal:', error);
      toast({
        title: "Erro ao entrar no canal",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchChannels();
    fetchAnnouncements();
  }, []);

  return {
    channels,
    messages,
    announcements,
    isLoading,
    fetchChannels,
    fetchMessages,
    fetchAnnouncements,
    createChannel,
    sendMessage,
    createAnnouncement,
    joinChannel
  };
};