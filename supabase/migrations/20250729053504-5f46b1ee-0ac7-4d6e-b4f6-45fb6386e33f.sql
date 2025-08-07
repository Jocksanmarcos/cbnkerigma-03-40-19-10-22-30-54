-- Verificar e corrigir a estrutura da tabela pessoas para suportar user_id nullable

-- 1. Verificar se a coluna user_id existe e é nullable
ALTER TABLE IF EXISTS public.pessoas 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_pessoas_user_id ON public.pessoas(user_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON public.pessoas(email);

-- 3. Política adicional para admins poderem ver todos os dados de pessoas
DROP POLICY IF EXISTS "Admins podem ver todas as pessoas" ON public.pessoas;
CREATE POLICY "Admins podem ver todas as pessoas" 
ON public.pessoas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE usuarios_admin.user_id = auth.uid() 
    AND usuarios_admin.ativo = true
  )
);

-- 4. Política para admins poderem atualizar pessoas
DROP POLICY IF EXISTS "Admins podem atualizar pessoas" ON public.pessoas;
CREATE POLICY "Admins podem atualizar pessoas" 
ON public.pessoas 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE usuarios_admin.user_id = auth.uid() 
    AND usuarios_admin.ativo = true
  )
);

-- 5. Garantir que a coluna user_id é nullable (pessoas podem existir sem conta de usuário)
ALTER TABLE public.pessoas ALTER COLUMN user_id DROP NOT NULL;