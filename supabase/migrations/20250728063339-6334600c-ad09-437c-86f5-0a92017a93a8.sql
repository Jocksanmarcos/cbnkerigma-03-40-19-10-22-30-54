-- Criar bucket para comprovantes financeiros
INSERT INTO storage.buckets (id, name, public) VALUES ('comprovantes-financeiros', 'comprovantes-financeiros', false);

-- Políticas para comprovantes financeiros
CREATE POLICY "Admins podem ver comprovantes" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'comprovantes-financeiros' AND 
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

CREATE POLICY "Admins podem enviar comprovantes" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'comprovantes-financeiros' AND 
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

CREATE POLICY "Admins podem atualizar comprovantes" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'comprovantes-financeiros' AND 
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

CREATE POLICY "Admins podem deletar comprovantes" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'comprovantes-financeiros' AND 
  EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);