import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityNotifications } from '@/hooks/useSecurityNotifications';

export const SecurityEnhancedAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signIn, signOut } = useAuth();
  const { logSecurityEvent, checkSuspiciousLogin } = useSecurityNotifications();

  // Interceptar login para registrar eventos de segurança
  useEffect(() => {
    if (user) {
      const handleSuccessfulLogin = async () => {
        // Registrar evento de login
        await logSecurityEvent('login_success', {
          method: 'password',
          timestamp: new Date().toISOString()
        });

        // Verificar se é login suspeito
        const isSuspicious = await checkSuspiciousLogin();
        if (isSuspicious) {
          await logSecurityEvent('login_new_device', {
            suspicious: true,
            timestamp: new Date().toISOString()
          });
        }
      };

      handleSuccessfulLogin();
    }
  }, [user, logSecurityEvent, checkSuspiciousLogin]);

  // Interceptar alterações de senha
  const enhancedSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    
    if (!result.error && user) {
      await logSecurityEvent('login_success', {
        method: 'password',
        timestamp: new Date().toISOString()
      });
    }
    
    return result;
  };

  // Registrar logout
  const enhancedSignOut = async () => {
    if (user) {
      await logSecurityEvent('logout', {
        timestamp: new Date().toISOString()
      });
    }
    return signOut();
  };

  return <>{children}</>;
};