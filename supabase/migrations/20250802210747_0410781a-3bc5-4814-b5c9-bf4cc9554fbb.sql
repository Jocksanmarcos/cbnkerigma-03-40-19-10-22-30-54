-- ===== MIGRAÇÃO PARA IMPLEMENTAR MODELO DNA =====

-- Criar tabela de Trilhas DNA
CREATE TABLE IF NOT EXISTS public.trilhas_dna (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('novo_convertido', 'batismo', 'discipulado_1', 'discipulado_2', 'discipulado_3', 'lider_celula', 'escola_lideres')),
  ordem INTEGER NOT NULL DEFAULT 1,
  etapas JSONB NOT NULL DEFAULT '[]'::jsonb,
  pre_requisitos TEXT[],
  certificado_template TEXT,
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de Progresso nas Trilhas DNA
CREATE TABLE IF NOT EXISTS public.progresso_trilhas_dna (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  trilha_id UUID NOT NULL REFERENCES public.trilhas_dna(id),
  etapa_atual INTEGER NOT NULL DEFAULT 1,
  etapas_concluidas JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  status TEXT NOT NULL DEFAULT 'em_andamento' CHECK (status IN ('em_andamento', 'concluido', 'pausado', 'cancelado')),
  discipulador_id UUID,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(pessoa_id, trilha_id)
);

-- Criar tabela de Relatórios de Célula
CREATE TABLE IF NOT EXISTS public.relatorios_celula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  celula_id UUID NOT NULL REFERENCES public.celulas(id),
  data_reuniao DATE NOT NULL,
  tipo_reuniao TEXT NOT NULL DEFAULT 'semanal' CHECK (tipo_reuniao IN ('semanal', 'especial', 'multiplicacao')),
  presentes INTEGER NOT NULL DEFAULT 0,
  visitantes INTEGER NOT NULL DEFAULT 0,
  criancas INTEGER NOT NULL DEFAULT 0,
  decisoes INTEGER NOT NULL DEFAULT 0,
  ofertas DECIMAL(10,2) DEFAULT 0,
  estudo_aplicado TEXT,
  atividades_realizadas TEXT[],
  proximos_passos TEXT,
  observacoes TEXT,
  relator_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de Presença em Células
