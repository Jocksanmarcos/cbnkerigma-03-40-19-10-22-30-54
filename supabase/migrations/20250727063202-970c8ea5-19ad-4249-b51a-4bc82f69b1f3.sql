-- Criar tabelas para analytics e estatísticas

-- Tabela para registrar visualizações de páginas
CREATE TABLE public.page_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  user_session TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para participação em eventos
CREATE TABLE public.participacao_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  status TEXT NOT NULL DEFAULT 'confirmado',
  check_in_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para pedidos de oração
CREATE TABLE public.pedidos_oracao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  pedido TEXT NOT NULL,
  urgencia TEXT NOT NULL DEFAULT 'normal', -- normal, urgente, muito_urgente
  categoria TEXT NOT NULL DEFAULT 'geral', -- geral, saude, familia, trabalho, etc
  publico BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ativo', -- ativo, respondido, arquivado
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para voluntariado
CREATE TABLE public.voluntarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  areas_interesse TEXT[] NOT NULL, -- array de áreas como música, infantil, etc
  disponibilidade TEXT NOT NULL, -- semanal, quinzenal, mensal, eventual
  experiencia TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo', -- ativo, inativo, afastado
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para reserva de salas/espaços
CREATE TABLE public.espacos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  capacidade INTEGER NOT NULL DEFAULT 10,
  recursos TEXT[], -- projetor, som, ar_condicionado, etc
  disponivel BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.reservas_espacos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  espaco_id UUID NOT NULL REFERENCES espacos(id) ON DELETE CASCADE,
  nome_responsavel TEXT NOT NULL,
  email_responsavel TEXT NOT NULL,
  telefone_responsavel TEXT,
  evento_titulo TEXT NOT NULL,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE NOT NULL,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, aprovado, rejeitado, cancelado
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_page_path ON page_views(page_path);
CREATE INDEX idx_participacao_eventos_evento_id ON participacao_eventos(evento_id);
CREATE INDEX idx_pedidos_oracao_status ON pedidos_oracao(status);
CREATE INDEX idx_reservas_espacos_data ON reservas_espacos(data_inicio, data_fim);

-- Enable RLS
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participacao_eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos_oracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voluntarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.espacos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas_espacos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para page_views (apenas admins)
CREATE POLICY "Apenas admins podem ver page views" 
  ON public.page_views FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

CREATE POLICY "Sistema pode inserir page views" 
  ON public.page_views FOR INSERT 
  WITH CHECK (true);

-- Políticas para participação em eventos
CREATE POLICY "Admins podem ver participações" 
  ON public.participacao_eventos FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

CREATE POLICY "Qualquer um pode se inscrever em eventos" 
  ON public.participacao_eventos FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar participações" 
  ON public.participacao_eventos FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

-- Políticas para pedidos de oração
CREATE POLICY "Admins podem ver todos os pedidos" 
  ON public.pedidos_oracao FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

CREATE POLICY "Qualquer um pode ver pedidos públicos" 
  ON public.pedidos_oracao FOR SELECT 
  USING (publico = true AND status = 'ativo');

CREATE POLICY "Qualquer um pode enviar pedidos" 
  ON public.pedidos_oracao FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar pedidos" 
  ON public.pedidos_oracao FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

-- Políticas para voluntários
CREATE POLICY "Admins podem ver voluntários" 
  ON public.voluntarios FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

CREATE POLICY "Qualquer um pode se voluntariar" 
  ON public.voluntarios FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar voluntários" 
  ON public.voluntarios FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

-- Políticas para espaços
CREATE POLICY "Qualquer um pode ver espaços disponíveis" 
  ON public.espacos FOR SELECT 
  USING (disponivel = true);

CREATE POLICY "Admins podem gerenciar espaços" 
  ON public.espacos FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

-- Políticas para reservas
CREATE POLICY "Admins podem ver todas as reservas" 
  ON public.reservas_espacos FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

CREATE POLICY "Qualquer um pode fazer reservas" 
  ON public.reservas_espacos FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Admins podem atualizar reservas" 
  ON public.reservas_espacos FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM usuarios_admin 
    WHERE user_id = auth.uid() AND ativo = true
  ));

-- Triggers para updated_at
CREATE TRIGGER update_participacao_eventos_updated_at
  BEFORE UPDATE ON public.participacao_eventos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pedidos_oracao_updated_at
  BEFORE UPDATE ON public.pedidos_oracao
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_voluntarios_updated_at
  BEFORE UPDATE ON public.voluntarios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_espacos_updated_at
  BEFORE UPDATE ON public.espacos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_reservas_espacos_updated_at
  BEFORE UPDATE ON public.reservas_espacos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Inserir alguns espaços padrão
INSERT INTO public.espacos (nome, descricao, capacidade, recursos) VALUES
('Santuário Principal', 'Espaço principal de cultos com capacidade para grandes eventos', 300, ARRAY['som', 'projetor', 'ar_condicionado', 'palco']),
('Sala de Reuniões 1', 'Sala pequena para reuniões e células', 15, ARRAY['projetor', 'ar_condicionado']),
('Sala de Reuniões 2', 'Sala média para grupos maiores', 30, ARRAY['projetor', 'ar_condicionado', 'som']),
('Área Infantil', 'Espaço dedicado para crianças com brinquedos e materiais', 25, ARRAY['brinquedos', 'ar_condicionado', 'tv']),
('Salão Social', 'Espaço para eventos sociais e confraternizações', 80, ARRAY['cozinha', 'som', 'ar_condicionado']);