-- Primeiro, vamos criar os types necessários
CREATE TYPE tipo_escala AS ENUM ('voluntarios', 'pregadores', 'ministerio_louvor', 'dancarinos', 'sonorizacao', 'multimidia', 'intercessao', 'recepcao', 'criancas', 'seguranca');
CREATE TYPE status_participacao AS ENUM ('convocado', 'confirmado', 'negado', 'substituido', 'presente', 'faltou');
CREATE TYPE tipo_culto AS ENUM ('domingo_manha', 'domingo_noite', 'quarta_oracao', 'sexta_jovens', 'especial', 'ensaio');

-- Tabela para programação de cultos
CREATE TABLE IF NOT EXISTS public.programacao_cultos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  data_culto TIMESTAMP WITH TIME ZONE NOT NULL,
  tipo_culto tipo_culto NOT NULL,
  local TEXT DEFAULT 'Templo Principal',
  tema_culto TEXT,
  versiculo_base TEXT,
  observacoes TEXT,
  cor_tema TEXT DEFAULT '#6366f1',
  igreja_id UUID NOT NULL,
  criado_por UUID NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para escalas expandida
CREATE TABLE IF NOT EXISTS public.escalas_ministerio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  programacao_culto_id UUID NOT NULL REFERENCES programacao_cultos(id) ON DELETE CASCADE,
  tipo_escala tipo_escala NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  vagas_necessarias INTEGER NOT NULL DEFAULT 1,
  vagas_preenchidas INTEGER NOT NULL DEFAULT 0,
  data_limite_confirmacao TIMESTAMP WITH TIME ZONE,
  instrucoes_especiais TEXT,
  materiais_necessarios JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para participantes das escalas
