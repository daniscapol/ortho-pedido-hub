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

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    const { email } = await req.json()
    
    if (!email) {
      return new Response(JSON.stringify({ error: 'Email é obrigatório' }), {
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

    // Load caller profile to check permissions
    const { data: caller, error: callerErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role_extended')
      .eq('id', authUser.user.id)
      .maybeSingle()

    if (callerErr) throw callerErr
    if (!caller || caller.role_extended !== 'admin_master') {
      return new Response(JSON.stringify({ error: 'Forbidden - Only admin_master can cleanup orphaned users' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Find the orphaned user in auth.users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers()
    if (authError) throw authError
    
    const orphanedUser = authUsers.users.find(user => user.email === email)
    if (!orphanedUser) {
      return new Response(JSON.stringify({ error: 'Usuário não encontrado em auth.users' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Check if user really is orphaned (exists in auth but not in profiles)
    const { data: profileExists } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('id', orphanedUser.id)
      .maybeSingle()

    if (profileExists) {
      return new Response(JSON.stringify({ error: 'Usuário não é órfão - existe em profiles' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      })
    }

    // Delete the orphaned user from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(orphanedUser.id)
    if (deleteError) throw deleteError

    console.log(`Orphaned user cleaned up: ${email} (${orphanedUser.id})`)

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Usuário órfão ${email} removido com sucesso`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  } catch (e: any) {
    console.error('admin-cleanup-orphaned-users error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
});