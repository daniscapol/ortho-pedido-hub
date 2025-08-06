import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestUser {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'dentist';
  role_extended: 'admin_master' | 'admin_clinica' | 'admin_filial' | 'dentist';
  clinica_id?: string;
  filial_id?: string;
  documento: string;
  telefone: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Usar service role key para operações administrativas
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const testUsers: TestUser[] = [
      {
        email: 'admin.clinica@sorrisoperfeito.com',
        password: 'teste123',
        name: 'Admin Clínica Sorriso',
        role: 'admin',
        role_extended: 'admin_clinica',
        clinica_id: '11111111-1111-1111-1111-111111111111',
        documento: '111.222.333-44',
        telefone: '(11) 99999-1111'
      },
      {
        email: 'admin.filial@centro.com', 
        password: 'teste123',
        name: 'Admin Filial Centro',
        role: 'admin',
        role_extended: 'admin_filial',
        clinica_id: '11111111-1111-1111-1111-111111111111',
        filial_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        documento: '222.333.444-55',
        telefone: '(11) 99999-2222'
      },
      {
        email: 'dentista.centro@clinica.com',
        password: 'teste123',
        name: 'Dr. João Silva',
        role: 'dentist',
        role_extended: 'dentist',
        clinica_id: '11111111-1111-1111-1111-111111111111',
        filial_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        documento: '333.444.555-66',
        telefone: '(11) 99999-3333'
      },
      {
        email: 'dentista.zonasul@clinica.com',
        password: 'teste123', 
        name: 'Dra. Maria Santos',
        role: 'dentist',
        role_extended: 'dentist',
        clinica_id: '11111111-1111-1111-1111-111111111111',
        filial_id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        documento: '444.555.666-77',
        telefone: '(11) 99999-4444'
      }
    ];

    const results = [];

    for (const testUser of testUsers) {
      try {
        // Criar usuário no auth
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: testUser.email,
          password: testUser.password,
          email_confirm: true,
          user_metadata: {
            name: testUser.name,
            role: testUser.role
          }
        });

        if (authError) {
          console.error(`Erro ao criar usuário ${testUser.email}:`, authError);
          results.push({ email: testUser.email, success: false, error: authError.message });
          continue;
        }

        if (!authData.user) {
          results.push({ email: testUser.email, success: false, error: 'User data is null' });
          continue;
        }

        // Criar profile
        const { error: profileError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: authData.user.id,
            name: testUser.name,
            email: testUser.email,
            role: testUser.role,
            role_extended: testUser.role_extended,
            clinica_id: testUser.clinica_id,
            filial_id: testUser.filial_id,
            documento: testUser.documento,
            telefone: testUser.telefone,
            created_by: '96251dd1-5141-4c9c-b947-c6b32bf4f5af' // admin master
          });

        if (profileError) {
          console.error(`Erro ao criar profile para ${testUser.email}:`, profileError);
          results.push({ email: testUser.email, success: false, error: profileError.message });
          continue;
        }

        results.push({ 
          email: testUser.email, 
          success: true, 
          userId: authData.user.id 
        });

      } catch (error) {
        console.error(`Erro geral para ${testUser.email}:`, error);
        results.push({ 
          email: testUser.email, 
          success: false, 
          error: error.message || 'Unknown error' 
        });
      }
    }

    // Associar alguns pacientes aos dentistas
    try {
      await supabaseAdmin
        .from('patients')
        .update({ dentist_id: results.find(r => r.email === 'dentista.centro@clinica.com')?.userId })
        .eq('filial_id', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')
        .is('dentist_id', null)
        .limit(3);

      await supabaseAdmin
        .from('patients')
        .update({ dentist_id: results.find(r => r.email === 'dentista.zonasul@clinica.com')?.userId })
        .eq('filial_id', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb')
        .is('dentist_id', null)
        .limit(2);
    } catch (error) {
      console.error('Erro ao associar pacientes:', error);
    }

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Erro geral:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);