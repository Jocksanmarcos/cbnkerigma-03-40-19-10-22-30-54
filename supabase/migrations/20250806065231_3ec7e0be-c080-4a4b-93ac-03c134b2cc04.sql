-- ETAPA 1: Preparar tabela 'pessoas' para integração com autenticação
-- Adicionar coluna de vínculo com auth.users se não existir
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE;

-- Adicionar índice para performance
CREATE INDEX IF NOT EXISTS idx_pessoas_user_id ON public.pessoas(user_id);

-- ETAPA 2: Criar trigger de sincronização automática
-- Função para criar registro em pessoas quando novo usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir novo registro em pessoas quando usuário se registra
  INSERT INTO public.pessoas (
    user_id, 
    email, 
    nome_completo,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nome', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Se já existe, apenas retorna
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log erro mas não falha o processo de registro
    RAISE WARNING 'Erro ao criar perfil de pessoa: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ETAPA 3: Refatorar tabela de matrículas de ensino
-- Adicionar referência para pessoas
ALTER TABLE public.matriculas_ensino 
ADD COLUMN IF NOT EXISTS pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE CASCADE;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_matriculas_ensino_pessoa_id ON public.matriculas_ensino(pessoa_id);

-- ETAPA 4: Refatorar participantes de células
-- Verificar se existe tabela de participantes ou similar
CREATE TABLE IF NOT EXISTS public.celula_participantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  papel_na_celula TEXT DEFAULT 'membro',
  data_ingresso DATE DEFAULT CURRENT_DATE,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(celula_id, pessoa_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_celula_participantes_celula_id ON public.celula_participantes(celula_id);
CREATE INDEX IF NOT EXISTS idx_celula_participantes_pessoa_id ON public.celula_participantes(pessoa_id);

-- ETAPA 5: Refatorar contribuições financeiras
-- Adicionar referência para pessoas nas contribuições
ALTER TABLE public.contribuicoes 
ADD COLUMN IF NOT EXISTS pessoa_id UUID REFERENCES public.pessoas(id) ON DELETE SET NULL;

-- Criar índice
CREATE INDEX IF NOT EXISTS idx_contribuicoes_pessoa_id ON public.contribuicoes(pessoa_id);

-- ETAPA 6: Atualizar RLS policies para trabalhar com a nova estrutura
-- Policy para celula_participantes
ALTER TABLE public.celula_participantes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso participantes células por igreja" 
ON public.celula_participantes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.celulas c 
    WHERE c.id = celula_participantes.celula_id 
    AND (is_sede_admin() OR c.igreja_id = get_user_igreja_id() OR c.igreja_id = get_pastor_missao_igreja_id())
  )
);

-- ETAPA 7: Trigger para atualizar updated_at
CREATE TRIGGER update_celula_participantes_updated_at
  BEFORE UPDATE ON public.celula_participantes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();