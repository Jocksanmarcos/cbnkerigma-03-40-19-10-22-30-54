-- Função para verificar se é pastor de missão e obter o ID da missão
CREATE OR REPLACE FUNCTION public.get_pastor_missao_igreja_id(uid UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT m.igreja_responsavel_id 
    FROM public.pastores_missoes pm
    JOIN public.missoes m ON m.id = pm.missao_id
    WHERE pm.user_id = uid 
    AND pm.ativo = true
    LIMIT 1
  );
END;
$$;

-- Função para verificar se é admin (sede admin OU pastor de missão)
CREATE OR REPLACE FUNCTION public.is_any_admin(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Verifica se é sede admin OU pastor de missão
  RETURN (
    is_sede_admin(uid) OR is_pastor_missao(uid)
  );
END;
$$;

-- Função para obter igreja_id considerando pastores de missão
CREATE OR REPLACE FUNCTION public.get_user_igreja_id_with_missao(uid UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Primeiro tenta obter pela tabela usuarios_admin
  DECLARE 
    igreja_id_result UUID;
  BEGIN
    SELECT igreja_id INTO igreja_id_result
    FROM public.usuarios_admin 
    WHERE user_id = uid 
    LIMIT 1;
    
    -- Se não encontrou, tenta pela tabela pastores_missoes
    IF igreja_id_result IS NULL THEN
      SELECT m.igreja_responsavel_id INTO igreja_id_result
      FROM public.pastores_missoes pm
      JOIN public.missoes m ON m.id = pm.missao_id
      WHERE pm.user_id = uid 
      AND pm.ativo = true
      LIMIT 1;
    END IF;
    
    RETURN igreja_id_result;
  END;
END;
$$;

-- Atualizar políticas para incluir pastores de missão nos acessos

-- Política para pessoas (incluindo pastores de missão)
DROP POLICY IF EXISTS "Acesso pessoas por igreja" ON public.pessoas;
CREATE POLICY "Acesso pessoas por igreja" 
ON public.pessoas 
FOR ALL 
USING (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR
  (igreja_id = get_pastor_missao_igreja_id())
)
WITH CHECK (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR
  (igreja_id = get_pastor_missao_igreja_id())
);

-- Política para células (incluindo pastores de missão)
DROP POLICY IF EXISTS "Acesso células por igreja" ON public.celulas;
CREATE POLICY "Acesso células por igreja" 
ON public.celulas 
FOR ALL 
USING (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR
  (igreja_id = get_pastor_missao_igreja_id())
)
WITH CHECK (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR
  (igreja_id = get_pastor_missao_igreja_id())
);

-- Política para eventos (incluindo pastores de missão)
DROP POLICY IF EXISTS "Acesso eventos por igreja" ON public.eventos;
CREATE POLICY "Acesso eventos por igreja" 
ON public.eventos 
FOR ALL 
USING (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR
  (igreja_id = get_pastor_missao_igreja_id())
)
WITH CHECK (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR
  (igreja_id = get_pastor_missao_igreja_id())
);

-- Política para lançamentos financeiros (incluindo pastores de missão)
DROP POLICY IF EXISTS "Acesso financeiro por igreja" ON public.lancamentos_financeiros;
CREATE POLICY "Acesso financeiro por igreja" 
ON public.lancamentos_financeiros 
FOR ALL 
USING (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR
  (igreja_id = get_pastor_missao_igreja_id())
)
WITH CHECK (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR
  (igreja_id = get_pastor_missao_igreja_id())
);