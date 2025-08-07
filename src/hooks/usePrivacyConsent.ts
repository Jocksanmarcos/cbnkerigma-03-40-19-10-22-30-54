import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface PrivacyConsent {
  id: string;
  consent_type: string;
  granted: boolean;
  consent_version: string;
  granted_at?: string;
  revoked_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DataRequest {
  id: string;
  request_type: string;
  status: string;
  request_data: any;
  response_data: any;
  created_at: string;
  updated_at: string;
  expires_at?: string;
  processed_at?: string;
  processed_by?: string;
  user_id: string;
}

export const usePrivacyConsent = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consents, setConsents] = useState<PrivacyConsent[]>([]);
  const [dataRequests, setDataRequests] = useState<DataRequest[]>([]);
  const [loading, setLoading] = useState(false);

  const loadConsents = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('privacy_consents')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar consentimentos:', error);
        return;
      }

      setConsents(data || []);
    } catch (error) {
      console.error('Erro ao carregar consentimentos:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const updateConsent = useCallback(async (
    consentType: string,
    granted: boolean,
    version = '1.0'
  ) => {
    if (!user) return false;

    try {
      setLoading(true);
      
      const userAgent = navigator.userAgent;
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('privacy_consents')
        .upsert({
          user_id: user.id,
          consent_type: consentType,
          granted,
          consent_version: version,
          user_agent: userAgent,
          granted_at: granted ? now : null,
          revoked_at: !granted ? now : null
        }, {
          onConflict: 'user_id,consent_type'
        });

      if (error) {
        console.error('Erro ao atualizar consentimento:', error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o consentimento.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Consentimento atualizado",
        description: `Sua preferência para ${consentType} foi ${granted ? 'aceita' : 'revogada'}.`
      });

      await loadConsents();
      return true;
    } catch (error) {
      console.error('Erro ao atualizar consentimento:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast, loadConsents]);

  const requestDataExport = useCallback(async () => {
    if (!user) return false;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('data_requests')
        .insert({
          user_id: user.id,
          request_type: 'export',
          request_data: {
            requested_at: new Date().toISOString(),
            user_agent: navigator.userAgent
          }
        });

      if (error) {
        console.error('Erro ao solicitar exportação:', error);
        toast({
          title: "Erro",
          description: "Não foi possível processar sua solicitação.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Solicitação enviada",
        description: "Você receberá um email com seus dados em até 48 horas."
      });

      await loadDataRequests();
      return true;
    } catch (error) {
      console.error('Erro ao solicitar exportação:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const requestDataDeletion = useCallback(async () => {
    if (!user) return false;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('data_requests')
        .insert({
          user_id: user.id,
          request_type: 'deletion',
          request_data: {
            requested_at: new Date().toISOString(),
            user_agent: navigator.userAgent,
            confirmation: 'Confirmo que desejo excluir permanentemente meus dados'
          }
        });

      if (error) {
        console.error('Erro ao solicitar exclusão:', error);
        toast({
          title: "Erro",
          description: "Não foi possível processar sua solicitação.",
          variant: "destructive"
        });
        return false;
      }

      toast({
        title: "Solicitação enviada",
        description: "Sua solicitação de exclusão será processada em até 30 dias.",
        variant: "destructive"
      });

      await loadDataRequests();
      return true;
    } catch (error) {
      console.error('Erro ao solicitar exclusão:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const loadDataRequests = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('data_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao carregar solicitações:', error);
        return;
      }

      setDataRequests(data || []);
    } catch (error) {
      console.error('Erro ao carregar solicitações:', error);
    }
  }, [user]);

  const getConsentStatus = useCallback((consentType: string): boolean => {
    const consent = consents.find(c => c.consent_type === consentType);
    return consent?.granted || false;
  }, [consents]);

  useEffect(() => {
    if (user) {
      loadConsents();
      loadDataRequests();
    }
  }, [user, loadConsents, loadDataRequests]);

  return {
    consents,
    dataRequests,
    loading,
    updateConsent,
    requestDataExport,
    requestDataDeletion,
    getConsentStatus,
    loadConsents,
    loadDataRequests
  };
};