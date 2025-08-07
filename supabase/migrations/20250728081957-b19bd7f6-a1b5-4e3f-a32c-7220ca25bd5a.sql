-- Criar tabelas para o módulo Patrimônio

-- Tabela de categorias de patrimônio
CREATE TABLE public.categorias_patrimonio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de subcategorias de patrimônio
CREATE TABLE public.subcategorias_patrimonio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria_id UUID NOT NULL REFERENCES public.categorias_patrimonio(id),
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela principal de patrimônio
CREATE TABLE public.patrimonios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  codigo_patrimonio TEXT UNIQUE,
  descricao TEXT,
  categoria_id UUID NOT NULL REFERENCES public.categorias_patrimonio(id),
  subcategoria_id UUID REFERENCES public.subcategorias_patrimonio(id),
  quantidade INTEGER NOT NULL DEFAULT 1,
  data_aquisicao DATE,
  valor_unitario NUMERIC(10,2),
  valor_total NUMERIC(10,2),
  nota_fiscal_url TEXT,
  localizacao_atual TEXT,
  responsavel_id UUID REFERENCES public.pessoas(id),
  ministerio_relacionado TEXT,
  estado_conservacao TEXT NOT NULL DEFAULT 'bom' CHECK (estado_conservacao IN ('novo', 'bom', 'usado', 'danificado', 'inservivel')),
  status TEXT NOT NULL DEFAULT 'em_uso' CHECK (status IN ('em_uso', 'em_manutencao', 'emprestado', 'encostado')),
  data_ultima_manutencao DATE,
  data_proxima_manutencao DATE,
  fotos JSONB DEFAULT '[]'::jsonb,
  documentos JSONB DEFAULT '[]'::jsonb,
  link_externo TEXT,
  observacoes TEXT,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de empréstimos de patrimônio
CREATE TABLE public.emprestimos_patrimonio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patrimonio_id UUID NOT NULL REFERENCES public.patrimonios(id),
  solicitante_id UUID NOT NULL REFERENCES public.pessoas(id),
  data_retirada DATE NOT NULL,
  data_prevista_devolucao DATE NOT NULL,
  data_devolucao DATE,
  local_uso TEXT,
  situacao_devolucao TEXT,
  responsavel_liberacao_id UUID REFERENCES public.pessoas(id),
  responsavel_devolucao_id UUID REFERENCES public.pessoas(id),
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'devolvido', 'atrasado')),
  termo_pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de manutenções
CREATE TABLE public.manutencoes_patrimonio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patrimonio_id UUID NOT NULL REFERENCES public.patrimonios(id),
  data_manutencao DATE NOT NULL,
  tipo_manutencao TEXT NOT NULL CHECK (tipo_manutencao IN ('preventiva', 'corretiva', 'revisao')),
  descricao TEXT NOT NULL,
  valor_gasto NUMERIC(10,2),
  responsavel_id UUID REFERENCES public.pessoas(id),
  empresa_responsavel TEXT,
  comprovante_url TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de patrimônio
CREATE TABLE public.historico_patrimonio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patrimonio_id UUID NOT NULL REFERENCES public.patrimonios(id),
  tipo_evento TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  usuario_responsavel UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.categorias_patrimonio (nome, descricao) VALUES
('Equipamento', 'Equipamentos eletrônicos e tecnológicos'),
('Móvel', 'Móveis e mobiliário em geral'),
('Instrumento', 'Instrumentos musicais'),
('Veículo', 'Veículos da igreja'),
('Imóvel', 'Bens imóveis'),
('Outros', 'Outros tipos de patrimônio');

-- Inserir subcategorias padrão
INSERT INTO public.subcategorias_patrimonio (nome, categoria_id) 
SELECT 'Áudio', id FROM public.categorias_patrimonio WHERE nome = 'Equipamento'
UNION ALL
SELECT 'Vídeo', id FROM public.categorias_patrimonio WHERE nome = 'Equipamento'
UNION ALL
SELECT 'Iluminação', id FROM public.categorias_patrimonio WHERE nome = 'Equipamento'
UNION ALL
SELECT 'Informática', id FROM public.categorias_patrimonio WHERE nome = 'Equipamento'
UNION ALL
SELECT 'Cadeiras', id FROM public.categorias_patrimonio WHERE nome = 'Móvel'
UNION ALL
SELECT 'Mesas', id FROM public.categorias_patrimonio WHERE nome = 'Móvel'
UNION ALL
SELECT 'Violão', id FROM public.categorias_patrimonio WHERE nome = 'Instrumento'
UNION ALL
SELECT 'Piano/Teclado', id FROM public.categorias_patrimonio WHERE nome = 'Instrumento'
UNION ALL
SELECT 'Bateria', id FROM public.categorias_patrimonio WHERE nome = 'Instrumento';

