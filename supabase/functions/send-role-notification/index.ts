import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationRequest {
  notification: {
    title: string;
    body: string;
    data?: Record<string, any>;
    role_target?: string[];
    tipo: string;
    priority: 'high' | 'normal' | 'low';
  };
  sender_id: string;
  sender_role: string;
}

interface PushToken {
  user_id: string;
  token: string;
  platform: string;
  role: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { notification, sender_id, sender_role }: NotificationRequest = await req.json();

    console.log('Processando notificação:', {
      tipo: notification.tipo,
      title: notification.title,
      sender_role,
      role_target: notification.role_target
    });

    // Validar se o remetente tem permissão para enviar notificações
    if (!isAuthorizedToSend(sender_role)) {
      throw new Error('Usuário não autorizado a enviar notificações');
    }

    // Buscar tokens de usuários que devem receber a notificação
    let query = supabaseClient
      .from('user_push_tokens')
      .select('*');

    // Filtrar por papel se especificado
    if (notification.role_target && notification.role_target.length > 0) {
      query = query.in('role', notification.role_target);
    }

    const { data: tokens, error: tokensError } = await query;

    if (tokensError) {
      throw tokensError;
    }

    console.log(`Encontrados ${tokens?.length || 0} tokens para envio`);

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Nenhum destinatário encontrado para os critérios especificados',
          sent_count: 0 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    // Preparar payload da notificação
    const pushPayload = {
      title: notification.title,
      body: notification.body,
      data: {
        ...notification.data,
        tipo: notification.tipo,
        sender_id,
        timestamp: new Date().toISOString(),
        role_target: notification.role_target
      }
    };

    // Enviar notificações (aqui você integraria com um serviço real como FCM)
    const results = await Promise.allSettled(
      tokens.map(async (tokenData: PushToken) => {
        try {
          // Simular envio de notificação push
          console.log(`Enviando para ${tokenData.platform} - Token: ${tokenData.token.substring(0, 10)}...`);
          
          // Aqui você faria a integração real com Firebase Cloud Messaging
          // ou Apple Push Notification Service
          await sendPushNotification(tokenData, pushPayload);
          
          return { success: true, token: tokenData.token };
        } catch (error) {
          console.error(`Erro ao enviar para token ${tokenData.token}:`, error);
          return { success: false, token: tokenData.token, error: error.message };
        }
      })
    );

    // Contar sucessos e falhas
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
    const failed = results.length - successful;

    // Registrar notificação no histórico
    await supabaseClient
      .from('notification_history')
      .insert({
        sender_id,
        title: notification.title,
        body: notification.body,
        tipo: notification.tipo,
        role_target: notification.role_target,
        recipients_count: tokens.length,
        sent_count: successful,
        failed_count: failed,
        created_at: new Date().toISOString()
      });

    console.log(`Notificação processada: ${successful} enviadas, ${failed} falharam`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notificação enviada para ${successful} usuários`,
        sent_count: successful,
        failed_count: failed
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Erro ao processar notificação:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});

// Verificar se o usuário tem permissão para enviar notificações
function isAuthorizedToSend(role: string): boolean {
  const authorizedRoles = [
    'administrador_geral',
    'coordenador_ensino', 
    'supervisor_regional',
    'secretario',
    'comunicacao'
  ];
  
  return authorizedRoles.includes(role);
}

// Simular envio de notificação push (substitua pela integração real)
async function sendPushNotification(tokenData: PushToken, payload: any): Promise<void> {
  // Aqui você implementaria a integração real com:
  // - Firebase Cloud Messaging (FCM) para Android
  // - Apple Push Notification Service (APNs) para iOS
  
  console.log(`Simulando envio para ${tokenData.platform}:`, {
    token: tokenData.token.substring(0, 20) + '...',
    title: payload.title,
    body: payload.body
  });

  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Simular falha ocasional (5% das vezes)
  if (Math.random() < 0.05) {
    throw new Error('Falha simulada no envio');
  }
}