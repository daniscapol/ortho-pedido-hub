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

interface ConfirmEmailRequest { userId: string }

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
    if (!callerProfile || callerProfile.role_extended !== 'admin_master') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const { userId } = (await req.json()) as ConfirmEmailRequest
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Missing userId' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true })
    if (error) {
      console.error('updateUserById error:', error)
      return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    return new Response(JSON.stringify({ success: true, user: data.user }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  } catch (e: any) {
    console.error('admin-confirm-email error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
}

serve(handler)
