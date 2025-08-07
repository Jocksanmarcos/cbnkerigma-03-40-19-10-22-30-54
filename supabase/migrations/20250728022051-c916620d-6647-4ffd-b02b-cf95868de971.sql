-- Garantir que os triggers estão funcionando
CREATE OR REPLACE TRIGGER trigger_atualizar_arvore_celulas
  BEFORE INSERT OR UPDATE ON public.celulas
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_arvore_genealogica();

-- Trigger para histórico de pessoas
CREATE OR REPLACE TRIGGER trigger_historico_pessoas
  AFTER UPDATE ON public.pessoas
  FOR EACH ROW
  EXECUTE FUNCTION public.criar_historico_pessoa();

-- Trigger para updated_at em pessoas
CREATE OR REPLACE TRIGGER trigger_updated_at_pessoas
  BEFORE UPDATE ON public.pessoas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Verificar se a função obter_estatisticas_pessoas está funcionando
SELECT public.obter_estatisticas_pessoas();