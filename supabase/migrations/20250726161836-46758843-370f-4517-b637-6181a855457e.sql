-- Criar tabela para gerenciamento de conteúdo
CREATE TABLE public.conteudo_site (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chave TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  valor TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'texto',
  categoria TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.conteudo_site ENABLE ROW LEVEL SECURITY;

-- Política para permitir que qualquer um veja os conteúdos
CREATE POLICY "Qualquer um pode ver conteúdos" 
ON public.conteudo_site 
FOR SELECT 
USING (true);

-- Política para permitir que apenas admins modifiquem conteúdos
CREATE POLICY "Apenas admins podem modificar conteúdos" 
ON public.conteudo_site 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true
  )
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_conteudo_site_updated_at
BEFORE UPDATE ON public.conteudo_site
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir conteúdos padrão do site
INSERT INTO public.conteudo_site (chave, titulo, valor, tipo, categoria, descricao) VALUES
('hero_titulo', 'Título Principal', 'Comunidade Bíblica Nova Kerigma', 'texto', 'home', 'Título principal da página inicial'),
('hero_subtitulo', 'Subtítulo Principal', 'Uma comunidade de fé, amor e esperança no coração de São Luís', 'texto', 'home', 'Subtítulo da página inicial'),
('sobre_titulo', 'Título Sobre Nós', 'Sobre Nossa Comunidade', 'texto', 'sobre', 'Título da seção sobre nós'),
('sobre_descricao', 'Descrição Sobre Nós', 'Somos uma comunidade cristã comprometida em viver e compartilhar o evangelho de Jesus Cristo através do amor, da comunhão e do serviço.', 'textarea', 'sobre', 'Descrição principal sobre a comunidade'),
('contato_titulo', 'Título Contato', 'Entre em Contato', 'texto', 'contato', 'Título da página de contato'),
('contato_descricao', 'Descrição Contato', 'Estamos aqui para você. Entre em contato conosco!', 'texto', 'contato', 'Descrição da página de contato'),
('celulas_titulo', 'Título Células', 'Nossas Células', 'texto', 'celulas', 'Título da página de células'),
('celulas_descricao', 'Descrição Células', 'Conecte-se, cresça e faça a diferença em nossa comunidade', 'texto', 'celulas', 'Descrição da página de células'),
('agenda_titulo', 'Título Agenda', 'Nossa Agenda', 'texto', 'agenda', 'Título da página de agenda'),
('galeria_titulo', 'Título Galeria', 'Nossa Galeria', 'texto', 'galeria', 'Título da página de galeria'),
('footer_endereco', 'Endereço Rodapé', 'Estrada de Ribamar, Km 2, N.º 5 - Aurora, São Luís, MA', 'texto', 'footer', 'Endereço no rodapé'),
('footer_telefone', 'Telefone Rodapé', '(98) 3245-1234', 'texto', 'footer', 'Telefone no rodapé'),
('footer_email', 'Email Rodapé', 'contato@cbnkerigma.org.br', 'texto', 'footer', 'Email no rodapé');