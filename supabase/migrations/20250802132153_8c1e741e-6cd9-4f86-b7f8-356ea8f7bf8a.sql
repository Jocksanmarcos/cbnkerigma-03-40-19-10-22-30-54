-- Criar tabela para pastores de missões
CREATE TABLE public.pastores_missoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  missao_id UUID NOT NULL,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  data_ordenacao DATE,
  ativo BOOLEAN NOT NULL DEFAULT true,
  papel TEXT NOT NULL DEFAULT 'pastor_missao',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.pastores_missoes ENABLE ROW LEVEL SECURITY;

-- Políticas para pastores de missões
CREATE POLICY "Pastores podem ver próprio perfil" 
ON public.pastores_missoes 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Pastores podem atualizar próprio perfil" 
ON public.pastores_missoes 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Sede admin pode gerenciar pastores" 
ON public.pastores_missoes 
FOR ALL 
USING (is_sede_admin())
WITH CHECK (is_sede_admin());

-- Função para verificar se é pastor de missão
CREATE OR REPLACE FUNCTION public.is_pastor_missao(uid UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.pastores_missoes 
    WHERE user_id = uid 
    AND ativo = true
  );
END;
$$;

-- Função para obter missão do pastor
CREATE OR REPLACE FUNCTION public.get_pastor_missao_id(uid UUID DEFAULT auth.uid())
RETURNS UUID
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT missao_id 
    FROM public.pastores_missoes 
    WHERE user_id = uid 
    AND ativo = true
    LIMIT 1
  );
END;
$$;

-- Atualizar políticas da tabela missoes para incluir pastores
DROP POLICY IF EXISTS "Acesso missões por igreja" ON public.missoes;

CREATE POLICY "Acesso missões completo" 
ON public.missoes 
FOR ALL 
USING (
  is_sede_admin() OR 
  (get_user_igreja_id() IS NOT NULL) OR
  (is_pastor_missao() AND id = get_pastor_missao_id())
)
WITH CHECK (
  is_sede_admin() OR 
  (get_user_igreja_id() IS NOT NULL) OR
  (is_pastor_missao() AND id = get_pastor_missao_id())
);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pastores_missoes_updated_at
BEFORE UPDATE ON public.pastores_missoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar perfil automático quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_pastor_missao()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Só criar se não for admin existente
  IF NOT EXISTS (SELECT 1 FROM public.usuarios_admin WHERE user_id = NEW.id) THEN
    -- Verificar se é pastor de missão baseado em metadados
    IF NEW.raw_user_meta_data->>'tipo_usuario' = 'pastor_missao' THEN
      INSERT INTO public.pastores_missoes (
        user_id, 
        nome, 
        email,
        missao_id
      ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email),
        NEW.email,
        (NEW.raw_user_meta_data->>'missao_id')::UUID
      );
    END IF;
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_pastor_missao
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_pastor_missao();