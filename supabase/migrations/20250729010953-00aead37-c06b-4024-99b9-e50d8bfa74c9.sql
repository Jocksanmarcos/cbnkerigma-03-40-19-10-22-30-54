-- Cadastrar Jocksan como pessoa/aluno no sistema
DO $$
BEGIN
  -- Inserir pessoa se não existir
  IF NOT EXISTS (SELECT 1 FROM public.pessoas WHERE email = 'jocksan.marcos@gmail.com') THEN
    INSERT INTO public.pessoas (
      nome_completo,
      email,
      tipo_pessoa,
      estado_espiritual,
      situacao
    ) VALUES (
      'Jocksan Marcos',
      'jocksan.marcos@gmail.com',
      'membro',
      'membro',
      'ativo'
    );
  ELSE
    -- Atualizar se já existe
    UPDATE public.pessoas 
    SET situacao = 'ativo',
        tipo_pessoa = 'membro',
        updated_at = now()
    WHERE email = 'jocksan.marcos@gmail.com';
  END IF;
  
  -- Remover permissões admin se existirem
  DELETE FROM public.usuarios_admin 
  WHERE email = 'jocksan.marcos@gmail.com';
END $$;