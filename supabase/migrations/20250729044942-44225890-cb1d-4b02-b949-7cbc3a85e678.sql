-- Criar tabela para controle de acesso ao portal do aluno
CREATE TABLE public.acesso_portal_aluno (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  matricula_id UUID NOT NULL,
  pessoa_id UUID NOT NULL,
  liberado BOOLEAN NOT NULL DEFAULT false,
  login TEXT,
  data_liberacao TIMESTAMP WITH TIME ZONE,
  liberado_por UUID REFERENCES auth.users(id),
  senha_temporaria_hash TEXT,
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  tentativas_login INTEGER DEFAULT 0,
  status_conta TEXT DEFAULT 'ativa' CHECK (status_conta IN ('ativa', 'bloqueada', 'suspensa')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(matricula_id),
  UNIQUE(pessoa_id)
);

-- Habilitar RLS
ALTER TABLE public.acesso_portal_aluno ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Admins podem gerenciar acesso portal" 
ON public.acesso_portal_aluno 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Usuários podem ver seu próprio acesso" 
ON public.acesso_portal_aluno 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM pessoas 
  WHERE pessoas.id = acesso_portal_aluno.pessoa_id 
  AND pessoas.user_id = auth.uid()
));

-- Índices para performance
CREATE INDEX idx_acesso_portal_matricula ON public.acesso_portal_aluno(matricula_id);
CREATE INDEX idx_acesso_portal_pessoa ON public.acesso_portal_aluno(pessoa_id);
CREATE INDEX idx_acesso_portal_liberado ON public.acesso_portal_aluno(liberado);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_acesso_portal_updated_at
  BEFORE UPDATE ON public.acesso_portal_aluno
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();