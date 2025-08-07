-- Criar tabela para armazenar treinamentos do chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_treinamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conteudo_original TEXT NOT NULL,
  conteudo_estruturado TEXT,
  palavras_chave TEXT[],
  categoria TEXT,
  relevancia TEXT DEFAULT 'media',
  status TEXT DEFAULT 'processado',
  data_treinamento TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para conversas do chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_conversas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_nome TEXT,
  usuario_email TEXT,
  mensagem_usuario TEXT NOT NULL,
  resposta_ia TEXT NOT NULL,
  contexto JSONB DEFAULT '{}',
  satisfacao INTEGER, -- 1-5
  tempo_resposta INTEGER, -- em milissegundos
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para respostas automáticas
CREATE TABLE IF NOT EXISTS public.chatbot_respostas_automaticas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  palavra_chave TEXT NOT NULL,
  resposta TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.chatbot_treinamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_conversas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_respostas_automaticas ENABLE ROW LEVEL SECURITY;

-- Políticas para chatbot_treinamentos
CREATE POLICY "Admins podem gerenciar treinamentos" 
ON public.chatbot_treinamentos 
FOR ALL 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

-- Políticas para chatbot_conversas
CREATE POLICY "Admins podem ver conversas" 
ON public.chatbot_conversas 
FOR SELECT 
USING (is_admin_user());

CREATE POLICY "Sistema pode criar conversas" 
ON public.chatbot_conversas 
FOR INSERT 
WITH CHECK (true);

-- Políticas para chatbot_respostas_automaticas
CREATE POLICY "Admins podem gerenciar respostas automáticas" 
ON public.chatbot_respostas_automaticas 
FOR ALL 
USING (is_admin_user()) 
WITH CHECK (is_admin_user());

CREATE POLICY "Sistema pode ver respostas ativas" 
ON public.chatbot_respostas_automaticas 
FOR SELECT 
USING (ativo = true);

-- Triggers para updated_at
CREATE TRIGGER update_chatbot_treinamentos_updated_at
  BEFORE UPDATE ON public.chatbot_treinamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_conversas_updated_at
  BEFORE UPDATE ON public.chatbot_conversas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chatbot_respostas_automaticas_updated_at
  BEFORE UPDATE ON public.chatbot_respostas_automaticas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();