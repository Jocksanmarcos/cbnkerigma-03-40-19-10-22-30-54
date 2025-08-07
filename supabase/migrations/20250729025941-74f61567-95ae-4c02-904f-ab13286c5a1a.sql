-- Adicionar coluna user_id na tabela pessoas para vincular com auth.users
ALTER TABLE public.pessoas 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX idx_pessoas_user_id ON public.pessoas(user_id);

-- Atualizar políticas RLS para permitir que usuários vejam seus próprios dados
CREATE POLICY "Usuários podem ver seus próprios dados" 
ON public.pessoas 
FOR SELECT 
USING (auth.uid() = user_id);

-- Política para matrículas - usuários podem ver suas próprias matrículas
CREATE POLICY "Usuários podem ver suas próprias matrículas" 
ON public.matriculas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pessoas 
    WHERE pessoas.id = matriculas.pessoa_id 
    AND pessoas.user_id = auth.uid()
  )
);

-- Política para trilhas - usuários podem ver seus próprios progressos
CREATE POLICY "Usuários podem ver seus próprios progressos" 
ON public.progresso_trilhas 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.pessoas 
    WHERE pessoas.id = progresso_trilhas.pessoa_id 
    AND pessoas.user_id = auth.uid()
  )
);