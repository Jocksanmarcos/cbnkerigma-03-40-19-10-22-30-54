import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
  status: string;
  htmlLink: string;
}

interface WebhookPayload {
  resourceId: string;
  resourceState: string;
  resourceUri: string;
  channelId: string;
  channelToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Google Calendar webhook received:', req.method);

    if (req.method === 'POST') {
      const webhookData: WebhookPayload = await req.json();
      console.log('Webhook data:', webhookData);

      // Verificar se é uma mudança real
      if (webhookData.resourceState === 'sync') {
        console.log('Sincronização inicial - ignorando');
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      // Buscar eventos atualizados do Google Calendar
      await processCalendarChanges(supabase, webhookData);

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // GET request - verificação de webhook
    if (req.method === 'GET') {
      return new Response('Webhook endpoint is active', {
        status: 200,
        headers: corsHeaders,
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders,
    });

  } catch (error: any) {
    console.error('Error in Google Calendar webhook:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

async function processCalendarChanges(supabase: any, webhookData: WebhookPayload) {
  try {
    console.log('Processando mudanças do Google Calendar...');

    // Aqui você buscaria os eventos atualizados do Google Calendar
    // Por enquanto, vamos simular a sincronização
    
    const mockEvents: GoogleCalendarEvent[] = [
      {
        id: 'google_event_1',
        summary: 'Culto de Domingo',
        description: 'Culto dominical da igreja',
        start: { dateTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
        end: { dateTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString() },
        location: 'Igreja Principal',
        status: 'confirmed',
        htmlLink: 'https://calendar.google.com/calendar/event?eid=google_event_1'
      }
    ];

    // Sincronizar cada evento com a tabela agenda_eventos
    for (const googleEvent of mockEvents) {
      // Verificar se o evento já existe
      const { data: existingEvent } = await supabase
        .from('agenda_eventos')
        .select('id')
        .eq('link_google_calendar', googleEvent.htmlLink)
        .single();

      const eventData = {
        titulo: googleEvent.summary,
        descricao: googleEvent.description || '',
        data_inicio: googleEvent.start.dateTime || googleEvent.start.date,
        data_fim: googleEvent.end.dateTime || googleEvent.end.date,
        local: googleEvent.location || '',
        link_google_calendar: googleEvent.htmlLink,
        status: googleEvent.status === 'confirmed' ? 'confirmado' : 'agendado',
        publico: true,
        tipo: 'evento'
      };

      if (existingEvent) {
        // Atualizar evento existente
        const { error } = await supabase
          .from('agenda_eventos')
          .update(eventData)
          .eq('id', existingEvent.id);

        if (error) {
          console.error('Erro ao atualizar evento:', error);
        } else {
          console.log('Evento atualizado:', googleEvent.summary);
          
          // Enviar notificação de atualização
          await sendEventNotification(supabase, 'updated', existingEvent.id, googleEvent.summary);
        }
      } else {
        // Criar novo evento
        const { data: newEvent, error } = await supabase
          .from('agenda_eventos')
          .insert([eventData])
          .select()
          .single();

        if (error) {
          console.error('Erro ao criar evento:', error);
        } else {
          console.log('Novo evento criado:', googleEvent.summary);
          
          // Enviar notificação de novo evento
          await sendEventNotification(supabase, 'created', newEvent.id, googleEvent.summary);
        }
      }
    }

    console.log('Sincronização concluída com sucesso');
  } catch (error) {
    console.error('Erro ao processar mudanças do calendário:', error);
    throw error;
  }
}

async function sendEventNotification(supabase: any, type: string, eventId: string, eventTitle: string) {
  try {
    // Chamar a função de notificação de eventos
    const { error } = await supabase.functions.invoke('send-event-notification', {
      body: {
        eventId,
        eventTitle,
        notificationType: type,
        source: 'google_calendar'
      }
    });

    if (error) {
      console.error('Erro ao enviar notificação:', error);
    } else {
      console.log(`Notificação enviada para evento ${type}:`, eventTitle);
    }
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
  }
}

serve(handler);