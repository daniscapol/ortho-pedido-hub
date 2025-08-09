import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

function getAuthedClient(req: Request) {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: req.headers.get('Authorization') || '' } } }
  )
}

interface CreateAdminClinicaRequest {
  name: string
  email: string
  password: string
  clinica_id: string
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }

  try {
    const payload = (await req.json()) as CreateAdminClinicaRequest
    const { name, email, password, clinica_id } = payload

    if (!name || !email || !password || !clinica_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const supabaseAuthed = getAuthedClient(req)
    const { data: authUser } = await supabaseAuthed.auth.getUser()
    if (!authUser?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // Caller profile
    const { data: caller, error: callerErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role_extended, filial_id')
      .eq('id', authUser.user.id)
      .maybeSingle()
    if (callerErr) throw callerErr
    if (!caller) return new Response(JSON.stringify({ error: 'Caller profile not found' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } })

    // Target clinic and filial
    const { data: clinic, error: clinicErr } = await supabaseAdmin
      .from('clinicas')
      .select('id, filial_id')
      .eq('id', clinica_id)
      .maybeSingle()
    if (clinicErr || !clinic) return new Response(JSON.stringify({ error: 'Clinica not found' }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } })

    // Permission checks: admin_master can create anywhere; admin_filial only within own filial
    if (!(caller.role_extended === 'admin_master' || (caller.role_extended === 'admin_filial' && caller.filial_id && caller.filial_id === clinic.filial_id))) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // Create auth user with admin_clinica
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'admin',
        role_extended: 'admin_clinica',
        clinica_id: clinic.id,
        filial_id: clinic.filial_id,
      },
    })
    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const userId = created.user?.id
    if (!userId) return new Response(JSON.stringify({ error: 'User not created' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })

    // Upsert profile with enforced links
    const { error: upsertErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        name,
        email,
        role: 'admin' as any,
        role_extended: 'admin_clinica',
        clinica_id: clinic.id,
        filial_id: clinic.filial_id,
        ativo: true,
      }, { onConflict: 'id' })
    if (upsertErr) return new Response(JSON.stringify({ error: upsertErr.message }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })

    return new Response(JSON.stringify({ success: true, userId }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  } catch (e: any) {
    console.error('admin-create-admin-clinica error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
})