import { useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { useSecurityNotifications } from './useSecurityNotifications';

export const useSecurityEventsLogger = () => {
  const { user, isAuthenticated } = useAuth();
  const { logSecurityEvent } = useSecurityNotifications();

  // Log login event
  const logLoginEvent = useCallback(async () => {
    if (!user) return;

    const userAgent = navigator.userAgent;
    const isNewDevice = !localStorage.getItem(`device_${user.id}`);
    
    if (isNewDevice) {
      localStorage.setItem(`device_${user.id}`, 'known');
      await logSecurityEvent('login_new_device', {
        device_info: userAgent,
        timestamp: new Date().toISOString()
      });
    } else {
      await logSecurityEvent('login_success', {
        device_info: userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }, [user, logSecurityEvent]);

  // Log password change event
  const logPasswordChange = useCallback(async () => {
    if (!user) return;
    
    await logSecurityEvent('password_change', {
      timestamp: new Date().toISOString(),
      user_id: user.id
    });
  }, [user, logSecurityEvent]);

  // Log MFA change event
  const logMFAChange = useCallback(async (enabled: boolean) => {
    if (!user) return;
    
    await logSecurityEvent('mfa_change', {
      enabled,
      timestamp: new Date().toISOString(),
      user_id: user.id
    });
  }, [user, logSecurityEvent]);

  // Log suspicious activity
  const logSuspiciousActivity = useCallback(async (details: any) => {
    if (!user) return;
    
    await logSecurityEvent('suspicious_activity', {
      details,
      timestamp: new Date().toISOString(),
      user_id: user.id
    });
  }, [user, logSecurityEvent]);

  // Auto-log login quando usuário faz login
  useEffect(() => {
    if (isAuthenticated && user) {
      // Delay para garantir que o usuário foi carregado completamente
      const timer = setTimeout(() => {
        logLoginEvent();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, logLoginEvent]);

  // Monitor para atividade suspeita (múltiplos logins rápidos)
  useEffect(() => {
    if (!user) return;

    const checkSuspiciousActivity = () => {
      const loginTimes = JSON.parse(localStorage.getItem(`login_times_${user.id}`) || '[]');
      const now = Date.now();
      const recentLogins = loginTimes.filter((time: number) => now - time < 60000); // 1 minuto

      if (recentLogins.length > 3) {
        logSuspiciousActivity({
          type: 'multiple_rapid_logins',
          count: recentLogins.length,
          timeframe: '1_minute'
        });
      }

      // Adicionar login atual
      loginTimes.push(now);
      // Manter apenas os últimos 10 logins
      const updatedTimes = loginTimes.slice(-10);
      localStorage.setItem(`login_times_${user.id}`, JSON.stringify(updatedTimes));
    };

    if (isAuthenticated) {
      checkSuspiciousActivity();
    }
  }, [isAuthenticated, user, logSuspiciousActivity]);

  return {
    logLoginEvent,
    logPasswordChange,
    logMFAChange,
    logSuspiciousActivity
  };
};