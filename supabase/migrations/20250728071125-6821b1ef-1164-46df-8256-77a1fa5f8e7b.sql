-- Inserir novas categorias financeiras que não existem
INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) VALUES
-- Categorias de Entrada
('Contribuição Convencional', 'entrada', 'Contribuições regulares dos membros', '#10b981', 0, true),
('Receitas Extraordinárias', 'entrada', 'Receitas não recorrentes', '#059669', 0, true),
('Receitas Financeiras', 'entrada', 'Rendimentos de aplicações e juros', '#047857', 0, true),
('Doações Específicas', 'entrada', 'Doações com destinação específica', '#065f46', 0, true),

-- Categorias de Saída - Administrativas
('Administração', 'saida', 'Despesas administrativas gerais', '#dc2626', 0, true),
('Despesas Bancárias', 'saida', 'Taxas e tarifas bancárias', '#b91c1c', 0, true),
('Contabilidade', 'saida', 'Serviços contábeis e consultorias', '#991b1b', 0, true),
('Material de Escritório', 'saida', 'Papelaria e materiais de escritório', '#7f1d1d', 0, true),

-- Categorias de Saída - Estrutura
('Construções e Benfeitorias', 'saida', 'Obras e melhorias na estrutura', '#7c2d12', 0, true),
('Móveis e Utensílios', 'saida', 'Móveis e equipamentos para o templo', '#a2450d', 0, true),
('Ornamentação', 'saida', 'Decoração e ornamentação do templo', '#92400e', 0, true),

-- Categorias de Saída - Pessoal
('Salários e Encargos', 'saida', 'Folha de pagamento e encargos', '#ea580c', 0, true),
('Prebenda Pastoral', 'saida', 'Sustento pastoral', '#c2410c', 0, true),
('Auxílios', 'saida', 'Auxílios diversos aos colaboradores', '#9a3412', 0, true),

-- Categorias de Saída - Ministérios
('Educação Religiosa', 'saida', 'Escola dominical e cursos', '#0891b2', 0, true),
('Ministério de Louvor', 'saida', 'Equipamentos e materiais de louvor', '#0e7490', 0, true),
('Ministério de Crianças', 'saida', 'Atividades e materiais infantis', '#155e75', 0, true),
('Ministério de Jovens', 'saida', 'Atividades e eventos jovens', '#164e63', 0, true),
('Ministério de Casais', 'saida', 'Atividades para casais', '#083344', 0, true),
('Ministério de Mulheres', 'saida', 'Atividades femininas', '#f59e0b', 0, true),
('Ministério de Homens', 'saida', 'Atividades masculinas', '#d97706', 0, true),

-- Categorias de Saída - Assistência
('Assistência Social', 'saida', 'Cestas básicas e auxílios sociais', '#7c3aed', 0, true),
('Projetos Sociais', 'saida', 'Projetos assistenciais da igreja', '#6d28d9', 0, true),
('Diaconia', 'saida', 'Trabalho diaconal', '#5b21b6', 0, true),

-- Categorias de Saída - Operacionais
('Despesas Gerais', 'saida', 'Despesas operacionais diversas', '#6b7280', 0, true),
('Serviços Terceirizados', 'saida', 'Limpeza, segurança e outros serviços', '#4b5563', 0, true),
('Impostos', 'saida', 'IPTU e outros tributos', '#374151', 0, true)

ON CONFLICT (nome) DO NOTHING;

-- Inserir novas contas financeiras que não existem
INSERT INTO public.contas_financeiras (nome, tipo, banco, saldo_atual, ativa) VALUES
-- Bancos
('Banco Bradesco', 'banco', 'Bradesco', 0, true),
('Banco do Brasil', 'banco', 'Banco do Brasil', 0, true),
('Banco Cora', 'banco', 'Cora', 0, true),

-- Cartões
('Cartão Atacadão', 'outros', 'Atacadão', 0, true),
('Cartão Hipercard', 'outros', 'Hipercard', 0, true),
('Cartão Ipiranga', 'outros', 'Ipiranga', 0, true),
('Cartão Itaú', 'outros', 'Itaú', 0, true),
('Cartão Passaí', 'outros', 'Passaí', 0, true),

-- Digitais
('Asaas', 'pix', 'Asaas', 0, true),
('Mercado Pago', 'pix', 'Mercado Pago', 0, true),
('Infinity Pay', 'pix', 'Infinity Pay', 0, true),

-- Caixas específicos
('Caixa Missões', 'caixa', NULL, 0, true),
('Caixa Eventos', 'caixa', NULL, 0, true),
('Caixa Construção', 'caixa', NULL, 0, true)

ON CONFLICT (nome) DO NOTHING;