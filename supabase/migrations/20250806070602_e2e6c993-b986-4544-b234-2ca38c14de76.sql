-- === IMPLEMENTAÇÃO DE POLÍTICAS RLS GRANULARES PARA SISTEMA RBAC+ABAC ===

-- 1. Criar tabela de auditoria para registro de todas as ações
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 2. Criar tabela para sessões ativas (para gerenciamento de sessões)
CREATE TABLE IF NOT EXISTS public.security_active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL,
  device_info JSONB DEFAULT '{}',
  ip_address INET,
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Criar tabela para configurações de MFA (Two-Factor Authentication)
CREATE TABLE IF NOT EXISTS public.security_mfa_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  enabled BOOLEAN DEFAULT false,
  secret_key TEXT,
  backup_codes TEXT[],
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Adicionar índices para performance
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_user_id ON public.security_audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_created_at ON public.security_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_logs_resource_type ON public.security_audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_security_active_sessions_user_id ON public.security_active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_security_active_sessions_expires_at ON public.security_active_sessions(expires_at);

-- 5. Ativar RLS nas novas tabelas
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_active_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_mfa_settings ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para auditoria
CREATE POLICY "Security admins can view all audit logs" ON public.security_audit_logs
FOR SELECT USING (is_security_admin());

CREATE POLICY "System can create audit logs" ON public.security_audit_logs
FOR INSERT WITH CHECK (true);

-- 7. Criar políticas RLS para sessões ativas
CREATE POLICY "Users can view own sessions" ON public.security_active_sessions
FOR SELECT USING (user_id = auth.uid() OR is_security_admin());

CREATE POLICY "Security admins can manage all sessions" ON public.security_active_sessions
FOR ALL USING (is_security_admin());

CREATE POLICY "System can manage sessions" ON public.security_active_sessions
FOR INSERT WITH CHECK (true);

-- 8. Criar políticas RLS para MFA
CREATE POLICY "Users can manage own MFA settings" ON public.security_mfa_settings
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Security admins can view MFA status" ON public.security_mfa_settings
FOR SELECT USING (is_security_admin());

-- 9. Implementar políticas granulares para tabela pessoas
DROP POLICY IF EXISTS "Líderes só podem ver membros da sua própria célula" ON public.pessoas;
CREATE POLICY "Líderes só podem ver membros da sua própria célula" ON public.pessoas
FOR SELECT USING (
  auth.uid() IS NOT NULL AND (
    -- Admin pode ver todos
    is_security_admin() OR 
    -- Usuário pode ver próprio perfil
    user_id = auth.uid() OR
    -- Líder pode ver membros de suas células
    EXISTS (
      SELECT 1 FROM public.celula_participantes cp1
      JOIN public.celula_participantes cp2 ON cp1.celula_id = cp2.celula_id
      WHERE cp1.pessoa_id = pessoas.id 
      AND cp2.pessoa_id = (SELECT id FROM public.pessoas WHERE user_id = auth.uid())
      AND cp2.papel_na_celula IN ('lider', 'auxiliar')
    )
  )
);

DROP POLICY IF EXISTS "Usuários podem editar apenas seu próprio perfil" ON public.pessoas;
CREATE POLICY "Usuários podem editar apenas seu próprio perfil" ON public.pessoas
FOR UPDATE USING (
  user_id = auth.uid() OR is_security_admin()
);

-- 10. Implementar políticas para ensino/progresso
CREATE POLICY "Alunos só podem ver seu próprio progresso" ON public.matriculas_ensino
FOR SELECT USING (
  pessoa_id = (SELECT id FROM public.pessoas WHERE user_id = auth.uid()) OR
  is_security_admin()
);

-- 11. Políticas para dados financeiros (apenas admins)
DROP POLICY IF EXISTS "Apenas admins podem gerenciar dados financeiros" ON public.lancamentos_financeiros;
CREATE POLICY "Apenas admins podem gerenciar dados financeiros" ON public.lancamentos_financeiros
FOR ALL USING (
  has_security_permission(auth.uid(), 'financeiro', 'manage') OR
  is_security_admin()
);

-- 12. Criar trigger para auditoria automática
CREATE OR REPLACE FUNCTION public.auto_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  action_type TEXT;
BEGIN
  -- Determinar o tipo de ação
  IF TG_OP = 'INSERT' THEN
    action_type := 'CREATE';
    new_data := to_jsonb(NEW);
    old_data := NULL;
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'UPDATE';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'DELETE';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;

  -- Inserir log de auditoria
  INSERT INTO public.security_audit_logs (
    user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata
  ) VALUES (
    auth.uid(),
    action_type,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    old_data,
    new_data,
    jsonb_build_object(
      'table', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME,
      'trigger_time', now()
    )
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 13. Aplicar trigger de auditoria nas tabelas críticas
DROP TRIGGER IF EXISTS audit_pessoas_changes ON public.pessoas;
CREATE TRIGGER audit_pessoas_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.pessoas
  FOR EACH ROW EXECUTE FUNCTION public.auto_audit_trigger();

DROP TRIGGER IF EXISTS audit_celulas_changes ON public.celulas;
CREATE TRIGGER audit_celulas_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.celulas
  FOR EACH ROW EXECUTE FUNCTION public.auto_audit_trigger();

DROP TRIGGER IF EXISTS audit_financeiro_changes ON public.lancamentos_financeiros;
CREATE TRIGGER audit_financeiro_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION public.auto_audit_trigger();

-- 14. Função para limpeza de sessões expiradas
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.security_active_sessions 
  WHERE expires_at < now() OR last_activity < (now() - INTERVAL '7 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;