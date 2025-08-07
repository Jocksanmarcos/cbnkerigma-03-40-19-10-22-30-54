-- Criação da tabela pessoas
CREATE TABLE public.pessoas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Campos Pessoais
  nome_completo TEXT NOT NULL,
  foto_url TEXT,
  sexo TEXT CHECK (sexo IN ('masculino', 'feminino')),
  data_nascimento DATE,
  estado_civil TEXT CHECK (estado_civil IN ('solteiro', 'casado', 'divorciado', 'viuvo', 'uniao_estavel')),
  cpf TEXT UNIQUE,
  rg TEXT,
  email TEXT,
  telefone_celular TEXT,
  telefone_whatsapp TEXT,
  telefone_residencial TEXT,
  
  -- Endereço
  cep TEXT,
  endereco_rua TEXT,
  endereco_numero TEXT,
  endereco_bairro TEXT,
  endereco_cidade TEXT,
  endereco_uf TEXT,
  endereco_complemento TEXT,
  
  -- Profissional/Educacional
  profissao TEXT,
  escolaridade TEXT CHECK (escolaridade IN ('fundamental_incompleto', 'fundamental_completo', 'medio_incompleto', 'medio_completo', 'superior_incompleto', 'superior_completo', 'pos_graduacao', 'mestrado', 'doutorado')),
  
  -- Redes Sociais
  instagram TEXT,
  facebook TEXT,
  linkedin TEXT,
  
  -- Campos Espirituais
  data_primeira_visita DATE,
  estado_espiritual TEXT NOT NULL DEFAULT 'visitante' CHECK (estado_espiritual IN ('visitante', 'novo_convertido', 'batizado', 'membro_ativo', 'em_acompanhamento', 'lider_treinamento', 'lider', 'pastor')),
  data_conversao DATE,
  data_batismo DATE,
  recebido_por_id UUID REFERENCES public.pessoas(id),
  discipulador_atual_id UUID REFERENCES public.pessoas(id),
  status_discipulado TEXT DEFAULT 'nao_iniciado' CHECK (status_discipulado IN ('nao_iniciado', 'em_andamento', 'concluido', 'pausado')),
  cargo_funcao TEXT,
  ministerio_atuacao TEXT[],
  observacoes_pastorais TEXT, -- Campo restrito
  
  -- Campos de Integração
  celula_id UUID REFERENCES public.celulas(id),
  
  -- Classificações
  tipo_pessoa TEXT NOT NULL DEFAULT 'membro' CHECK (tipo_pessoa IN ('membro', 'visitante', 'voluntario', 'pastor', 'obreiro', 'lider')),
  situacao TEXT NOT NULL DEFAULT 'ativo' CHECK (situacao IN ('ativo', 'inativo', 'transferido', 'desligado')),
  grupo_etario TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN data_nascimento IS NULL THEN NULL
      WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) <= 12 THEN 'crianca'
      WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) <= 17 THEN 'adolescente'
      WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) <= 30 THEN 'jovem'
      WHEN EXTRACT(YEAR FROM AGE(data_nascimento)) <= 60 THEN 'adulto'
      ELSE 'idoso'
    END
  ) STORED,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_pessoas_nome ON public.pessoas(nome_completo);
CREATE INDEX idx_pessoas_email ON public.pessoas(email);
CREATE INDEX idx_pessoas_cpf ON public.pessoas(cpf);
CREATE INDEX idx_pessoas_estado_espiritual ON public.pessoas(estado_espiritual);
CREATE INDEX idx_pessoas_tipo_pessoa ON public.pessoas(tipo_pessoa);
CREATE INDEX idx_pessoas_situacao ON public.pessoas(situacao);
CREATE INDEX idx_pessoas_celula_id ON public.pessoas(celula_id);
CREATE INDEX idx_pessoas_discipulador ON public.pessoas(discipulador_atual_id);

-- Comentários para documentação
COMMENT ON TABLE public.pessoas IS 'Tabela central para cadastro de todas as pessoas do sistema eclesiástico';
COMMENT ON COLUMN public.pessoas.observacoes_pastorais IS 'Campo restrito apenas para pastores e líderes autorizados';
COMMENT ON COLUMN public.pessoas.grupo_etario IS 'Campo calculado automaticamente baseado na data de nascimento';

-- Habilitar RLS
ALTER TABLE public.pessoas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Admins podem gerenciar todas as pessoas" 
ON public.pessoas 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Qualquer um pode ver informações básicas das pessoas ativas" 
ON public.pessoas 
FOR SELECT 
USING (situacao = 'ativo');

-- Tabela para histórico de mudanças importantes
CREATE TABLE public.historico_pessoas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('conversao', 'batismo', 'mudanca_celula', 'mudanca_discipulador', 'mudanca_cargo', 'mudanca_status', 'transferencia', 'desligamento')),
  descricao TEXT NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  usuario_responsavel UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para histórico
CREATE INDEX idx_historico_pessoas_pessoa_id ON public.historico_pessoas(pessoa_id);
CREATE INDEX idx_historico_pessoas_tipo_evento ON public.historico_pessoas(tipo_evento);
CREATE INDEX idx_historico_pessoas_created_at ON public.historico_pessoas(created_at);

