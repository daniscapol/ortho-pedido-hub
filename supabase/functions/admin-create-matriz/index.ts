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

interface CreateMatrizRequest {
  nome_completo: string
  endereco: string
  telefone: string
  email: string
  ativo?: boolean
  cnpj?: string
  cep?: string
  cidade?: string
  estado?: string
  numero?: string
  complemento?: string
}

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
    // Somente admin_master pode criar matrizes
    if (!callerProfile || callerProfile.role_extended !== 'admin_master') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    const b = (await req.json()) as CreateMatrizRequest
    if (!b.nome_completo || !b.endereco || !b.telefone || !b.email) {
      return new Response(JSON.stringify({ error: 'Campos obrigatórios ausentes' }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
    }

    // Payload whitelist – evita colunas desconhecidas como clinica_id
    const payload: CreateMatrizRequest = {
      nome_completo: b.nome_completo,
      endereco: b.endereco,
      telefone: b.telefone,
      email: b.email,
      ativo: b.ativo ?? true,
      cnpj: b.cnpj,
      cep: b.cep,
      cidade: b.cidade,
      estado: b.estado,
      numero: b.numero,
      complemento: b.complemento,
    }

    const { data, error } = await supabaseAdmin.from('matrizes').insert([payload]).select('*').single()
    if (error) throw error

    return new Response(JSON.stringify({ matriz: data }), { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  } catch (e: any) {
    console.error('admin-create-matriz error:', e)
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } })
  }
}

serve(handler)
