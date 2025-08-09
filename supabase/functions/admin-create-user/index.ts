import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Service role client for privileged operations
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Authenticated client (for reading caller info if needed)
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

interface CreateUserRequest {
  name: string
  email: string
  password: string
  role_extended: 'admin_master' | 'admin_filial' | 'admin_clinica' | 'dentist'
  clinica_id?: string | null
  filial_id?: string | null
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    const payload = (await req.json()) as CreateUserRequest
    const { name, email, password, role_extended, clinica_id, filial_id } = payload

    if (!name || !email || !password || !role_extended) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Verify caller is admin_master
    const supabaseAuthed = getAuthedClient(req)
    const { data: authUser } = await supabaseAuthed.auth.getUser()
    if (!authUser?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const { data: callerProfile, error: profileErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role_extended')
      .eq('id', authUser.user.id)
      .maybeSingle()

    if (profileErr) {
      console.error('Error fetching caller profile:', profileErr)
      return new Response(JSON.stringify({ error: 'Failed to verify permissions' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    if (!callerProfile || callerProfile.role_extended !== 'admin_master') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    const role = role_extended === 'dentist' ? 'dentist' : 'admin'

    // Try to create the auth user (confirmed, with password)
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, role_extended, clinica_id, filial_id },
    })

    // If user already exists, fetch it; otherwise handle error
    let userId = created?.user?.id || null

    if (createErr) {
      // Supabase returns 422 with message 'User already registered'
      if (createErr?.message?.toLowerCase()?.includes('already')) {
        // We need to find user id by email using admin listUsers
        let foundId: string | null = null
        let nextPage: string | null = null
        for (let i = 0; i < 10 && !foundId; i++) {
          const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({ page: i + 1, perPage: 200 })
          if (listErr) break
          const match = list?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase())
          if (match) foundId = match.id
          if (!list || list.users.length < 200) break
          nextPage = null
        }
        if (!foundId) {
          return new Response(JSON.stringify({ error: 'User already exists but could not be found by email' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          })
        }
        userId = foundId
      } else {
        console.error('Error creating user:', createErr)
        return new Response(JSON.stringify({ error: createErr.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        })
      }
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Failed to get user id' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Ensure profile exists and has correct roles
    const { error: upsertErr } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        name,
        email,
        role: role as any,
        role_extended,
        clinica_id: clinica_id ?? null,
        filial_id: filial_id ?? null,
      }, { onConflict: 'id' })

    if (upsertErr) {
      console.error('Error upserting profile:', upsertErr)
      return new Response(JSON.stringify({ error: 'User created but failed to upsert profile' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    return new Response(JSON.stringify({ success: true, userId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e: any) {
    console.error('admin-create-user error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

serve(handler)
