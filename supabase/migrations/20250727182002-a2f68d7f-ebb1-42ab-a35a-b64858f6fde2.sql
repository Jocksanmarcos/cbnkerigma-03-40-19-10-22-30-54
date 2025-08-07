-- Expandir tabela celulas com novos campos do sistema de gestão eclesiástica
ALTER TABLE public.celulas 
ADD COLUMN IF NOT EXISTS rede_ministerio text,
ADD COLUMN IF NOT EXISTS coordenador text,
ADD COLUMN IF NOT EXISTS supervisor text,
ADD COLUMN IF NOT EXISTS lider_em_treinamento text,
ADD COLUMN IF NOT EXISTS anfitriao text,
ADD COLUMN IF NOT EXISTS data_inicio date,
ADD COLUMN IF NOT EXISTS status_celula text DEFAULT 'ativa',
ADD COLUMN IF NOT EXISTS observacoes text;

-- Criar tabela de participantes das células
CREATE TABLE IF NOT EXISTS public.participantes_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  telefone TEXT,
  email TEXT,
  data_entrada DATE DEFAULT CURRENT_DATE,
  tipo_participante TEXT DEFAULT 'membro' CHECK (tipo_participante IN ('membro', 'visitante', 'novo_convertido')),
  status_espiritual JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de relatórios semanais
CREATE TABLE IF NOT EXISTS public.relatorios_semanais_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  data_reuniao DATE NOT NULL,
  presencas JSONB DEFAULT '[]',
  visitantes JSONB DEFAULT '[]',
  palavra_ministrada TEXT,
  oferta_arrecadada DECIMAL(10,2) DEFAULT 0,
  motivos_oracao TEXT,
  decisoes_cristo INTEGER DEFAULT 0,
  batismos_agendados INTEGER DEFAULT 0,
  foto_url TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'aprovado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de histórico das células
CREATE TABLE IF NOT EXISTS public.historico_celulas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('criacao', 'mudanca_lideranca', 'mudanca_endereco', 'multiplicacao', 'reuniao', 'alteracao_status')),
  descricao TEXT NOT NULL,
  dados_antigos JSONB,
  dados_novos JSONB,
  usuario_responsavel UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.participantes_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_semanais_celulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.historico_celulas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para participantes_celulas
CREATE POLICY "Admins podem gerenciar participantes" 
ON public.participantes_celulas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Qualquer um pode ver participantes ativos" 
ON public.participantes_celulas 
FOR SELECT 
USING (ativo = true);

-- Políticas RLS para relatorios_semanais_celulas
CREATE POLICY "Admins podem gerenciar relatórios" 
ON public.relatorios_semanais_celulas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Líderes podem criar relatórios" 
ON public.relatorios_semanais_celulas 
FOR INSERT 
WITH CHECK (true);

-- Políticas RLS para historico_celulas
CREATE POLICY "Admins podem ver histórico" 
ON public.historico_celulas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Sistema pode inserir histórico" 
ON public.historico_celulas 
FOR INSERT 
WITH CHECK (true);

-- Adicionar triggers para updated_at
CREATE TRIGGER update_participantes_celulas_updated_at
  BEFORE UPDATE ON public.participantes_celulas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_relatorios_semanais_celulas_updated_at
  BEFORE UPDATE ON public.relatorios_semanais_celulas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_participantes_celulas_celula_id ON public.participantes_celulas(celula_id);
CREATE INDEX IF NOT EXISTS idx_participantes_celulas_tipo ON public.participantes_celulas(tipo_participante);
CREATE INDEX IF NOT EXISTS idx_relatorios_semanais_celula_id ON public.relatorios_semanais_celulas(celula_id);
CREATE INDEX IF NOT EXISTS idx_relatorios_semanais_data ON public.relatorios_semanais_celulas(data_reuniao);
CREATE INDEX IF NOT EXISTS idx_historico_celulas_celula_id ON public.historico_celulas(celula_id);
CREATE INDEX IF NOT EXISTS idx_historico_celulas_tipo ON public.historico_celulas(tipo_evento);