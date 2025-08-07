-- Primeiro, criar uma restrição única para o nome na tabela categorias_patrimonio
ALTER TABLE categorias_patrimonio ADD CONSTRAINT categorias_patrimonio_nome_unique UNIQUE (nome);

-- Inserir categorias principais de patrimônio
INSERT INTO categorias_patrimonio (nome, descricao) VALUES
('Equipamentos de Som e Áudio', 'Equipamentos para sonorização e áudio'),
('Equipamentos de Vídeo e Projeção', 'Equipamentos audiovisuais e projeção'),
('Instrumentos Musicais', 'Instrumentos para louvor e adoração'),
('Móveis e Utensílios', 'Mobiliário e utensílios diversos'),
('Equipamentos de Informática', 'Computadores, notebooks e equipamentos de TI'),
('Veículos', 'Veículos da igreja'),
('Equipamentos de Segurança', 'Sistemas de segurança e proteção'),
('Equipamentos de Climatização', 'Ar condicionado, ventiladores e climatização'),
('Livros e Material Didático', 'Biblioteca e materiais educacionais'),
('Equipamentos de Limpeza', 'Materiais e equipamentos de limpeza')
ON CONFLICT (nome) DO NOTHING;

-- Criar tabela de subcategorias de patrimônio
CREATE TABLE IF NOT EXISTS subcategorias_patrimonio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  categoria_id UUID NOT NULL REFERENCES categorias_patrimonio(id),
  ativa BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);