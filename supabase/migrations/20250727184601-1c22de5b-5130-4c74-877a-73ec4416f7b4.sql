-- Adicionar campos para rastreamento de multiplicação de células
ALTER TABLE public.celulas 
ADD COLUMN celula_mae_id UUID REFERENCES public.celulas(id),
ADD COLUMN data_multiplicacao DATE,
ADD COLUMN geracao INTEGER DEFAULT 1,
ADD COLUMN arvore_genealogica TEXT;

-- Adicionar índices para melhor performance
CREATE INDEX idx_celulas_celula_mae ON public.celulas(celula_mae_id);
CREATE INDEX idx_celulas_geracao ON public.celulas(geracao);

-- Comentários para documentação
COMMENT ON COLUMN public.celulas.celula_mae_id IS 'ID da célula mãe (origem da multiplicação)';
COMMENT ON COLUMN public.celulas.data_multiplicacao IS 'Data quando esta célula foi criada por multiplicação';
COMMENT ON COLUMN public.celulas.geracao IS 'Geração da célula (1 = original, 2 = primeira multiplicação, etc.)';
COMMENT ON COLUMN public.celulas.arvore_genealogica IS 'Caminho hierárquico das células (ex: "1->2->5")';

-- Função para atualizar a árvore genealógica automaticamente
CREATE OR REPLACE FUNCTION public.atualizar_arvore_genealogica()
RETURNS TRIGGER AS $$
BEGIN
  -- Se tem célula mãe, construir a árvore genealógica
  IF NEW.celula_mae_id IS NOT NULL THEN
    -- Buscar a árvore da célula mãe
    SELECT 
      COALESCE(arvore_genealogica, id::text) || '->' || NEW.id::text,
      COALESCE(geracao, 1) + 1
    INTO NEW.arvore_genealogica, NEW.geracao
    FROM public.celulas 
    WHERE id = NEW.celula_mae_id;
    
    -- Se a célula mãe não tem árvore, criar uma
    IF NEW.arvore_genealogica IS NULL THEN
      NEW.arvore_genealogica := NEW.celula_mae_id::text || '->' || NEW.id::text;
      NEW.geracao := 2;
    END IF;
  ELSE
    -- Célula original (sem mãe)
    NEW.arvore_genealogica := NEW.id::text;
    NEW.geracao := 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar automaticamente a árvore genealógica
CREATE TRIGGER trigger_atualizar_arvore_genealogica
  BEFORE INSERT OR UPDATE ON public.celulas
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_arvore_genealogica();

-- Função para obter estatísticas de multiplicação
CREATE OR REPLACE FUNCTION public.obter_estatisticas_multiplicacao()
RETURNS TABLE (
  total_celulas_originais BIGINT,
  total_celulas_multiplicadas BIGINT,
  geracao_maxima INTEGER,
  celulas_por_geracao JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.celulas WHERE celula_mae_id IS NULL)::BIGINT,
    (SELECT COUNT(*) FROM public.celulas WHERE celula_mae_id IS NOT NULL)::BIGINT,
    (SELECT MAX(geracao) FROM public.celulas),
    (SELECT jsonb_object_agg(geracao::text, count::text) 
     FROM (
       SELECT geracao, COUNT(*) as count 
       FROM public.celulas 
       GROUP BY geracao 
       ORDER BY geracao
     ) sub);
END;
$$ LANGUAGE plpgsql;