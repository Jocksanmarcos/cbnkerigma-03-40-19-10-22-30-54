import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface SimpleNotificationPrefs {
  evento_reminders: boolean;
  sound_enabled: boolean;
  vibration_enabled: boolean;
}

export const useSimpleNotifications = () => {
  const [preferences, setPreferences] = useState<SimpleNotificationPrefs>({
    evento_reminders: true,
    sound_enabled: true,
    vibration_enabled: true
  });
  const [loading, setLoading] = useState(false);

  // Buscar preferências do usuário
  const fetchPreferences = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('notification_preferences')
        .select('evento_reminders, sound_enabled, vibration_enabled')
        .eq('user_id', userData.user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Erro ao buscar preferências:', error);
        return;
      }

      if (data) {
        setPreferences({
          evento_reminders: data.evento_reminders ?? true,
          sound_enabled: data.sound_enabled ?? true,
          vibration_enabled: data.vibration_enabled ?? true
        });
      }
    } catch (error) {
      console.error('Erro ao buscar preferências:', error);
    }
  };

  // Atualizar preferências
  const updatePreferences = async (updates: Partial<SimpleNotificationPrefs>) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userData.user.id,
          ...preferences,
          ...updates
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Preferências atualizadas!",
        description: "Suas configurações foram salvas.",
      });
    } catch (error) {
      console.error('Erro ao atualizar preferências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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