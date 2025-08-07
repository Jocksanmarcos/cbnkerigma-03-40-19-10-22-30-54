-- Primeiro, desvincular a Vitória do usuário admin
UPDATE public.pessoas 
SET user_id = NULL
WHERE nome_completo = 'Vitória Santos Costa' 
AND email = 'vitoria960289@gmail.com'
AND id = 'f49e7c39-563e-4615-859c-84b75fad357c';