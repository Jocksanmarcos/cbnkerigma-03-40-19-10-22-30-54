import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, tema, nivel, duracao, detalhes } = await req.json();
    
    console.log('Gerando conteúdo de ensino:', { type, tema, nivel, duracao });

    let prompt = '';
    
    switch (type) {
      case 'estudo_biblico':
        prompt = `Crie um estudo bíblico completo sobre "${tema}" para nível ${nivel}.
        
        Estruture o conteúdo em formato JSON com:
        - titulo: string
        - versiculo_chave: string (referência bíblica)
        - introducao: string
        - desenvolvimento: array de objetos com { subtitulo: string, conteudo: string, versiculos: array }
        - aplicacao_pratica: string
        - perguntas_reflexao: array de strings
        - oracao_final: string
        
        Duração estimada: ${duracao} minutos.
        ${detalhes ? `Detalhes adicionais: ${detalhes}` : ''}
        
        Retorne apenas o JSON válido.`;
        break;
        
      case 'questoes_avaliacao':
        prompt = `Crie ${duracao || 10} questões de avaliação sobre "${tema}" para nível ${nivel}.
        
        Estruture em formato JSON com:
        - questoes: array de objetos com {
            pergunta: string,
            tipo: "multipla_escolha" | "dissertativa" | "verdadeiro_falso",
            opcoes?: array de strings (se múltipla escolha),
            resposta_correta: string,
            explicacao: string,
            versiculo_referencia?: string
          }
        
        ${detalhes ? `Foco específico: ${detalhes}` : ''}
        
        Retorne apenas o JSON válido.`;
        break;
        
      case 'trilha_formacao':
        prompt = `Crie uma trilha de formação sobre "${tema}" para nível ${nivel}.
        
        Estruture em formato JSON com:
        - nome: string
        - descricao: string
        - duracao_total: string
        - etapas: array de objetos com {
            ordem: number,
            titulo: string,
            descricao: string,
            objetivos: array de strings,
            recursos: array de strings,
            duracao_estimada: string,
            pre_requisitos?: array de strings
          }
        - certificacao: { disponivel: boolean, criterios: array de strings }
        
        ${detalhes ? `Considerações especiais: ${detalhes}` : ''}
        
        Retorne apenas o JSON válido.`;
        break;
        
      case 'resumo_aula':
        prompt = `Crie um resumo estruturado da aula sobre "${tema}".
        
        Estruture em formato JSON com:
        - titulo: string
        - pontos_principais: array de strings
        - versiculos_chave: array de strings
        - aplicacoes_praticas: array de strings
        - proximos_passos: array de strings
        - materiais_apoio: array de strings
        
        ${detalhes ? `Conteúdo da aula: ${detalhes}` : ''}
        
        Retorne apenas o JSON válido.`;
        break;
        
      default:
        throw new Error('Tipo de conteúdo não suportado');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Você é um especialista em educação cristã e ensino bíblico. Crie conteúdos educacionais de alta qualidade, sempre baseados na Bíblia, com linguagem clara e aplicações práticas. Retorne sempre JSON válido.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('Falha na comunicação com OpenAI');
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    console.log('Conteúdo gerado com sucesso:', generatedContent.substring(0, 200) + '...');

    // Tenta fazer parse do JSON retornado
    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      // Se não conseguir fazer parse, retorna o conteúdo bruto
      parsedContent = { conteudo_bruto: generatedContent };
    }

    return new Response(JSON.stringify({ 
      success: true,
      content: parsedContent,
      tipo: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na geração de conteúdo:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});