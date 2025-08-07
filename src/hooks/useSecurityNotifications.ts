import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SecurityEvent {
  id: string;
  event_type: string;
  event_data: any;
  ip_address?: string;
  user_agent?: string;
  location_data?: any;
  created_at: string;
}

export interface SecurityNotification {
  id: string;
  user_id: string;
  security_event_id?: string;
  notification_type: string;
  template_used: string;
  recipient: string;
  status: string;
  sent_at?: string;
  created_at: string;
}

export const useSecurityNotifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const logSecurityEvent = useCallback(async (
    eventType: string,
    eventData: any = {},
    locationData: any = {}
  ) => {
    if (!user) return null;

    try {
      // Detectar informações do navegador
      const userAgent = navigator.userAgent;
      
      // Tentar obter IP (não é preciso para o log básico)
      const { data, error } = await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_data: eventData,
        p_user_agent: userAgent,
        p_location_data: locationData
      });

      if (error) {
        console.error('Erro ao registrar evento de segurança:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erro ao registrar evento de segurança:', error);
      return null;
    }
  }, [user]);

  const getSecurityEvents = useCallback(async (limit = 50) => {
    if (!user) return [];

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar eventos de segurança:', error);
        return [];
      }

      return data as SecurityEvent[];
    } catch (error) {
      console.error('Erro ao buscar eventos de segurança:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const getSecurityNotifications = useCallback(async (limit = 50) => {
    if (!user) return [];

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('security_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Erro ao buscar notificações de segurança:', error);
        return [];
      }

      return data as SecurityNotification[];
    } catch (error) {
      console.error('Erro ao buscar notificações de segurança:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const checkSuspiciousLogin = useCallback(async () => {
    if (!user) return false;

    try {
      const userAgent = navigator.userAgent;
      
      const { data, error } = await supabase.rpc('check_suspicious_login', {
        p_user_id: user.id,
        p_ip_address: null, // IP será detectado no servidor se necessário
        p_user_agent: userAgent
      });

      if (error) {
        console.error('Erro ao verificar login suspeito:', error);
        return false;
      }

      return data as boolean;
    } catch (error) {
      console.error('Erro ao verificar login suspeito:', error);
      return false;
    }
  }, [user]);

  return {
    loading,
    logSecurityEvent,
    getSecurityEvents,
    getSecurityNotifications,
    checkSuspiciousLogin
  };
};