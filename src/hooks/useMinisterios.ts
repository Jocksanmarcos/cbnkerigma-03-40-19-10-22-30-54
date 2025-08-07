import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Ministry {
  id: string;
  name: string;
  description?: string;
  leader_id?: string;
  church_id?: string;
  color: string;
  icon: string;
  is_active: boolean;
  meeting_day?: string;
  meeting_time?: string;
  location?: string;
  contact_info: any;
  requirements: string[];
  created_at: string;
  updated_at: string;
  leader?: {
    nome_completo: string;
    email: string;
  };
  volunteer_count?: number;
}

export interface ServiceOpportunity {
  id: string;
  ministry_id: string;
  title: string;
  description?: string;
  required_skills: string[];
  preferred_skills: string[];
  time_commitment?: string;
  schedule_details?: string;
  slots_needed: number;
  slots_filled: number;
  is_urgent: boolean;
  is_active: boolean;
  created_by?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
  ministry?: {
    name: string;
    icon: string;
    color: string;
  };
}

export interface UserSkillsProfile {
  id?: string;
  user_id: string;
  spiritual_gifts: string[];
  talents_interests: string[];
  experience_areas: string[];
  availability: any;
  preferred_ministries: string[];
  emergency_contact: any;
  background_check_date?: string;
  training_completed: string[];
  notes?: string;
  is_available: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface VolunteerApplication {
  id: string;
  service_opportunity_id: string;
  user_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn';
  message?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  review_notes?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  service_opportunity?: ServiceOpportunity;
  user?: {
    nome_completo: string;
    email: string;
  };
}

export interface ServiceSchedule {
  id: string;
  ministry_id: string;
  title: string;
  event_date: string;
  event_time?: string;
  location?: string;
  description?: string;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  created_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  ministry?: {
    name: string;
    icon: string;
    color: string;
  };
  volunteers?: Array<{
    volunteer_id: string;
    role: string;
    status: string;
    volunteer: {
      nome_completo: string;
      email: string;
    };
  }>;
}

export const useMinisterios = () => {
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [serviceOpportunities, setServiceOpportunities] = useState<ServiceOpportunity[]>([]);
  const [userSkillsProfile, setUserSkillsProfile] = useState<UserSkillsProfile | null>(null);
  const [volunteerApplications, setVolunteerApplications] = useState<VolunteerApplication[]>([]);
  const [serviceSchedules, setServiceSchedules] = useState<ServiceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchMinistries = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ministries')
        .select(`
          *,
          leader:pessoas!leader_id(nome_completo, email)
        `)
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setMinistries((data || []) as Ministry[]);
    } catch (error) {
      console.error('Erro ao buscar ministérios:', error);
      toast({
        title: "Erro ao carregar ministérios",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchServiceOpportunities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_opportunities')
        .select(`
          *,
          ministry:ministries!ministry_id(name, icon, color)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setServiceOpportunities((data || []) as ServiceOpportunity[]);
    } catch (error) {
      console.error('Erro ao buscar oportunidades:', error);
      toast({
        title: "Erro ao carregar oportunidades",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserSkillsProfile = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (pessoaError) throw pessoaError;

      const { data, error } = await supabase
        .from('user_skills_profile')
        .select('*')
        .eq('user_id', pessoaData.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      setUserSkillsProfile(data as UserSkillsProfile);
    } catch (error) {
      console.error('Erro ao buscar perfil de dons:', error);
    }
  };

  const fetchVolunteerApplications = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (pessoaError) throw pessoaError;

      const { data, error } = await supabase
        .from('volunteer_applications')
        .select(`
          *,
          service_opportunity:service_opportunities!service_opportunity_id(*),
          user:pessoas!user_id(nome_completo, email)
        `)
        .eq('user_id', pessoaData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVolunteerApplications((data || []) as VolunteerApplication[]);
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
    }
  };

  const fetchServiceSchedules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('service_schedules')
        .select(`
          *,
          ministry:ministries!ministry_id(name, icon, color),
          service_schedule_volunteers(
            volunteer_id,
            role,
            status,
            volunteer:pessoas!volunteer_id(nome_completo, email)
          )
        `)
        .order('event_date', { ascending: false })
        .limit(20);

      if (error) throw error;
      setServiceSchedules((data || []) as ServiceSchedule[]);
    } catch (error) {
      console.error('Erro ao buscar escalas:', error);
      toast({
        title: "Erro ao carregar escalas",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createMinistry = async (ministryData: {
    name: string;
    description?: string;
    leader_id?: string;
    color?: string;
    icon?: string;
    meeting_day?: string;
    meeting_time?: string;
    location?: string;
    requirements?: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('ministries')
        .insert([ministryData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Ministério criado com sucesso",
        description: "O ministério foi adicionado à igreja.",
      });

      await fetchMinistries();
      return data;
    } catch (error) {
      console.error('Erro ao criar ministério:', error);
      toast({
        title: "Erro ao criar ministério",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const createServiceOpportunity = async (opportunityData: {
    ministry_id: string;
    title: string;
    description?: string;
    required_skills?: string[];
    preferred_skills?: string[];
    time_commitment?: string;
    schedule_details?: string;
    slots_needed: number;
    is_urgent?: boolean;
    expires_at?: string;
  }) => {
    try {
      const { data, error } = await supabase
        .from('service_opportunities')
        .insert([opportunityData])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Oportunidade criada com sucesso",
        description: "A vaga de voluntário foi publicada.",
      });

      await fetchServiceOpportunities();
      return data;
    } catch (error) {
      console.error('Erro ao criar oportunidade:', error);
      toast({
        title: "Erro ao criar oportunidade",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const saveUserSkillsProfile = async (profileData: UserSkillsProfile) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (pessoaError) throw pessoaError;

      const dataToSave = {
        ...profileData,
        user_id: pessoaData.id
      };

      const { data, error } = await supabase
        .from('user_skills_profile')
        .upsert([dataToSave])
        .select()
        .single();

      if (error) throw error;

      setUserSkillsProfile(data as UserSkillsProfile);

      toast({
        title: "Perfil salvo com sucesso",
        description: "Suas informações de dons e talentos foram atualizadas.",
      });

      return data;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const applyForOpportunity = async (opportunityId: string, message?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (pessoaError) throw pessoaError;

      const { data, error } = await supabase
        .from('volunteer_applications')
        .insert([{
          service_opportunity_id: opportunityId,
          user_id: pessoaData.id,
          message
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Candidatura enviada",
        description: "Sua candidatura foi enviada com sucesso.",
      });

      await fetchVolunteerApplications();
      return data;
    } catch (error) {
      console.error('Erro ao candidatar-se:', error);
      toast({
        title: "Erro ao enviar candidatura",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected', reviewNotes?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Usuário não autenticado');

      const { data: pessoaData, error: pessoaError } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', userData.user.id)
        .single();

      if (pessoaError) throw pessoaError;

      const { data, error } = await supabase
        .from('volunteer_applications')
        .update({
          status,
          reviewed_by: pessoaData.id,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes
        })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: `Candidatura ${status === 'approved' ? 'aprovada' : 'rejeitada'}`,
        description: "O status da candidatura foi atualizado.",
      });

      await fetchVolunteerApplications();
      return data;
    } catch (error) {
      console.error('Erro ao atualizar candidatura:', error);
      toast({
        title: "Erro ao atualizar candidatura",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMinistries();
    fetchServiceOpportunities();
    fetchUserSkillsProfile();
    fetchVolunteerApplications();
    fetchServiceSchedules();
  }, []);

  return {
    ministries,
    serviceOpportunities,
    userSkillsProfile,
    volunteerApplications,
    serviceSchedules,
    isLoading,
    fetchMinistries,
    fetchServiceOpportunities,
    fetchUserSkillsProfile,
    fetchVolunteerApplications,
    fetchServiceSchedules,
    createMinistry,
    createServiceOpportunity,
    saveUserSkillsProfile,
    applyForOpportunity,
    updateApplicationStatus
  };
};