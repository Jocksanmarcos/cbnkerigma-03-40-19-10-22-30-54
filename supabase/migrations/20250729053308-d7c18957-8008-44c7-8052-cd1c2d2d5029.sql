-- Corrigir problemas de segurança RLS e vincular dados de pessoas com usuários

-- 1. Ativar RLS em tabelas críticas se não estiver ativo
ALTER TABLE IF EXISTS public.pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.matriculas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.cursos ENABLE ROW LEVEL SECURITY;

-- 2. Criar políticas RLS para pessoas (usuários podem ver apenas seus próprios dados)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios dados" ON public.pessoas;
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.pessoas 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios dados" ON public.pessoas;
CREATE POLICY "Usuários podem atualizar seus próprios dados" 
ON public.pessoas 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 3. Políticas para matrículas (alunos podem ver apenas suas matrículas)
DROP POLICY IF EXISTS "Usuários podem ver suas próprias matrículas através de pessoas" ON public.matriculas;
CREATE POLICY "Usuários podem ver suas próprias matrículas através de pessoas" 
ON public.matriculas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pessoas 
    WHERE pessoas.id = matriculas.pessoa_id 
    AND pessoas.user_id = auth.uid()
  )
);

-- 4. Políticas para turmas (usuários podem ver turmas onde estão matriculados)
DROP POLICY IF EXISTS "Usuários podem ver turmas onde estão matriculados" ON public.turmas;
CREATE POLICY "Usuários podem ver turmas onde estão matriculados" 
ON public.turmas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.matriculas
    JOIN public.pessoas ON pessoas.id = matriculas.pessoa_id
    WHERE matriculas.turma_id = turmas.id 
    AND pessoas.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE usuarios_admin.user_id = auth.uid() 
    AND usuarios_admin.ativo = true
  )
);

-- 5. Políticas para cursos (usuários podem ver cursos onde estão matriculados ou cursos públicos)
DROP POLICY IF EXISTS "Usuários podem ver cursos disponíveis" ON public.cursos;
CREATE POLICY "Usuários podem ver cursos disponíveis" 
ON public.cursos 
FOR SELECT 
USING (
  ativo = true 
  OR 
  EXISTS (
    SELECT 1 FROM public.matriculas
    JOIN public.pessoas ON pessoas.id = matriculas.pessoa_id
    JOIN public.turmas ON turmas.id = matriculas.turma_id
    WHERE turmas.curso_id = cursos.id 
    AND pessoas.user_id = auth.uid()
  )
  OR
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE usuarios_admin.user_id = auth.uid() 
    AND usuarios_admin.ativo = true
  )
);

-- 6. Atualizar função de reset de senha para incluir domínio correto
CREATE OR REPLACE FUNCTION public.get_site_url()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Retorna a URL base do site para redirecionamentos
  RETURN 'https://f239131e-7b11-4349-b1f8-04f6401da903.lovableproject.com';
END;
$$;