-- RLS para histórico
ALTER TABLE public.historico_pessoas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver todo histórico" 
ON public.historico_pessoas 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

CREATE POLICY "Sistema pode inserir histórico" 
ON public.historico_pessoas 
FOR INSERT 
WITH CHECK (true);

-- Tabela para relacionamentos familiares
CREATE TABLE public.relacionamentos_familiares (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  parente_id UUID NOT NULL REFERENCES public.pessoas(id) ON DELETE CASCADE,
  tipo_relacionamento TEXT NOT NULL CHECK (tipo_relacionamento IN ('pai', 'mae', 'filho', 'filha', 'conjuge', 'irmao', 'irma', 'avo', 'avo_fem', 'neto', 'neta', 'tio', 'tia', 'primo', 'prima')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, parente_id, tipo_relacionamento)
);

-- Índices para relacionamentos
CREATE INDEX idx_relacionamentos_pessoa_id ON public.relacionamentos_familiares(pessoa_id);
CREATE INDEX idx_relacionamentos_parente_id ON public.relacionamentos_familiares(parente_id);

-- RLS para relacionamentos
ALTER TABLE public.relacionamentos_familiares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem gerenciar relacionamentos" 
ON public.relacionamentos_familiares 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM usuarios_admin 
  WHERE user_id = auth.uid() AND ativo = true
));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_pessoas_updated_at
  BEFORE UPDATE ON public.pessoas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar histórico automaticamente em mudanças importantes
CREATE OR REPLACE FUNCTION public.criar_historico_pessoa()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudanças importantes
  IF OLD.estado_espiritual != NEW.estado_espiritual THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_status', 'Mudança de estado espiritual', OLD.estado_espiritual, NEW.estado_espiritual, auth.uid());
  END IF;
  
  IF OLD.celula_id IS DISTINCT FROM NEW.celula_id THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_celula', 'Mudança de célula', 
            COALESCE(OLD.celula_id::text, 'nenhuma'), 
            COALESCE(NEW.celula_id::text, 'nenhuma'), 
            auth.uid());
  END IF;
  
  IF OLD.discipulador_atual_id IS DISTINCT FROM NEW.discipulador_atual_id THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_discipulador', 'Mudança de discipulador', 
            COALESCE(OLD.discipulador_atual_id::text, 'nenhum'), 
            COALESCE(NEW.discipulador_atual_id::text, 'nenhum'), 
            auth.uid());
  END IF;
  
  IF OLD.cargo_funcao IS DISTINCT FROM NEW.cargo_funcao THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_anterior, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'mudanca_cargo', 'Mudança de cargo/função', 
            COALESCE(OLD.cargo_funcao, 'nenhum'), 
            COALESCE(NEW.cargo_funcao, 'nenhum'), 
            auth.uid());
  END IF;
  
  -- Registrar marcos especiais
  IF OLD.data_conversao IS NULL AND NEW.data_conversao IS NOT NULL THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'conversao', 'Data de conversão registrada', NEW.data_conversao::text, auth.uid());
  END IF;
  
  IF OLD.data_batismo IS NULL AND NEW.data_batismo IS NOT NULL THEN
    INSERT INTO public.historico_pessoas (pessoa_id, tipo_evento, descricao, valor_novo, usuario_responsavel)
    VALUES (NEW.id, 'batismo', 'Data de batismo registrada', NEW.data_batismo::text, auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar histórico
CREATE TRIGGER trigger_historico_pessoa
  AFTER UPDATE ON public.pessoas
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_historico_pessoa();

-- Função para obter estatísticas das pessoas
CREATE OR REPLACE FUNCTION public.obter_estatisticas_pessoas()
RETURNS TABLE(
  total_pessoas BIGINT,
  total_membros BIGINT,
  total_visitantes BIGINT,
  total_lideres BIGINT,
  total_batizados BIGINT,
  total_em_discipulado BIGINT,
  crescimento_mes_atual BIGINT,
  pessoas_por_grupo_etario JSONB,
  pessoas_por_estado_espiritual JSONB
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM public.pessoas WHERE situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'membro' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'visitante' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE tipo_pessoa = 'lider' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE data_batismo IS NOT NULL AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE status_discipulado = 'em_andamento' AND situacao = 'ativo')::BIGINT,
    (SELECT COUNT(*) FROM public.pessoas WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND situacao = 'ativo')::BIGINT,
    (SELECT jsonb_object_agg(grupo_etario, count) 
     FROM (
       SELECT grupo_etario, COUNT(*) as count 
       FROM public.pessoas 
       WHERE situacao = 'ativo' AND grupo_etario IS NOT NULL
       GROUP BY grupo_etario
     ) sub),
    (SELECT jsonb_object_agg(estado_espiritual, count) 
     FROM (
       SELECT estado_espiritual, COUNT(*) as count 
       FROM public.pessoas 
       WHERE situacao = 'ativo'
       GROUP BY estado_espiritual
     ) sub);
END;
$$;