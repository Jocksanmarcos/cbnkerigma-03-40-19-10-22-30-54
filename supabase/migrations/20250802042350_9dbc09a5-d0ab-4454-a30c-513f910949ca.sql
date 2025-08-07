-- Adicionar políticas RLS para administradores gerenciarem cursos
CREATE POLICY "Admins podem gerenciar cursos" 
ON cursos_ensino 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel IN ('admin', 'lider')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel IN ('admin', 'lider')
  )
);