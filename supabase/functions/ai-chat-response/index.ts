import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, mensagem, userContext, conversationHistory, siteContext, usuario_nome, usuario_email } = await req.json();
    const inicioTempo = Date.now();
    const mensagemFinal = message || mensagem;

    if (!mensagemFinal || !mensagemFinal.trim()) {
      throw new Error('Mensagem é obrigatória');
    }

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY não configurada');
    }

    console.log('Processando mensagem do chatbot:', mensagemFinal.substring(0, 100) + '...');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar respostas automáticas primeiro
    const { data: respostasAutomaticas } = await supabase
      .from('chatbot_respostas_automaticas')
      .select('palavra_chave, resposta')
      .eq('ativo', true);

    // Verificar se alguma palavra-chave combina
    let respostaAutomatica = null;
    if (respostasAutomaticas) {
      for (const resposta of respostasAutomaticas) {
        if (mensagemFinal.toLowerCase().includes(resposta.palavra_chave.toLowerCase())) {
          respostaAutomatica = resposta.resposta;
          break;
        }
      }
    }

    if (respostaAutomatica) {
      const tempoResposta = Date.now() - inicioTempo;
      
      // Salvar conversa no banco
      await supabase
        .from('chatbot_conversas')
        .insert({
          usuario_nome: usuario_nome || 'Visitante',
          usuario_email: usuario_email || null,
          mensagem_usuario: mensagemFinal,
          resposta_ia: respostaAutomatica,
          tempo_resposta: tempoResposta,
          contexto: {
            tipo_resposta: 'automatica',
            timestamp: new Date().toISOString()
          }
        });

      console.log(`Resposta automática gerada em ${tempoResposta}ms`);

      return new Response(JSON.stringify({ 
        response: respostaAutomatica,
        resposta: respostaAutomatica,
        tempo_resposta: tempoResposta,
        tipo: 'automatica'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 2. Buscar base de conhecimento do treinamento
    const { data: baseConhecimento } = await supabase
      .from('chatbot_treinamentos')
      .select('conteudo_estruturado, palavras_chave, categoria')
      .eq('status', 'processado')
      .order('created_at', { ascending: false })
      .limit(10);

    let contextoConhecimento = '';
    if (baseConhecimento && baseConhecimento.length > 0) {
      contextoConhecimento = baseConhecimento
        .map(item => `${item.categoria}: ${item.conteudo_estruturado}`)
        .join('\n\n');
    }

    // Informações específicas do site CBN Kerigma
    const siteInformation = `
INFORMAÇÕES ESPECÍFICAS DO SITE CBN KERIGMA:

HORÁRIOS DOS CULTOS:
- Domingo: 19h00 - Culto da Família
- Quarta-feira: 19h30 - Culto de Oração  
- Sábado: 19h30 - Culto de Ensino

LOCALIZAÇÃO:
- Endereço: Bairro Aurora, São Luís - MA
- WhatsApp: (98) 98873-4670
- Email: contato@cbnkerigma.org.br
- Estacionamento próprio disponível

CÉLULAS:
- Grupos pequenos espalhados por toda São Luís
- Reuniões durante a semana
- Foco em estudo bíblico, oração, comunhão e evangelismo
- Para participar: contato via WhatsApp ou após cultos

BATISMO:
- Aulas preparatórias obrigatórias
- Batismo por imersão
- Cerimônias mensais especiais
- Acompanhamento pastoral completo

CONTRIBUIÇÕES:
- Durante cultos (dinheiro/cartão)
- Online pelo site
- PIX da igreja
- Base bíblica: Malaquias 3:10

MINISTÉRIOS DISPONÍVEIS:
- Jovens, Casais, Infantil, Música, Intercessão
- Células em diversos bairros
- Evangelismo e ação social

RECURSOS ESPECIAIS:
- Busca inteligente em todo conteúdo do site
- Acesso a informações atualizadas sobre eventos, cursos, células
- Galeria de fotos e campanhas ativas
- Informações sobre liderança e ministérios
`;

    console.log('Mensagem recebida:', mensagemFinal);
    console.log('Contexto do usuário:', userContext);
    
    // Buscar conteúdo relevante do site baseado na mensagem
    let siteContentContext = '';
    
    try {
      const { data: searchData, error: searchError } = await supabase.functions.invoke('search-site-content', {
        body: { query: mensagemFinal, limit: 5 }
      });
      
      if (!searchError && searchData?.sucesso) {
        const contexto = searchData.contexto;
        
        // Construir contexto baseado nos resultados encontrados
        if (contexto.resultados_encontrados > 0) {
          siteContentContext = `\n\nCONTEÚDO ENCONTRADO NO SITE (baseado na pergunta do usuário):\n`;
          
          if (contexto.conteudo.eventos.length > 0) {
            siteContentContext += `\nEVENTOS PRÓXIMOS:\n`;
            contexto.conteudo.eventos.slice(0, 3).forEach((evento: any) => {
              siteContentContext += `- ${evento.titulo}: ${evento.descricao || ''} (${evento.local}, ${new Date(evento.data_inicio).toLocaleDateString()})\n`;
            });
          }
          
          if (contexto.conteudo.estudos_biblicos.length > 0) {
            siteContentContext += `\nESTUDOS BÍBLICOS DISPONÍVEIS:\n`;
            contexto.conteudo.estudos_biblicos.slice(0, 3).forEach((estudo: any) => {
              siteContentContext += `- ${estudo.titulo}: ${estudo.descricao || ''}\n`;
            });
          }
          
          if (contexto.conteudo.cursos.length > 0) {
            siteContentContext += `\nCURSOS DISPONÍVEIS:\n`;
            contexto.conteudo.cursos.slice(0, 3).forEach((curso: any) => {
              siteContentContext += `- ${curso.nome}: ${curso.descricao || ''} (${curso.categoria})\n`;
            });
          }
          
          if (contexto.conteudo.celulas.length > 0) {
            siteContentContext += `\nCÉLULAS DISPONÍVEIS:\n`;
            contexto.conteudo.celulas.slice(0, 3).forEach((celula: any) => {
              siteContentContext += `- ${celula.nome}: ${celula.bairro}, ${celula.dia_semana} às ${celula.horario} (Líder: ${celula.lider})\n`;
            });
          }
          
          if (contexto.conteudo.campanhas.length > 0) {
            siteContentContext += `\nCAMPANHAS ATIVAS:\n`;
            contexto.conteudo.campanhas.slice(0, 2).forEach((campanha: any) => {
              siteContentContext += `- ${campanha.titulo}: ${campanha.descricao || ''}\n`;
            });
          }
          
          if (contexto.conteudo.lideranca.length > 0) {
            siteContentContext += `\nLIDERANÇA:\n`;
            contexto.conteudo.lideranca.slice(0, 3).forEach((lider: any) => {
              siteContentContext += `- ${lider.nome}: ${lider.cargo} - ${lider.biografia || ''}\n`;
            });
          }
          
          if (contexto.conteudo.conteudo_site.length > 0) {
            siteContentContext += `\nINFORMAÇÕES INSTITUCIONAIS:\n`;
            contexto.conteudo.conteudo_site.slice(0, 3).forEach((item: any) => {
              siteContentContext += `- ${item.titulo}: ${item.valor}\n`;
            });
          }
        }
      }
    } catch (searchError) {
      console.log('Erro na busca de conteúdo, continuando sem contexto específico:', searchError);
    }
    
    // Detectar se é pedido de estudo bíblico
    const isStudyRequest = mensagemFinal.toLowerCase().includes('estudo sobre') || 
                          mensagemFinal.toLowerCase().includes('estudo bíblico') ||
                          mensagemFinal.toLowerCase().includes('devocional sobre');

    // Se for pedido de estudo, usar a função especializada
    if (isStudyRequest) {
      const tema = extractStudyTopic(mensagemFinal);
      if (tema) {
        try {
          const { data: studyData, error: studyError } = await supabase.functions.invoke('generate-biblical-study', {
            body: {
              tema,
              publico_alvo: userContext?.visitCount > 1 ? 'membros' : 'visitantes',
              nivel_dificuldade: 'intermediario',
              duracao_minutos: 30,
              contexto: {
                igreja: 'CBN Kerigma',
                linha_teologica: 'evangélica pentecostal'
              }
            }
          });

          if (!studyError && studyData?.estudo) {
            const formattedStudy = formatStudyResponse(studyData.estudo);
            const tempoResposta = Date.now() - inicioTempo;
            
            // Salvar conversa no banco
            await supabase
              .from('chatbot_conversas')
              .insert({
                usuario_nome: usuario_nome || 'Visitante',
                usuario_email: usuario_email || null,
                mensagem_usuario: mensagemFinal,
                resposta_ia: formattedStudy,
                tempo_resposta: tempoResposta,
                contexto: {
                  tipo_resposta: 'estudo_biblico',
                  tema: tema,
                  timestamp: new Date().toISOString()
                }
              });
            
            return new Response(JSON.stringify({ 
              response: formattedStudy,
              resposta: formattedStudy,
              detectedInterests: ['estudos'],
              suggestedFollowUp: "Gostou do estudo? Posso criar outros sobre temas diferentes!",
              tempo_resposta: tempoResposta,
              tipo: 'estudo_biblico'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        } catch (studyError) {
          console.error('Erro ao gerar estudo:', studyError);
        }
      }
    }

    // Criar contexto personalizado baseado no usuário
    const contextualPrompt = `Você é um assistente virtual carinhoso e sábio da Igreja CBN Kerigma. 

CONTEXTO DO USUÁRIO:
- Número de visitas: ${userContext?.visitCount || 1}
- Interesses demonstrados: ${userContext?.interests?.join(', ') || 'Nenhum ainda'}
- Primeira vez?: ${userContext?.visitCount === 1 ? 'Sim' : 'Não'}

BASE DE CONHECIMENTO DA IGREJA:
${contextoConhecimento}

${siteInformation}

DIRETRIZES PARA RESPONDER QUALQUER ASSUNTO DO SITE:
1. SEMPRE busque primeiro informações específicas do conteúdo do site encontrado
2. Seja caloroso, empático e pastoral
3. Use emojis apropriados para criar conexão emocional
4. Faça perguntas inteligentes para identificar necessidades espirituais
5. Ofereça soluções práticas baseadas nas informações reais do site
6. Sempre direcione para ações concretas (cultos, células, estudos)
7. Demonstre interesse genuíno pela pessoa e sua jornada de fé
8. Use linguagem acessível mas sempre respeitosa
9. SEMPRE use as informações específicas do site quando relevante
10. Formate respostas de forma clara com marcadores e emojis
11. Seja um verdadeiro pastor virtual

PADRÃO DE RESPOSTA BASEADO NO CONTEÚDO DO SITE:
- Se encontrou eventos relacionados: mencione datas, locais e como participar
- Se encontrou estudos/cursos: destaque os mais relevantes e como se inscrever
- Se encontrou células: indique as mais próximas do usuário e horários
- Se encontrou campanhas: explique como participar ou contribuir
- Se encontrou liderança: apresente as pessoas certas para contato
- Se encontrou conteúdo institucional: use as informações oficiais

RECURSOS ESPECIAIS:
- Para estudos bíblicos: mencione que pode "gerar estudos personalizados com IA"
- Para dúvidas espirituais: ofereça versículos e orientação pastoral
- Para visitantes: seja extra acolhedor e explique os básicos
- Para membros: aprofunde relacionamento e identifique necessidades

EXEMPLO DE FORMATAÇÃO ENRIQUECIDA:
🙏 **[TÍTULO BASEADO NO ASSUNTO]**

💭 Resposta pastoral empática baseada no conteúdo específico encontrado...

📍 **INFORMAÇÕES ESPECÍFICAS DO SITE:**
• [Usar dados reais encontrados]
• [Datas, horários, locais específicos]
• [Contatos diretos quando relevante]

✨ **PRÓXIMOS PASSOS:**
• [Ações concretas baseadas no conteúdo]
• [Como se envolver]

❓ **[Pergunta personalizada para continuar a conversa]**

Responda à mensagem do usuário de forma natural, pastoral e informativa, SEMPRE priorizando o conteúdo específico encontrado no site.`;

    const messages = [
      { role: 'system', content: contextualPrompt },
      ...(conversationHistory || []).slice(-6), // Últimas 6 mensagens para contexto
      { role: 'user', content: mensagemFinal }
    ];

    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + geminiApiKey, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: contextualPrompt + siteContentContext + '\n\nHistórico da conversa:\n' + 
                      (conversationHistory || []).slice(-6).map((msg: any) => `${msg.role}: ${msg.content}`).join('\n') + 
                      '\n\nUsuário: ' + mensagemFinal
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API Gemini: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;
    const tempoResposta = Date.now() - inicioTempo;

    // Salvar conversa no banco
    await supabase
      .from('chatbot_conversas')
      .insert({
        usuario_nome: usuario_nome || 'Visitante',
        usuario_email: usuario_email || null,
        mensagem_usuario: mensagemFinal,
        resposta_ia: aiResponse,
        tempo_resposta: tempoResposta,
        contexto: {
          tipo_resposta: 'ia',
          timestamp: new Date().toISOString(),
          site_content_found: siteContentContext ? true : false
        }
      });

    // Analisar a resposta para extrair insights sobre o usuário
    const interests = [];
    if (aiResponse.includes('estudo') || mensagemFinal.includes('estudo')) interests.push('estudos');
    if (aiResponse.includes('dízimo') || mensagemFinal.includes('dízimo')) interests.push('contribuições');
    if (aiResponse.includes('célula') || mensagemFinal.includes('célula')) interests.push('células');
    if (aiResponse.includes('batismo') || mensagemFinal.includes('batismo')) interests.push('batismo');

    console.log(`Resposta da IA gerada em ${tempoResposta}ms`);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      resposta: aiResponse,
      detectedInterests: interests,
      suggestedFollowUp: generateFollowUpSuggestion(userContext, mensagemFinal),
      tempo_resposta: tempoResposta,
      tipo: 'ia'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função ai-chat-response:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: generateFallbackResponse()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFollowUpSuggestion(userContext: any, message: string): string {
  if (!userContext || userContext?.visitCount === 1) {
    return "Gostaria de saber mais sobre nossos horários de culto ou como participar de uma célula?";
  }
  
  if (message.includes('oração')) {
    return "Posso criar um estudo bíblico personalizado sobre oração para você!";
  }
  
  if (message.includes('estudo')) {
    return "Que tema específico você gostaria de estudar? Posso gerar um estudo completo!";
  }
  
  return "Como posso te ajudar ainda mais em sua jornada de fé?";
}

function generateFallbackResponse(): string {
  return `🙏 **ASSISTENTE CBN KERIGMA**

😊 Obrigado por sua mensagem! Estou aqui para te ajudar com:

📍 **INFORMAÇÕES PRÁTICAS:**
• Horários dos cultos (Dom, Qua, Sáb)
• Localização e contato
• Como participar de células
• Informações sobre batismo
• Dízimos e ofertas

✨ **RECURSOS ESPECIAIS:**
• Estudos bíblicos personalizados com IA
• Devocionais diários
• Orientação pastoral

📱 **CONTATO DIRETO:** (98) 98873-4670

Como posso te ajudar em sua jornada de fé hoje?`;
}

function extractStudyTopic(message: string): string | null {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('estudo sobre ')) {
    const match = message.match(/estudo sobre (.+)/i);
    return match ? match[1].trim() : null;
  }
  
  if (lowerMessage.includes('devocional sobre ')) {
    const match = message.match(/devocional sobre (.+)/i);
    return match ? match[1].trim() : null;
  }
  
  // Detectar temas comuns
  const commonTopics = {
    'fé': 'A importância da fé em nossa vida cristã',
    'amor': 'O amor de Deus e amor ao próximo',
    'oração': 'A vida de oração do cristão',
    'perdão': 'O perdão segundo a Bíblia',
    'esperança': 'A esperança que temos em Cristo',
    'gratidão': 'A gratidão como estilo de vida cristão',
    'família': 'A família cristã segundo a Bíblia'
  };
  
  for (const [keyword, topic] of Object.entries(commonTopics)) {
    if (lowerMessage.includes(keyword)) {
      return topic;
    }
  }
  
  return null;
}

function formatStudyResponse(study: any): string {
  if (!study || !study.titulo) return "Erro ao gerar estudo. Tente novamente.";
  
  let response = `📖 **ESTUDO BÍBLICO PERSONALIZADO**\n\n`;
  response += `🎯 **${study.titulo}**\n\n`;
  
  if (study.versiculo_chave) {
    response += `📜 **Versículo Chave:** ${study.versiculo_chave}\n\n`;
  }
  
  if (study.introducao) {
    response += `💭 **Introdução:**\n${study.introducao}\n\n`;
  }
  
  if (study.desenvolvimento && Array.isArray(study.desenvolvimento)) {
    response += `📚 **Desenvolvimento:**\n\n`;
    study.desenvolvimento.forEach((item: any, index: number) => {
      response += `**${index + 1}. ${item.subtitulo}**\n`;
      response += `${item.conteudo}\n\n`;
      if (item.versiculos && item.versiculos.length > 0) {
        response += `📖 *Versículos:* ${item.versiculos.join(', ')}\n\n`;
      }
    });
  }
  
  if (study.aplicacao_pratica) {
    response += `✨ **Aplicação Prática:**\n${study.aplicacao_pratica}\n\n`;
  }
  
  if (study.perguntas_reflexao && Array.isArray(study.perguntas_reflexao)) {
    response += `❓ **Para Reflexão:**\n`;
    study.perguntas_reflexao.forEach((pergunta: string, index: number) => {
      response += `${index + 1}. ${pergunta}\n`;
    });
    response += '\n';
  }
  
  response += `🙏 **Que Deus abençoe seu tempo de estudo!**\n\n`;
  response += `💡 *Posso criar outros estudos sobre temas diferentes. Basta pedir!*`;
  
  return response;
}