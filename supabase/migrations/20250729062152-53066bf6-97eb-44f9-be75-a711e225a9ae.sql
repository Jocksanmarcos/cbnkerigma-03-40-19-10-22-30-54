-- Primeiro verificar se o curso já existe
DO $$
DECLARE
    curso_existe BOOLEAN;
    curso_id_var UUID;
    modulo_id_var UUID;
BEGIN
    -- Verificar se o curso já existe
    SELECT EXISTS(SELECT 1 FROM public.cursos WHERE nome = 'Escola de Líderes DNA') INTO curso_existe;
    
    IF NOT curso_existe THEN
        -- Inserir curso "Escola de Líderes DNA"
        INSERT INTO public.cursos (nome, descricao, categoria, nivel, carga_horaria, emite_certificado, ativo)
        VALUES (
            'Escola de Líderes DNA',
            'Formação cristã para desenvolvimento de líderes comprometidos com o Reino de Deus. Contém 14 aulas com conteúdo bíblico, vídeos, tarefas e avaliação final.',
            'Formação Ministerial',
            'intermediario',
            28,
            true,
            true
        ) RETURNING id INTO curso_id_var;
        
        -- Inserir módulo principal
        INSERT INTO public.modulos_curso (curso_id, nome, descricao, ordem, duracao_estimada)
        VALUES (
            curso_id_var,
            'Formação de Líderes',
            'Módulo principal com 14 lições sobre liderança cristã',
            1,
            28
        ) RETURNING id INTO modulo_id_var;
        
        -- Inserir as 14 lições
        INSERT INTO public.licoes_modulo (modulo_id, titulo, tipo, ordem, conteudo, duracao_estimada, pontos, tarefas) VALUES
        (modulo_id_var, 'Preparação para um Encontro com Deus', 'teoria', 1, '{"objetivo": "Entender a importância da preparação espiritual", "versiculo_chave": "1 Pedro 3:15", "topicos": ["Importância da preparação", "Vida de oração", "Santificação", "Disponibilidade para Deus"]}', 120, 10, '[{"pergunta": "Como você se prepara espiritualmente para servir a Deus?", "tipo": "texto"}]'),
        (modulo_id_var, 'A Igreja em Células', 'teoria', 2, '{"objetivo": "Compreender o modelo celular e sua importância", "versiculo_chave": "Atos 2:46-47", "topicos": ["Modelo bíblico", "Comunhão", "Multiplicação", "Cuidado mútuo"]}', 120, 10, '[{"pergunta": "Quais são os benefícios do modelo celular para a igreja?", "tipo": "texto"}]'),
        (modulo_id_var, 'A Reunião da Célula', 'teoria', 3, '{"objetivo": "Aprender a conduzir uma reunião de célula eficaz", "versiculo_chave": "1 Coríntios 14:26", "topicos": ["Estrutura da reunião", "Quebra-gelo", "Palavra", "Oração", "Visão"]}', 120, 10, '[{"pergunta": "Como você estruturaria uma reunião de célula?", "tipo": "texto"}]'),
        (modulo_id_var, 'O Perfil do Líder Cristão', 'teoria', 4, '{"objetivo": "Definir as características de um líder segundo Cristo", "versiculo_chave": "Marcos 10:43-44", "topicos": ["Servo-liderança", "Caráter cristão", "Exemplo de vida", "Autoridade espiritual"]}', 120, 10, '[{"pergunta": "Liste 3 qualidades essenciais de um líder cristão e explique cada uma.", "tipo": "texto"}]'),
        (modulo_id_var, 'Caráter e Santidade', 'teoria', 5, '{"objetivo": "Compreender a importância do caráter na liderança", "versiculo_chave": "1 Timóteo 4:12", "topicos": ["Integridade", "Santidade", "Transparência", "Exemplo de vida"]}', 120, 10, '[{"pergunta": "Como o caráter influencia a liderança cristã?", "tipo": "texto"}]'),
        (modulo_id_var, 'Chamado e Missão', 'teoria', 6, '{"objetivo": "Entender o chamado divino para liderança", "versiculo_chave": "Jeremias 1:5", "topicos": ["Chamado divino", "Propósito", "Missão", "Vocação"]}', 120, 10, '[{"pergunta": "Escreva seu testemunho de chamado para a liderança.", "tipo": "texto"}]'),
        (modulo_id_var, 'Autoridade Espiritual', 'teoria', 7, '{"objetivo": "Compreender a fonte da autoridade espiritual", "versiculo_chave": "Lucas 10:19", "topicos": ["Fonte da autoridade", "Submissão", "Delegação", "Responsabilidade"]}', 120, 10, '[{"pergunta": "Qual a diferença entre autoridade posicional e espiritual?", "tipo": "texto"}]'),
        (modulo_id_var, 'Relacionamento com Deus', 'teoria', 8, '{"objetivo": "Fortalecer a intimidade com Deus", "versiculo_chave": "João 15:5", "topicos": ["Vida devocional", "Oração", "Jejum", "Comunhão"]}', 120, 10, '[{"pergunta": "Como manter uma vida devocional consistente?", "tipo": "texto"}]'),
        (modulo_id_var, 'A Importância da Palavra e da Oração', 'teoria', 9, '{"objetivo": "Valorizar a Palavra e oração na liderança", "versiculo_chave": "2 Timóteo 3:16", "topicos": ["Estudo bíblico", "Meditação", "Intercersão", "Poder da oração"]}', 120, 10, '[{"pergunta": "Como a Palavra e a oração transformam um líder?", "tipo": "texto"}]'),
        (modulo_id_var, 'Discipulado e Multiplicação', 'teoria', 10, '{"objetivo": "Aprender princípios de discipulado", "versiculo_chave": "Mateus 28:19-20", "topicos": ["Grande comissão", "Mentoria", "Multiplicação", "Investimento na vida"]}', 120, 10, '[{"pergunta": "Qual sua estratégia para discipular outros líderes?", "tipo": "texto"}]'),
        (modulo_id_var, 'Cuidado com Pessoas', 'teoria', 11, '{"objetivo": "Desenvolver coração pastoral", "versiculo_chave": "João 10:11", "topicos": ["Coração pastoral", "Cuidado integral", "Aconselhamento", "Compaixão"]}', 120, 10, '[{"pergunta": "Como demonstrar cuidado pastoral às pessoas?", "tipo": "texto"}]'),
        (modulo_id_var, 'Ministério e Voluntariado', 'teoria', 12, '{"objetivo": "Entender o propósito do ministério", "versiculo_chave": "1 Pedro 4:10", "topicos": ["Dons espirituais", "Serviço", "Voluntariado", "Ministério"]}', 120, 10, '[{"pergunta": "Como identificar e desenvolver dons espirituais?", "tipo": "texto"}]'),
        (modulo_id_var, 'Comunicação Eficaz', 'teoria', 13, '{"objetivo": "Desenvolver habilidades de comunicação", "versiculo_chave": "Efésios 4:29", "topicos": ["Comunicação clara", "Oratória", "Escrita", "Relacionamento"]}', 120, 10, '[{"pergunta": "Quais são os elementos de uma comunicação eficaz?", "tipo": "texto"}]'),
        (modulo_id_var, 'Envio e Frutificação', 'teoria', 14, '{"objetivo": "Preparar para o envio ministerial", "versiculo_chave": "João 15:16", "topicos": ["Frutificação", "Multiplicação", "Envio", "Legado"]}', 120, 15, '[{"pergunta": "Compartilhe sua visão de multiplicação e frutificação ministerial.", "tipo": "texto"}]');
        
        RAISE NOTICE 'Curso Escola de Líderes DNA criado com sucesso!';
    ELSE
        RAISE NOTICE 'Curso Escola de Líderes DNA já existe.';
    END IF;
END $$;