-- Primeiro, vamos remover o trigger problemático temporariamente
DROP TRIGGER IF EXISTS criar_historico_pessoa_trigger ON public.pessoas;

-- Criar tabela de igrejas (sede e missões)
CREATE TABLE public.igrejas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('Sede', 'Missão')) NOT NULL,
  cidade TEXT,
  estado TEXT,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  pastor_responsavel TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir dados iniciais (sede + 5 missões)
INSERT INTO public.igrejas (nome, tipo, cidade, estado, pastor_responsavel) VALUES
('CBN Kerigma - Sede', 'Sede', 'Cidade Principal', 'SP', 'Pastor Principal'),
('CBN Kerigma - Missão Vila Nova', 'Missão', 'Vila Nova', 'SP', 'Pastor João Silva'),
('CBN Kerigma - Missão Centro', 'Missão', 'Centro', 'SP', 'Pastor Carlos Lima'),
('CBN Kerigma - Missão Jardim São Paulo', 'Missão', 'Jardim São Paulo', 'SP', 'Pastora Maria Santos'),
('CBN Kerigma - Missão Vila Esperança', 'Missão', 'Vila Esperança', 'SP', 'Pastor Marcos Oliveira'),
('CBN Kerigma - Missão Novo Horizonte', 'Missão', 'Novo Horizonte', 'SP', 'Pastora Ana Costa');

-- Habilitar RLS na tabela igrejas
ALTER TABLE public.igrejas ENABLE ROW LEVEL SECURITY;