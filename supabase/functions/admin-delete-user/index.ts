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

interface DeleteUserRequest { userId: string }

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }

  try {
    const supabaseAuthed = getAuthedClient(req)
    const { data: authUser } = await supabaseAuthed.auth.getUser()
    if (!authUser?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const { data: callerProfile, error: callerErr } = await supabaseAdmin
      .from('profiles')
      .select('id, role_extended')
      .eq('id', authUser.user.id)
      .maybeSingle()

    if (callerErr) throw callerErr
    if (!callerProfile || !['admin_master', 'admin_matriz'].includes(callerProfile.role_extended)) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const { userId } = (await req.json()) as DeleteUserRequest
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // Check orders: block deletion if there are any
    const { data: orders, error: ordersErr } = await supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)

    if (ordersErr) throw ordersErr
    if ((orders as any)?.length > 0) {
      return new Response(JSON.stringify({ error: 'Usuário possui pedidos ativos e não pode ser deletado.' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // 1) Delete notifications
    const { error: notifErr } = await supabaseAdmin.from('notifications').delete().eq('user_id', userId)
    if (notifErr) throw notifErr

    // 2) Detach patients
    const { error: patientsErr } = await supabaseAdmin.from('patients').update({ dentist_id: null }).eq('dentist_id', userId)
    if (patientsErr) throw patientsErr

    // 3) Delete profile row
    const { error: profileErr } = await supabaseAdmin.from('profiles').delete().eq('id', userId)
    if (profileErr) throw profileErr

    // 4) Delete Auth user (revokes tokens)
    const { error: authErr } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (authErr) throw authErr

    return new Response(JSON.stringify({ success: true }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  } catch (e: any) {
    console.error('admin-delete-user error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
}

serve(handler)
