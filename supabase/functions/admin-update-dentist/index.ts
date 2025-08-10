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

interface UpdateDentistRequest {
  dentist_id: string
  nome_completo?: string
  email?: string
  cro?: string
  cpf?: string
  telefone?: string
  endereco?: string
  cep?: string
  cidade?: string
  estado?: string
  numero?: string
  complemento?: string
  clinica_id?: string | null
  ativo?: boolean
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
    const payload = (await req.json()) as UpdateDentistRequest
    const { dentist_id, ...updates } = payload

    if (!dentist_id) {
      return new Response(JSON.stringify({ error: 'Missing dentist_id' }), {
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

    if (callerErr) throw callerErr
    if (!caller) {
      return new Response(JSON.stringify({ error: 'Caller profile not found' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Load dentist being updated
    const { data: dentist, error: dentistErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role_extended, filial_id, clinica_id')
      .eq('id', dentist_id)
      .eq('role_extended', 'dentist')
      .maybeSingle()

    if (dentistErr) throw dentistErr
    if (!dentist) {
      return new Response(JSON.stringify({ error: 'Dentist not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Check permissions
    let canUpdate = false
    
    if (caller.role_extended === 'admin_master') {
      canUpdate = true
    } else if (caller.role_extended === 'admin_matriz' || caller.role_extended === 'admin_filial') {
      // Can update dentists from their matriz/filial
      canUpdate = dentist.filial_id === caller.filial_id
    } else if (caller.role_extended === 'admin_clinica') {
      // Can update dentists from their clinic
      canUpdate = dentist.clinica_id === caller.clinica_id
    }

    if (!canUpdate) {
      return new Response(JSON.stringify({ error: 'Forbidden: Cannot update this dentist' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Validate clinic change if provided
    if (updates.clinica_id !== undefined) {
      if (updates.clinica_id) {
        const { data: clinicaRow, error: clinicErr } = await supabaseAdmin
          .from('clinicas')
          .select('id, filial_id')
          .eq('id', updates.clinica_id)
          .maybeSingle()

        if (clinicErr || !clinicaRow) {
          return new Response(JSON.stringify({ error: 'Clínica não encontrada' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Check if caller can assign to this clinic
        if ((caller.role_extended === 'admin_matriz' || caller.role_extended === 'admin_filial') && clinicaRow.filial_id !== caller.filial_id) {
          return new Response(JSON.stringify({ error: 'Clínica não pertence à sua matriz/filial' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        } else if (caller.role_extended === 'admin_clinica' && clinicaRow.id !== caller.clinica_id) {
          return new Response(JSON.stringify({ error: 'Você só pode atribuir dentistas à sua clínica' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }

        // Update filial_id and matriz_id based on clinic
        updates.filial_id = clinicaRow.filial_id
        updates.matriz_id = clinicaRow.filial_id
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (updates.nome_completo) updateData.name = updates.nome_completo
    if (updates.nome_completo) updateData.nome_completo = updates.nome_completo
    if (updates.email) updateData.email = updates.email
    if (updates.cro) updateData.cro = updates.cro
    if (updates.cpf) updateData.cpf = updates.cpf
    if (updates.telefone !== undefined) updateData.telefone = updates.telefone
    if (updates.endereco !== undefined) updateData.endereco = updates.endereco
    if (updates.cep !== undefined) updateData.cep = updates.cep
    if (updates.cidade !== undefined) updateData.cidade = updates.cidade
    if (updates.estado !== undefined) updateData.estado = updates.estado
    if (updates.numero !== undefined) updateData.numero = updates.numero
    if (updates.complemento !== undefined) updateData.complemento = updates.complemento
    if (updates.clinica_id !== undefined) updateData.clinica_id = updates.clinica_id
    if (updates.filial_id !== undefined) updateData.filial_id = updates.filial_id
    if (updates.matriz_id !== undefined) updateData.matriz_id = updates.matriz_id
    if (updates.ativo !== undefined) updateData.ativo = updates.ativo

    // Update profile
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update(updateData)
      .eq('id', dentist_id)

    if (updateErr) {
      console.error('Update error:', updateErr)
      return new Response(JSON.stringify({ error: updateErr.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e: any) {
    console.error('admin-update-dentist error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
});