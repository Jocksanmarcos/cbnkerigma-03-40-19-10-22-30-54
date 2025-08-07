-- Criar tabela para tokens de push notifications
CREATE TABLE IF NOT EXISTS public.user_push_tokens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  token TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'web', -- 'ios', 'android', 'web'
  device_id TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- Criar tabela para preferências de notificação
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  evento_reminders BOOLEAN NOT NULL DEFAULT true,
  evento_confirmations BOOLEAN NOT NULL DEFAULT true,
  celula_updates BOOLEAN NOT NULL DEFAULT true,
  ensino_updates BOOLEAN NOT NULL DEFAULT true,
  general_announcements BOOLEAN NOT NULL DEFAULT true,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  vibration_enabled BOOLEAN NOT NULL DEFAULT true,
  quiet_hours_start TIME WITHOUT TIME ZONE DEFAULT '22:00',
  quiet_hours_end TIME WITHOUT TIME ZONE DEFAULT '07:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Criar tabela para confirmações de eventos
CREATE TABLE IF NOT EXISTS public.evento_confirmacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL,
  user_id UUID NOT NULL,
  confirmado BOOLEAN NOT NULL DEFAULT true,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(evento_id, user_id),
  FOREIGN KEY (evento_id) REFERENCES public.agenda_eventos(id) ON DELETE CASCADE
);

-- Criar tabela para doações/contribuições para eventos
CREATE TABLE IF NOT EXISTS public.evento_doacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL,
  user_id UUID,
  nome_doador TEXT,
  email_doador TEXT,
  valor DECIMAL(10,2) NOT NULL,
  tipo_doacao TEXT NOT NULL DEFAULT 'dinheiro', -- 'dinheiro', 'material', 'servico'
  descricao TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- 'pendente', 'confirmado', 'cancelado'
  metodo_pagamento TEXT DEFAULT 'pix',
  comprovante_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (evento_id) REFERENCES public.agenda_eventos(id) ON DELETE CASCADE
);

-- Criar tabela para pedidos de oração relacionados a eventos
CREATE TABLE IF NOT EXISTS public.evento_pedidos_oracao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL,
  user_id UUID,
  nome_solicitante TEXT NOT NULL,
  email_solicitante TEXT,
  telefone_solicitante TEXT,
  pedido TEXT NOT NULL,
  publico BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ativo', -- 'ativo', 'atendido', 'cancelado'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (evento_id) REFERENCES public.agenda_eventos(id) ON DELETE CASCADE
);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_confirmacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_doacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evento_pedidos_oracao ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_push_tokens
CREATE POLICY "Usuários podem gerenciar próprios tokens" 
ON public.user_push_tokens 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Políticas RLS para notification_preferences
CREATE POLICY "Usuários podem gerenciar próprias preferências" 
ON public.notification_preferences 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Políticas RLS para evento_confirmacoes
CREATE POLICY "Usuários podem gerenciar próprias confirmações" 
ON public.evento_confirmacoes 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Organizadores podem ver confirmações dos eventos" 
ON public.evento_confirmacoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agenda_eventos ae 
    WHERE ae.id = evento_confirmacoes.evento_id 
    AND ae.organizador_id = auth.uid()
  )
);

-- Políticas RLS para evento_doacoes
CREATE POLICY "Usuários podem criar doações" 
ON public.evento_doacoes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem ver próprias doações" 
ON public.evento_doacoes 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Organizadores podem ver doações dos eventos" 
ON public.evento_doacoes 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agenda_eventos ae 
    WHERE ae.id = evento_doacoes.evento_id 
    AND ae.organizador_id = auth.uid()
  )
);

-- Políticas RLS para evento_pedidos_oracao
CREATE POLICY "Usuários podem criar pedidos de oração" 
ON public.evento_pedidos_oracao 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários podem ver próprios pedidos" 
ON public.evento_pedidos_oracao 
FOR SELECT 
USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Pedidos públicos são visíveis para todos" 
ON public.evento_pedidos_oracao 
FOR SELECT 
USING (publico = true);

CREATE POLICY "Organizadores podem ver todos os pedidos dos eventos" 
ON public.evento_pedidos_oracao 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.agenda_eventos ae 
    WHERE ae.id = evento_pedidos_oracao.evento_id 
    AND ae.organizador_id = auth.uid()
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_user_push_tokens_updated_at
BEFORE UPDATE ON public.user_push_tokens
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON public.notification_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evento_confirmacoes_updated_at
BEFORE UPDATE ON public.evento_confirmacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evento_doacoes_updated_at
BEFORE UPDATE ON public.evento_doacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_evento_pedidos_oracao_updated_at
BEFORE UPDATE ON public.evento_pedidos_oracao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();