-- ========================================
-- MÓDULO 1: HUB DE COMUNICAÇÃO INTEGRADO
-- ========================================

-- Tabela de canais de comunicação
CREATE TABLE IF NOT EXISTS public.communication_channels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('ministry', 'cell_group', 'class_group', 'direct_message', 'announcement')),
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.pessoas(id),
  ministry_id UUID,
  celula_id UUID REFERENCES public.celulas(id),
  turma_id UUID,
  icon TEXT DEFAULT '💬',
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de membros dos canais
CREATE TABLE IF NOT EXISTS public.communication_channel_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_muted BOOLEAN DEFAULT false,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(channel_id, user_id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.communication_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID NOT NULL REFERENCES public.communication_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,
  attachment_name TEXT,
  is_pinned BOOLEAN DEFAULT false,
  reply_to_id UUID REFERENCES public.communication_messages(id),
  edited_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de avisos/murais
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES public.pessoas(id),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  target_audience TEXT[] DEFAULT ARRAY['all'], -- 'all', 'members', 'leaders', 'students'
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  church_id UUID,
  attachment_url TEXT,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ========================================
-- MÓDULO 2: GESTÃO DE VOLUNTÁRIOS E DONS
-- ========================================

-- Tabela de ministérios
CREATE TABLE IF NOT EXISTS public.ministries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES public.pessoas(id),
  church_id UUID,
  color TEXT DEFAULT '#6366f1',
  icon TEXT DEFAULT '🙏',
  is_active BOOLEAN DEFAULT true,
  meeting_day TEXT, -- 'sunday', 'monday', etc.
  meeting_time TIME,
  location TEXT,
  contact_info JSONB DEFAULT '{}',
  requirements TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de oportunidades de serviço/vagas
CREATE TABLE IF NOT EXISTS public.service_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  preferred_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
  time_commitment TEXT, -- 'weekly', 'monthly', 'occasional'
  schedule_details TEXT,
  slots_needed INTEGER DEFAULT 1,
  slots_filled INTEGER DEFAULT 0,
  is_urgent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.pessoas(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de perfil de dons e talentos dos usuários
CREATE TABLE IF NOT EXISTS public.user_skills_profile (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE UNIQUE,
  spiritual_gifts TEXT[] DEFAULT ARRAY[]::TEXT[],
  talents_interests TEXT[] DEFAULT ARRAY[]::TEXT[],
  experience_areas TEXT[] DEFAULT ARRAY[]::TEXT[],
  availability JSONB DEFAULT '{}', -- dias da semana, horários
  preferred_ministries UUID[] DEFAULT ARRAY[]::UUID[],
  emergency_contact JSONB DEFAULT '{}',
  background_check_date DATE,
  training_completed TEXT[] DEFAULT ARRAY[]::TEXT[],
  notes TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de inscrições/candidaturas para serviço
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_opportunity_id UUID NOT NULL REFERENCES public.service_opportunities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  message TEXT,
  reviewed_by UUID REFERENCES public.pessoas(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_notes TEXT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_opportunity_id, user_id)
);

-- Tabela de escalas de serviço
CREATE TABLE IF NOT EXISTS public.service_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id),
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
  created_by UUID REFERENCES public.pessoas(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de voluntários designados para escalas
CREATE TABLE IF NOT EXISTS public.service_schedule_volunteers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  schedule_id UUID NOT NULL REFERENCES public.service_schedules(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  status TEXT DEFAULT 'assigned' CHECK (status IN ('assigned', 'confirmed', 'declined', 'substituted')),
  substitute_for UUID REFERENCES public.pessoas(id),
  notes TEXT,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(schedule_id, volunteer_id, role)
);

-- ========================================
-- ÍNDICES E TRIGGERS
-- ========================================

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_communication_channels_type ON public.communication_channels(type);
CREATE INDEX IF NOT EXISTS idx_communication_channels_active ON public.communication_channels(is_active);
CREATE INDEX IF NOT EXISTS idx_communication_messages_channel ON public.communication_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_communication_messages_sender ON public.communication_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_communication_messages_sent_at ON public.communication_messages(sent_at);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON public.announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_expires ON public.announcements(expires_at);
CREATE INDEX IF NOT EXISTS idx_ministries_active ON public.ministries(is_active);
CREATE INDEX IF NOT EXISTS idx_service_opportunities_ministry ON public.service_opportunities(ministry_id);
CREATE INDEX IF NOT EXISTS idx_service_opportunities_active ON public.service_opportunities(is_active);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_user ON public.volunteer_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON public.volunteer_applications(status);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar triggers
DROP TRIGGER IF EXISTS update_communication_channels_updated_at ON public.communication_channels;
CREATE TRIGGER update_communication_channels_updated_at
  BEFORE UPDATE ON public.communication_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_announcements_updated_at ON public.announcements;
CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ministries_updated_at ON public.ministries;
CREATE TRIGGER update_ministries_updated_at
  BEFORE UPDATE ON public.ministries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_opportunities_updated_at ON public.service_opportunities;
CREATE TRIGGER update_service_opportunities_updated_at
  BEFORE UPDATE ON public.service_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_skills_profile_updated_at ON public.user_skills_profile;
CREATE TRIGGER update_user_skills_profile_updated_at
  BEFORE UPDATE ON public.user_skills_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_volunteer_applications_updated_at ON public.volunteer_applications;
CREATE TRIGGER update_volunteer_applications_updated_at
  BEFORE UPDATE ON public.volunteer_applications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_schedules_updated_at ON public.service_schedules;
CREATE TRIGGER update_service_schedules_updated_at
  BEFORE UPDATE ON public.service_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_service_schedule_volunteers_updated_at ON public.service_schedule_volunteers;
CREATE TRIGGER update_service_schedule_volunteers_updated_at
  BEFORE UPDATE ON public.service_schedule_volunteers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();