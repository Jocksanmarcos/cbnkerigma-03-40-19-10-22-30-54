-- Adicionar campo imagem_url na tabela agenda_eventos
ALTER TABLE public.agenda_eventos 
ADD COLUMN imagem_url TEXT;

-- Criar bucket para imagens de eventos se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('eventos', 'eventos', true)
ON CONFLICT (id) DO NOTHING;

-- Criar políticas para o bucket de eventos
CREATE POLICY "Imagens de eventos são públicas" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'eventos');

CREATE POLICY "Admins podem fazer upload de imagens de eventos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'eventos' 
  AND (auth.uid() IN (
    SELECT user_id 
    FROM public.usuarios_admin 
    WHERE ativo = true 
    AND papel IN ('admin', 'lider')
  ))
);

CREATE POLICY "Admins podem atualizar imagens de eventos" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'eventos' 
  AND (auth.uid() IN (
    SELECT user_id 
    FROM public.usuarios_admin 
    WHERE ativo = true 
    AND papel IN ('admin', 'lider')
  ))
);

CREATE POLICY "Admins podem deletar imagens de eventos" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'eventos' 
  AND (auth.uid() IN (
    SELECT user_id 
    FROM public.usuarios_admin 
    WHERE ativo = true 
    AND papel IN ('admin', 'lider')
  ))
);