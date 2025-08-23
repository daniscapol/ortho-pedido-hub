import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface StressTestProgress {
  step: string
  completed: number
  total: number
  details: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('🚀 Iniciando teste de estresse...')
    
    // Start background task for creating the data
    const backgroundTask = async () => {
      try {
        await createStressTestData(supabase)
        console.log('✅ Teste de estresse concluído com sucesso!')
      } catch (error) {
        console.error('❌ Erro durante teste de estresse:', error)
      }
    }

    // Use background task to not block the response
    EdgeRuntime.waitUntil(backgroundTask())

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Teste de estresse iniciado! Verifique os logs para acompanhar o progresso.',
        expectedData: {
          matrizes: 5,
          clinicas: 25,
          dentistas: 125,
          pacientes: 3750,
          pedidos: 3750
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Erro:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})

async function createStressTestData(supabase: any) {
  console.log('📊 Criando dados para teste de estresse...')
  
  // Step 1: Create 5 Matrizes
  console.log('🏢 Criando 5 matrizes...')
  const matrizes = []
  
  for (let i = 1; i <= 5; i++) {
    const matrizData = {
      nome_completo: `Matriz Teste ${i}`,
      cnpj: `${String(i).padStart(2, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}/0001-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
      endereco: `Rua das Matrizes, ${i * 100}`,
      telefone: `(11) 9${String(i).padStart(4, '0')}-0000`,
      email: `matriz${i}@teste.com`,
      cep: `${String(i).padStart(2, '0')}000-000`,
      cidade: `Cidade Matriz ${i}`,
      estado: 'SP',
      numero: `${i * 100}`,
      ativo: true
    }

    const { data: matriz, error } = await supabase
      .from('filiais')
      .insert(matrizData)
      .select()
      .single()

    if (error) {
      console.error(`Erro criando matriz ${i}:`, error)
      continue
    }

    matrizes.push(matriz)
    console.log(`✅ Matriz ${i} criada: ${matriz.id}`)
  }

  // Step 2: Create 5 Clínicas for each Matriz (25 total)
  console.log('🏥 Criando 5 clínicas para cada matriz (25 total)...')
  const clinicas = []
  
  for (const [matrizIndex, matriz] of matrizes.entries()) {
    for (let i = 1; i <= 5; i++) {
      const clinicaData = {
        nome_completo: `Clínica ${matrizIndex + 1}-${i}`,
        cnpj: `${String(matrizIndex + 1).padStart(2, '0')}.${String(i).padStart(3, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}/0001-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
        endereco: `Rua das Clínicas, ${(matrizIndex + 1) * 100 + i}`,
        telefone: `(11) 8${String(matrizIndex + 1).padStart(2, '0')}${String(i).padStart(2, '0')}-0000`,
        email: `clinica${matrizIndex + 1}-${i}@teste.com`,
        cep: `${String(matrizIndex + 1).padStart(2, '0')}${String(i).padStart(3, '0')}-000`,
        cidade: `Cidade Clínica ${matrizIndex + 1}-${i}`,
        estado: 'SP',
        numero: `${(matrizIndex + 1) * 100 + i}`,
        matriz_id: matriz.id,
        filial_id: matriz.id,
        ativo: true
      }

      const { data: clinica, error } = await supabase
        .from('clinicas')
        .insert(clinicaData)
        .select()
        .single()

      if (error) {
        console.error(`Erro criando clínica ${matrizIndex + 1}-${i}:`, error)
        continue
      }

      clinicas.push({ ...clinica, matrizIndex })
      console.log(`✅ Clínica ${matrizIndex + 1}-${i} criada: ${clinica.id}`)
    }
  }

  // Step 3: Create 5 Dentistas for each Clínica (125 total)
  console.log('👨‍⚕️ Criando 5 dentistas para cada clínica (125 total)...')
  const dentistas = []
  
  for (const [clinicaIndex, clinica] of clinicas.entries()) {
    for (let i = 1; i <= 5; i++) {
      const dentistaEmail = `dentista${clinica.matrizIndex + 1}-${clinicaIndex % 5 + 1}-${i}@teste.com`
      const dentistaPassword = 'senha123456'

      try {
        // Create auth user first
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: dentistaEmail,
          password: dentistaPassword,
          email_confirm: true,
          user_metadata: {
            role: 'dentist',
            role_extended: 'dentist'
          }
        })

        if (authError) {
          console.error(`Erro criando auth user para dentista ${clinicaIndex + 1}-${i}:`, authError)
          continue
        }

        // Create profile
        const profileData = {
          id: authUser.user.id,
          name: `Dr(a). Dentista ${clinica.matrizIndex + 1}-${clinicaIndex % 5 + 1}-${i}`,
          nome_completo: `Dr(a). Dentista Teste ${clinica.matrizIndex + 1}-${clinicaIndex % 5 + 1}-${i}`,
          email: dentistaEmail,
          telefone: `(11) 7${String(clinica.matrizIndex + 1).padStart(2, '0')}${String(clinicaIndex % 5 + 1).padStart(2, '0')}-${String(i).padStart(4, '0')}`,
          cpf: `${String(clinica.matrizIndex + 1).padStart(3, '0')}.${String(clinicaIndex % 5 + 1).padStart(3, '0')}.${String(i).padStart(3, '0')}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
          cro: `SP-${String(clinica.matrizIndex + 1).padStart(2, '0')}${String(clinicaIndex % 5 + 1).padStart(2, '0')}${String(i).padStart(3, '0')}`,
          endereco: `Rua dos Dentistas, ${(clinica.matrizIndex + 1) * 1000 + (clinicaIndex % 5 + 1) * 100 + i}`,
          cep: `${String(clinica.matrizIndex + 1).padStart(2, '0')}${String(clinicaIndex % 5 + 1).padStart(2, '0')}${String(i).padStart(1, '0')}-000`,
          cidade: `Cidade ${clinica.matrizIndex + 1}-${clinicaIndex % 5 + 1}`,
          estado: 'SP',
          numero: `${i}`,
          role: 'dentist',
          role_extended: 'dentist',
          clinica_id: clinica.id,
          matriz_id: clinica.matriz_id,
          filial_id: clinica.filial_id,
          ativo: true
        }

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert(profileData)
          .select()
          .single()

        if (profileError) {
          console.error(`Erro criando profile para dentista ${clinicaIndex + 1}-${i}:`, profileError)
          continue
        }

        dentistas.push({ ...profile, clinicaId: clinica.id })
        console.log(`✅ Dentista ${clinica.matrizIndex + 1}-${clinicaIndex % 5 + 1}-${i} criado: ${profile.id}`)

      } catch (error) {
        console.error(`Erro geral criando dentista ${clinicaIndex + 1}-${i}:`, error)
      }
    }
  }

  // Step 4: Create 30 Pacientes for each Dentista (3750 total)
  console.log('🤕 Criando 30 pacientes para cada dentista (3750 total)...')
  const pacientes = []
  
  for (const [dentistaIndex, dentista] of dentistas.entries()) {
    const batchSize = 10 // Process patients in batches to avoid timeout
    
    for (let batch = 0; batch < 3; batch++) {
      const pacientesBatch = []
      
      for (let i = 1; i <= 10; i++) {
        const pacienteNum = batch * 10 + i
        const pacienteData = {
          nome_completo: `Paciente ${dentistaIndex + 1}-${pacienteNum}`,
          cpf: `${String(dentistaIndex + 1).padStart(3, '0')}.${String(pacienteNum).padStart(3, '0')}.${String(Math.floor(Math.random() * 999)).padStart(3, '0')}-${String(Math.floor(Math.random() * 99)).padStart(2, '0')}`,
          email_contato: `paciente${dentistaIndex + 1}-${pacienteNum}@teste.com`,
          telefone_contato: `(11) 6${String(dentistaIndex + 1).padStart(3, '0')}-${String(pacienteNum).padStart(4, '0')}`,
          observacoes: `Paciente de teste ${dentistaIndex + 1}-${pacienteNum} para stress test`,
          dentist_id: dentista.id,
          clinica_id: dentista.clinicaId,
          filial_id: dentista.filial_id,
          ativo: true
        }
        pacientesBatch.push(pacienteData)
      }

      const { data: pacientesBatchResult, error } = await supabase
        .from('patients')
        .insert(pacientesBatch)
        .select()

      if (error) {
        console.error(`Erro criando batch de pacientes para dentista ${dentistaIndex + 1}:`, error)
        continue
      }

      pacientes.push(...pacientesBatchResult.map(p => ({ ...p, dentistaId: dentista.id })))
      console.log(`✅ Batch ${batch + 1}/3 de pacientes criado para dentista ${dentistaIndex + 1}`)
    }
  }

  // Step 5: Create 1 Pedido for each Paciente (3750 total)
  console.log('📋 Criando 1 pedido para cada paciente (3750 total)...')
  
  const prosthesisTypes = ['Coroa', 'Ponte', 'Prótese Parcial', 'Prótese Total', 'Implante', 'Faceta']
  const materials = ['Porcelana', 'Zircônia', 'Resina', 'Metal', 'Cerâmica']
  const colors = ['A1', 'A2', 'A3', 'B1', 'B2', 'C1', 'C2']
  const priorities = ['baixa', 'normal', 'alta', 'urgente']
  const statuses = ['pedido_solicitado', 'baixado_verificado', 'projeto_realizado']
  
  const batchSize = 50 // Process orders in batches
  const totalBatches = Math.ceil(pacientes.length / batchSize)
  
  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const startIndex = batchIndex * batchSize
    const endIndex = Math.min(startIndex + batchSize, pacientes.length)
    const pacientesBatch = pacientes.slice(startIndex, endIndex)
    
    const pedidosBatch = pacientesBatch.map((paciente, index) => {
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() + Math.floor(Math.random() * 30) + 7) // 7-37 days from now
      
      return {
        patient_id: paciente.id,
        user_id: paciente.dentistaId,
        dentist: `Dr(a). Dentista do Paciente ${paciente.nome_completo}`,
        prosthesis_type: prosthesisTypes[Math.floor(Math.random() * prosthesisTypes.length)],
        material: materials[Math.floor(Math.random() * materials.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        deadline: randomDate.toISOString().split('T')[0],
        observations: `Pedido de teste para ${paciente.nome_completo} - Stress Test`,
        selected_teeth: [`${Math.floor(Math.random() * 48) + 1}`],
        delivery_address: `Endereço de entrega para ${paciente.nome_completo}`
      }
    })

    const { data: pedidosBatchResult, error } = await supabase
      .from('orders')
      .insert(pedidosBatch)
      .select()

    if (error) {
      console.error(`Erro criando batch ${batchIndex + 1} de pedidos:`, error)
      continue
    }

    console.log(`✅ Batch ${batchIndex + 1}/${totalBatches} de pedidos criado (${pedidosBatchResult.length} pedidos)`)
  }

  console.log('🎉 Teste de estresse concluído!')
  console.log(`📊 Dados criados:`)
  console.log(`   • Matrizes: ${matrizes.length}`)
  console.log(`   • Clínicas: ${clinicas.length}`)
  console.log(`   • Dentistas: ${dentistas.length}`)
  console.log(`   • Pacientes: ${pacientes.length}`)
  console.log(`   • Pedidos: ~${pacientes.length} (em batches)`)
}