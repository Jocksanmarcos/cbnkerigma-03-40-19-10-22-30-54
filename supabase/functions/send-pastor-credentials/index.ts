import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendCredentialsRequest {
  pastorId: string;
  email: string;
  nome: string;
  senha: string;
  nomeIgreja: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { pastorId, email, nome, senha, nomeIgreja }: SendCredentialsRequest = await req.json();

    console.log('Enviando credenciais para pastor:', { pastorId, email, nome });

    // Verificar se o pastor existe
    const { data: pastor, error: pastorError } = await supabase
      .from('pastores_missoes')
      .select('*')
      .eq('id', pastorId)
      .single();

    if (pastorError || !pastor) {
      console.error('Pastor não encontrado:', pastorError);
      return new Response(
        JSON.stringify({ error: 'Pastor não encontrado' }),
        {
          status: 404,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const loginUrl = `${Deno.env.get('SUPABASE_URL')?.replace('/supabase', '')}/pastor-login`;

    const emailResponse = await resend.emails.send({
      from: "CBN Kerigma <noreply@cbnkerigma.com>",
      to: [email],
      subject: "Suas credenciais de acesso - CBN Kerigma",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Credenciais de Acesso - CBN Kerigma</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">CBN Kerigma</h1>
            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Portal do Pastor</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333; margin-top: 0;">Olá, Pastor ${nome}!</h2>
            
            <p>Suas credenciais de acesso ao sistema administrativo da CBN Kerigma foram criadas com sucesso.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea;">Seus dados de acesso:</h3>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Senha temporária:</strong> <code style="background: #f0f0f0; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${senha}</code></p>
              <p><strong>Igreja/Missão:</strong> ${nomeIgreja}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Acessar Portal do Pastor
              </a>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #856404; margin-top: 0;">⚠️ Importante - Primeiro Acesso</h4>
              <p style="color: #856404; margin-bottom: 0;">
                <strong>Esta é uma senha temporária.</strong> No seu primeiro login, você será solicitado a criar uma nova senha de sua escolha. Por motivos de segurança, mantenha suas credenciais em local seguro.
              </p>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="color: #155724; margin-top: 0;">📋 O que você pode fazer no portal:</h4>
              <ul style="color: #155724; margin-bottom: 0;">
                <li>Gerenciar membros da sua missão</li>
                <li>Controlar células e liderança</li>
                <li>Acompanhar finanças da missão</li>
                <li>Gerar relatórios e estatísticas</li>
                <li>Gerenciar eventos e atividades</li>
              </ul>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 14px; text-align: center;">
              Problemas com o acesso? Entre em contato conosco<br>
              <strong>Email:</strong> suporte@cbnkerigma.com<br>
              <strong>WhatsApp:</strong> (11) 99999-9999
            </p>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 20px;">
              CBN Kerigma - Sistema de Gestão Eclesiástica<br>
              Este email foi enviado automaticamente, não responda.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email enviado com sucesso:", emailResponse);

    // Marcar que as credenciais foram enviadas
    await supabase
      .from('pastores_missoes')
      .update({ 
        credenciais_enviadas: true,
        credenciais_enviadas_em: new Date().toISOString()
      })
      .eq('id', pastorId);

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Credenciais enviadas com sucesso',
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Erro ao enviar credenciais:", error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro interno do servidor', 
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);