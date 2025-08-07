-- Verificar a constraint atual e corrigi-la para aceitar todos os status necessários
ALTER TABLE public.contatos 
DROP CONSTRAINT IF EXISTS contatos_status_check;

-- Adicionar nova constraint com todos os valores de status válidos
ALTER TABLE public.contatos 
ADD CONSTRAINT contatos_status_check 
CHECK (status IN ('novo', 'pendente', 'em_andamento', 'resolvido'));