-- Criar tabela de igrejas (sede e missões)
CREATE TABLE public.igrejas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('Sede', 'Missão')) NOT NULL,
  cidade TEXT,
  estado TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  pastor_responsavel TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir dados iniciais (sede + 5 missões)
INSERT INTO public.igrejas (nome, tipo, cidade, estado, pastor_responsavel) VALUES
('CBN Kerigma - Sede', 'Sede', 'Cidade Principal', 'SP', 'Pastor Principal'),
('CBN Kerigma - Missão Vila Nova', 'Missão', 'Vila Nova', 'SP', 'Pastor João Silva'),
('CBN Kerigma - Missão Centro', 'Missão', 'Centro', 'SP', 'Pastor Carlos Lima'),
('CBN Kerigma - Missão Jardim São Paulo', 'Missão', 'Jardim São Paulo', 'SP', 'Pastora Maria Santos'),
('CBN Kerigma - Missão Vila Esperança', 'Missão', 'Vila Esperança', 'SP', 'Pastor Marcos Oliveira'),
('CBN Kerigma - Missão Novo Horizonte', 'Missão', 'Novo Horizonte', 'SP', 'Pastora Ana Costa');

-- Adicionar coluna igreja_id à tabela usuarios_admin existente
ALTER TABLE public.usuarios_admin 
ADD COLUMN igreja_id UUID REFERENCES public.igrejas(id);

-- Definir sede como padrão para usuários existentes
UPDATE public.usuarios_admin 
SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1)
WHERE igreja_id IS NULL;

-- Tornar igreja_id obrigatório
ALTER TABLE public.usuarios_admin 
ALTER COLUMN igreja_id SET NOT NULL;

-- Adicionar perfis específicos
ALTER TABLE public.usuarios_admin 
ADD COLUMN perfil_ministerial TEXT CHECK (perfil_ministerial IN ('Pastor', 'Líder', 'Tesoureiro', 'Administrador', 'Secretário'));

-- Adicionar coluna igreja_id às tabelas existentes que precisam de segmentação
ALTER TABLE public.pessoas ADD COLUMN igreja_id UUID REFERENCES public.igrejas(id);
ALTER TABLE public.celulas ADD COLUMN igreja_id UUID REFERENCES public.igrejas(id);
ALTER TABLE public.lancamentos_financeiros ADD COLUMN igreja_id UUID REFERENCES public.igrejas(id);
ALTER TABLE public.eventos ADD COLUMN igreja_id UUID REFERENCES public.igrejas(id);

-- Atualizar registros existentes para a sede
UPDATE public.pessoas SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1) WHERE igreja_id IS NULL;
UPDATE public.celulas SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1) WHERE igreja_id IS NULL;
UPDATE public.lancamentos_financeiros SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1) WHERE igreja_id IS NULL;
UPDATE public.eventos SET igreja_id = (SELECT id FROM public.igrejas WHERE tipo = 'Sede' LIMIT 1) WHERE igreja_id IS NULL;

-- Tornar igreja_id obrigatório nas tabelas principais
ALTER TABLE public.pessoas ALTER COLUMN igreja_id SET NOT NULL;
ALTER TABLE public.celulas ALTER COLUMN igreja_id SET NOT NULL;
ALTER TABLE public.lancamentos_financeiros ALTER COLUMN igreja_id SET NOT NULL;
ALTER TABLE public.eventos ALTER COLUMN igreja_id SET NOT NULL;

-- Habilitar RLS na tabela igrejas
ALTER TABLE public.igrejas ENABLE ROW LEVEL SECURITY;

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

-- Atualizar políticas existentes para incluir igreja_id

-- Política para pessoas
DROP POLICY IF EXISTS "Admins e líderes podem ver todas as pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Admins e líderes podem atualizar pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Admins e líderes podem criar pessoas" ON public.pessoas;
DROP POLICY IF EXISTS "Apenas admins podem deletar pessoas" ON public.pessoas;

CREATE POLICY "Acesso pessoas por igreja"
ON public.pessoas
FOR ALL
USING (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
)
WITH CHECK (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
);

-- Política para células
DROP POLICY IF EXISTS "Qualquer um pode ver células ativas" ON public.celulas;
DROP POLICY IF EXISTS "Admins e líderes podem criar células" ON public.celulas;
DROP POLICY IF EXISTS "Admins e líderes podem atualizar células" ON public.celulas;
DROP POLICY IF EXISTS "Apenas admins podem deletar células" ON public.celulas;

CREATE POLICY "Acesso células por igreja"
ON public.celulas
FOR ALL
USING (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
)
WITH CHECK (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
);

-- Política para lançamentos financeiros
DROP POLICY IF EXISTS "Apenas admins podem gerenciar lançamentos financeiros" ON public.lancamentos_financeiros;

CREATE POLICY "Acesso financeiro por igreja"
ON public.lancamentos_financeiros
FOR ALL
USING (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
)
WITH CHECK (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
);

-- Política para eventos
DROP POLICY IF EXISTS "Qualquer um pode ver eventos públicos" ON public.eventos;

CREATE POLICY "Acesso eventos por igreja"
ON public.eventos
FOR ALL
USING (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
)
WITH CHECK (
  igreja_id = public.get_user_igreja_id()
  OR public.is_sede_admin()
);

-- Trigger para atualização automática de updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_igrejas_updated_at
  BEFORE UPDATE ON public.igrejas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Função para obter estatísticas por igreja
CREATE OR REPLACE FUNCTION public.get_estatisticas_por_igreja()
RETURNS TABLE(
  igreja_id UUID,
  igreja_nome TEXT,
  total_membros BIGINT,
  total_celulas BIGINT,
  total_entradas NUMERIC,
  total_saidas NUMERIC,
  saldo_atual NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id as igreja_id,
    i.nome as igreja_nome,
    COALESCE(p.total_membros, 0) as total_membros,
    COALESCE(c.total_celulas, 0) as total_celulas,
    COALESCE(f.total_entradas, 0) as total_entradas,
    COALESCE(f.total_saidas, 0) as total_saidas,
    COALESCE(f.total_entradas, 0) - COALESCE(f.total_saidas, 0) as saldo_atual
  FROM public.igrejas i
  LEFT JOIN (
    SELECT igreja_id, COUNT(*) as total_membros
    FROM public.pessoas
    WHERE situacao = 'ativo'
    GROUP BY igreja_id
  ) p ON p.igreja_id = i.id
  LEFT JOIN (
    SELECT igreja_id, COUNT(*) as total_celulas
    FROM public.celulas
    WHERE ativa = true
    GROUP BY igreja_id
  ) c ON c.igreja_id = i.id
  LEFT JOIN (
    SELECT 
      igreja_id,
      SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE 0 END) as total_entradas,
      SUM(CASE WHEN tipo = 'saida' THEN valor ELSE 0 END) as total_saidas
    FROM public.lancamentos_financeiros
    WHERE status = 'confirmado'
    GROUP BY igreja_id
  ) f ON f.igreja_id = i.id
  WHERE i.ativa = true
  ORDER BY i.tipo DESC, i.nome;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;