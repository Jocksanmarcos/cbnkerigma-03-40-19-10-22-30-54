-- Create badges_ensino table for gamification badges
CREATE TABLE public.badges_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  icon TEXT NOT NULL DEFAULT '🏆',
  cor TEXT NOT NULL DEFAULT '#6366f1',
  criterios JSONB NOT NULL DEFAULT '{}',
  pontos_recompensa INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create conquistas_ensino table for user achievements
CREATE TABLE public.conquistas_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  pessoa_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges_ensino(id) ON DELETE CASCADE,
  pontos_ganhos INTEGER NOT NULL DEFAULT 0,
  data_conquista TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notificacoes_ensino table
CREATE TABLE public.notificacoes_ensino (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT NOT NULL DEFAULT 'info',
  destinatario_id UUID,
  lida BOOLEAN NOT NULL DEFAULT false,
  data_leitura TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create configuracoes_notificacoes table
CREATE TABLE public.configuracoes_notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  configuracoes JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.badges_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conquistas_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notificacoes_ensino ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_notificacoes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for badges_ensino
CREATE POLICY "Qualquer um pode ver badges ativos" 
ON public.badges_ensino 
FOR SELECT 
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar badges" 
ON public.badges_ensino 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create RLS policies for conquistas_ensino
CREATE POLICY "Usuários podem ver próprias conquistas" 
ON public.conquistas_ensino 
FOR SELECT 
USING (pessoa_id IN (SELECT id FROM pessoas WHERE user_id = auth.uid()));

CREATE POLICY "Sistema pode criar conquistas" 
ON public.conquistas_ensino 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins podem gerenciar conquistas" 
ON public.conquistas_ensino 
FOR ALL 
USING (is_admin_user());

-- Create RLS policies for notificacoes_ensino
CREATE POLICY "Usuários podem ver próprias notificações" 
ON public.notificacoes_ensino 
FOR SELECT 
USING (destinatario_id = auth.uid() OR destinatario_id IS NULL);

CREATE POLICY "Usuários podem atualizar próprias notificações" 
ON public.notificacoes_ensino 
FOR UPDATE 
USING (destinatario_id = auth.uid());

CREATE POLICY "Admins podem gerenciar notificações" 
ON public.notificacoes_ensino 
FOR ALL 
USING (is_admin_user())
WITH CHECK (is_admin_user());

-- Create RLS policies for configuracoes_notificacoes
CREATE POLICY "Usuários podem gerenciar próprias configurações" 
ON public.configuracoes_notificacoes 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create function to get teaching ranking
CREATE OR REPLACE FUNCTION public.obter_ranking_ensino()
RETURNS TABLE(
  pessoa_id UUID,
  nome TEXT,
  total_pontos BIGINT,
  badges_count BIGINT,
  cursos_concluidos BIGINT,
  posicao INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH pontuacao AS (
    SELECT 
      p.id as pessoa_id,
      p.nome,
      COALESCE(SUM(c.pontos_ganhos), 0) as total_pontos,
      COUNT(c.id) as badges_count,
      COUNT(CASE WHEN m.status = 'concluido' THEN 1 END) as cursos_concluidos
    FROM pessoas p
    LEFT JOIN conquistas_ensino c ON p.id = c.pessoa_id
    LEFT JOIN matriculas_ensino m ON p.id = m.pessoa_id
    WHERE p.situacao = 'ativo'
    GROUP BY p.id, p.nome
  )
  SELECT 
    pontuacao.pessoa_id,
    pontuacao.nome,
    pontuacao.total_pontos,
    pontuacao.badges_count,
    pontuacao.cursos_concluidos,
    ROW_NUMBER() OVER (ORDER BY pontuacao.total_pontos DESC, pontuacao.badges_count DESC)::INTEGER as posicao
  FROM pontuacao
  ORDER BY pontuacao.total_pontos DESC, pontuacao.badges_count DESC
  LIMIT 50;
END;
$$;

-- Create indexes for better performance
CREATE INDEX idx_conquistas_ensino_pessoa_id ON public.conquistas_ensino(pessoa_id);
CREATE INDEX idx_conquistas_ensino_badge_id ON public.conquistas_ensino(badge_id);
CREATE INDEX idx_notificacoes_ensino_destinatario ON public.notificacoes_ensino(destinatario_id);
CREATE INDEX idx_configuracoes_notificacoes_user ON public.configuracoes_notificacoes(user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_badges_ensino_updated_at
BEFORE UPDATE ON public.badges_ensino
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notificacoes_ensino_updated_at
BEFORE UPDATE ON public.notificacoes_ensino
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_notificacoes_updated_at
BEFORE UPDATE ON public.configuracoes_notificacoes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();