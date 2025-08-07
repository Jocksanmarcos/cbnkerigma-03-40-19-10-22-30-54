-- Atualizar os nomes das missões conforme solicitado
UPDATE igrejas SET 
  nome = 'Comunidade Batista Nacional - Sede',
  cidade = 'São Luís',
  estado = 'MA'
WHERE tipo = 'Sede';

-- Atualizar as 5 missões com os nomes corretos
UPDATE igrejas SET 
  nome = 'Comunidade Batista Nacional - Missão Gapara',
  cidade = 'Gapara',
  estado = 'MA',
  pastor_responsavel = 'Pastor da Missão Gapara'
WHERE id = '67d8ddff-1789-4c8b-971e-c56ac41d20b0';

UPDATE igrejas SET 
  nome = 'Comunidade Batista Nacional - Missão Bacabeira',
  cidade = 'Bacabeira', 
  estado = 'MA',
  pastor_responsavel = 'Pastor da Missão Bacabeira'
WHERE id = '2b616d72-0e3a-44ad-b55a-9a689bd708e6';

UPDATE igrejas SET 
  nome = 'Comunidade Batista Nacional - Missão Icatu',
  cidade = 'Icatu',
  estado = 'MA', 
  pastor_responsavel = 'Pastor da Missão Icatu'
WHERE id = '4cbccedf-2efe-436f-afbb-a863dc709169';

UPDATE igrejas SET 
  nome = 'Comunidade Batista Nacional - Missão Vila Maranhão',
  cidade = 'Vila Maranhão',
  estado = 'MA',
  pastor_responsavel = 'Pastor da Missão Vila Maranhão'
WHERE id = 'b7722d0e-33cf-4b50-bb29-b542da0c78e7';

UPDATE igrejas SET 
  nome = 'Comunidade Batista Nacional - Missão Mata de Itapera',
  cidade = 'Mata de Itapera',
  estado = 'MA',
  pastor_responsavel = 'Pastor da Missão Mata de Itapera'
WHERE id = '658fdbbb-a480-416a-b664-1dc87ade559e';