import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
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
    const { 
      tema, 
      versiculo_base, 
      publico_alvo, 
      duracao_minutos = 45, 
      nivel_dificuldade = 'intermediario',
      contexto = {}
    } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    // Supabase client para salvar histórico
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const prompt = `Crie um estudo bíblico completo e detalhado sobre o tema: "${tema}".

ESPECIFICAÇÕES:
- Duração: ${duracao_minutos} minutos
- Público-alvo: ${publico_alvo || 'geral'}
- Nível: ${nivel_dificuldade}
- Igreja: ${contexto.igreja || 'evangélica'}
- Linha teológica: ${contexto.linha_teologica || 'evangélica reformada'}

O estudo deve incluir:
1. Título criativo e atrativo
2. Versículo(s) chave com referência completa
3. Introdução contextualizada (2-3 parágrafos)
4. Desenvolvimento em 3-4 seções principais
5. Aplicação prática específica para o público-alvo
6. Perguntas para reflexão e discussão
7. Sugestão de oração final
8. Recursos extras (livros, versículos adicionais)

IMPORTANTE: 
- Use linguagem apropriada para o nível especificado
- Inclua versículos bíblicos relevantes com referências
- Seja prático e aplicável à vida moderna
- Mantenha fidelidade às Escrituras

Formato de resposta em JSON rigorosamente seguindo esta estrutura:
{
  "titulo": "string",
  "tema": "string",
  "versiculo_chave": "string com referência completa",
  "introducao": "string de 2-3 parágrafos",
  "desenvolvimento": [
    {
      "subtitulo": "string",
      "conteudo": "string explicativo detalhado",
      "versiculos": ["referência1", "referência2"]
    }
  ],
  "aplicacao_pratica": "string com sugestões práticas",
  "perguntas_reflexao": ["pergunta1", "pergunta2", "pergunta3"],
  "oracao_final": "string com oração sugerida",
  "recursos_extras": ["sugestão1", "sugestão2"],
  "duracao_estimada": ${duracao_minutos},
  "publico_alvo": "${publico_alvo || 'geral'}",
  "nivel_dificuldade": "${nivel_dificuldade}"
}

${versiculo_base ? `VERSÍCULO BASE OBRIGATÓRIO: ${versiculo_base}` : ''}

Seja profundo, inspirador e biblicamente sólido. Use o máximo de versículos relevantes.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `Você é um pastor experiente, teólogo e educador cristão especializado em criar estudos bíblicos envolventes e biblicamente fundamentados. 

COMPETÊNCIAS:
- Conhecimento profundo das Escrituras em português
- Habilidade didática para diferentes públicos
- Experiência em liderança de células e grupos de estudo
- Compreensão da aplicação prática da Bíblia na vida moderna

INSTRUÇÕES:
- Responda SEMPRE em JSON válido e bem estruturado
- Use versículos da Bíblia em português (preferencialmente ACF ou NVI)
- Seja criativo mas mantenha-se fiel às Escrituras
- Adapte linguagem e profundidade ao público-alvo
- Inclua elementos interativos para engajar o grupo`
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 3000,
        temperature: 0.8,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      }),
    });

    if (!response.ok) {
      throw new Error(`Erro na API OpenAI: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('Resposta da IA:', aiResponse);

    let estudo;
    try {
      estudo = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      throw new Error('Resposta da IA não está em formato JSON válido');
    }

    // Salvar no histórico de estudos gerados (opcional, não falhar se der erro)
    try {
      await supabase
        .from('estudos_gerados_ia')
        .insert({
          tema,
          publico_alvo: publico_alvo || 'geral',
          nivel_dificuldade,
          duracao_minutos,
          conteudo_gerado: estudo,
          parametros_entrada: {
            tema,
            versiculo_base,
            publico_alvo,
            duracao_minutos,
            nivel_dificuldade,
            contexto
          }
        });
    } catch (saveError) {
      console.error('Erro ao salvar histórico:', saveError);
      // Não falhar a operação se não conseguir salvar o histórico
    }

    return new Response(JSON.stringify({ 
      estudo,
      metadata: {
        gerado_em: new Date().toISOString(),
        parametros: {
          tema,
          publico_alvo: publico_alvo || 'geral',
          duracao_minutos,
          nivel_dificuldade
        }
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro na função generate-biblical-study:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      fallback: generateFallbackStudy()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFallbackStudy() {
  return {
    titulo: "Estudo Bíblico: A Palavra de Deus",
    tema: "A importância da Palavra de Deus",
    versiculo_chave: "Lâmpada para os meus pés é tua palavra e luz, para o meu caminho. - Salmos 119:105",
    introducao: "A Palavra de Deus é fundamental para a vida cristã. Através dela conhecemos a vontade divina e encontramos direção para nossa caminhada. Neste estudo, exploraremos como a Bíblia pode transformar nossa vida diária.",
    desenvolvimento: [
      {
        subtitulo: "A Palavra como Guia",
        conteudo: "Assim como uma lâmpada ilumina nossos passos na escuridão, a Palavra de Deus nos orienta nas decisões da vida.",
        versiculos: ["Salmos 119:105", "2 Timóteo 3:16"]
      }
    ],
    aplicacao_pratica: "Reserve tempo diário para leitura bíblica e meditação. Aplique os ensinamentos em situações práticas do dia a dia.",
    perguntas_reflexao: [
      "Como a Palavra de Deus tem guiado suas decisões?",
      "Que versículo tem sido especial em sua vida?",
      "Como podemos aplicar melhor os ensinamentos bíblicos?"
    ],
    oracao_final: "Pai celestial, obrigado por sua Palavra que nos guia e ensina. Ajuda-nos a viver segundo seus preceitos. Amém.",
    recursos_extras: ["Leitura do Salmo 119", "Estudo sobre hermenêutica"],
    duracao_estimada: 45,
    publico_alvo: "geral",
    nivel_dificuldade: "intermediario"
  };
}