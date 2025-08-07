import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, limit = 10 } = await req.json();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Buscando conteúdo para:', query);

    // Buscar em todas as tabelas relevantes do site
    const searchPromises = [
      // Conteúdo do site
      supabase
        .from('conteudo_site')
        .select('*')
        .or(`titulo.ilike.%${query}%, valor.ilike.%${query}%, descricao.ilike.%${query}%`),
      
      // Eventos
      supabase
        .from('eventos')
        .select('*')
        .or(`titulo.ilike.%${query}%, descricao.ilike.%${query}%, local.ilike.%${query}%`)
        .eq('publico', true),
      
      // Estudos bíblicos
      supabase
        .from('estudos_biblicos')
        .select('*')
        .or(`titulo.ilike.%${query}%, descricao.ilike.%${query}%, versiculo_chave.ilike.%${query}%`)
        .eq('ativo', true),
      
      // Cursos
      supabase
        .from('cursos_ensino')
        .select('*')
        .or(`nome.ilike.%${query}%, descricao.ilike.%${query}%`)
        .eq('ativo', true),
      
      // Células
      supabase
        .from('celulas')
        .select('nome, descricao, bairro, dia_semana, horario, lider')
        .or(`nome.ilike.%${query}%, descricao.ilike.%${query}%, bairro.ilike.%${query}%, lider.ilike.%${query}%`)
        .eq('ativa', true),
      
      // Galeria
      supabase
        .from('galeria_fotos')
        .select('*')
        .or(`titulo.ilike.%${query}%, descricao.ilike.%${query}%, categoria.ilike.%${query}%`),
      
      // Campanhas
      supabase
        .from('campanhas_arrecadacao')
        .select('*')
        .or(`titulo.ilike.%${query}%, descricao.ilike.%${query}%`)
        .eq('ativa', true),
      
      // Liderança
      supabase
        .from('lideranca')
        .select('*')
        .or(`nome.ilike.%${query}%, cargo.ilike.%${query}%, biografia.ilike.%${query}%`)
        .eq('ativo', true)
    ];

    const results = await Promise.all(searchPromises);
    
    const searchResults = {
      conteudo_site: results[0].data || [],
      eventos: results[1].data || [],
      estudos_biblicos: results[2].data || [],
      cursos: results[3].data || [],
      celulas: results[4].data || [],
      galeria: results[5].data || [],
      campanhas: results[6].data || [],
      lideranca: results[7].data || []
    };

    // Construir contexto estruturado
    const contexto = {
      query,
      resultados_encontrados: Object.values(searchResults).flat().length,
      conteudo: searchResults,
      resumo_areas: {
        conteudo_institucional: searchResults.conteudo_site.length,
        eventos_proximos: searchResults.eventos.length,
        materiais_estudo: searchResults.estudos_biblicos.length + searchResults.cursos.length,
        celulas_disponiveis: searchResults.celulas.length,
        campanhas_ativas: searchResults.campanhas.length,
        galeria_fotos: searchResults.galeria.length,
        lideranca: searchResults.lideranca.length
      }
    };

    return new Response(JSON.stringify({
      sucesso: true,
      contexto,
      total_resultados: contexto.resultados_encontrados
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na busca de conteúdo:', error);
    return new Response(JSON.stringify({ 
      sucesso: false,
      error: error.message,
      contexto: null
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});