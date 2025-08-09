// Supabase Edge Function: admin-update-user-links
// Purpose: Allow admin master to update a user's filial_id and/or clinica_id safely with service role, with proper authorization.
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

    if (callerProfile.role_extended !== "admin_master") {
      return new Response(
        JSON.stringify({ error: "forbidden", message: "Apenas Admin Master pode executar esta ação." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { userId, filialId, clinicaId } = await req.json().catch(() => ({}));

    if (!userId || (filialId === undefined && clinicaId === undefined)) {
      return new Response(
        JSON.stringify({ error: "invalid_request", message: "Informe userId e pelo menos um dos campos: filialId ou clinicaId." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const updates: Record<string, string | null> = {};
    if (filialId !== undefined) updates["filial_id"] = filialId; // pode ser null
    if (clinicaId !== undefined) updates["clinica_id"] = clinicaId; // pode ser null

    const { data: updated, error: updateError } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select("id, filial_id, clinica_id")
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "update_failed", message: updateError.message }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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
