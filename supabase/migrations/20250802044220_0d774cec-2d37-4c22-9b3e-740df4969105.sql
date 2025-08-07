-- Criar tabela para categorias de galeria
CREATE TABLE public.categorias_galeria (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT NOT NULL DEFAULT '#6366f1',
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para categorias de conteúdo
CREATE TABLE public.categorias_conteudo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT NOT NULL DEFAULT '#6366f1',
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para categorias de eventos
CREATE TABLE public.categorias_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT NOT NULL DEFAULT '#6366f1',
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.categorias_galeria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_conteudo ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias_eventos ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias_galeria
CREATE POLICY "Qualquer um pode ver categorias de galeria ativas" 
ON categorias_galeria 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Admins podem gerenciar categorias de galeria" 
ON categorias_galeria 
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

-- Políticas para categorias_conteudo
CREATE POLICY "Qualquer um pode ver categorias de conteúdo ativas" 
ON categorias_conteudo 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Admins podem gerenciar categorias de conteúdo" 
ON categorias_conteudo 
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

-- Políticas para categorias_eventos
CREATE POLICY "Qualquer um pode ver categorias de eventos ativas" 
ON categorias_eventos 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Admins podem gerenciar categorias de eventos" 
ON categorias_eventos 
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

-- Triggers para atualizar updated_at
CREATE TRIGGER update_categorias_galeria_updated_at
  BEFORE UPDATE ON categorias_galeria
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_conteudo_updated_at
  BEFORE UPDATE ON categorias_conteudo
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categorias_eventos_updated_at
  BEFORE UPDATE ON categorias_eventos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas categorias padrão
INSERT INTO categorias_galeria (nome, descricao, cor) VALUES
('Culto', 'Fotos de cultos dominicais e especiais', '#8B5CF6'),
('Célula', 'Fotos de reuniões de células', '#06B6D4'),
('Evento', 'Fotos de eventos especiais', '#F59E0B'),
('Batismo', 'Fotos de batismos', '#3B82F6'),
('Casamento', 'Fotos de casamentos', '#EC4899'),
('Jovens', 'Fotos de atividades dos jovens', '#10B981'),
('Geral', 'Fotos diversas', '#6B7280');

INSERT INTO categorias_conteudo (nome, descricao, cor) VALUES
('Home', 'Conteúdo da página inicial', '#8B5CF6'),
('Sobre', 'Conteúdo da página sobre', '#06B6D4'),
('Contato', 'Informações de contato', '#F59E0B'),
('Células', 'Conteúdo sobre células', '#3B82F6'),
('Agenda', 'Conteúdo da agenda', '#EC4899'),
('Galeria', 'Conteúdo da galeria', '#10B981'),
('Footer', 'Conteúdo do rodapé', '#6B7280'),
('Geral', 'Conteúdo geral', '#64748B');

INSERT INTO categorias_eventos (nome, descricao, cor) VALUES
('Culto', 'Cultos dominicais e especiais', '#8B5CF6'),
('Célula', 'Reuniões de células', '#06B6D4'),
('Conferência', 'Conferências e congressos', '#F59E0B'),
('Workshop', 'Workshops e treinamentos', '#3B82F6'),
('Retiro', 'Retiros espirituais', '#EC4899'),
('Reunião', 'Reuniões administrativas', '#10B981'),
('Batismo', 'Cerimônias de batismo', '#8B5CF6'),
('Casamento', 'Cerimônias de casamento', '#EC4899'),
('Outro', 'Outros tipos de eventos', '#6B7280');