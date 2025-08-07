-- ========================================
-- RLS POLICIES PARA OS NOVOS MÓDULOS
-- ========================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_skills_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_schedule_volunteers ENABLE ROW LEVEL SECURITY;

-- ========================================
-- POLÍTICAS PARA COMUNICAÇÃO
-- ========================================

-- Canais de comunicação
CREATE POLICY "Usuários podem ver canais públicos ou onde são membros" ON public.communication_channels
  FOR SELECT TO authenticated
  USING (
    is_public = true OR 
    id IN (
      SELECT channel_id FROM public.communication_channel_members 
      WHERE user_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    ) OR
    is_sede_admin()
  );

CREATE POLICY "Admins e líderes podem gerenciar canais" ON public.communication_channels
  FOR ALL TO authenticated
  USING (is_sede_admin() OR is_pastor_missao())
  WITH CHECK (is_sede_admin() OR is_pastor_missao());

-- Membros dos canais
CREATE POLICY "Usuários podem ver membros dos canais que participam" ON public.communication_channel_members
  FOR SELECT TO authenticated
  USING (
    channel_id IN (
      SELECT channel_id FROM public.communication_channel_members 
      WHERE user_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    ) OR
    is_sede_admin()
  );

CREATE POLICY "Admins podem gerenciar membros dos canais" ON public.communication_channel_members
  FOR ALL TO authenticated
  USING (is_sede_admin())
  WITH CHECK (is_sede_admin());

-- Mensagens
CREATE POLICY "Usuários podem ver mensagens dos canais que participam" ON public.communication_messages
  FOR SELECT TO authenticated
  USING (
    channel_id IN (
      SELECT channel_id FROM public.communication_channel_members 
      WHERE user_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    ) OR
    is_sede_admin()
  );

CREATE POLICY "Usuários podem enviar mensagens nos canais que participam" ON public.communication_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()) AND
    channel_id IN (
      SELECT channel_id FROM public.communication_channel_members 
      WHERE user_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Usuários podem editar próprias mensagens" ON public.communication_messages
  FOR UPDATE TO authenticated
  USING (sender_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()))
  WITH CHECK (sender_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()));

-- Avisos
CREATE POLICY "Usuários podem ver avisos ativos direcionados a eles" ON public.announcements
  FOR SELECT TO authenticated
  USING (is_active = true AND (target_audience @> ARRAY['all'] OR is_sede_admin()));

CREATE POLICY "Admins podem gerenciar avisos" ON public.announcements
  FOR ALL TO authenticated
  USING (is_sede_admin())
  WITH CHECK (is_sede_admin());

-- ========================================
-- POLÍTICAS PARA MINISTÉRIOS E VOLUNTÁRIOS
-- ========================================

-- Ministérios
CREATE POLICY "Qualquer um pode ver ministérios ativos" ON public.ministries
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins e líderes podem gerenciar ministérios" ON public.ministries
  FOR ALL TO authenticated
  USING (is_sede_admin() OR is_pastor_missao())
  WITH CHECK (is_sede_admin() OR is_pastor_missao());

-- Oportunidades de serviço
CREATE POLICY "Qualquer um pode ver oportunidades ativas" ON public.service_opportunities
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY "Admins e líderes de ministério podem gerenciar oportunidades" ON public.service_opportunities
  FOR ALL TO authenticated
  USING (
    is_sede_admin() OR
    is_pastor_missao() OR
    ministry_id IN (
      SELECT id FROM public.ministries 
      WHERE leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    is_sede_admin() OR
    is_pastor_missao() OR
    ministry_id IN (
      SELECT id FROM public.ministries 
      WHERE leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  );

-- Perfil de dons dos usuários
CREATE POLICY "Usuários podem gerenciar próprio perfil de dons" ON public.user_skills_profile
  FOR ALL TO authenticated
  USING (user_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Líderes podem ver perfis de dons" ON public.user_skills_profile
  FOR SELECT TO authenticated
  USING (is_sede_admin() OR is_pastor_missao());

-- Candidaturas para voluntariado
CREATE POLICY "Usuários podem ver e gerenciar próprias candidaturas" ON public.volunteer_applications
  FOR ALL TO authenticated
  USING (user_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Líderes podem ver candidaturas dos seus ministérios" ON public.volunteer_applications
  FOR SELECT TO authenticated
  USING (
    is_sede_admin() OR
    is_pastor_missao() OR
    service_opportunity_id IN (
      SELECT so.id FROM public.service_opportunities so
      JOIN public.ministries m ON m.id = so.ministry_id
      WHERE m.leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Líderes podem aprovar candidaturas dos seus ministérios" ON public.volunteer_applications
  FOR UPDATE TO authenticated
  USING (
    is_sede_admin() OR
    is_pastor_missao() OR
    service_opportunity_id IN (
      SELECT so.id FROM public.service_opportunities so
      JOIN public.ministries m ON m.id = so.ministry_id
      WHERE m.leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  );

-- Escalas de serviço
CREATE POLICY "Usuários podem ver escalas dos ministérios que participam" ON public.service_schedules
  FOR SELECT TO authenticated
  USING (
    is_sede_admin() OR
    is_pastor_missao() OR
    ministry_id IN (
      SELECT ministry_id FROM public.ministries 
      WHERE leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    ) OR
    id IN (
      SELECT schedule_id FROM public.service_schedule_volunteers
      WHERE volunteer_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Líderes podem gerenciar escalas dos seus ministérios" ON public.service_schedules
  FOR ALL TO authenticated
  USING (
    is_sede_admin() OR
    is_pastor_missao() OR
    ministry_id IN (
      SELECT id FROM public.ministries 
      WHERE leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    is_sede_admin() OR
    is_pastor_missao() OR
    ministry_id IN (
      SELECT id FROM public.ministries 
      WHERE leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  );

-- Voluntários em escalas
CREATE POLICY "Usuários podem ver escalas onde estão designados" ON public.service_schedule_volunteers
  FOR SELECT TO authenticated
  USING (
    volunteer_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()) OR
    is_sede_admin() OR
    is_pastor_missao() OR
    schedule_id IN (
      SELECT ss.id FROM public.service_schedules ss
      JOIN public.ministries m ON m.id = ss.ministry_id
      WHERE m.leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Voluntários podem atualizar próprio status" ON public.service_schedule_volunteers
  FOR UPDATE TO authenticated
  USING (volunteer_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()))
  WITH CHECK (volunteer_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Líderes podem gerenciar voluntários nas escalas dos seus ministérios" ON public.service_schedule_volunteers
  FOR ALL TO authenticated
  USING (
    is_sede_admin() OR
    is_pastor_missao() OR
    schedule_id IN (
      SELECT ss.id FROM public.service_schedules ss
      JOIN public.ministries m ON m.id = ss.ministry_id
      WHERE m.leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  )
  WITH CHECK (
    is_sede_admin() OR
    is_pastor_missao() OR
    schedule_id IN (
      SELECT ss.id FROM public.service_schedules ss
      JOIN public.ministries m ON m.id = ss.ministry_id
      WHERE m.leader_id IN (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
    )
  );