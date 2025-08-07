-- Corrigir search_path nas funções existentes para resolver avisos de segurança
-- Todas as funções devem ter SECURITY DEFINER e SET search_path = 'public'

-- 1. Função atualizar_arvore_genealogica
CREATE OR REPLACE FUNCTION public.atualizar_arvore_genealogica()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 2. Função obter_estatisticas_multiplicacao
CREATE OR REPLACE FUNCTION public.obter_estatisticas_multiplicacao()
 RETURNS TABLE(total_celulas_originais bigint, total_celulas_multiplicadas bigint, geracao_maxima integer, celulas_por_geracao jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 3. Função atualizar_saldo_conta
CREATE OR REPLACE FUNCTION public.atualizar_saldo_conta()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- 4. Função atualizar_valor_campanha
CREATE OR REPLACE FUNCTION public.atualizar_valor_campanha()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF NEW.campanha_id IS NOT NULL AND NEW.status = 'confirmado' THEN
    UPDATE campanhas_arrecadacao 
    SET valor_atual = valor_atual + NEW.valor,
        updated_at = now()
    WHERE id = NEW.campanha_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. Função is_admin_user
CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel = 'admin'
  );
END;
$function$;

-- 6. Função can_access_own_admin_record
CREATE OR REPLACE FUNCTION public.can_access_own_admin_record()
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$function$;