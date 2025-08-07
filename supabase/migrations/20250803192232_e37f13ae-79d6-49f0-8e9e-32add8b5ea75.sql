-- Create WhatsApp messages table for tracking sent messages
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'template', 'media')),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
  external_id TEXT, -- WhatsApp message ID
  error_message TEXT,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('high', 'normal', 'low')),
  campaign_id TEXT, -- For bulk campaigns
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON public.whatsapp_messages(phone);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_campaign ON public.whatsapp_messages(campaign_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at);

-- Enable RLS
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins podem gerenciar mensagens WhatsApp" 
ON public.whatsapp_messages 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel = ANY(ARRAY['admin', 'lider'])
  )
);

-- Create notifications users table for real notification system
CREATE TABLE IF NOT EXISTS public.notificacoes_usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info' CHECK (tipo IN ('info', 'warning', 'success', 'error')),
  categoria TEXT NOT NULL DEFAULT 'geral' CHECK (categoria IN ('ensino', 'celula', 'financeiro', 'geral', 'sistema')),
  lida BOOLEAN DEFAULT FALSE,
  data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  data_leitura TIMESTAMP WITH TIME ZONE,
  acao_url TEXT,
  acao_texto TEXT,
  dados_extras JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for notifications
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuarios_user_id ON public.notificacoes_usuarios(user_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuarios_lida ON public.notificacoes_usuarios(lida);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuarios_categoria ON public.notificacoes_usuarios(categoria);
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuarios_data_criacao ON public.notificacoes_usuarios(data_criacao);

-- Enable RLS for notifications
ALTER TABLE public.notificacoes_usuarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for notifications
CREATE POLICY "Usuários podem ver próprias notificações" 
ON public.notificacoes_usuarios 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Usuários podem atualizar próprias notificações" 
ON public.notificacoes_usuarios 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Sistema pode criar notificações" 
ON public.notificacoes_usuarios 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar todas as notificações" 
ON public.notificacoes_usuarios 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.usuarios_admin 
    WHERE user_id = auth.uid() 
    AND ativo = true 
    AND papel = 'admin'
  )
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_whatsapp_messages_updated_at ON public.whatsapp_messages;
CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_notificacoes_usuarios_updated_at ON public.notificacoes_usuarios;
CREATE TRIGGER update_notificacoes_usuarios_updated_at
  BEFORE UPDATE ON public.notificacoes_usuarios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();