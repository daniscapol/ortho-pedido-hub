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
    
    console.log('Received payload:', { name, email, clinica_id });

    if (!name || !email || !password) {
      console.log('Missing required fields:', { name: !!name, email: !!email, password: !!password });
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (!clinica_id) {
      console.log('Missing clinica_id');
      return new Response(JSON.stringify({ error: 'Clínica é obrigatória' }), {
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
      .select('id, role_extended, filial_id, matriz_id, clinica_id')
      .eq('id', authUser.user.id)
      .maybeSingle()

    console.log('Caller profile:', caller);
    console.log('Caller error:', callerErr);

    if (callerErr) throw callerErr
    if (!caller) {
      console.log('Caller profile not found');
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
    } else if (caller.role_extended === 'admin_matriz' || caller.role_extended === 'admin_filial') {
      // Must belong to caller's matriz/filial
      enforcedFilialId = caller.filial_id ?? null
      if (clinica_id) {
        const { data: clinicaRow, error: clinicErr } = await supabaseAdmin
          .from('clinicas')
          .select('id, filial_id')
          .eq('id', clinica_id)
          .eq('filial_id', enforcedFilialId)
          .maybeSingle()
        if (clinicErr || !clinicaRow) {
          return new Response(JSON.stringify({ error: 'Clínica não pertence à sua matriz/filial' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }
        enforcedClinicaId = clinicaRow.id
      }
    } else if (caller.role_extended === 'admin_clinica') {
      console.log('Processing admin_clinica, caller clinica_id:', caller.clinica_id);
      // Must belong to caller's clinic
      if (!caller.clinica_id) {
        console.log('Admin clinica has no clinica_id');
        return new Response(JSON.stringify({ error: 'Seu perfil não possui clínica vinculada' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }

      // Admin clinica can only create dentists for their own clinic
      if (clinica_id !== caller.clinica_id) {
        console.log('Clinica mismatch:', { requested: clinica_id, caller_clinic: caller.clinica_id });
        return new Response(JSON.stringify({ error: 'Você só pode criar dentistas para sua própria clínica' }), {
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
      console.log('Enforced clinic and filial:', { enforcedClinicaId, enforcedFilialId });
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
      console.log('Create user error:', createErr);
      
      // Handle specific error cases with user-friendly messages
      let errorMessage = createErr.message;
      
      if (createErr.message.includes('User with this email address already exists') || 
          createErr.message.includes('A user with this email address has already been registered')) {
        errorMessage = `O email ${email} já está cadastrado no sistema. Por favor, use um email diferente.`;
      } else if (createErr.message.includes('Invalid email')) {
        errorMessage = 'O formato do email é inválido. Por favor, verifique e tente novamente.';
      } else if (createErr.message.includes('Password')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      }
      
      return new Response(JSON.stringify({ error: errorMessage }), {
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
        matriz_id: enforcedFilialId, // matriz_id same as filial_id
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