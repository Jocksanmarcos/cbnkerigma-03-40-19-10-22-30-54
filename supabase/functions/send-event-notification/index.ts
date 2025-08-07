import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  evento_id: string;
  tipo: 'push' | 'email' | 'whatsapp';
  titulo: string;
  mensagem: string;
  destinatarios: {
    lideres: boolean;
    membros: boolean;
    visitantes: boolean;
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { evento_id, tipo, titulo, mensagem, destinatarios }: NotificationRequest = await req.json();

    // Simular envio de notificação
    console.log(`Enviando notificação ${tipo} para evento ${evento_id}`);
    console.log(`Título: ${titulo}`);
    console.log(`Mensagem: ${mensagem}`);
    console.log(`Destinatários:`, destinatarios);

    // Simular processo de envio
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response = {
      success: true,
      notification_id: `notif_${Date.now()}`,
      total_destinatarios: 150,
      total_entregues: 143,
      message: "Notificação enviada com sucesso!"
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);