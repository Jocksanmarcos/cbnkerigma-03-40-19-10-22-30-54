import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  phone: string;
  message: string;
  template?: string;
  variables?: Record<string, string>;
  type: 'text' | 'template' | 'media';
  priority?: 'high' | 'normal' | 'low';
}

interface WhatsAppBulkMessage {
  recipients: string[];
  message: string;
  template?: string;
  variables?: Record<string, string>[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('WhatsApp Integration - Processing request:', req.method);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get WhatsApp API credentials
    const whatsappToken = Deno.env.get('WHATSAPP_API_TOKEN');
    const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
    
    if (!whatsappToken || !whatsappPhoneId) {
      console.error('WhatsApp API credentials not configured');
      return new Response(
        JSON.stringify({ 
          error: 'WhatsApp API não configurado. Configure WHATSAPP_API_TOKEN e WHATSAPP_PHONE_NUMBER_ID.' 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    if (req.method === 'POST') {
      const body = await req.json();
      
      switch (action) {
        case 'send-message': {
          const messageData: WhatsAppMessage = body;
          console.log('Sending WhatsApp message to:', messageData.phone);
          
          // Format phone number (remove special characters and add country code if needed)
          const formattedPhone = formatPhoneNumber(messageData.phone);
          
          // Send message via WhatsApp Business API
          const result = await sendWhatsAppMessage(
            whatsappToken,
            whatsappPhoneId,
            formattedPhone,
            messageData.message,
            messageData.type || 'text'
          );

          // Log message in database
          await supabase.from('whatsapp_messages').insert({
            phone: formattedPhone,
            message: messageData.message,
            type: messageData.type || 'text',
            status: result.success ? 'sent' : 'failed',
            external_id: result.messageId,
            error_message: result.error,
            priority: messageData.priority || 'normal'
          });

          return new Response(
            JSON.stringify({ 
              success: result.success, 
              messageId: result.messageId,
              error: result.error 
            }),
            { 
              status: result.success ? 200 : 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        case 'send-bulk': {
          const bulkData: WhatsAppBulkMessage = body;
          console.log('Sending bulk WhatsApp messages to:', bulkData.recipients.length, 'recipients');
          
          const results = [];
          
          for (let i = 0; i < bulkData.recipients.length; i++) {
            const phone = formatPhoneNumber(bulkData.recipients[i]);
            const variables = bulkData.variables?.[i] || {};
            const message = replacePlaceholders(bulkData.message, variables);
            
            try {
              const result = await sendWhatsAppMessage(
                whatsappToken,
                whatsappPhoneId,
                phone,
                message,
                'text'
              );

              results.push({
                phone,
                success: result.success,
                messageId: result.messageId,
                error: result.error
              });

              // Log in database
              await supabase.from('whatsapp_messages').insert({
                phone,
                message,
                type: 'text',
                status: result.success ? 'sent' : 'failed',
                external_id: result.messageId,
                error_message: result.error,
                priority: 'normal',
                campaign_id: body.campaignId || null
              });

              // Rate limiting - wait 1 second between messages to avoid being blocked
              if (i < bulkData.recipients.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            } catch (error) {
              console.error('Error sending to', phone, ':', error);
              results.push({
                phone,
                success: false,
                error: error.message
              });
            }
          }

          const successCount = results.filter(r => r.success).length;
          console.log(`Bulk message completed: ${successCount}/${bulkData.recipients.length} sent successfully`);

          return new Response(
            JSON.stringify({ 
              results,
              summary: {
                total: bulkData.recipients.length,
                successful: successCount,
                failed: bulkData.recipients.length - successCount
              }
            }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        case 'send-template': {
          const templateData = body;
          console.log('Sending WhatsApp template:', templateData.templateName);
          
          const result = await sendWhatsAppTemplate(
            whatsappToken,
            whatsappPhoneId,
            formatPhoneNumber(templateData.phone),
            templateData.templateName,
            templateData.language || 'pt_BR',
            templateData.components || []
          );

          // Log template message
          await supabase.from('whatsapp_messages').insert({
            phone: formatPhoneNumber(templateData.phone),
            message: `Template: ${templateData.templateName}`,
            type: 'template',
            status: result.success ? 'sent' : 'failed',
            external_id: result.messageId,
            error_message: result.error,
            priority: 'normal'
          });

          return new Response(
            JSON.stringify(result),
            { 
              status: result.success ? 200 : 400, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        default:
          return new Response(
            JSON.stringify({ error: 'Ação não encontrada' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
      }
    }

    if (req.method === 'GET') {
      switch (action) {
        case 'status': {
          // Check WhatsApp API status
          const status = await checkWhatsAppStatus(whatsappToken, whatsappPhoneId);
          
          return new Response(
            JSON.stringify(status),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        case 'templates': {
          // Get available templates
          const templates = await getWhatsAppTemplates(whatsappToken);
          
          return new Response(
            JSON.stringify(templates),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }

        default:
          return new Response(
            JSON.stringify({ error: 'Endpoint não encontrado' }),
            { 
              status: 404, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
      }
    }

    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('WhatsApp Integration Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper functions
function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const numeric = phone.replace(/\D/g, '');
  
  // Add Brazil country code if not present
  if (numeric.length === 11 && numeric.startsWith('11')) {
    return `55${numeric}`;
  } else if (numeric.length === 10) {
    return `5511${numeric}`;
  } else if (numeric.length === 13 && numeric.startsWith('55')) {
    return numeric;
  }
  
  return numeric;
}

function replacePlaceholders(message: string, variables: Record<string, string>): string {
  let result = message;
  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
  });
  return result;
}

async function sendWhatsAppMessage(
  token: string, 
  phoneNumberId: string, 
  to: string, 
  message: string, 
  type: string
): Promise<{success: boolean, messageId?: string, error?: string}> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'text',
          text: {
            body: message
          }
        })
      }
    );

    const data = await response.json();
    
    if (response.ok && data.messages?.[0]?.id) {
      return {
        success: true,
        messageId: data.messages[0].id
      };
    } else {
      console.error('WhatsApp API Error:', data);
      return {
        success: false,
        error: data.error?.message || 'Erro desconhecido'
      };
    }
  } catch (error) {
    console.error('Network error sending WhatsApp message:', error);
    return {
      success: false,
      error: `Erro de rede: ${error.message}`
    };
  }
}

async function sendWhatsAppTemplate(
  token: string,
  phoneNumberId: string,
  to: string,
  templateName: string,
  language: string,
  components: any[]
): Promise<{success: boolean, messageId?: string, error?: string}> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: to,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: language
            },
            components: components
          }
        })
      }
    );

    const data = await response.json();
    
    if (response.ok && data.messages?.[0]?.id) {
      return {
        success: true,
        messageId: data.messages[0].id
      };
    } else {
      return {
        success: false,
        error: data.error?.message || 'Erro ao enviar template'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: `Erro de rede: ${error.message}`
    };
  }
}

async function checkWhatsAppStatus(token: string, phoneNumberId: string): Promise<any> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${phoneNumberId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return await response.json();
  } catch (error) {
    return { error: error.message, status: 'offline' };
  }
}

async function getWhatsAppTemplates(token: string): Promise<any> {
  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/message_templates`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    return await response.json();
  } catch (error) {
    return { error: error.message, templates: [] };
  }
}