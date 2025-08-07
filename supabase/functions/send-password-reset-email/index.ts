import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.53.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    
    console.log('Enviando email de reset de senha para:', email);

    // Verificar se o usuário existe na tabela pessoas (opcional)
    const { data: pessoa, error: pessoaError } = await supabase
      .from('pessoas')
      .select('nome_completo, id')
      .eq('email', email)
      .maybeSingle();
    
    if (pessoaError) {
      console.error('Erro ao buscar pessoa:', pessoaError);
      // Continua mesmo se não encontrar na tabela pessoas
    }

    const nomeUsuario = pessoa?.nome_completo || email.split('@')[0];

    // Detectar ambiente e configurar URL correta dinamicamente
    const siteUrl = (() => {
      const reqUrl = req.headers.get('origin') || req.headers.get('referer');
      if (reqUrl) {
        // Usar a URL de origem da requisição
        const url = new URL(reqUrl);
        return url.origin;
      }
      // Fallback para ambiente local ou produção
      return Deno.env.get('SUPABASE_URL')?.includes('localhost') ? 
        'http://localhost:5173' : 
        'https://1affac2e-d500-4495-904e-b5526f0a2a6f.lovableproject.com';
    })();
    
    const resetUrl = `${siteUrl}/reset`;
    console.log('URL de reset configurada dinamicamente:', resetUrl);
    console.log('Origin da requisição:', req.headers.get('origin'));
    
    const { data: resetData, error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: resetUrl
    });

    if (resetError) {
      console.error('Erro ao gerar link de reset:', resetError);
      
      // Se for erro de rate limit, informa mas ainda envia o email de notificação
      if (resetError.message.includes('rate_limit') || resetError.status === 429) {
        console.log('Rate limit detectado, mas continuando com notificação por email...');
      } else {
        throw new Error('Erro ao gerar link de reset de senha');
      }
    }

    // Template do email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Redefinir Senha - CBN Kerigma</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196f3; }
            .button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
            .warning { background: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🔑 Redefinir Senha</h1>
            <p>Igreja Batista Nacional Kerigma</p>
          </div>
          
          <div class="content">
            <h2>Olá, ${nomeUsuario}!</h2>
            
            <p>Recebemos uma solicitação para redefinir a senha da sua conta no Portal do Aluno da CBN Kerigma.</p>
            
            <div class="highlight">
              <h3>🚀 Como Redefinir sua Senha</h3>
              <ol>
                <li>Clique no botão abaixo para acessar a página de redefinição</li>
                <li>Digite sua nova senha</li>
                <li>Confirme a nova senha</li>
                <li>Acesse o portal com suas novas credenciais</li>
              </ol>
            </div>

            <div class="highlight">
              <p><strong>Solicitação de redefinição processada!</strong></p>
              ${resetError ? 
                '<p><strong>Aguarde alguns minutos antes de solicitar novamente.</strong> Por segurança, limitamos o número de solicitações por email.</p>' : 
                '<p>Verifique sua caixa de entrada para encontrar o link de redefinição de senha oficial do Supabase.</p>'
              }
              <p><strong>URL de redirecionamento:</strong> ${resetUrl}</p>
              <p><small>Se você clicar no link e for direcionado para uma página "Não encontrado", aguarde alguns segundos - o sistema irá redirecioná-lo automaticamente para a página correta de redefinição de senha.</small></p>
            </div>

            <div class="warning">
              <h3>⚠️ Importante</h3>
              <ul>
                <li><strong>Este link expira em 1 hora</strong> por motivos de segurança</li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Escolha uma senha forte com pelo menos 8 caracteres</li>
              </ul>
            </div>

            <p>Após redefinir sua senha, você poderá acessar normalmente o Portal do Aluno e continuar seus estudos.</p>

            <p>Se tiver dificuldades, entre em contato conosco através dos canais oficiais da igreja.</p>
            
            <p><strong>Equipe de Tecnologia<br>Igreja Batista Nacional Kerigma</strong></p>
          </div>

          <div class="footer">
            <p>Este é um email automático do Portal do Aluno da CBN Kerigma.</p>
            <p>Se você não solicitou a redefinição de senha, ignore este email.</p>
          </div>
        </body>
      </html>
    `;

    // Enviar email
    const emailResponse = await resend.emails.send({
      from: "CBN Kerigma <onboarding@resend.dev>",
      to: [email],
      subject: "🔑 Redefinir Senha - Portal do Aluno CBN Kerigma",
      html: emailHtml,
    });

    console.log("Email de reset enviado com sucesso:", emailResponse);

    // Registrar no histórico se a pessoa existir
    if (pessoa) {
      const { data: pessoaId } = await supabase.from('pessoas').select('id').eq('email', email).maybeSingle();
      if (pessoaId) {
        await supabase
          .from('historico_pessoas')
          .insert({
            pessoa_id: pessoaId.id,
            tipo_evento: 'email_reset_senha',
            descricao: 'Email de redefinição de senha enviado',
            valor_novo: emailResponse.id || 'enviado'
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.id,
        message: 'Email de redefinição de senha enviado com sucesso'
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Erro ao enviar email de reset:", error);
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