CREATE TABLE IF NOT EXISTS public.participantes_escala (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  escala_id UUID NOT NULL REFERENCES escalas_ministerio(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL,
  funcao TEXT NOT NULL,
  status_participacao status_participacao NOT NULL DEFAULT 'convocado',
  data_convocacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_confirmacao TIMESTAMP WITH TIME ZONE,
  data_presenca TIMESTAMP WITH TIME ZONE,
  substituido_por UUID REFERENCES pessoas(id),
  observacoes TEXT,
  notificado BOOLEAN NOT NULL DEFAULT false,
  lembrete_enviado BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(escala_id, pessoa_id)
);

-- Tabela para lista de músicas (ministério de louvor)
CREATE TABLE IF NOT EXISTS public.listas_musicas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  programacao_culto_id UUID NOT NULL REFERENCES programacao_cultos(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT 'Lista de Músicas',
  ordem_execucao INTEGER NOT NULL DEFAULT 1,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para músicas da lista
CREATE TABLE IF NOT EXISTS public.musicas_lista (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lista_id UUID NOT NULL REFERENCES listas_musicas(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  artista TEXT,
  tom_original TEXT,
  tom_execucao TEXT,
  bpm INTEGER,
  ordem INTEGER NOT NULL,
  tipo TEXT DEFAULT 'louvor' CHECK (tipo IN ('louvor', 'adoracao', 'entrada', 'oferta', 'saida', 'especial')),
  letra TEXT,
  cifra TEXT,
  link_video TEXT,
  link_playback TEXT,
  link_partitura TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para ensaios
CREATE TABLE IF NOT EXISTS public.ensaios_ministerio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  programacao_culto_id UUID NOT NULL REFERENCES programacao_cultos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  data_ensaio TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT NOT NULL,
  duracao_estimada INTEGER DEFAULT 120, -- em minutos
  observacoes TEXT,
  lista_musicas_id UUID REFERENCES listas_musicas(id),
  obrigatorio BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para participantes de ensaios
CREATE TABLE IF NOT EXISTS public.participantes_ensaio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ensaio_id UUID NOT NULL REFERENCES ensaios_ministerio(id) ON DELETE CASCADE,
  pessoa_id UUID NOT NULL,
  status_participacao status_participacao NOT NULL DEFAULT 'convocado',
  data_confirmacao TIMESTAMP WITH TIME ZONE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ensaio_id, pessoa_id)
);

-- Tabela para recursos e materiais
CREATE TABLE IF NOT EXISTS public.recursos_ministerio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('instrumento', 'equipamento', 'material', 'partitura', 'playback')),
  descricao TEXT,
  disponivel BOOLEAN NOT NULL DEFAULT true,
  responsavel_id UUID REFERENCES pessoas(id),
  localizacao TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para reserva de recursos
CREATE TABLE IF NOT EXISTS public.reservas_recursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recurso_id UUID NOT NULL REFERENCES recursos_ministerio(id) ON DELETE CASCADE,
  programacao_culto_id UUID NOT NULL REFERENCES programacao_cultos(id) ON DELETE CASCADE,
  reservado_por UUID NOT NULL REFERENCES pessoas(id),
  data_reserva TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.programacao_cultos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escalas_ministerio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes_escala ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listas_musicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.musicas_lista ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ensaios_ministerio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participantes_ensaio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos_ministerio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas_recursos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para programacao_cultos
CREATE POLICY "Líderes podem gerenciar programação de cultos"
ON public.programacao_cultos FOR ALL
USING (is_sede_admin() OR (igreja_id = get_user_igreja_id()))
WITH CHECK (is_sede_admin() OR (igreja_id = get_user_igreja_id()));

CREATE POLICY "Membros podem ver programação ativa"
ON public.programacao_cultos FOR SELECT
USING (ativo = true);

-- Políticas RLS para escalas_ministerio
CREATE POLICY "Líderes podem gerenciar escalas do ministério"
ON public.escalas_ministerio FOR ALL
USING (EXISTS (
  SELECT 1 FROM programacao_cultos pc 
  WHERE pc.id = escalas_ministerio.programacao_culto_id 
  AND (is_sede_admin() OR pc.igreja_id = get_user_igreja_id())
))
WITH CHECK (EXISTS (
  SELECT 1 FROM programacao_cultos pc 
  WHERE pc.id = escalas_ministerio.programacao_culto_id 
  AND (is_sede_admin() OR pc.igreja_id = get_user_igreja_id())
));

CREATE POLICY "Membros podem ver escalas ativas"
ON public.escalas_ministerio FOR SELECT
USING (ativo = true);

-- Políticas RLS para participantes_escala
CREATE POLICY "Participantes podem ver próprias escalas"
ON public.participantes_escala FOR SELECT
USING (pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Participantes podem confirmar própria participação"
ON public.participantes_escala FOR UPDATE
USING (pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Líderes podem gerenciar participantes"
ON public.participantes_escala FOR ALL
USING (EXISTS (
  SELECT 1 FROM escalas_ministerio em 
  JOIN programacao_cultos pc ON pc.id = em.programacao_culto_id
  WHERE em.id = participantes_escala.escala_id 
  AND (is_sede_admin() OR pc.igreja_id = get_user_igreja_id())
));

-- Políticas RLS para listas_musicas
CREATE POLICY "Ministério de louvor pode gerenciar listas"
ON public.listas_musicas FOR ALL
USING (EXISTS (
  SELECT 1 FROM programacao_cultos pc 
  WHERE pc.id = listas_musicas.programacao_culto_id 
  AND (is_sede_admin() OR pc.igreja_id = get_user_igreja_id())
));

CREATE POLICY "Membros podem ver listas de músicas"
ON public.listas_musicas FOR SELECT
USING (true);

-- Políticas RLS para musicas_lista
CREATE POLICY "Ministério de louvor pode gerenciar músicas"
ON public.musicas_lista FOR ALL
USING (EXISTS (
  SELECT 1 FROM listas_musicas lm 
  JOIN programacao_cultos pc ON pc.id = lm.programacao_culto_id
  WHERE lm.id = musicas_lista.lista_id 
  AND (is_sede_admin() OR pc.igreja_id = get_user_igreja_id())
));

CREATE POLICY "Membros podem ver músicas"
ON public.musicas_lista FOR SELECT
USING (true);

-- Políticas RLS para ensaios_ministerio
CREATE POLICY "Líderes podem gerenciar ensaios"
ON public.ensaios_ministerio FOR ALL
USING (EXISTS (
  SELECT 1 FROM programacao_cultos pc 
  WHERE pc.id = ensaios_ministerio.programacao_culto_id 
  AND (is_sede_admin() OR pc.igreja_id = get_user_igreja_id())
));

CREATE POLICY "Membros podem ver ensaios ativos"
ON public.ensaios_ministerio FOR SELECT
USING (ativo = true);

-- Políticas RLS para participantes_ensaio
CREATE POLICY "Participantes podem ver próprios ensaios"
ON public.participantes_ensaio FOR SELECT
USING (pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Participantes podem confirmar ensaios"
ON public.participantes_ensaio FOR UPDATE
USING (pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Líderes podem gerenciar participantes de ensaio"
ON public.participantes_ensaio FOR ALL
USING (EXISTS (
  SELECT 1 FROM ensaios_ministerio em 
  JOIN programacao_cultos pc ON pc.id = em.programacao_culto_id
  WHERE em.id = participantes_ensaio.ensaio_id 
  AND (is_sede_admin() OR pc.igreja_id = get_user_igreja_id())
));

-- Políticas RLS para recursos_ministerio
CREATE POLICY "Líderes podem gerenciar recursos"
ON public.recursos_ministerio FOR ALL
USING (is_sede_admin() OR EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true 
  AND papel IN ('admin', 'lider')
));

CREATE POLICY "Membros podem ver recursos disponíveis"
ON public.recursos_ministerio FOR SELECT
USING (disponivel = true);

-- Políticas RLS para reservas_recursos
CREATE POLICY "Usuários podem fazer próprias reservas"
ON public.reservas_recursos FOR ALL
USING (reservado_por IN (SELECT id FROM pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Líderes podem ver todas as reservas"
ON public.reservas_recursos FOR SELECT
USING (is_sede_admin() OR EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true 
  AND papel IN ('admin', 'lider')
));

-- Triggers para updated_at
CREATE TRIGGER update_programacao_cultos_updated_at
  BEFORE UPDATE ON public.programacao_cultos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escalas_ministerio_updated_at
  BEFORE UPDATE ON public.escalas_ministerio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_participantes_escala_updated_at
  BEFORE UPDATE ON public.participantes_escala
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_listas_musicas_updated_at
  BEFORE UPDATE ON public.listas_musicas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_musicas_lista_updated_at
  BEFORE UPDATE ON public.musicas_lista
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ensaios_ministerio_updated_at
  BEFORE UPDATE ON public.ensaios_ministerio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_participantes_ensaio_updated_at
  BEFORE UPDATE ON public.participantes_ensaio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recursos_ministerio_updated_at
  BEFORE UPDATE ON public.recursos_ministerio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservas_recursos_updated_at
  BEFORE UPDATE ON public.reservas_recursos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();