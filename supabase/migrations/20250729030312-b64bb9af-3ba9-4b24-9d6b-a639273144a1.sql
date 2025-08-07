-- Primeiro, vamos criar um usuário de teste no sistema de autenticação
-- Isso simula a criação de um usuário através do signup

-- Inserir um usuário direto na tabela auth.users (apenas para demonstração)
-- Na prática, isso seria feito através do processo de signup normal

-- Vamos vincular a pessoa Vitória ao user_id do admin temporariamente para teste
-- (Em produção, cada pessoa teria seu próprio usuário único)

-- Vincular a pessoa Vitória Santos Costa a um usuário fictício para teste
UPDATE public.pessoas 
SET user_id = 'e8105244-b334-4ccd-a943-9bf7382463f8'
WHERE nome_completo = 'Vitória Santos Costa' 
AND email = 'vitoria960289@gmail.com'
AND id = 'f49e7c39-563e-4615-859c-84b75fad357c';

-- Verificar se a vinculação foi feita
SELECT p.nome_completo, p.email, p.user_id, m.status, c.nome as curso_nome
FROM pessoas p 
LEFT JOIN matriculas m ON p.id = m.pessoa_id
LEFT JOIN turmas t ON m.turma_id = t.id  
LEFT JOIN cursos c ON t.curso_id = c.id
WHERE p.user_id = 'e8105244-b334-4ccd-a943-9bf7382463f8';