// Supabase Edge Function: admin-update-user-links
// Purpose: Allow admin master and admin matriz to update user profile data safely with service role, with proper authorization.
// CORS enabled and robust error messages.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });

    // AuthN: get current user from the JWT provided by the client
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "not_authenticated", message: "Usuário não autenticado." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // AuthZ: ensure the caller is admin_master
    const { data: callerProfile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role_extended")
      .eq("id", user.id)
      .single();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "profile_not_found", message: "Perfil do solicitante não encontrado." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!['admin_master', 'admin_matriz'].includes(callerProfile.role_extended)) {
      return new Response(
        JSON.stringify({ error: "forbidden", message: "Apenas Admin Master ou Admin Matriz podem executar esta ação." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { userId, updates } = await req.json().catch(() => ({}));
    
    console.log("Received request:", { userId, updates });

    if (!userId || !updates || typeof updates !== 'object') {
      return new Response(
        JSON.stringify({ error: "invalid_request", message: "Informe userId e um objeto updates com os campos a serem atualizados." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Allowed fields to update
    const allowedFields = ['name', 'nome_completo', 'email', 'role_extended', 'filial_id', 'clinica_id', 'telefone', 'documento', 'cro', 'cpf', 'endereco', 'cep', 'cidade', 'estado', 'numero', 'complemento'];
    const profileUpdates: Record<string, any> = {};
    
    // Filter only allowed fields
    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key)) {
        profileUpdates[key] = value;
      }
    }

    console.log("Filtered updates:", profileUpdates);

    if (Object.keys(profileUpdates).length === 0) {
      return new Response(
        JSON.stringify({ error: "invalid_request", message: "Nenhum campo válido para atualização foi fornecido." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Attempting to update user:", userId, "with data:", profileUpdates);

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update(profileUpdates)
      .eq("id", userId)
      .select("*")
      .single();

    console.log("Update result:", { updated, updateError });

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ error: "update_failed", message: updateError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Successfully updated profile:", updated);

    return new Response(JSON.stringify({ success: true, profile: updated }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: "unexpected_error", message: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
