-- Criação das tabelas para o módulo financeiro

-- Tabela de categorias financeiras
CREATE TABLE public.categorias_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT,
  cor TEXT DEFAULT '#6366f1',
  orcamento_mensal NUMERIC DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de subcategorias financeiras
CREATE TABLE public.subcategorias_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  categoria_id UUID NOT NULL REFERENCES public.categorias_financeiras(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  descricao TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de contas bancárias/caixas
CREATE TABLE public.contas_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('banco', 'caixa', 'pix', 'outros')),
  banco TEXT,
  agencia TEXT,
  conta TEXT,
  saldo_atual NUMERIC DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de lançamentos financeiros
CREATE TABLE public.lancamentos_financeiros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_lancamento DATE NOT NULL DEFAULT CURRENT_DATE,
  forma_pagamento TEXT NOT NULL CHECK (forma_pagamento IN ('dinheiro', 'transferencia', 'cartao', 'pix', 'boleto', 'cheque')),
  categoria_id UUID NOT NULL REFERENCES public.categorias_financeiras(id),
  subcategoria_id UUID REFERENCES public.subcategorias_financeiras(id),
  conta_id UUID NOT NULL REFERENCES public.contas_financeiras(id),
  responsavel_id UUID REFERENCES public.usuarios_admin(id),
  comprovante_url TEXT,
  repeticao_mensal BOOLEAN DEFAULT false,
  observacoes TEXT,
  status TEXT DEFAULT 'confirmado' CHECK (status IN ('pendente', 'confirmado', 'cancelado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir categorias padrão
INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor) VALUES
('Dízimos', 'entrada', 'Dízimos dos membros', '#10b981'),
('Ofertas', 'entrada', 'Ofertas especiais e de gratidão', '#059669'),
('Doações', 'entrada', 'Doações diversas', '#0d9488'),
('Eventos', 'entrada', 'Recursos arrecadados em eventos', '#0891b2'),
('Campanhas', 'entrada', 'Campanhas especiais de arrecadação', '#0284c7'),
('Contas Fixas', 'saida', 'Contas mensais (água, luz, telefone)', '#dc2626'),
('Salários', 'saida', 'Folha de pagamento', '#b91c1c'),
('Missões', 'saida', 'Investimentos em missões', '#ea580c'),
('Manutenção', 'saida', 'Manutenção e reparos', '#d97706'),
('Equipamentos', 'saida', 'Compra de equipamentos', '#ca8a04'),
('Ação Social', 'saida', 'Projetos sociais e ajuda humanitária', '#65a30d');

-- Inserir subcategorias padrão
INSERT INTO public.subcategorias_financeiras (categoria_id, nome) VALUES
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Ofertas'), 'Missões'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Ofertas'), 'Ação Social'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Ofertas'), 'Construção'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Contas Fixas'), 'Energia Elétrica'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Contas Fixas'), 'Água'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Contas Fixas'), 'Telefone/Internet'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Manutenção'), 'Limpeza'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Manutenção'), 'Reparos'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Equipamentos'), 'Som e Imagem'),
((SELECT id FROM public.categorias_financeiras WHERE nome = 'Equipamentos'), 'Informática');

-- Inserir conta padrão
INSERT INTO public.contas_financeiras (nome, tipo) VALUES
('Caixa Geral', 'caixa'),
('Conta Corrente Principal', 'banco');

-- Enable RLS
ALTER TABLE public.categorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subcategorias_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins podem gerenciar categorias financeiras" ON public.categorias_financeiras
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

CREATE POLICY "Admins podem gerenciar subcategorias financeiras" ON public.subcategorias_financeiras
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

CREATE POLICY "Admins podem gerenciar contas financeiras" ON public.contas_financeiras
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

CREATE POLICY "Admins podem gerenciar lançamentos financeiros" ON public.lancamentos_financeiros
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_categorias_financeiras_updated_at
BEFORE UPDATE ON public.categorias_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subcategorias_financeiras_updated_at
BEFORE UPDATE ON public.subcategorias_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contas_financeiras_updated_at
BEFORE UPDATE ON public.contas_financeiras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lancamentos_financeiros_updated_at
BEFORE UPDATE ON public.lancamentos_financeiros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar saldo da conta
CREATE OR REPLACE FUNCTION public.atualizar_saldo_conta()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmado' THEN
    IF NEW.tipo = 'entrada' THEN
      UPDATE public.contas_financeiras 
      SET saldo_atual = saldo_atual + NEW.valor
      WHERE id = NEW.conta_id;
    ELSE
      UPDATE public.contas_financeiras 
      SET saldo_atual = saldo_atual - NEW.valor
      WHERE id = NEW.conta_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Reverter o lançamento anterior se estava confirmado
    IF OLD.status = 'confirmado' THEN
      IF OLD.tipo = 'entrada' THEN
        UPDATE public.contas_financeiras 
        SET saldo_atual = saldo_atual - OLD.valor
        WHERE id = OLD.conta_id;
      ELSE
        UPDATE public.contas_financeiras 
        SET saldo_atual = saldo_atual + OLD.valor
        WHERE id = OLD.conta_id;
      END IF;
    END IF;
    
    -- Aplicar o novo lançamento se confirmado
    IF NEW.status = 'confirmado' THEN
      IF NEW.tipo = 'entrada' THEN
        UPDATE public.contas_financeiras 
        SET saldo_atual = saldo_atual + NEW.valor
        WHERE id = NEW.conta_id;
      ELSE
        UPDATE public.contas_financeiras 
        SET saldo_atual = saldo_atual - NEW.valor
        WHERE id = NEW.conta_id;
      END IF;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'confirmado' THEN
    IF OLD.tipo = 'entrada' THEN
      UPDATE public.contas_financeiras 
      SET saldo_atual = saldo_atual - OLD.valor
      WHERE id = OLD.conta_id;
    ELSE
      UPDATE public.contas_financeiras 
      SET saldo_atual = saldo_atual + OLD.valor
      WHERE id = OLD.conta_id;
    END IF;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar saldo
CREATE TRIGGER trigger_atualizar_saldo_conta
AFTER INSERT OR UPDATE OR DELETE ON public.lancamentos_financeiros
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_saldo_conta();