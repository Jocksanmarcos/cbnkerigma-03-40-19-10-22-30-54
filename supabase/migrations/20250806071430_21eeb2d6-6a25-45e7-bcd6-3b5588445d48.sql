-- === IMPLEMENTAÇÃO DE POLÍTICAS RLS GRANULARES - VERSÃO SIMPLIFICADA ===

-- 1. Remover políticas existentes se houver problemas
DO $$ 
BEGIN
  -- Remover políticas antigas se existirem
  DROP POLICY IF EXISTS "Security admins can view all audit logs" ON public.security_audit_logs;
  DROP POLICY IF EXISTS "System can create audit logs" ON public.security_audit_logs;
  DROP POLICY IF EXISTS "Users can view own sessions" ON public.security_active_sessions;
  DROP POLICY IF EXISTS "Security admins can manage all sessions" ON public.security_active_sessions;
  DROP POLICY IF EXISTS "System can manage sessions" ON public.security_active_sessions;
  DROP POLICY IF EXISTS "Users can manage own MFA settings" ON public.security_mfa_settings;
  DROP POLICY IF EXISTS "Security admins can view MFA status" ON public.security_mfa_settings;
END $$;

-- 2. Ativar RLS nas tabelas de segurança se existirem
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit_logs' AND table_schema = 'public') THEN
    ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_active_sessions' AND table_schema = 'public') THEN
    ALTER TABLE public.security_active_sessions ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_mfa_settings' AND table_schema = 'public') THEN
    ALTER TABLE public.security_mfa_settings ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- 3. Criar políticas RLS para auditoria
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_audit_logs' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Security admins can view all audit logs" ON public.security_audit_logs
    FOR SELECT USING (is_security_admin())';
    
    EXECUTE 'CREATE POLICY "System can create audit logs" ON public.security_audit_logs
    FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- 4. Criar políticas RLS para sessões ativas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_active_sessions' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Users can view own sessions" ON public.security_active_sessions
    FOR SELECT USING (user_id = auth.uid() OR is_security_admin())';
    
    EXECUTE 'CREATE POLICY "Security admins can manage all sessions" ON public.security_active_sessions
    FOR ALL USING (is_security_admin())';
    
    EXECUTE 'CREATE POLICY "System can manage sessions" ON public.security_active_sessions
    FOR INSERT WITH CHECK (true)';
  END IF;
END $$;

-- 5. Criar políticas RLS para MFA
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'security_mfa_settings' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "Users can manage own MFA settings" ON public.security_mfa_settings
    FOR ALL USING (user_id = auth.uid())';
    
    EXECUTE 'CREATE POLICY "Security admins can view MFA status" ON public.security_mfa_settings
    FOR SELECT USING (is_security_admin())';
  END IF;
END $$;

-- 6. Implementar políticas granulares para tabela pessoas
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pessoas' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Líderes só podem ver membros da sua própria célula" ON public.pessoas;
    DROP POLICY IF EXISTS "Usuários podem editar apenas seu próprio perfil" ON public.pessoas;
    
    EXECUTE 'CREATE POLICY "Líderes só podem ver membros da sua própria célula" ON public.pessoas
    FOR SELECT USING (
      auth.uid() IS NOT NULL AND (
        is_security_admin() OR 
        user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM public.celula_participantes cp1
          JOIN public.celula_participantes cp2 ON cp1.celula_id = cp2.celula_id
          WHERE cp1.pessoa_id = pessoas.id 
          AND cp2.pessoa_id = (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
          AND cp2.papel_na_celula IN (''lider'', ''auxiliar'')
        )
      )
    )';
    
    EXECUTE 'CREATE POLICY "Usuários podem editar apenas seu próprio perfil" ON public.pessoas
    FOR UPDATE USING (
      user_id = auth.uid() OR is_security_admin()
    )';
  END IF;
END $$;

-- 7. Implementar políticas para ensino/progresso
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'matriculas_ensino' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Alunos só podem ver seu próprio progresso" ON public.matriculas_ensino;
    
    EXECUTE 'CREATE POLICY "Alunos só podem ver seu próprio progresso" ON public.matriculas_ensino
    FOR SELECT USING (
      pessoa_id = (SELECT id FROM public.pessoas WHERE user_id = auth.uid()) OR
      is_security_admin()
    )';
  END IF;
END $$;

-- 8. Políticas para dados financeiros
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'lancamentos_financeiros' AND table_schema = 'public') THEN
    DROP POLICY IF EXISTS "Apenas admins podem gerenciar dados financeiros" ON public.lancamentos_financeiros;
    
    EXECUTE 'CREATE POLICY "Apenas admins podem gerenciar dados financeiros" ON public.lancamentos_financeiros
    FOR ALL USING (
      has_security_permission(auth.uid(), ''financeiro'', ''manage'') OR
      is_security_admin()
    )';
  END IF;
END $$;