-- Criar enum para tipos de eventos
CREATE TYPE tipo_evento_agenda AS ENUM ('publico', 'celula', 'ensino', 'reuniao_interna', 'pastoral');

-- Criar enum para status de eventos
CREATE TYPE status_evento_agenda AS ENUM ('agendado', 'confirmado', 'concluido', 'cancelado');

-- Criar tabela agenda_eventos
CREATE TABLE public.agenda_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  tipo tipo_evento_agenda NOT NULL DEFAULT 'publico',
  publico BOOLEAN NOT NULL DEFAULT true,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  local TEXT,
  organizador_id UUID,
  status status_evento_agenda NOT NULL DEFAULT 'agendado',
  enviar_notificacao BOOLEAN NOT NULL DEFAULT false,
  visivel_para TEXT[] DEFAULT ARRAY['todos'],
  grupo TEXT DEFAULT 'geral',
  link_google_calendar TEXT,
  igreja_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Foreign key para organizador (opcional)
  CONSTRAINT fk_organizador FOREIGN KEY (organizador_id) REFERENCES pessoas(id) ON DELETE SET NULL,
  CONSTRAINT fk_igreja FOREIGN KEY (igreja_id) REFERENCES igrejas(id) ON DELETE CASCADE
);

-- Habilitar RLS
ALTER TABLE public.agenda_eventos ENABLE ROW LEVEL SECURITY;

-- Política para visualização - eventos públicos para todos, privados apenas para autorizados
CREATE POLICY "Ver eventos públicos" 
ON public.agenda_eventos 
FOR SELECT 
USING (
  publico = true OR 
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR 
  (igreja_id = get_pastor_missao_igreja_id())
);

-- Política para criação/edição - apenas admins e líderes
CREATE POLICY "Gerenciar eventos por igreja" 
ON public.agenda_eventos 
FOR ALL 
USING (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR 
  (igreja_id = get_pastor_missao_igreja_id())
)
WITH CHECK (
  is_sede_admin() OR 
  (igreja_id = get_user_igreja_id()) OR 
  (igreja_id = get_pastor_missao_igreja_id())
);

-- Trigger para updated_at
CREATE TRIGGER update_agenda_eventos_updated_at
BEFORE UPDATE ON public.agenda_eventos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_agenda_eventos_data_inicio ON public.agenda_eventos(data_inicio);
CREATE INDEX idx_agenda_eventos_igreja_id ON public.agenda_eventos(igreja_id);
CREATE INDEX idx_agenda_eventos_tipo ON public.agenda_eventos(tipo);
CREATE INDEX idx_agenda_eventos_publico ON public.agenda_eventos(publico);
CREATE INDEX idx_agenda_eventos_status ON public.agenda_eventos(status);