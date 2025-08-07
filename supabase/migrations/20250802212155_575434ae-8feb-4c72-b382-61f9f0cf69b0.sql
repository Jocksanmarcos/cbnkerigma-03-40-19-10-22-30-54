-- Adicionar novos campos ao módulo Pessoas
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS status_formacao text CHECK (status_formacao IN ('Visitante', 'Novo convertido', 'Aluno', 'Em formação', 'Líder em treinamento', 'Líder formado')) DEFAULT 'Visitante',
ADD COLUMN IF NOT EXISTS aulas_concluidas integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultimo_acesso_portal timestamp with time zone,
ADD COLUMN IF NOT EXISTS pontuacao_gamificada integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS medalhas text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS ranking_na_celula integer,
ADD COLUMN IF NOT EXISTS discipulador_id uuid REFERENCES public.pessoas(id),
ADD COLUMN IF NOT EXISTS papel_na_celula text CHECK (papel_na_celula IN ('Membro', 'Anfitrião', 'Auxiliar', 'Líder', 'Supervisor', 'Discipulador')) DEFAULT 'Membro',
ADD COLUMN IF NOT EXISTS celula_atual_id uuid REFERENCES public.celulas(id);

-- Criar tabela para histórico de células
CREATE TABLE IF NOT EXISTS public.historico_celulas_pessoas (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  celula_id uuid NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  data_entrada date NOT NULL,
  data_saida date,
  papel text CHECK (papel IN ('Membro', 'Anfitrião', 'Auxiliar', 'Líder', 'Supervisor', 'Discipulador')),
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela para certificados (se não existir)
CREATE TABLE IF NOT EXISTS public.certificados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  descricao text,
  curso_id uuid REFERENCES public.cursos_ensino(id),
  template_url text,
  ativo boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criar tabela de relacionamento entre pessoas e certificados
CREATE TABLE IF NOT EXISTS public.pessoas_certificados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id uuid NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  certificado_id uuid NOT NULL REFERENCES public.certificados(id) ON DELETE CASCADE,
  data_emissao date NOT NULL DEFAULT CURRENT_DATE,
  url_certificado text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, certificado_id)
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.historico_celulas_pessoas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pessoas_certificados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para histórico de células
CREATE POLICY "Usuários podem ver próprio histórico" 
ON public.historico_celulas_pessoas 
FOR SELECT 
USING (
  pessoa_id IN (
    SELECT id FROM public.pessoas WHERE user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true AND papel = ANY(ARRAY['admin', 'lider'])
  )
);

CREATE POLICY "Admins podem gerenciar histórico" 
ON public.historico_celulas_pessoas 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true AND papel = ANY(ARRAY['admin', 'lider'])
  )
);

-- Políticas RLS para certificados
CREATE POLICY "Qualquer um pode ver certificados ativos" 
ON public.certificados 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar certificados" 
ON public.certificados 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true AND papel = ANY(ARRAY['admin', 'lider'])
  )
);

-- Políticas RLS para pessoas_certificados
CREATE POLICY "Usuários podem ver próprios certificados" 
ON public.pessoas_certificados 
FOR SELECT 
USING (
  pessoa_id IN (
    SELECT id FROM public.pessoas WHERE user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true AND papel = ANY(ARRAY['admin', 'lider'])
  )
);

CREATE POLICY "Admins podem gerenciar certificados de pessoas" 
ON public.pessoas_certificados 
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true AND papel = ANY(ARRAY['admin', 'lider'])
  )
);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_historico_celulas_pessoas_updated_at
BEFORE UPDATE ON public.historico_celulas_pessoas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificados_updated_at
BEFORE UPDATE ON public.certificados
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();