import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

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

    // Usar o serviço de email nativo do Supabase
    const emailResponse = await supabase.auth.admin.inviteUserByEmail(email, {
      data: {
        name: name,
        temporary_password: temporaryPassword,
        welcome_email: true
      },
      redirectTo: `https://bbtiykafwqkusagnwvcu.supabase.co/auth/v1/verify?token=TOKEN&type=invite&redirect_to=${Deno.env.get('SUPABASE_URL') || 'https://22baa630-0ae0-424e-9c60-e79c86da4254.lovableproject.com'}`
    });

    console.log("Welcome email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email de boas-vindas enviado com sucesso",
      emailId: emailResponse.data?.user?.id 
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