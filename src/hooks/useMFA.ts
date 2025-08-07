import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface MFASettings {
  id?: string;
  user_id: string;
  mfa_enabled: boolean;
  backup_codes: string[];
  phone_number?: string;
  preferred_method: string; // Mudado para string para aceitar qualquer valor do banco
}

interface MFAFactor {
  id: string;
  status: 'verified' | 'unverified';
  factor_type: string; // Mudado para string para aceitar qualquer valor
  friendly_name?: string;
}

export const useMFA = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<MFASettings | null>(null);
  const [factors, setFactors] = useState<MFAFactor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadMFASettings();
      loadMFAFactors();
    }
  }, [user]);

  const loadMFASettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_mfa_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setSettings(data || {
        user_id: user.id,
        mfa_enabled: false,
        backup_codes: [],
        preferred_method: 'totp'
      });
    } catch (error) {
      console.error('Erro ao carregar configurações MFA:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar configurações de autenticação",
        variant: "destructive"
      });
    }
  };

  const loadMFAFactors = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      
      if (error) throw error;
      
      // Filtrar apenas fatores TOTP e mapear para nossa interface
      const totpFactors = (data?.totp || []).map(factor => ({
        id: factor.id,
        status: factor.status as 'verified' | 'unverified',
        factor_type: 'totp',
        friendly_name: factor.friendly_name
      }));
      
      setFactors(totpFactors);
    } catch (error) {
      console.error('Erro ao carregar fatores MFA:', error);
    } finally {
      setLoading(false);
    }
  };

  const enrollMFA = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: 'Autenticador'
      });

      if (error) throw error;

      // Retornar dados necessários para mostrar QR code
      return {
        id: data.id,
        qr_code: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri
      };
    } catch (error) {
      console.error('Erro ao configurar MFA:', error);
      toast({
        title: "Erro",
        description: "Falha ao configurar autenticação de dois fatores",
        variant: "destructive"
      });
      throw error;
    }
  };

  const verifyMFA = async (factorId: string, code: string) => {
    try {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code
      });

      if (error) throw error;

      // Gerar códigos de backup
      const { data: backupCodes } = await supabase.rpc('generate_backup_codes');

      // Salvar configurações no banco
      await supabase
        .from('user_mfa_settings')
        .upsert({
          user_id: user!.id,
          mfa_enabled: true,
          backup_codes: backupCodes || [],
          preferred_method: 'totp'
        });

      await loadMFASettings();
      await loadMFAFactors();

      toast({
        title: "Sucesso",
        description: "Autenticação de dois fatores ativada com sucesso",
      });

      return { success: true, backup_codes: backupCodes };
    } catch (error) {
      console.error('Erro ao verificar MFA:', error);
      toast({
        title: "Erro",
        description: "Código inválido. Tente novamente.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const disableMFA = async (factorId: string) => {
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId });
      
      if (error) throw error;

      // Atualizar configurações no banco
      await supabase
        .from('user_mfa_settings')
        .upsert({
          user_id: user!.id,
          mfa_enabled: false,
          backup_codes: [],
          preferred_method: 'totp'
        });

      await loadMFASettings();
      await loadMFAFactors();

      toast({
        title: "Sucesso",
        description: "Autenticação de dois fatores desativada",
      });
    } catch (error) {
      console.error('Erro ao desativar MFA:', error);
      toast({
        title: "Erro",
        description: "Falha ao desativar autenticação de dois fatores",
        variant: "destructive"
      });
      throw error;
    }
  };

  const regenerateBackupCodes = async () => {
    if (!user || !settings?.mfa_enabled) return;

    try {
      const { data: backupCodes } = await supabase.rpc('generate_backup_codes');

      await supabase
        .from('user_mfa_settings')
        .update({ backup_codes: backupCodes || [] })
        .eq('user_id', user.id);

      await loadMFASettings();

      toast({
        title: "Sucesso",
        description: "Códigos de backup regenerados",
      });

      return backupCodes;
    } catch (error) {
      console.error('Erro ao regenerar códigos:', error);
      toast({
        title: "Erro",
        description: "Falha ao regenerar códigos de backup",
        variant: "destructive"
      });
      throw error;
    }
  };

  const verifyBackupCode = async (code: string) => {
    if (!settings?.backup_codes.includes(code)) {
      throw new Error('Código de backup inválido');
    }

    try {
      // Remover código usado da lista
      const updatedCodes = settings.backup_codes.filter(c => c !== code);
      
      await supabase
        .from('user_mfa_settings')
        .update({ backup_codes: updatedCodes })
        .eq('user_id', user!.id);

      await loadMFASettings();
      return true;
    } catch (error) {
      console.error('Erro ao usar código de backup:', error);
      throw error;
    }
  };

  return {
    settings,
    factors,
    loading,
    enrollMFA,
    verifyMFA,
    disableMFA,
    regenerateBackupCodes,
    verifyBackupCode,
    loadMFASettings,
    loadMFAFactors
  };
};