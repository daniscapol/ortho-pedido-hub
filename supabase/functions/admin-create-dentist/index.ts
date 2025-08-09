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
    {
      global: {
        headers: { Authorization: req.headers.get('Authorization') || '' },
      },
    }
  )
}

interface CreateDentistRequest {
  name: string
  email: string
  password: string
  clinica_id?: string | null
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    const payload = (await req.json()) as CreateDentistRequest
    const { name, email, password, clinica_id } = payload

    if (!name || !email || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const supabaseAuthed = getAuthedClient(req)
    const { data: authUser } = await supabaseAuthed.auth.getUser()
    if (!authUser?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Load caller profile
    const { data: caller, error: callerErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role_extended, filial_id, clinica_id')
      .eq('id', authUser.user.id)
      .maybeSingle()

    if (callerErr) throw callerErr
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Caller profile not found' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Determine enforced filial_id and clinic
    let enforcedFilialId: string | null = null
    let enforcedClinicaId: string | null = null

    if (caller.role_extended === 'admin_master') {
      // Admin master can choose any clinic; if clinic provided infer filial from clinic
      if (clinica_id) {
        const { data: clinicaRow } = await supabaseAdmin
          .from('clinicas')
          .select('id, filial_id')
          .eq('id', clinica_id)
          .maybeSingle()
        enforcedClinicaId = clinicaRow?.id ?? null
        enforcedFilialId = clinicaRow?.filial_id ?? null
      }
    } else if (caller.role_extended === 'admin_filial') {
      // Must belong to caller's filial
      enforcedFilialId = caller.filial_id ?? null
      if (clinica_id) {
        const { data: clinicaRow, error: clinicErr } = await supabaseAdmin
          .from('clinicas')
          .select('id, filial_id')
          .eq('id', clinica_id)
          .eq('filial_id', enforcedFilialId)
          .maybeSingle()
        if (clinicErr || !clinicaRow) {
          return new Response(JSON.stringify({ error: 'Clinica não pertence à sua filial' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }
        enforcedClinicaId = clinicaRow.id
      }
    } else if (caller.role_extended === 'admin_clinica') {
      // Must belong to caller's clinic
      if (!caller.clinica_id) {
        return new Response(JSON.stringify({ error: 'Seu perfil não possui clínica vinculada' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }
      enforcedClinicaId = caller.clinica_id
      // Get filial from clinic
      const { data: clinicaRow } = await supabaseAdmin
        .from('clinicas')
        .select('filial_id')
        .eq('id', enforcedClinicaId)
        .maybeSingle()
      enforcedFilialId = clinicaRow?.filial_id ?? null
    } else {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Create auth user as dentist
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role: 'dentist',
        role_extended: 'dentist',
        clinica_id: enforcedClinicaId,
        filial_id: enforcedFilialId,
      },
    })

    if (createErr) {
      return new Response(JSON.stringify({ error: createErr.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const userId = created.user?.id
    if (!userId) {
      return new Response(JSON.stringify({ error: 'User not created' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Ensure profile has the enforced clinic/filial
    const { error: upsertErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        name,
        email,
        role: 'dentist' as any,
        role_extended: 'dentist',
        clinica_id: enforcedClinicaId,
        filial_id: enforcedFilialId,
        ativo: true,
      }, { onConflict: 'id' })

    if (upsertErr) {
      return new Response(JSON.stringify({ error: upsertErr.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ success: true, userId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e: any) {
    console.error('admin-create-dentist error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
});