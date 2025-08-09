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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })
  if (req.method !== 'GET') {
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

    // Fetch profiles
    const { data: profiles, error: profilesErr } = await supabaseAdmin
      .from('profiles')
      .select('id, name, email, role_extended, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (profilesErr) throw profilesErr

    // Fetch auth users via admin listUsers (paged)
    const emailStatus = new Map<string, { email_confirmed_at: string | null }>()
    let page = 1
    const perPage = 200
    // We'll loop a few pages until we fetch fewer than perPage
    for (let i = 0; i < 10; i++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage })
      if (error) throw error
      data.users.forEach((u: any) => {
        emailStatus.set(u.id, { email_confirmed_at: u.email_confirmed_at || null })
      })
      if (data.users.length < perPage) break
      page++
    }

    const users = profiles.map(p => {
      const s = emailStatus.get(p.id)
      const email_confirmed_at = s?.email_confirmed_at || null
      const email_verified = !!email_confirmed_at
      return { ...p, email_confirmed_at, email_verified }
    })

    return new Response(JSON.stringify({ users }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  } catch (e: any) {
    console.error('admin-list-users error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
}

serve(handler)
