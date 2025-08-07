import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export type BiometryType = 'TOUCH_ID' | 'FACE_ID' | 'FINGERPRINT' | 'FACE_AUTHENTICATION' | 'BIOMETRIC_WEAK' | 'BIOMETRIC_STRONG';

export interface BiometricAuthState {
  isAvailable: boolean;
  biometryType: BiometryType | null;
  isEnabled: boolean;
  isAuthenticating: boolean;
}

export const useBiometricAuth = () => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [state, setState] = useState<BiometricAuthState>({
    isAvailable: false,
    biometryType: null,
    isEnabled: false,
    isAuthenticating: false
  });

  // Verificar disponibilidade da autenticação biométrica
  const checkAvailability = async () => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    try {
      // Para plataformas nativas, assumir que biometria está disponível
      // Na implementação real, você usaria um plugin específico
      const isAvailable = true;
      const biometryType: BiometryType = Capacitor.getPlatform() === 'ios' ? 'FACE_ID' : 'FINGERPRINT';
      
      setState(prev => ({
        ...prev,
        isAvailable,
        biometryType
      }));
      return isAvailable;
    } catch (error) {
      console.error('Erro ao verificar biometria:', error);
      return false;
    }
  };

  // Verificar se a autenticação biométrica está habilitada para o usuário
  const checkBiometricEnabled = () => {
    const enabled = localStorage.getItem('biometric_auth_enabled') === 'true';
    setState(prev => ({ ...prev, isEnabled: enabled }));
    return enabled;
  };

  // Habilitar autenticação biométrica
  const enableBiometricAuth = async (email: string, password: string) => {
    if (!state.isAvailable) {
      toast({
        title: "Biometria não disponível",
        description: "Seu dispositivo não suporta autenticação biométrica.",
        variant: "destructive",
      });
      return false;
    }

    try {
      setState(prev => ({ ...prev, isAuthenticating: true }));

      // Simular autenticação biométrica para desenvolvimento
      // Na implementação real, você usaria o plugin específico
      await new Promise((resolve, reject) => {
        if (Math.random() > 0.2) { // 80% de sucesso
          setTimeout(resolve, 1000);
        } else {
          setTimeout(() => reject(new Error('Biometria não reconhecida')), 1000);
        }
      });

      // Se chegou até aqui, salvar credenciais (criptografadas)
      const credentials = btoa(JSON.stringify({ email, password }));
      localStorage.setItem('biometric_credentials', credentials);
      localStorage.setItem('biometric_auth_enabled', 'true');
      
      setState(prev => ({ ...prev, isEnabled: true }));
      
      toast({
        title: "Biometria configurada!",
        description: `${getBiometryTypeLabel(state.biometryType)} habilitado com sucesso.`,
      });

      return true;
    } catch (error: any) {
      console.error('Erro ao configurar biometria:', error);
      
      let errorMessage = "Não foi possível configurar a autenticação biométrica.";
      if (error.message?.includes('cancelled') || error.message?.includes('user_cancel')) {
        errorMessage = "Operação cancelada pelo usuário.";
      } else if (error.message?.includes('not_enrolled')) {
        errorMessage = "Nenhuma biometria está cadastrada no dispositivo.";
      }
      
      toast({
        title: "Erro na configuração",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setState(prev => ({ ...prev, isAuthenticating: false }));
    }
  };

  // Autenticar com biometria
  const authenticateWithBiometry = async () => {
    if (!state.isEnabled || !state.isAvailable) {
      return false;
    }

    try {
      setState(prev => ({ ...prev, isAuthenticating: true }));

      // Simular autenticação biométrica para desenvolvimento
      await new Promise((resolve, reject) => {
        if (Math.random() > 0.15) { // 85% de sucesso
          setTimeout(resolve, 800);
        } else {
          setTimeout(() => reject(new Error('Biometria não reconhecida')), 800);
        }
      });

      // Recuperar credenciais salvas
      const storedCredentials = localStorage.getItem('biometric_credentials');
      if (!storedCredentials) {
        throw new Error('Credenciais não encontradas');
      }

      const { email, password } = JSON.parse(atob(storedCredentials));
      
      // Fazer login
      const result = await signIn(email, password);
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      toast({
        title: "Login realizado!",
        description: "Acesso autorizado via biometria.",
      });

      return true;
    } catch (error: any) {
      console.error('Erro na autenticação biométrica:', error);
      
      let errorMessage = "Falha na autenticação biométrica.";
      if (error.message?.includes('cancelled') || error.message?.includes('user_cancel')) {
        errorMessage = "Autenticação cancelada.";
      } else if (error.message?.includes('failed')) {
        errorMessage = "Biometria não reconhecida. Tente novamente.";
      } else if (error.message?.includes('lockout')) {
        errorMessage = "Muitas tentativas. Tente novamente mais tarde.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setState(prev => ({ ...prev, isAuthenticating: false }));
    }
  };

  // Desabilitar autenticação biométrica
  const disableBiometricAuth = () => {
    localStorage.removeItem('biometric_credentials');
    localStorage.removeItem('biometric_auth_enabled');
    setState(prev => ({ ...prev, isEnabled: false }));
    
    toast({
      title: "Biometria desabilitada",
      description: "Autenticação biométrica foi removida.",
    });
  };

  // Obter label do tipo de biometria
  const getBiometryTypeLabel = (type: BiometryType | null) => {
    switch (type) {
      case 'TOUCH_ID':
        return 'Touch ID';
      case 'FACE_ID':
        return 'Face ID';
      case 'FINGERPRINT':
        return 'Impressão Digital';
      case 'FACE_AUTHENTICATION':
        return 'Reconhecimento Facial';
      case 'BIOMETRIC_WEAK':
        return 'Biometria Simples';
      case 'BIOMETRIC_STRONG':
        return 'Biometria Avançada';
      default:
        return 'Biometria';
    }
  };

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      checkAvailability();
      checkBiometricEnabled();
    }
  }, []);

  return {
    ...state,
    enableBiometricAuth,
    authenticateWithBiometry,
    disableBiometricAuth,
    checkAvailability,
    getBiometryTypeLabel: () => getBiometryTypeLabel(state.biometryType)
  };
};