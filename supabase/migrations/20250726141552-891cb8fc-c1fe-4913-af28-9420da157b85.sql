-- Inserir usuário admin inicial com o email correto
INSERT INTO public.usuarios_admin (email, nome, papel, ativo)
VALUES ('contato@cbnkerigma.org.br', 'Administrador CBN Kerigma', 'admin', true);