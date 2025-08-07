-- Criar bucket para galeria de fotos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('galeria', 'galeria', true);

-- Política para permitir que qualquer um veja as imagens da galeria
CREATE POLICY "Imagens da galeria são públicas" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'galeria');

-- Política para permitir que admins façam upload de imagens
CREATE POLICY "Admins podem fazer upload na galeria" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'galeria' AND 
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true
  )
);

-- Política para permitir que admins atualizem imagens
CREATE POLICY "Admins podem atualizar imagens da galeria" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'galeria' AND 
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true
  )
);

-- Política para permitir que admins deletem imagens
CREATE POLICY "Admins podem deletar imagens da galeria" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'galeria' AND 
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true
  )
);