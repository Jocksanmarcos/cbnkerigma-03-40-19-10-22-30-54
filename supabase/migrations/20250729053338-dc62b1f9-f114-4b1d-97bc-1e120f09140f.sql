-- Corrigir problemas de segurança detectados

-- 1. Corrigir função get_site_url com search_path fixo
CREATE OR REPLACE FUNCTION public.get_site_url()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Retorna a URL base do site para redirecionamentos
  RETURN 'https://f239131e-7b11-4349-b1f8-04f6401da903.lovableproject.com';
END;
$$;

-- 2. Atualizar função de reset de senha no edge function para usar URL correta
CREATE OR REPLACE FUNCTION public.get_reset_url()
RETURNS TEXT
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Retorna a URL de reset específica
  RETURN 'https://f239131e-7b11-4349-b1f8-04f6401da903.lovableproject.com/reset';
END;
$$;