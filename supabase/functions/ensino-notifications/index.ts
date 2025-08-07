import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, recipients } = await req.json();
    
    console.log('Enviando notificação de ensino:', { type, recipients: recipients?.length });

    let notificationContent = {};
    
    switch (type) {
      case 'nova_matricula':
        notificationContent = {
          titulo: `Nova Matrícula: ${data.curso_nome}`,
          mensagem: `${data.aluno_nome} se matriculou na turma ${data.turma_nome}`,
          tipo: 'matricula',
          curso_id: data.curso_id,
          turma_id: data.turma_id,
          icon: '🎓'
        };
        break;
        
      case 'lembrete_aula':
        notificationContent = {
          titulo: `Aula em ${data.tempo_restante}`,
          mensagem: `${data.curso_nome} - ${data.turma_nome}`,
          tipo: 'lembrete',
          curso_id: data.curso_id,
          turma_id: data.turma_id,
          data_aula: data.data_aula,
          icon: '⏰'
        };
        break;
        
      case 'progresso_concluido':
        notificationContent = {
          titulo: `Parabéns! Módulo concluído`,
          mensagem: `Você concluiu o módulo "${data.modulo_nome}" do curso ${data.curso_nome}`,
          tipo: 'progresso',
          curso_id: data.curso_id,
          modulo_id: data.modulo_id,
          icon: '✅'
        };
        break;
        
      case 'certificado_disponivel':
        notificationContent = {
          titulo: `Certificado Disponível!`,
          mensagem: `Seu certificado do curso "${data.curso_nome}" está pronto para download`,
          tipo: 'certificado',
          curso_id: data.curso_id,
          certificado_url: data.certificado_url,
          icon: '🏆'
        };
        break;
        
      case 'nova_avaliacao':
        notificationContent = {
          titulo: `Nova Avaliação Disponível`,
          mensagem: `Avaliação do módulo "${data.modulo_nome}" - ${data.curso_nome}`,
          tipo: 'avaliacao',
          curso_id: data.curso_id,
          avaliacao_id: data.avaliacao_id,
          icon: '📝'
        };
        break;
        
      default:
        throw new Error('Tipo de notificação não suportado');
    }

    // Cria as notificações para cada destinatário
    const notifications = recipients.map((recipient: any) => ({
      ...notificationContent,
      usuario_id: recipient.usuario_id,
      pessoa_id: recipient.pessoa_id,
      lida: false,
      created_at: new Date().toISOString()
    }));

    // Insere as notificações na tabela
    const { data: insertedNotifications, error: insertError } = await supabase
      .from('notificacoes_ensino')
      .insert(notifications)
      .select();

    if (insertError) {
      console.error('Erro ao inserir notificações:', insertError);
      throw insertError;
    }

    console.log(`${notifications.length} notificações criadas com sucesso`);

    // Envia notificações em tempo real via Supabase Realtime
    for (const notification of insertedNotifications) {
      await supabase
        .channel(`user_${notification.usuario_id}`)
        .send({
          type: 'broadcast',
          event: 'nova_notificacao',
          payload: notification
        });
    }

    return new Response(JSON.stringify({ 
      success: true,
      notifications_sent: notifications.length,
      notifications: insertedNotifications
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro no sistema de notificações:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});