-- Remover subcategorias duplicadas das categorias antigas
DELETE FROM subcategorias_patrimonio 
WHERE categoria_id IN (
  SELECT id FROM categorias_patrimonio 
  WHERE nome IN ('Equipamento', 'Instrumento', 'Móvel')
) 
AND nome IN (
  'Áudio', 'Vídeo', 'Informática', 'Iluminação',
  'Bateria', 'Corda', 'Sopro', 'Teclado',
  'Escritório', 'Igreja', 'Cozinha'
);

-- Desativar categorias antigas duplicadas
UPDATE categorias_patrimonio 
SET ativa = false 
WHERE nome IN ('Equipamento', 'Instrumento', 'Móvel', 'Veículo', 'Imóvel', 'Outros');