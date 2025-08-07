-- Criar tabelas para cache e logs de SEO
CREATE TABLE IF NOT EXISTS public.seo_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  result JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

CREATE TABLE IF NOT EXISTS public.seo_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES auth.users(id),
  slug TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_seo_cache_slug ON public.seo_cache(slug);
CREATE INDEX IF NOT EXISTS idx_seo_cache_expires ON public.seo_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_seo_logs_uid_timestamp ON public.seo_logs(uid, timestamp);

-- RLS para as tabelas
ALTER TABLE public.seo_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para cache (acessível por usuários autenticados)
CREATE POLICY "Usuários podem ver cache SEO" ON public.seo_cache
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Sistema pode gerenciar cache SEO" ON public.seo_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Políticas para logs (usuários podem ver seus próprios logs)
CREATE POLICY "Usuários podem ver seus logs SEO" ON public.seo_logs
  FOR SELECT USING (auth.uid() = uid);

CREATE POLICY "Sistema pode criar logs SEO" ON public.seo_logs
  FOR INSERT WITH CHECK (true);

-- Função para limpar cache expirado
CREATE OR REPLACE FUNCTION public.cleanup_seo_cache()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.seo_cache WHERE expires_at < NOW();
END;
$function$;