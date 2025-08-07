-- Adicionar coluna igreja_id à tabela usuarios_admin existente
ALTER TABLE public.usuarios_admin 
ADD COLUMN IF NOT EXISTS igreja_id UUID REFERENCES public.igrejas(id);

-- Definir sede como padrão para usuários existentes
UPDATE public.usuarios_admin 
SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1)
WHERE igreja_id IS NULL;

-- Tornar igreja_id obrigatório
ALTER TABLE public.usuarios_admin 
ALTER COLUMN igreja_id SET NOT NULL;

-- Adicionar perfis específicos
ALTER TABLE public.usuarios_admin 
ADD COLUMN IF NOT EXISTS perfil_ministerial TEXT CHECK (perfil_ministerial IN ('Pastor', 'Líder', 'Tesoureiro', 'Administrador', 'Secretário'));

-- Funções de segurança para multi-tenant
CREATE OR REPLACE FUNCTION public.get_user_igreja_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT igreja_id 
    FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_sede_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.usuarios_admin ua
    JOIN public.igrejas i ON i.id = ua.igreja_id
    WHERE ua.user_id = auth.uid() 
    AND i.tipo = 'Sede'
    AND ua.ativo = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Políticas RLS para igrejas
CREATE POLICY "Usuários podem ver própria igreja e sede vê todas"
ON public.igrejas
FOR SELECT
USING (
  id = public.get_user_igreja_id() 
  OR public.is_sede_admin()
);

CREATE POLICY "Apenas sede pode gerenciar igrejas"
ON public.igrejas
FOR ALL
USING (public.is_sede_admin())
WITH CHECK (public.is_sede_admin());