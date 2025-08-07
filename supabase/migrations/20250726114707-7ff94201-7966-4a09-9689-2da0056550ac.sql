-- Criação das tabelas principais do site da igreja

-- Tabela de contatos (formulário de contato)
CREATE TABLE public.contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'respondido', 'arquivado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de contribuições (dízimos e ofertas)
CREATE TABLE public.contribuicoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('dizimo', 'oferta', 'missoes', 'obras')),
  mensagem TEXT,
  metodo_pagamento TEXT DEFAULT 'pix' CHECK (metodo_pagamento IN ('pix', 'transferencia', 'dinheiro')),
  comprovante_url TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de células
CREATE TABLE public.celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  lider TEXT NOT NULL,
  endereco TEXT NOT NULL,
  bairro TEXT NOT NULL,
  dia_semana TEXT NOT NULL,
  horario TIME NOT NULL,
  telefone TEXT,
  descricao TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  membros_atual INTEGER DEFAULT 0,
  membros_maximo INTEGER DEFAULT 20,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de eventos/agenda
CREATE TABLE public.eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT NOT NULL,
  endereco TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('culto', 'celula', 'evento_especial', 'jovens', 'lideranca', 'familia')),
  recorrente BOOLEAN DEFAULT false,
  recorrencia_tipo TEXT CHECK (recorrencia_tipo IN ('diario', 'semanal', 'mensal', 'anual')),
  publico BOOLEAN DEFAULT true,
  capacidade INTEGER,
  inscricoes_abertas BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de estudos bíblicos
CREATE TABLE public.estudos_biblicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  versiculo_chave TEXT,
  semana_inicio DATE NOT NULL,
  semana_fim DATE NOT NULL,
  arquivo_url TEXT,
  arquivo_nome TEXT,
  arquivo_tamanho TEXT,
  downloads INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de galeria de fotos
CREATE TABLE public.galeria_fotos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  evento_id UUID REFERENCES public.eventos(id),
  url_imagem TEXT NOT NULL,
  url_thumbnail TEXT,
  data_evento DATE,
  categoria TEXT DEFAULT 'geral' CHECK (categoria IN ('culto', 'celula', 'evento', 'batismo', 'casamento', 'jovens', 'geral')),
  ordem INTEGER DEFAULT 0,
  destaque BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de usuários administrativos (opcional para futuro)
CREATE TABLE public.usuarios_admin (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  papel TEXT DEFAULT 'editor' CHECK (papel IN ('admin', 'editor', 'visualizador')),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contribuicoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estudos_biblicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galeria_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acesso público (leitura) e inserção de formulários

-- Contatos - Qualquer um pode inserir, apenas admins podem ver
CREATE POLICY "Qualquer um pode enviar contatos"
ON public.contatos
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Apenas admins podem ver contatos"
ON public.contatos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Contribuições - Qualquer um pode inserir, apenas admins podem ver
CREATE POLICY "Qualquer um pode enviar contribuições"
ON public.contribuicoes
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Apenas admins podem ver contribuições"
ON public.contribuicoes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Células - Leitura pública, apenas admins podem modificar
CREATE POLICY "Qualquer um pode ver células ativas"
ON public.celulas
FOR SELECT
TO anon, authenticated
USING (ativa = true);

CREATE POLICY "Apenas admins podem modificar células"
ON public.celulas
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Eventos - Leitura pública para eventos públicos
CREATE POLICY "Qualquer um pode ver eventos públicos"
ON public.eventos
FOR SELECT
TO anon, authenticated
USING (publico = true);

CREATE POLICY "Apenas admins podem modificar eventos"
ON public.eventos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Estudos bíblicos - Leitura pública para estudos ativos
CREATE POLICY "Qualquer um pode ver estudos ativos"
ON public.estudos_biblicos
FOR SELECT
TO anon, authenticated
USING (ativo = true);

CREATE POLICY "Apenas admins podem modificar estudos"
ON public.estudos_biblicos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Galeria - Leitura pública
CREATE POLICY "Qualquer um pode ver fotos da galeria"
ON public.galeria_fotos
FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Apenas admins podem modificar galeria"
ON public.galeria_fotos
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Usuários admin - Apenas para usuários autenticados que já são admins
CREATE POLICY "Apenas admins podem ver outros admins"
ON public.usuarios_admin
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true AND papel = 'admin'
  )
);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_contatos_updated_at
  BEFORE UPDATE ON public.contatos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contribuicoes_updated_at
  BEFORE UPDATE ON public.contribuicoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_celulas_updated_at
  BEFORE UPDATE ON public.celulas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at
  BEFORE UPDATE ON public.eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estudos_biblicos_updated_at
  BEFORE UPDATE ON public.estudos_biblicos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usuarios_admin_updated_at
  BEFORE UPDATE ON public.usuarios_admin
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();