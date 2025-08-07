-- Verificar se o usuário admin já existe na tabela pessoas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.pessoas 
    WHERE email = 'admin@cbnkerigma.org.br' 
    OR user_id = 'e8105244-b334-4ccd-a943-9bf7382463f8'
  ) THEN
    -- Inserir registro na tabela pessoas para o usuário admin
    INSERT INTO public.pessoas (
      user_id,
      nome_completo, 
      email,
      tipo_pessoa,
      situacao,
      estado_espiritual,
      papel_igreja,
      igreja_id
    ) VALUES (
      'e8105244-b334-4ccd-a943-9bf7382463f8',
      'Jocksan Marcos',
      'admin@cbnkerigma.org.br', 
      'membro',
      'ativo',
      'membro',
      'administrador_geral',
      'd49516eb-0044-44af-8108-1e5635dd3b99' -- igreja_id do admin obtido dos logs
    );
    
    RAISE NOTICE 'Usuário admin criado na tabela pessoas';
  ELSE
    RAISE NOTICE 'Usuário admin já existe na tabela pessoas';
  END IF;
END $$;