-- Habilitar RLS
ALTER TABLE public.categorias_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patrimonios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emprestimos_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes_patrimonio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_patrimonio ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categorias
CREATE POLICY "Admins podem gerenciar categorias patrimônio" ON public.categorias_patrimonio
FOR ALL USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Qualquer um pode ver categorias patrimônio ativas" ON public.categorias_patrimonio
FOR SELECT USING (ativa = true);

-- Políticas RLS para subcategorias
CREATE POLICY "Admins podem gerenciar subcategorias patrimônio" ON public.subcategorias_patrimonio
FOR ALL USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Qualquer um pode ver subcategorias patrimônio ativas" ON public.subcategorias_patrimonio
FOR SELECT USING (ativa = true);

-- Políticas RLS para patrimônios
CREATE POLICY "Admins podem gerenciar patrimônios" ON public.patrimonios
FOR ALL USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Qualquer um pode ver patrimônios ativos" ON public.patrimonios
FOR SELECT USING (ativo = true);

-- Políticas RLS para empréstimos
CREATE POLICY "Admins podem gerenciar empréstimos patrimônio" ON public.emprestimos_patrimonio
FOR ALL USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Políticas RLS para manutenções
CREATE POLICY "Admins podem gerenciar manutenções patrimônio" ON public.manutencoes_patrimonio
FOR ALL USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Políticas RLS para histórico
CREATE POLICY "Admins podem ver histórico patrimônio" ON public.historico_patrimonio
FOR SELECT USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Sistema pode inserir histórico patrimônio" ON public.historico_patrimonio
FOR INSERT WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_categorias_patrimonio_updated_at
  BEFORE UPDATE ON public.categorias_patrimonio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategorias_patrimonio_updated_at
  BEFORE UPDATE ON public.subcategorias_patrimonio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patrimonios_updated_at
  BEFORE UPDATE ON public.patrimonios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_emprestimos_patrimonio_updated_at
  BEFORE UPDATE ON public.emprestimos_patrimonio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manutencoes_patrimonio_updated_at
  BEFORE UPDATE ON public.manutencoes_patrimonio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Função para gerar código de patrimônio automático
CREATE OR REPLACE FUNCTION public.gerar_codigo_patrimonio()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.codigo_patrimonio IS NULL THEN
    NEW.codigo_patrimonio := 'PAT' || LPAD(nextval('seq_patrimonio')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar sequência para código de patrimônio
CREATE SEQUENCE IF NOT EXISTS seq_patrimonio START 1;

-- Trigger para gerar código automático
CREATE TRIGGER trigger_gerar_codigo_patrimonio
  BEFORE INSERT ON public.patrimonios
  FOR EACH ROW EXECUTE FUNCTION public.gerar_codigo_patrimonio();

-- Trigger para histórico de patrimônio
CREATE OR REPLACE FUNCTION public.criar_historico_patrimonio()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudanças importantes
  IF OLD.status != NEW.status THEN
    INSERT INTO public.historico_patrimonio (patrimonio_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_status', 'Mudança de status', OLD.status, NEW.status, auth.uid());
  END IF;
  
  IF OLD.localizacao_atual IS DISTINCT FROM NEW.localizacao_atual THEN
    INSERT INTO public.historico_patrimonio (patrimonio_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_localizacao', 'Mudança de localização', 
            COALESCE(OLD.localizacao_atual, 'não informado'), 
            COALESCE(NEW.localizacao_atual, 'não informado'), 
            auth.uid());
  END IF;
  
  IF OLD.responsavel_id IS DISTINCT FROM NEW.responsavel_id THEN
    INSERT INTO public.historico_patrimonio (patrimonio_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_responsavel', 'Mudança de responsável', 
            COALESCE(OLD.responsavel_id::text, 'nenhum'), 
            COALESCE(NEW.responsavel_id::text, 'nenhum'), 
            auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historico_patrimonio
  AFTER UPDATE ON public.patrimonios
  FOR EACH ROW EXECUTE FUNCTION public.criar_historico_patrimonio();