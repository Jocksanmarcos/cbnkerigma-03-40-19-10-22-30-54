-- Corrigir avisos de segurança - adicionar search_path às funções

-- Recriar função gerar_codigo_patrimonio com search_path
CREATE OR REPLACE FUNCTION public.gerar_codigo_patrimonio()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.codigo_patrimonio IS NULL THEN
    NEW.codigo_patrimonio := 'PAT' || LPAD(nextval('seq_patrimonio')::text, 6, '0');
  END IF;
  RETURN NEW;
END;
$$;

-- Recriar função criar_historico_patrimonio com search_path
CREATE OR REPLACE FUNCTION public.criar_historico_patrimonio()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;