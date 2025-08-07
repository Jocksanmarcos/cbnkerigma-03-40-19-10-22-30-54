import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  to: string;
  message: string;
  templateName?: string;
  templateParams?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verificar se todas as variáveis de ambiente necessárias estão definidas
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioWhatsAppNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      throw new Error('Configurações do Twilio não encontradas. Verifique as variáveis de ambiente.');
    }

    const { to, message, templateName, templateParams }: WhatsAppMessage = await req.json();

    if (!to || !message) {
      throw new Error('Número de destino e mensagem são obrigatórios');
    }

    // Formatar o número para o padrão do WhatsApp
    const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
    const formattedFrom = twilioWhatsAppNumber.startsWith('whatsapp:') 
      ? twilioWhatsAppNumber 
      : `whatsapp:${twilioWhatsAppNumber}`;

    // Preparar o corpo da requisição para a API do Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    
    const body = new URLSearchParams({
      From: formattedFrom,
      To: formattedTo,
      Body: message,
    });

    // Se um template foi especificado, usar template do WhatsApp Business
    if (templateName) {
      body.set('ContentSid', templateName);
      if (templateParams && templateParams.length > 0) {
        body.set('ContentVariables', JSON.stringify(templateParams));
      }
    }

    // Fazer a requisição para a API do Twilio
    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Erro da API do Twilio:', responseData);
      throw new Error(`Erro ao enviar WhatsApp: ${responseData.message || 'Erro desconhecido'}`);
    }

    console.log('WhatsApp enviado com sucesso:', responseData.sid);

    return new Response(
      JSON.stringify({
        success: true,
        messageSid: responseData.sid,
        status: responseData.status,
        message: 'WhatsApp enviado com sucesso'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro ao enviar notificação por WhatsApp'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});