CREATE TABLE IF NOT EXISTS public.presencas_celula (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  relatorio_id UUID NOT NULL REFERENCES public.relatorios_celula(id),
  pessoa_id UUID NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT true,
  tipo_participacao TEXT NOT NULL DEFAULT 'membro' CHECK (tipo_participacao IN ('membro', 'visitante', 'crianca')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar campos ao modelo de Pessoas para DNA
ALTER TABLE public.pessoas 
ADD COLUMN IF NOT EXISTS discipulador_id UUID,
ADD COLUMN IF NOT EXISTS data_inicio_discipulado DATE,
ADD COLUMN IF NOT EXISTS discipulando_ids UUID[],
ADD COLUMN IF NOT EXISTS tags_pastorais TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS nivel_lideranca TEXT DEFAULT 'membro' CHECK (nivel_lideranca IN ('membro', 'auxiliar', 'lider_treinamento', 'lider', 'supervisor', 'coordenador', 'pastor')),
ADD COLUMN IF NOT EXISTS pronto_para_liderar BOOLEAN DEFAULT false;

-- Adicionar campos ao modelo de Células para DNA
ALTER TABLE public.celulas
ADD COLUMN IF NOT EXISTS meta_membros INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS meta_visitantes_mes INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS meta_decisoes_mes INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS anfitriao_id UUID,
ADD COLUMN IF NOT EXISTS auxiliar_id UUID,
ADD COLUMN IF NOT EXISTS frequencia_reunioes TEXT DEFAULT 'semanal' CHECK (frequencia_reunioes IN ('semanal', 'quinzenal', 'mensal'));

-- Inserir Trilhas DNA padrão
INSERT INTO public.trilhas_dna (nome, descricao, tipo, ordem, etapas) VALUES
('Trilha do Novo Convertido', 'Primeira trilha para quem aceitou Jesus', 'novo_convertido', 1, '[
  {"id": 1, "nome": "Bem-vindo à Família", "descricao": "Entender o que significa ser cristão", "material": "Cartilha Novo Convertido"},
  {"id": 2, "nome": "Sua Nova Vida", "descricao": "Mudanças práticas na vida cristã", "material": "Livro Nova Vida"},
  {"id": 3, "nome": "Primeiros Passos", "descricao": "Oração, leitura bíblica e congregar", "material": "Guia Primeiros Passos"},
  {"id": 4, "nome": "Preparação para o Batismo", "descricao": "Entender o significado do batismo", "material": "Manual do Batismo"}
]'::jsonb),

('Escola de Líderes - DNA', 'Formação completa de líderes pelo método DNA', 'escola_lideres', 2, '[
  {"id": 1, "nome": "Fundamentos da Liderança", "descricao": "Princípios bíblicos de liderança", "material": "Livro DNA 1"},
  {"id": 2, "nome": "Discipulado Natural", "descricao": "Como formar outros líderes", "material": "Livro DNA 2"},
  {"id": 3, "nome": "Liderança de Células", "descricao": "Como liderar uma célula eficaz", "material": "Manual do Líder"},
  {"id": 4, "nome": "Multiplicação", "descricao": "Estratégias para multiplicar células", "material": "Guia Multiplicação"}
]'::jsonb),

('Treinamento para Líderes de Células', 'Capacitação específica para líderes de células', 'lider_celula', 3, '[
  {"id": 1, "nome": "Visão de Células", "descricao": "Entender o modelo de igreja em células", "material": "Manual Visão"},
  {"id": 2, "nome": "Dinâmica de Grupos", "descricao": "Como conduzir reuniões eficazes", "material": "Guia Dinâmicas"},
  {"id": 3, "nome": "Cuidado Pastoral", "descricao": "Como pastorear os membros da célula", "material": "Manual Cuidado"},
  {"id": 4, "nome": "Evangelismo Relacional", "descricao": "Estratégias para alcançar novos", "material": "Livro Evangelismo"}
]'::jsonb),

('Curso de Batismo', 'Preparação para o batismo nas águas', 'batismo', 4, '[
  {"id": 1, "nome": "O que é o Batismo", "descricao": "Significado bíblico do batismo", "material": "Folheto Batismo"},
  {"id": 2, "nome": "Minha Decisão", "descricao": "Testemunho pessoal e decisão pública", "material": "Formulário Testemunho"},
  {"id": 3, "nome": "Nova Identidade", "descricao": "Vida após o batismo", "material": "Manual Nova Identidade"}
]'::jsonb),

('Discipulado 1 - Fundamentos', 'Primeira fase do discipulado', 'discipulado_1', 5, '[
  {"id": 1, "nome": "Segurança da Salvação", "descricao": "Certeza da vida eterna", "material": "Livro Salvação"},
  {"id": 2, "nome": "Autoridade da Bíblia", "descricao": "A Palavra como guia", "material": "Manual Bíblia"},
  {"id": 3, "nome": "Vida de Oração", "descricao": "Desenvolvendo intimidade com Deus", "material": "Guia Oração"},
  {"id": 4, "nome": "Santificação", "descricao": "Vivendo em santidade", "material": "Livro Santidade"}
]'::jsonb),

('Discipulado 2 - Crescimento', 'Segunda fase do discipulado', 'discipulado_2', 6, '[
  {"id": 1, "nome": "Dons Espirituais", "descricao": "Descobrindo seus dons", "material": "Manual Dons"},
  {"id": 2, "nome": "Caráter Cristão", "descricao": "Desenvolvendo o fruto do Espírito", "material": "Livro Caráter"},
  {"id": 3, "nome": "Relacionamentos", "descricao": "Vivendo em comunidade", "material": "Guia Relacionamentos"},
  {"id": 4, "nome": "Missão Pessoal", "descricao": "Encontrando seu propósito", "material": "Manual Missão"}
]'::jsonb),

('Discipulado 3 - Ministério', 'Terceira fase do discipulado', 'discipulado_3', 7, '[
  {"id": 1, "nome": "Chamado ao Ministério", "descricao": "Entendendo o chamado para servir", "material": "Livro Ministério"},
  {"id": 2, "nome": "Pregação e Ensino", "descricao": "Comunicando a Palavra", "material": "Manual Pregação"},
  {"id": 3, "nome": "Liderança Servidora", "descricao": "Liderando como Jesus", "material": "Livro Liderança"},
  {"id": 4, "nome": "Formando Discípulos", "descricao": "Multiplicando a vida cristã", "material": "Guia Discipulado"}
]'::jsonb);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_progresso_trilhas_pessoa ON public.progresso_trilhas_dna(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_progresso_trilhas_status ON public.progresso_trilhas_dna(status);
CREATE INDEX IF NOT EXISTS idx_relatorios_celula_data ON public.relatorios_celula(data_reuniao);
CREATE INDEX IF NOT EXISTS idx_presencas_celula_pessoa ON public.presencas_celula(pessoa_id);

-- Habilitar RLS
ALTER TABLE public.trilhas_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progresso_trilhas_dna ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relatorios_celula ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas_celula ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Qualquer um pode ver trilhas ativas" ON public.trilhas_dna
  FOR SELECT USING (ativa = true);

CREATE POLICY "Admins podem gerenciar trilhas" ON public.trilhas_dna
  FOR ALL USING (is_admin_user());

CREATE POLICY "Acesso progresso trilhas por igreja" ON public.progresso_trilhas_dna
  FOR ALL USING (
    is_sede_admin() OR 
    EXISTS (
      SELECT 1 FROM pessoas p 
      WHERE p.id = progresso_trilhas_dna.pessoa_id 
      AND (p.igreja_id = get_user_igreja_id() OR p.igreja_id = get_pastor_missao_igreja_id())
    )
  );

CREATE POLICY "Acesso relatórios célula por igreja" ON public.relatorios_celula
  FOR ALL USING (
    is_sede_admin() OR 
    EXISTS (
      SELECT 1 FROM celulas c 
      WHERE c.id = relatorios_celula.celula_id 
      AND (c.igreja_id = get_user_igreja_id() OR c.igreja_id = get_pastor_missao_igreja_id())
    )
  );

CREATE POLICY "Acesso presenças por igreja" ON public.presencas_celula
  FOR ALL USING (
    is_sede_admin() OR 
    EXISTS (
      SELECT 1 FROM relatorios_celula rc
      JOIN celulas c ON c.id = rc.celula_id
      WHERE rc.id = presencas_celula.relatorio_id 
      AND (c.igreja_id = get_user_igreja_id() OR c.igreja_id = get_pastor_missao_igreja_id())
    )
  );

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trilhas_dna_updated_at
  BEFORE UPDATE ON public.trilhas_dna
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progresso_trilhas_updated_at
  BEFORE UPDATE ON public.progresso_trilhas_dna
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relatorios_celula_updated_at
  BEFORE UPDATE ON public.relatorios_celula
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();