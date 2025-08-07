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

-- Inserir subcategorias de Som e Áudio
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Microfones', 'Microfones diversos (com fio, sem fio, lapela)', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Mesa de Som', 'Mesas de som e mixers', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Amplificadores', 'Amplificadores de potência', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Caixas de Som', 'Alto-falantes e monitores', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Cabos de Áudio', 'Cabos, conectores e acessórios de áudio', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Processadores de Áudio', 'Equalizadores, compressores e processadores', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio';

-- Inserir subcategorias de Vídeo e Projeção
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Projetores', 'Data shows e projetores multimídia', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Telões e Telas', 'Telas de projeção e telões', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Câmeras', 'Câmeras de vídeo e fotografia', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Televisores', 'TVs e monitores de vídeo', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Cabos de Vídeo', 'Cabos HDMI, VGA e acessórios de vídeo', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Equipamentos de Streaming', 'Encoders, decoders e equipamentos para transmissão online', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção';

-- Inserir subcategorias de Instrumentos Musicais
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Teclados e Pianos', 'Pianos acústicos, digitais e teclados', id FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Guitarras e Baixos', 'Guitarras, baixos e contrabaixos', id FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Bateria e Percussão', 'Baterias acústicas, eletrônicas e instrumentos de percussão', id FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Instrumentos de Sopro', 'Saxofones, trompetes, flautas e outros sopros', id FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Violões e Violinos', 'Instrumentos de cordas acústicas', id FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Acessórios Musicais', 'Pedestais, capas, palhetas e acessórios diversos', id FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais';

-- Inserir subcategorias de Móveis e Utensílios
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Cadeiras e Bancos', 'Cadeiras para auditório, bancos e assentos', id FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Mesas e Escrivaninhas', 'Mesas de escritório, púlpitos e escrivaninhas', id FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Armários e Estantes', 'Armários, estantes e organizadores', id FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Púlpitos e Plataformas', 'Púlpitos, plataformas e estruturas para palco', id FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Utensílios de Cozinha', 'Equipamentos e utensílios para cozinha e copa', id FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Decoração', 'Quadros, plantas e itens decorativos', id FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios';

-- Inserir subcategorias de Equipamentos de Informática
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Computadores Desktop', 'Computadores de mesa e workstations', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Informática'
UNION ALL
SELECT 'Notebooks e Tablets', 'Laptops, notebooks e tablets', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Informática'
UNION ALL
SELECT 'Impressoras e Scanners', 'Impressoras, scanners e equipamentos de digitalização', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Informática'
UNION ALL
SELECT 'Equipamentos de Rede', 'Roteadores, switches e equipamentos de conectividade', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Informática'
UNION ALL
SELECT 'Periféricos', 'Mouses, teclados, monitores e acessórios', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Informática'
UNION ALL
SELECT 'Servidores e Storage', 'Servidores, HDs externos e equipamentos de armazenamento', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Informática';

-- Inserir subcategorias de Veículos
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Carros de Passeio', 'Automóveis para transporte de pessoas', id FROM categorias_patrimonio WHERE nome = 'Veículos'
UNION ALL
SELECT 'Vans e Micro-ônibus', 'Veículos para transporte de grupos', id FROM categorias_patrimonio WHERE nome = 'Veículos'
UNION ALL
SELECT 'Motocicletas', 'Motos e ciclomotores', id FROM categorias_patrimonio WHERE nome = 'Veículos'
UNION ALL
SELECT 'Bicicletas', 'Bicicletas convencionais e elétricas', id FROM categorias_patrimonio WHERE nome = 'Veículos';

-- Inserir subcategorias de Equipamentos de Segurança
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Câmeras de Segurança', 'Câmeras de monitoramento e vigilância', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Segurança'
UNION ALL
SELECT 'Sistemas de Alarme', 'Alarmes, sensores e centrais de segurança', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Segurança'
UNION ALL
SELECT 'Extintores', 'Extintores de incêndio e equipamentos contra fogo', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Segurança'
UNION ALL
SELECT 'Equipamentos de Primeiros Socorros', 'Kits de primeiros socorros e equipamentos médicos básicos', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Segurança'
UNION ALL
SELECT 'Cofres e Fechaduras', 'Cofres, fechaduras eletrônicas e sistemas de controle de acesso', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Segurança';

-- Inserir subcategorias de Equipamentos de Climatização
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Ar Condicionado', 'Aparelhos de ar condicionado split, janela e centrais', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Climatização'
UNION ALL
SELECT 'Ventiladores', 'Ventiladores de teto, mesa e coluna', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Climatização'
UNION ALL
SELECT 'Aquecedores', 'Aquecedores elétricos e a gás', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Climatização'
UNION ALL
SELECT 'Purificadores de Ar', 'Purificadores e umidificadores de ar', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Climatização';

-- Inserir subcategorias de Livros e Material Didático
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Bíblias e Comentários', 'Bíblias em diferentes versões e comentários bíblicos', id FROM categorias_patrimonio WHERE nome = 'Livros e Material Didático'
UNION ALL
SELECT 'Livros de Estudo', 'Livros teológicos e de crescimento espiritual', id FROM categorias_patrimonio WHERE nome = 'Livros e Material Didático'
UNION ALL
SELECT 'Material Infantil', 'Livros e materiais para escola dominical infantil', id FROM categorias_patrimonio WHERE nome = 'Livros e Material Didático'
UNION ALL
SELECT 'DVDs e CDs', 'Materiais de áudio e vídeo educativos e de louvor', id FROM categorias_patrimonio WHERE nome = 'Livros e Material Didático'
UNION ALL
SELECT 'Revistas e Periódicos', 'Revistas de escola dominical e periódicos cristãos', id FROM categorias_patrimonio WHERE nome = 'Livros e Material Didático';

-- Inserir subcategorias de Equipamentos de Limpeza
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id)
SELECT 'Aspiradores', 'Aspiradores de pó e equipamentos de sucção', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Limpeza'
UNION ALL
SELECT 'Lavadoras e Secadoras', 'Máquinas de lavar e secar roupas', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Limpeza'
UNION ALL
SELECT 'Materiais de Limpeza', 'Baldes, rodos, vassouras e materiais diversos', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Limpeza'
UNION ALL
SELECT 'Equipamentos Industriais', 'Enceradeiras, lavadoras de alta pressão e equipamentos pesados', id FROM categorias_patrimonio WHERE nome = 'Equipamentos de Limpeza';

-- Habilitar RLS na tabela de subcategorias
ALTER TABLE subcategorias_patrimonio ENABLE ROW LEVEL SECURITY;

-- Criar política para subcategorias
CREATE POLICY "Qualquer um pode ver subcategorias patrimônio ativas"
ON subcategorias_patrimonio
FOR SELECT
USING (ativa = true);

-- Trigger para updated_at
CREATE TRIGGER update_subcategorias_patrimonio_updated_at
  BEFORE UPDATE ON subcategorias_patrimonio
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();