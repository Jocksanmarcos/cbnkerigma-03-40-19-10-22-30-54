-- Criar tabela para campanhas de arrecadação primeiro
CREATE TABLE public.campanhas_arrecadacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descricao TEXT,
  meta_valor NUMERIC NOT NULL,
  valor_atual NUMERIC DEFAULT 0,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  ativa BOOLEAN DEFAULT true,
  tipo TEXT DEFAULT 'geral', -- geral, obras, missoes, emergencia
  imagem_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.campanhas_arrecadacao ENABLE ROW LEVEL SECURITY;

-- Políticas para campanhas
CREATE POLICY "Qualquer um pode ver campanhas ativas" 
ON public.campanhas_arrecadacao 
FOR SELECT 
USING (ativa = true);

CREATE POLICY "Apenas admins podem modificar campanhas" 
ON public.campanhas_arrecadacao 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
))
WITH CHECK (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Agora adicionar colunas à tabela de contribuições
ALTER TABLE public.contribuicoes 
ADD COLUMN campanha_id UUID REFERENCES campanhas_arrecadacao(id),
ADD COLUMN stripe_payment_intent_id TEXT,
ADD COLUMN stripe_session_id TEXT;

-- Função para atualizar valor atual da campanha
CREATE OR REPLACE FUNCTION public.atualizar_valor_campanha()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campanha_id IS NOT NULL AND NEW.status = 'confirmado' THEN
    UPDATE campanhas_arrecadacao 
    SET valor_atual = valor_atual + NEW.valor,
        updated_at = now()
    WHERE id = NEW.campanha_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar valor da campanha automaticamente
CREATE TRIGGER trigger_atualizar_valor_campanha
  AFTER INSERT OR UPDATE ON public.contribuicoes
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_valor_campanha();

-- Adicionar trigger de updated_at para campanhas
CREATE TRIGGER update_campanhas_updated_at
  BEFORE UPDATE ON public.campanhas_arrecadacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir algumas campanhas exemplo
INSERT INTO public.campanhas_arrecadacao (titulo, descricao, meta_valor, data_inicio, data_fim, tipo) VALUES
('Reforma do Templo', 'Campanha para reforma e modernização do templo principal', 50000.00, '2024-01-01', '2024-12-31', 'obras'),
('Missões África', 'Apoio às missões evangelísticas na África', 25000.00, '2024-01-01', '2024-06-30', 'missoes'),
('Natal Solidário', 'Cestas básicas para famílias carentes', 10000.00, '2024-11-01', '2024-12-25', 'emergencia');