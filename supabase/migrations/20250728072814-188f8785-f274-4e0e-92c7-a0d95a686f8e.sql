-- Inserir novas categorias financeiras apenas se não existirem
DO $$
BEGIN
  -- Categorias de Entrada
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Contribuição Convencional') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Contribuição Convencional', 'entrada', 'Contribuições regulares dos membros', '#10b981', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Receitas Extraordinárias') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Receitas Extraordinárias', 'entrada', 'Receitas não recorrentes', '#059669', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Receitas Financeiras') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Receitas Financeiras', 'entrada', 'Rendimentos de aplicações e juros', '#047857', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Doações Específicas') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Doações Específicas', 'entrada', 'Doações com destinação específica', '#065f46', 0, true);
  END IF;

  -- Categorias de Saída - Administrativas
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Administração') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Administração', 'saida', 'Despesas administrativas gerais', '#dc2626', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Despesas Bancárias') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Despesas Bancárias', 'saida', 'Taxas e tarifas bancárias', '#b91c1c', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Contabilidade') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Contabilidade', 'saida', 'Serviços contábeis e consultorias', '#991b1b', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Material de Escritório') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Material de Escritório', 'saida', 'Papelaria e materiais de escritório', '#7f1d1d', 0, true);
  END IF;

  -- Categorias de Saída - Estrutura
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Construções e Benfeitorias') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Construções e Benfeitorias', 'saida', 'Obras e melhorias na estrutura', '#7c2d12', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Móveis e Utensílios') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Móveis e Utensílios', 'saida', 'Móveis e equipamentos para o templo', '#a2450d', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Ornamentação') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Ornamentação', 'saida', 'Decoração e ornamentação do templo', '#92400e', 0, true);
  END IF;

  -- Categorias de Saída - Pessoal
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Salários e Encargos') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Salários e Encargos', 'saida', 'Folha de pagamento e encargos', '#ea580c', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Prebenda Pastoral') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Prebenda Pastoral', 'saida', 'Sustento pastoral', '#c2410c', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Auxílios') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Auxílios', 'saida', 'Auxílios diversos aos colaboradores', '#9a3412', 0, true);
  END IF;

  -- Categorias de Saída - Ministérios
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Ministério de Louvor') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Ministério de Louvor', 'saida', 'Equipamentos e materiais de louvor', '#0e7490', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Ministério de Crianças') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Ministério de Crianças', 'saida', 'Atividades e materiais infantis', '#155e75', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Ministério de Jovens') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Ministério de Jovens', 'saida', 'Atividades e eventos jovens', '#164e63', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Ministério de Casais') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Ministério de Casais', 'saida', 'Atividades para casais', '#083344', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Ministério de Mulheres') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Ministério de Mulheres', 'saida', 'Atividades femininas', '#f59e0b', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Ministério de Homens') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Ministério de Homens', 'saida', 'Atividades masculinas', '#d97706', 0, true);
  END IF;

  -- Categorias de Saída - Assistência
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Projetos Sociais') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Projetos Sociais', 'saida', 'Projetos assistenciais da igreja', '#6d28d9', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Diaconia') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Diaconia', 'saida', 'Trabalho diaconal', '#5b21b6', 0, true);
  END IF;

  -- Categorias de Saída - Operacionais
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Serviços Terceirizados') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Serviços Terceirizados', 'saida', 'Limpeza, segurança e outros serviços', '#4b5563', 0, true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categorias_financeiras WHERE nome = 'Impostos') THEN
    INSERT INTO public.categorias_financeiras (nome, tipo, descricao, cor, orcamento_mensal, ativa) 
    VALUES ('Impostos', 'saida', 'IPTU e outros tributos', '#374151', 0, true);
  END IF;
END $$;