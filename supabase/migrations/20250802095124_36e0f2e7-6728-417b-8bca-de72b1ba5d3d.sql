-- Atualizar políticas existentes para incluir igreja_id

-- Política para pessoas
DROP POLICY IF EXISTS "Admins e líderes podem ver todas as pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Admins e líderes podem atualizar pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Admins e líderes podem criar pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Apenas admins podem deletar pessoas" ON public.pessoas;

CREATE POLICY "Acesso pessoas por igreja"
ON public.pessoas
FOR ALL
USING (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
)
WITH CHECK (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
);

-- Política para células
DROP POLICY IF EXISTS "Qualquer um pode ver células ativas" ON public.celulas;
DROP POLICY IF EXISTS "Admins e líderes podem criar células" ON public.celulas;
DROP POLICY IF EXISTS "Admins e líderes podem atualizar células" ON public.celulas;
DROP POLICY IF EXISTS "Apenas admins podem deletar células" ON public.celulas;

CREATE POLICY "Acesso células por igreja"
ON public.celulas
FOR ALL
USING (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
)
WITH CHECK (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
);

-- Política para lançamentos financeiros
DROP POLICY IF EXISTS "Apenas admins podem gerenciar lançamentos financeiros" ON public.lancamentos_financeiros;

CREATE POLICY "Acesso financeiro por igreja"
ON public.lancamentos_financeiros
FOR ALL
USING (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
)
WITH CHECK (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
);

-- Política para eventos
DROP POLICY IF EXISTS "Qualquer um pode ver eventos públicos" ON public.eventos;

CREATE POLICY "Acesso eventos por igreja"
ON public.eventos
FOR ALL
USING (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
)
WITH CHECK (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
);