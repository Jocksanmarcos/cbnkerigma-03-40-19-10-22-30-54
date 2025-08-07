-- Criar tabela para notificações de eventos
CREATE TABLE public.notificacoes_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL REFERENCES public.agenda_eventos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('push', 'email', 'whatsapp')),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  destinatarios JSONB NOT NULL DEFAULT '{}',
  total_destinatarios INTEGER NOT NULL DEFAULT 0,
  total_entregues INTEGER NOT NULL DEFAULT 0,
  total_lidos INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviando', 'concluido', 'erro')),
  erro_detalhes TEXT,
  enviado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes_eventos ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Admins podem gerenciar notificações de eventos"
ON public.notificacoes_eventos
FOR ALL
USING (is_sede_admin() OR is_pastor_missao());

-- Criar tabela para participação em eventos
CREATE TABLE public.participacao_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL REFERENCES public.agenda_eventos(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'confirmado' CHECK (status IN ('confirmado', 'presente', 'ausente', 'cancelado')),
  data_confirmacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_presenca TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  confirmado_por UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(evento_id, pessoa_id)
);

-- Habilitar RLS
ALTER TABLE public.participacao_eventos ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Usuários podem gerenciar própria participação"
ON public.participacao_eventos
FOR SELECT
USING (
  pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()) OR
  is_sede_admin() OR 
  is_pastor_missao()
);

CREATE POLICY "Usuários podem confirmar própria participação"
ON public.participacao_eventos
FOR INSERT
WITH CHECK (
  pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid())
);

CREATE POLICY "Usuários podem atualizar própria participação"
ON public.participacao_eventos
FOR UPDATE
USING (
  pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()) OR
  is_sede_admin() OR 
  is_pastor_missao()
);

CREATE POLICY "Admins podem gerenciar todas as participações"
ON public.participacao_eventos
FOR ALL
USING (is_sede_admin() OR is_pastor_missao());

-- Criar tabela para lembretes automáticos
CREATE TABLE public.lembretes_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL REFERENCES public.agenda_eventos(id) ON DELETE CASCADE,
  tipo_lembrete TEXT NOT NULL CHECK (tipo_lembrete IN ('1_semana', '3_dias', '1_dia', '2_horas', '30_minutos')),
  minutos_antes INTEGER NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  template_titulo TEXT NOT NULL,
  template_mensagem TEXT NOT NULL,
  ultima_execucao TIMESTAMP WITH TIME ZONE,
  proxima_execucao TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(evento_id, tipo_lembrete)
);

-- Habilitar RLS
ALTER TABLE public.lembretes_eventos ENABLE ROW LEVEL SECURITY;

-- Criar políticas
CREATE POLICY "Admins podem gerenciar lembretes"
ON public.lembretes_eventos
FOR ALL
USING (is_sede_admin() OR is_pastor_missao());

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_notificacoes_eventos_updated_at
  BEFORE UPDATE ON public.notificacoes_eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_participacao_eventos_updated_at
  BEFORE UPDATE ON public.participacao_eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lembretes_eventos_updated_at
  BEFORE UPDATE ON public.lembretes_eventos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();