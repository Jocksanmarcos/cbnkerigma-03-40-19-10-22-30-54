import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  evento_reminders: boolean;
  evento_confirmations: boolean;
  celula_updates: boolean;
  ensino_updates: boolean;
  general_announcements: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
  quiet_hours_start?: string;
  quiet_hours_end?: string;
  created_at: string;
  updated_at: string;
}

export const useNotificationPreferences = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar preferências do usuário
  const fetchPreferences = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(data);
      } else {
        // Criar preferências padrão se não existir
        await createDefaultPreferences(userData.user.id);
      }
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
    } finally {
      setLoading(false);
    }
  };

  // Criar preferências padrão
  const createDefaultPreferences = async (userId: string) => {
    try {
      const defaultPrefs = {
        user_id: userId,
        evento_reminders: true,
        evento_confirmations: true,
        celula_updates: true,
        ensino_updates: true,
        general_announcements: true,
        sound_enabled: true,
        vibration_enabled: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '07:00'
      };

      const { data, error } = await supabase
        .from('notification_preferences')
        .insert([defaultPrefs])
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
    } catch (error) {
      console.error('Erro ao criar preferências padrão:', error);
    }
  };

  // Atualizar preferências
  const updatePreferences = async (updates: Partial<NotificationPreferences>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', userData.user.id)
        .select()
        .single();

      if (error) throw error;

      setPreferences(data);
      
      toast({
        title: "Preferências atualizadas!",
        description: "Suas configurações de notificação foram salvas.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    loading,
    updatePreferences,
    fetchPreferences
  };
};