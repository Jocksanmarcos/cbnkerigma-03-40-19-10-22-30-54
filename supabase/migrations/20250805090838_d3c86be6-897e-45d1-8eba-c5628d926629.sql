-- Corrigir functions sem search_path definido
-- Atualizar function que não tem search_path configurado

-- Verificar se esta função existe e corrigir
CREATE OR REPLACE FUNCTION public.obter_papel_usuario(user_email text)
RETURNS papel_igreja
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  papel_resultado papel_igreja;
BEGIN
  SELECT pe.papel_igreja INTO papel_resultado
  FROM public.pessoas pe
  WHERE pe.email = user_email
  LIMIT 1;
  
  RETURN COALESCE(papel_resultado, 'membro_comum'::papel_igreja);
END;
$function$;

-- Corrigir função verificar_permissao
CREATE OR REPLACE FUNCTION public.verificar_permissao(user_email text, modulo_codigo modulo_sistema, acao_desejada acao_permissao)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  tem_permissao BOOLEAN := FALSE;
BEGIN
  SELECT EXISTS (
    SELECT 1 
    FROM public.pessoas pe
    JOIN public.papeis_igreja pa ON pa.codigo = pe.papel_igreja
    JOIN public.permissoes_sistema ps ON ps.papel_id = pa.id
    JOIN public.modulos_sistema ms ON ms.id = ps.modulo_id
    WHERE pe.email = user_email
      AND ms.codigo = modulo_codigo
      AND ps.acao = acao_desejada
      AND ps.ativo = TRUE
      AND pa.ativo = TRUE
      AND ms.ativo = TRUE
  ) INTO tem_permissao;
  
  RETURN tem_permissao;
END;
$function$;

-- Corrigir função criar_permissoes_automaticas
CREATE OR REPLACE FUNCTION public.criar_permissoes_automaticas()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    func_record RECORD;
    acao_record RECORD;
    permissao_codigo TEXT;
    permissao_nome TEXT;
BEGIN
    -- Para cada funcionalidade e ação, criar uma permissão
    FOR func_record IN 
        SELECT f.id as func_id, f.codigo as func_codigo, f.nome as func_nome
        FROM funcionalidades_modulo f
    LOOP
        FOR acao_record IN 
            SELECT a.id as acao_id, a.codigo as acao_codigo, a.nome as acao_nome
            FROM acoes_permissao a
        LOOP
            permissao_codigo := func_record.func_codigo || '_' || acao_record.acao_codigo;
            permissao_nome := acao_record.acao_nome || ' - ' || func_record.func_nome;
            
            INSERT INTO permissoes (funcionalidade_id, acao_id, codigo, nome)
            VALUES (func_record.func_id, acao_record.acao_id, permissao_codigo, permissao_nome)
            ON CONFLICT (codigo) DO NOTHING;
        END LOOP;
    END LOOP;
END;
$function$;