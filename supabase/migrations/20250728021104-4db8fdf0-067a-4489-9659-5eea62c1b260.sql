-- Corrigir funções com search_path mutable
CREATE OR REPLACE FUNCTION public.calcular_grupo_etario(data_nascimento DATE)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF data_nascimento IS NULL THEN
    RETURN NULL;
  END IF;
  
  IF EXTRACT(YEAR FROM AGE(data_nascimento)) <= 12 THEN
    RETURN 'crianca';
  ELSIF EXTRACT(YEAR FROM AGE(data_nascimento)) <= 17 THEN
    RETURN 'adolescente';
  ELSIF EXTRACT(YEAR FROM AGE(data_nascimento)) <= 30 THEN
    RETURN 'jovem';
  ELSIF EXTRACT(YEAR FROM AGE(data_nascimento)) <= 60 THEN
    RETURN 'adulto';
  ELSE
    RETURN 'idoso';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.criar_historico_pessoa()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Registrar mudanças importantes
  IF OLD.estado_espiritual != NEW.estado_espiritual THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_status', 'Mudança de estado espiritual', OLD.estado_espiritual, NEW.estado_espiritual, auth.uid());
  END IF;
  
  IF OLD.celula_id IS DISTINCT FROM NEW.celula_id THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_celula', 'Mudança de célula', 
            COALESCE(OLD.celula_id::text, 'nenhuma'), 
            COALESCE(NEW.celula_id::text, 'nenhuma'), 
            auth.uid());
  END IF;
  
  IF OLD.discipulador_atual_id IS DISTINCT FROM NEW.discipulador_atual_id THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_discipulador', 'Mudança de discipulador', 
            COALESCE(OLD.discipulador_atual_id::text, 'nenhum'), 
            COALESCE(NEW.discipulador_atual_id::text, 'nenhum'), 
            auth.uid());
  END IF;
  
  IF OLD.cargo_funcao IS DISTINCT FROM NEW.cargo_funcao THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_cargo', 'Mudança de cargo/função', 
            COALESCE(OLD.cargo_funcao, 'nenhum'), 
            COALESCE(NEW.cargo_funcao, 'nenhum'), 
            auth.uid());
  END IF;
  
  -- Registrar marcos especiais
  IF OLD.data_conversao IS NULL AND NEW.data_conversao IS NOT NULL THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'conversao', 'Data de conversão registrada', NEW.data_conversao::text, auth.uid());
  END IF;
  
  IF OLD.data_batismo IS NULL AND NEW.data_batismo IS NOT NULL THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'batismo', 'Data de batismo registrada', NEW.data_batismo::text, auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.obter_estatisticas_pessoas()
RETURNS TABLE(
  total_pessoas BIGINT,
  total_membros BIGINT,
  total_visitantes BIGINT,
  total_lideres BIGINT,
  total_batizados BIGINT,
  total_em_discipulado BIGINT,
  crescimento_mes_atual BIGINT,
  pessoas_por_grupo_etario JSONB,
  pessoas_por_estado_espiritual JSONB
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.pessoas WHERE situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'membro' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'visitante' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'lider' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE data_batismo IS NOT NULL AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE status_discipulado = 'em_andamento' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND situacao = 'ativo')::BIGINT,
    (SELECT jsonb_object_agg(grupo_etario, count) 
     FROM (
       SELECT calcular_grupo_etario(data_nascimento) as grupo_etario, COUNT(*) as count 
       FROM public.pessoas 
       WHERE situacao = 'ativo' AND data_nascimento IS NOT NULL
       GROUP BY calcular_grupo_etario(data_nascimento)
     ) sub),
    (SELECT jsonb_object_agg(estado_espiritual, count) 
     FROM (
       SELECT estado_espiritual, COUNT(*) as count 
       FROM public.pessoas 
       WHERE situacao = 'ativo'
       GROUP BY estado_espiritual
     ) sub);
END;
$$;