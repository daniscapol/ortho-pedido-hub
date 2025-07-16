import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  name: string;
  email: string;
  temporaryPassword: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, temporaryPassword }: WelcomeEmailRequest = await req.json();

    console.log(`Sending welcome email to: ${email} for user: ${name}`);

    const emailResponse = await resend.emails.send({
      from: "SB Prótese <noreply@sbprotese.com>",
      to: [email],
      subject: "Bem-vindo ao Sistema SB Prótese - Sua conta foi criada!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bem-vindo ao SB Prótese</title>
          <style>
            body { margin: 0; padding: 0; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 16px; }
            .content { padding: 40px 30px; }
            .welcome-box { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .credentials-box { background: #fefce8; border: 1px solid #facc15; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .credentials-box h3 { margin-top: 0; color: #854d0e; }
            .credential-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #fbbf24; }
            .credential-label { font-weight: bold; color: #854d0e; }
            .credential-value { font-family: monospace; background: white; padding: 4px 8px; border-radius: 4px; border: 1px solid #d97706; }
            .login-button { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .login-button:hover { background: #1d4ed8; }
            .security-notice { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 15px; margin: 20px 0; color: #991b1b; }
            .footer { background: #f8fafc; padding: 20px 30px; text-align: center; color: #64748b; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🦷 SB Prótese</h1>
              <p>Sistema de Gestão de Próteses Dentárias</p>
            </div>
            
            <div class="content">
              <div class="welcome-box">
                <h2 style="margin-top: 0; color: #1e40af;">Olá, ${name}! 👋</h2>
                <p style="margin-bottom: 0;">Sua conta no Sistema SB Prótese foi criada com sucesso! Você agora tem acesso completo à nossa plataforma para gerenciar seus pedidos de próteses dentárias.</p>
              </div>

              <div class="credentials-box">
                <h3>🔑 Suas Credenciais de Acesso</h3>
                <div class="credential-item">
                  <span class="credential-label">Email:</span>
                  <span class="credential-value">${email}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Senha Temporária:</span>
                  <span class="credential-value">${temporaryPassword}</span>
                </div>
              </div>

              <div style="text-align: center;">
                <a href="${Deno.env.get('SUPABASE_URL') || 'https://22baa630-0ae0-424e-9c60-e79c86da4254.lovableproject.com'}" class="login-button">
                  🚀 Acessar Sistema
                </a>
              </div>

              <div class="security-notice">
                <h4 style="margin-top: 0;">🔒 Importante - Segurança</h4>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Esta é uma senha temporária. <strong>Altere-a no primeiro acesso</strong></li>
                  <li>Nunca compartilhe suas credenciais com terceiros</li>
                  <li>Caso tenha problemas, entre em contato com o administrador</li>
                </ul>
              </div>

              <h3>✨ O que você pode fazer no sistema:</h3>
              <ul>
                <li>📋 Criar e gerenciar pedidos de próteses</li>
                <li>👥 Gerenciar informações dos pacientes</li>
                <li>📊 Acompanhar o status dos seus pedidos</li>
                <li>🔔 Receber notificações em tempo real</li>
                <li>💬 Chat de suporte direto</li>
              </ul>

              <p>Se você tiver alguma dúvida ou precisar de ajuda, nossa equipe está sempre disponível para auxiliá-lo.</p>
            </div>

            <div class="footer">
              <p><strong>SB Prótese</strong> - Sistema de Gestão de Próteses Dentárias</p>
              <p>Este email foi gerado automaticamente. Não responda a este email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email de boas-vindas enviado com sucesso",
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);