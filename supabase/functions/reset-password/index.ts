import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2';
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email }: ResetPasswordRequest = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email é obrigatório" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Inicializar Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verificar se o usuário existe na tabela profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, name, email')
      .eq('email', email)
      .single();
    
    if (profileError || !profile) {
      console.log(`Reset password attempted for non-existent email: ${email}`);
      // Por segurança, sempre retornamos sucesso mesmo se o email não existir
      return new Response(
        JSON.stringify({ 
          message: "Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha." 
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Gerar link de reset de senha usando o email
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://22baa630-0ae0-424e-9c60-e79c86da4254.lovableproject.com'}/reset-password`
      }
    });
    
    console.log('Generated reset link data:', resetData);

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      throw new Error("Erro ao gerar link de recuperação");
    }

    // Inicializar Resend
    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    const userName = profile.name || email.split('@')[0];

    // Enviar email de recuperação
    const emailResponse = await resend.emails.send({
      from: "SB Prótese <noreply@resend.dev>",
      to: [email],
      subject: "Redefinir sua senha - Sistema SB Prótese",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinir Senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #007bff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background-color: #007bff; color: white; width: 60px; height: 60px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin-bottom: 10px;">
                SB
              </div>
              <h1 style="margin: 0; color: #007bff;">Sistema SB Prótese</h1>
            </div>
            
            <h2 style="color: #333; margin-bottom: 20px;">Olá, ${userName}!</h2>
            
            <p style="margin-bottom: 20px;">
              Recebemos uma solicitação para redefinir a senha da sua conta no Sistema SB Prótese.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetData.properties?.action_link}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Redefinir Minha Senha
              </a>
            </div>
            
            <p style="margin-bottom: 15px;">
              Se você não conseguir clicar no botão acima, copie e cole o link abaixo no seu navegador:
            </p>
            
            <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 12px; margin-bottom: 20px;">
              ${resetData.properties?.action_link}
            </div>
            
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #666;">
              <p><strong>Importante:</strong></p>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Este link expira em 1 hora por motivos de segurança</li>
                <li>Se você não solicitou esta redefinição, ignore este email</li>
                <li>Nunca compartilhe este link com outras pessoas</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #888; font-size: 12px;">
              <p>Este é um email automático, não responda.</p>
              <p><strong>Sistema SB Prótese</strong> - Gestão de Próteses Dentárias</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Password reset email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        message: "Se o email estiver cadastrado, você receberá as instruções para redefinir sua senha.",
        success: true
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in reset-password function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno do servidor. Tente novamente mais tarde." 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);