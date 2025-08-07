-- Inserir subcategorias de Som e Áudio
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id, ativa)
SELECT 'Microfones', 'Microfones diversos (com fio, sem fio, lapela)', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Mesa de Som', 'Mesas de som e mixers', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Amplificadores', 'Amplificadores de potência', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Caixas de Som', 'Alto-falantes e monitores', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Cabos de Áudio', 'Cabos, conectores e acessórios de áudio', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio'
UNION ALL
SELECT 'Processadores de Áudio', 'Equalizadores, compressores e processadores', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Som e Áudio';

-- Inserir subcategorias de Vídeo e Projeção
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id, ativa)
SELECT 'Projetores', 'Data shows e projetores multimídia', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Telões e Telas', 'Telas de projeção e telões', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Câmeras', 'Câmeras de vídeo e fotografia', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Televisores', 'TVs e monitores de vídeo', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Cabos de Vídeo', 'Cabos HDMI, VGA e acessórios de vídeo', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção'
UNION ALL
SELECT 'Equipamentos de Streaming', 'Encoders, decoders e equipamentos para transmissão online', id, true FROM categorias_patrimonio WHERE nome = 'Equipamentos de Vídeo e Projeção';

-- Inserir subcategorias de Instrumentos Musicais
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id, ativa)
SELECT 'Teclados e Pianos', 'Pianos acústicos, digitais e teclados', id, true FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Guitarras e Baixos', 'Guitarras, baixos e contrabaixos', id, true FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Bateria e Percussão', 'Baterias acústicas, eletrônicas e instrumentos de percussão', id, true FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Instrumentos de Sopro', 'Saxofones, trompetes, flautas e outros sopros', id, true FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Violões e Violinos', 'Instrumentos de cordas acústicas', id, true FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais'
UNION ALL
SELECT 'Acessórios Musicais', 'Pedestais, capas, palhetas e acessórios diversos', id, true FROM categorias_patrimonio WHERE nome = 'Instrumentos Musicais';

-- Inserir subcategorias de Móveis e Utensílios
INSERT INTO subcategorias_patrimonio (nome, descricao, categoria_id, ativa)
SELECT 'Cadeiras e Bancos', 'Cadeiras para auditório, bancos e assentos', id, true FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Mesas e Escrivaninhas', 'Mesas de escritório, púlpitos e escrivaninhas', id, true FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Armários e Estantes', 'Armários, estantes e organizadores', id, true FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Púlpitos e Plataformas', 'Púlpitos, plataformas e estruturas para palco', id, true FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Utensílios de Cozinha', 'Equipamentos e utensílios para cozinha e copa', id, true FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios'
UNION ALL
SELECT 'Decoração', 'Quadros, plantas e itens decorativos', id, true FROM categorias_patrimonio WHERE nome = 'Móveis e Utensílios';