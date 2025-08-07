import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useUserRole, UserRole } from './useUserRole';
import { useToast } from './use-toast';

export interface NotificationPreference {
  tipo: string;
  habilitado: boolean;
  papel_necessario?: UserRole[];
  horario_inicio?: string;
  horario_fim?: string;
}

export interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
  role_target?: UserRole[];
  tipo: 'evento' | 'celula' | 'ensino' | 'financeiro' | 'geral' | 'emergencia';
  priority: 'high' | 'normal' | 'low';
}

export const useAdvancedNotifications = () => {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { toast } = useToast();
  
  const [isRegistered, setIsRegistered] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [pushToken, setPushToken] = useState<string | null>(null);

  // Configurações padrão de notificações por papel
  const defaultPreferences: NotificationPreference[] = [
    { tipo: 'eventos_geral', habilitado: true },
    { tipo: 'celulas_relatorios', habilitado: true, papel_necessario: ['lider_celula', 'supervisor_regional'] },
    { tipo: 'ensino_matriculas', habilitado: true, papel_necessario: ['coordenador_ensino', 'administrador_geral'] },
    { tipo: 'financeiro_contribuicoes', habilitado: false, papel_necessario: ['tesoureiro', 'administrador_geral'] },
    { tipo: 'emergencia_pastoral', habilitado: true },
    { tipo: 'lembretes_pessoais', habilitado: true },
    { tipo: 'aniversarios', habilitado: true },
    { tipo: 'agenda_eventos', habilitado: true, horario_inicio: '08:00', horario_fim: '22:00' }
  ];

  // Inicializar notificações push
  const initializePushNotifications = async () => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      // Solicitar permissões
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive !== 'granted') {
        throw new Error('Permissão negada para notificações');
      }

      // Registrar para push notifications
      await PushNotifications.register();
      setIsRegistered(true);

      // Configurar listeners
      setupNotificationListeners();

      return true;
    } catch (error) {
      console.error('Erro ao inicializar notificações:', error);
      toast({
        title: "Erro nas notificações",
        description: "Não foi possível configurar as notificações push.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Configurar listeners de notificações
  const setupNotificationListeners = () => {
    // Token de registro
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token: ' + token.value);
      setPushToken(token.value);
      
      // Salvar token no backend
      await saveTokenToDatabase(token.value);
    });

    // Erro no registro
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Registration error: ', error.error);
    });

    // Notificação recebida (app em foreground)
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received: ', notification);
      
      // Processar notificação baseada no papel do usuário
      if (shouldShowNotification(notification)) {
        showLocalNotification({
          title: notification.title || 'Nova notificação',
          body: notification.body || '',
          data: notification.data
        });
      }
    });

    // Ação na notificação (tap, etc)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed: ', notification);
      handleNotificationAction(notification);
    });
  };

  // Verificar se deve mostrar notificação baseado no papel
  const shouldShowNotification = (notification: PushNotificationSchema): boolean => {
    if (!notification.data || !role) return true;

    const targetRoles = notification.data.role_target as UserRole[];
    if (!targetRoles || targetRoles.length === 0) return true;

    return targetRoles.includes(role);
  };

  // Salvar token no banco de dados
  const saveTokenToDatabase = async (token: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_push_tokens')
        .upsert({
          user_id: user.id,
          token,
          platform: Capacitor.getPlatform(),
          role: role || 'membro_comum',
          created_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao salvar token:', error);
    }
  };

  // Mostrar notificação local
  const showLocalNotification = async (data: { title: string; body: string; data?: any }) => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title: data.title,
          body: data.body,
          id: Date.now(),
          schedule: { at: new Date(Date.now() + 100) },
          sound: 'default',
          actionTypeId: data.data?.actionType || 'default',
          extra: data.data
        }]
      });
    } catch (error) {
      console.error('Erro ao mostrar notificação local:', error);
    }
  };

  // Lidar com ações de notificação
  const handleNotificationAction = (notification: ActionPerformed) => {
    const data = (notification.notification as any).extra;
    
    if (data?.route) {
      // Navegar para rota específica
      window.location.href = data.route;
    }
  };

  // Enviar notificação personalizada
  const sendCustomNotification = async (notificationData: PushNotificationData) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('send-role-notification', {
        body: {
          notification: notificationData,
          sender_id: user.id,
          sender_role: role
        }
      });

      if (error) throw error;

      toast({
        title: "Notificação enviada!",
        description: "A notificação foi enviada para os usuários apropriados.",
      });
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a notificação.",
        variant: "destructive",
      });
    }
  };

  // Carregar preferências do usuário
  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') throw error;

      if (data && data.length > 0) {
        setPreferences(data.map((item: any) => ({
          tipo: 'geral',
          habilitado: true,
          papel_necessario: undefined,
          horario_inicio: item.quiet_hours_start,
          horario_fim: item.quiet_hours_end
        })));
      } else {
        // Criar preferências padrão baseadas no papel
        const filteredPreferences = defaultPreferences.filter(pref => {
          if (!pref.papel_necessario) return true;
          return role && pref.papel_necessario.includes(role);
        });
        setPreferences(filteredPreferences);
      }
    } catch (error) {
      console.error('Erro ao carregar preferências:', error);
    }
  };

  // Salvar preferências
  const savePreferences = async (newPreferences: NotificationPreference[]) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert(
          newPreferences.map(pref => ({
            user_id: user.id,
            tipo: pref.tipo,
            habilitado: pref.habilitado,
            horario_inicio: pref.horario_inicio,
            horario_fim: pref.horario_fim
          })),
          { onConflict: 'user_id,tipo' }
        );

      if (error) throw error;

      setPreferences(newPreferences);
      
      toast({
        title: "Preferências salvas!",
        description: "Suas configurações de notificação foram atualizadas.",
      });
    } catch (error) {
      console.error('Erro ao salvar preferências:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar as preferências.",
        variant: "destructive",
      });
    }
  };

  // Agendar notificação local
  const scheduleLocalNotification = async (
    title: string, 
    body: string, 
    scheduleDate: Date,
    data?: any
  ) => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Math.floor(Math.random() * 10000),
          schedule: { at: scheduleDate },
          sound: 'default',
          extra: data
        }]
      });

      toast({
        title: "Lembrete agendado!",
        description: `Você será notificado em ${scheduleDate.toLocaleString()}.`,
      });
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  };

  // Limpar todas as notificações
  const clearAllNotifications = async () => {
    try {
      await LocalNotifications.removeAllDeliveredNotifications();
      await PushNotifications.removeAllDeliveredNotifications();
      
      toast({
        title: "Notificações limpas",
        description: "Todas as notificações foram removidas.",
      });
    } catch (error) {
      console.error('Erro ao limpar notificações:', error);
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform() && user) {
      initializePushNotifications();
      loadPreferences();
    }
  }, [user, role]);

  return {
    isRegistered,
    preferences,
    pushToken,
    sendCustomNotification,
    scheduleLocalNotification,
    savePreferences,
    clearAllNotifications,
    initializePushNotifications
  };
};