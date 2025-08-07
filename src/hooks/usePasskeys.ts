import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PasskeyCredential {
  id: string;
  device_name: string;
  device_type?: string;
  transports?: string[];
  last_used_at?: string;
  created_at: string;
}

export const usePasskeys = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<PasskeyCredential[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  // Verificar suporte a WebAuthn
  useEffect(() => {
    const checkSupport = () => {
      const supported = !!(
        window.PublicKeyCredential &&
        navigator.credentials &&
        navigator.credentials.create &&
        navigator.credentials.get
      );
      setIsSupported(supported);
    };

    checkSupport();
  }, []);

  const loadCredentials = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('passkey_credentials')
        .select('id, device_name, device_type, transports, last_used_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar credenciais:', error);
        return;
      }

      setCredentials(data || []);
    } catch (error) {
      console.error('Erro ao carregar credenciais:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const registerPasskey = useCallback(async (deviceName: string) => {
    if (!user || !isSupported) {
      toast({
        title: "Não suportado",
        description: "Seu navegador não suporta autenticação biométrica.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setLoading(true);
      
      // Gerar challenge único
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);
      
      // Converter user ID para Uint8Array
      const userId = new TextEncoder().encode(user.id);
      
      const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: "CBN Kerigma",
          id: window.location.hostname,
        },
        user: {
          id: userId,
          name: user.email || 'usuario',
          displayName: deviceName,
        },
        pubKeyCredParams: [
          { alg: -7, type: "public-key" }, // ES256
          { alg: -257, type: "public-key" }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "required",
          residentKey: "preferred"
        },
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({
        publicKey: publicKeyCredentialCreationOptions
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Falha ao criar credencial');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Salvar credencial no banco
      const publicKeyBuffer = response.getPublicKey();
      const publicKeyBase64 = publicKeyBuffer ? btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer))) : '';
      
      const { error } = await supabase
        .from('passkey_credentials')
        .insert({
          user_id: user.id,
          credential_id: credential.id,
          public_key: publicKeyBase64,
          device_name: deviceName,
          device_type: 'platform',
          transports: response.getTransports?.() || [],
          counter: 0
        });

      if (error) {
        console.error('Erro ao salvar credencial:', error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar a credencial.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Passkey registrado!",
        description: `Dispositivo "${deviceName}" configurado com sucesso.`
      });

      await loadCredentials();
      return true;
    } catch (error: any) {
      console.error('Erro ao registrar passkey:', error);
      
      let message = "Não foi possível registrar o passkey.";
      if (error.name === 'NotAllowedError') {
        message = "Operação cancelada pelo usuário.";
      } else if (error.name === 'NotSupportedError') {
        message = "Autenticação biométrica não suportada.";
      }
      
      toast({
        title: "Erro no registro",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isSupported, toast, loadCredentials]);

  const authenticateWithPasskey = useCallback(async () => {
    if (!user || !isSupported) return false;

    try {
      setLoading(true);
      
      // Buscar credenciais existentes
      const { data: userCredentials, error: credError } = await supabase
        .from('passkey_credentials')
        .select('credential_id')
        .eq('user_id', user.id);

      if (credError || !userCredentials?.length) {
        toast({
          title: "Nenhuma credencial",
          description: "Você precisa registrar um passkey primeiro.",
          variant: "destructive"
        });
        return false;
      }

      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        allowCredentials: userCredentials.map(cred => ({
          id: new TextEncoder().encode(cred.credential_id),
          type: 'public-key' as const,
          transports: ['internal', 'hybrid'] as AuthenticatorTransport[]
        })),
        userVerification: "required",
        timeout: 60000,
      };

      const assertion = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions
      }) as PublicKeyCredential;

      if (!assertion) {
        throw new Error('Falha na autenticação');
      }

      // Atualizar last_used_at
      await supabase
        .from('passkey_credentials')
        .update({ last_used_at: new Date().toISOString() })
        .eq('credential_id', assertion.id)
        .eq('user_id', user.id);

      toast({
        title: "Autenticação bem-sucedida!",
        description: "Login realizado com passkey."
      });

      return true;
    } catch (error: any) {
      console.error('Erro na autenticação com passkey:', error);
      
      let message = "Falha na autenticação biométrica.";
      if (error.name === 'NotAllowedError') {
        message = "Autenticação cancelada.";
      }
      
      toast({
        title: "Erro na autenticação",
        description: message,
        variant: "destructive"
      });
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isSupported, toast]);

  const removeCredential = useCallback(async (credentialId: string) => {
    if (!user) return false;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('passkey_credentials')
        .delete()
        .eq('id', credentialId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Erro ao remover credencial:', error);
        toast({
          title: "Erro",
          description: "Não foi possível remover a credencial.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Credencial removida",
        description: "Dispositivo removido com sucesso."
      });

      await loadCredentials();
      return true;
    } catch (error) {
      console.error('Erro ao remover credencial:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, loadCredentials]);

  useEffect(() => {
    if (user && isSupported) {
      loadCredentials();
    }
  }, [user, isSupported, loadCredentials]);

  return {
    credentials,
    loading,
    isSupported,
    registerPasskey,
    authenticateWithPasskey,
    removeCredential,
    loadCredentials
  };
};