import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Missao {
  id: string;
  nome: string;
  pais: string;
  cidade?: string;
  estado_provincia?: string;
  descricao?: string;
  pastor_responsavel?: string;
  contato_email?: string;
  contato_telefone?: string;
  data_inicio?: string;
  status: string;
  igreja_responsavel_id?: string;
  orcamento_anual?: number;
  membros_atual?: number;
  meta_membros?: number;
  observacoes?: string;
  ativa: boolean;
  created_at: string;
  updated_at: string;
}

export interface PastorMissao {
  id: string;
  user_id: string;
  missao_id: string;
  nome: string;
  email: string;
  telefone?: string;
  data_ordenacao?: string;
  ativo: boolean;
  papel: string;
  created_at: string;
  updated_at: string;
}

export const useMissoes = () => {
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [pastores, setPastores] = useState<PastorMissao[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const loadMissoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('missoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissoes(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as missões.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadPastores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pastores_missoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPastores(data || []);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pastores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMissao = async (missaoData: Omit<Missao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('missoes')
        .insert([missaoData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Missão criada",
        description: "A missão foi cadastrada com sucesso.",
      });

      await loadMissoes();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível criar a missão.",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updateMissao = async (id: string, missaoData: Partial<Missao>) => {
    try {
      const { data, error } = await supabase
        .from('missoes')
        .update(missaoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Missão atualizada",
        description: "Os dados da missão foram atualizados com sucesso.",
      });

      await loadMissoes();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar a missão.",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const createPastorCredentials = async (email: string, password: string, metadata: any) => {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const createPastor = async (pastorData: Omit<PastorMissao, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('pastores_missoes')
        .insert([pastorData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pastor cadastrado",
        description: "O pastor foi cadastrado com sucesso.",
      });

      await loadPastores();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar o pastor.",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const updatePastor = async (id: string, pastorData: Partial<PastorMissao>) => {
    try {
      const { data, error } = await supabase
        .from('pastores_missoes')
        .update(pastorData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Pastor atualizado",
        description: "Os dados do pastor foram atualizados com sucesso.",
      });

      await loadPastores();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o pastor.",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const resetPastorPassword = async (userId: string, newPassword: string) => {
    try {
      const { data, error } = await supabase.auth.admin.updateUserById(
        userId,
        { password: newPassword }
      );

      if (error) throw error;

      toast({
        title: "Senha atualizada",
        description: "A senha do pastor foi alterada com sucesso.",
      });

      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  const togglePastorStatus = async (id: string, ativo: boolean) => {
    try {
      const { data, error } = await supabase
        .from('pastores_missoes')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: ativo ? "Pastor ativado" : "Pastor desativado",
        description: `O pastor foi ${ativo ? 'ativado' : 'desativado'} com sucesso.`,
      });

      await loadPastores();
      return { data, error: null };
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível alterar o status do pastor.",
        variant: "destructive"
      });
      return { data: null, error };
    }
  };

  // Verificações de permissão
  const checkSedeAdmin = async () => {
    try {
      const { data, error } = await supabase.rpc('is_sede_admin');
      if (error) throw error;
      return data || false;
    } catch (error) {
      return false;
    }
  };

  const checkPastorMissao = async () => {
    try {
      const { data, error } = await supabase.rpc('is_pastor_missao');
      if (error) throw error;
      return data || false;
    } catch (error) {
      return false;
    }
  };

  const getCurrentUserMissao = async () => {
    try {
      const { data, error } = await supabase.rpc('get_pastor_missao_id');
      if (error) throw error;
      return data;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    loadMissoes();
    loadPastores();
  }, []);

  return {
    missoes,
    pastores,
    loading,
    loadMissoes,
    loadPastores,
    createMissao,
    updateMissao,
    createPastor,
    updatePastor,
    createPastorCredentials,
    resetPastorPassword,
    togglePastorStatus,
    checkSedeAdmin,
    checkPastorMissao,
    getCurrentUserMissao
  };
};