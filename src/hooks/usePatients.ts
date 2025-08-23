import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface Patient {
  id: string
  nome_completo: string
  cpf?: string
  telefone_contato?: string
  email_contato?: string
  dentist_id?: string
  clinica_id?: string
  matriz_id?: string
  ativo?: boolean
  observacoes?: string
  dentist?: {
    id: string
    nome_completo: string | null
    email: string | null
  }
  created_at: string
  updated_at: string
}

export const usePatients = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select(`
          *,
          dentist:dentist_id (
            id,
            nome_completo,
            email
          )
        `)
        .order('nome_completo')

      if (searchTerm) {
        query = query.or(`nome_completo.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return data as Patient[]
    },
  })
}

export const useCreatePatient = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'dentist'>) => {
      // Ensure required relational fields for RLS (clinica_id / filial_id)
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Usuário não autenticado')

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role_extended, clinica_id, matriz_id, filial_id')
        .eq('id', userId)
        .maybeSingle()

      const mutable: any = { ...patientData }

      // If dentist is creating without explicitly selecting dentist_id
      if (!mutable.dentist_id && currentProfile?.role_extended === 'dentist') {
        mutable.dentist_id = userId
      }

      // Derive clinic/matriz (filial) from selected dentist when available
      if (mutable.dentist_id) {
        const { data: dentistProfile } = await supabase
          .from('profiles')
          .select('clinica_id, matriz_id, filial_id')
          .eq('id', mutable.dentist_id)
          .maybeSingle()

        if (dentistProfile) {
          mutable.clinica_id = dentistProfile.clinica_id ?? mutable.clinica_id
          // DB uses patients.filial_id; prefer explicit filial_id then fall back to matriz_id
          mutable.filial_id = dentistProfile.filial_id ?? dentistProfile.matriz_id ?? mutable.filial_id
        }
      } else if (currentProfile) {
        // Fallback for admins creating sem selecionar dentista (não recomendado)
        if (currentProfile.role_extended === 'admin_clinica') {
          mutable.clinica_id = currentProfile.clinica_id ?? mutable.clinica_id
        }
        mutable.filial_id = currentProfile.filial_id ?? currentProfile.matriz_id ?? mutable.filial_id
      }

      // Default ativo
      if (typeof mutable.ativo === 'undefined') mutable.ativo = true

      // Normalize CPF to digits and max 11 to satisfy DB varchar(14)
      if (mutable.cpf) {
        const digits = String(mutable.cpf).replace(/\D/g, '')
        mutable.cpf = digits.slice(0, 11)
      }

      // Preflight: check duplicate CPF (friendly error) - only if CPF is provided
      if (mutable.cpf) {
        const { data: existingByCpf } = await supabase
          .from('patients')
          .select('id')
          .eq('cpf', mutable.cpf)
          .limit(1)
          .maybeSingle()
        if (existingByCpf) {
          const e = new Error('CPF já cadastrado para algum paciente visível a você') as any
          e.code = '23505'
          throw e
        }
      }

      const insertPayload = {
        nome_completo: mutable.nome_completo,
        cpf: mutable.cpf || null,
        telefone_contato: mutable.telefone_contato || null,
        email_contato: mutable.email_contato || null,
        observacoes: mutable.observacoes ?? null,
        ativo: mutable.ativo,
        dentist_id: mutable.dentist_id,
        clinica_id: mutable.clinica_id,
        filial_id: mutable.filial_id,
      }

      const { data, error } = await supabase
        .from('patients')
        .insert([insertPayload])
        .select('*')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast({
        title: "Paciente cadastrado",
        description: "Paciente cadastrado com sucesso!",
      })
    },
    onError: (error: any) => {
      console.error('Create patient error:', error)
      let description = 'Erro ao cadastrar paciente.'
      if (error?.code === '22001' || /value too long/i.test(error?.message)) {
        description = 'CPF inválido: use 11 dígitos (somente números).'
      } else if (error?.code === '23505' || /duplicate/i.test(error?.message) || /já cadastrado/i.test(error?.message) || error?.status === 409) {
        description = 'CPF já cadastrado para outro paciente.'
      } else if (error?.code === '42501' || error?.status === 403) {
        description = 'Sem permissão para salvar: selecione um dentista da mesma matriz/clínica.'
      } else if (error?.message) {
        description = error.message
      }
      toast({ title: 'Erro', description, variant: 'destructive' })
    },
  })
}

export const useUpdatePatient = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, ...patientData }: { id: string } & Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'dentist'>) => {
      // Update must also respect RLS; recalculate clinica_id/filial_id if dentist changes
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('Usuário não autenticado')

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role_extended, clinica_id, matriz_id, filial_id')
        .eq('id', userId)
        .maybeSingle()

      const mutable: any = { ...patientData }

      // If no dentist specified, fallback for dentist user
      if (!mutable.dentist_id && currentProfile?.role_extended === 'dentist') {
        mutable.dentist_id = userId
      }

      if (mutable.dentist_id) {
        const { data: dentistProfile } = await supabase
          .from('profiles')
          .select('clinica_id, matriz_id, filial_id')
          .eq('id', mutable.dentist_id)
          .maybeSingle()

        if (dentistProfile) {
          mutable.clinica_id = dentistProfile.clinica_id ?? mutable.clinica_id
          mutable.filial_id = dentistProfile.filial_id ?? dentistProfile.matriz_id ?? mutable.filial_id
        }
      } else if (currentProfile) {
        if (currentProfile.role_extended === 'admin_clinica') {
          mutable.clinica_id = currentProfile.clinica_id ?? mutable.clinica_id
        }
        mutable.filial_id = currentProfile.filial_id ?? currentProfile.matriz_id ?? mutable.filial_id
      }

      // Normalize CPF to digits and max 11
      if (mutable.cpf) {
        const digits = String(mutable.cpf).replace(/\D/g, '')
        mutable.cpf = digits.slice(0, 11)
      }

      // Preflight duplicate (excluding current id)
      if (mutable.cpf) {
        const { data: existingByCpf } = await supabase
          .from('patients')
          .select('id')
          .eq('cpf', mutable.cpf)
          .neq('id', id)
          .limit(1)
          .maybeSingle()
        if (existingByCpf) {
          const e = new Error('CPF já cadastrado para outro paciente') as any
          e.code = '23505'
          throw e
        }
      }

      const updatePayload = {
        nome_completo: mutable.nome_completo,
        cpf: mutable.cpf || null,
        telefone_contato: mutable.telefone_contato || null,
        email_contato: mutable.email_contato || null,
        observacoes: mutable.observacoes ?? null,
        ativo: typeof mutable.ativo === 'undefined' ? true : mutable.ativo,
        dentist_id: mutable.dentist_id,
        clinica_id: mutable.clinica_id,
        filial_id: mutable.filial_id,
      }

      const { data, error } = await supabase
        .from('patients')
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
      toast({
        title: "Paciente atualizado",
        description: "Paciente atualizado com sucesso!",
      })
    },
    onError: (error: any) => {
      let description = 'Erro ao atualizar paciente.'
      if (error?.code === '22001' || /value too long/i.test(error?.message)) {
        description = 'CPF inválido: use 11 dígitos (somente números).'
      } else if (error?.code === '23505' || /duplicate/i.test(error?.message) || /já cadastrado/i.test(error?.message)) {
        description = 'CPF já cadastrado para outro paciente.'
      } else if (error?.code === '42501') {
        description = 'Sem permissão para atualizar: verifique se o paciente pertence à sua matriz/clínica.'
      } else if (error?.message) {
        description = error.message
      }
      toast({ title: 'Erro', description, variant: 'destructive' })
    },
  })
}

// Hook para buscar dentistas para o dropdown respeitando hierarquia por MATRIZ
export const useDentistsForPatients = () => {
  return useQuery({
    queryKey: ['dentists-for-patients'],
    queryFn: async () => {
      // Primeiro, verificar se o usuário atual é admin
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role, role_extended, matriz_id, filial_id, clinica_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      console.log('Current profile for dentists selection:', currentProfile)

      let query = supabase
        .from('profiles')
        .select('id, nome_completo, email, role_extended, matriz_id, clinica_id')

      // Se for admin_master, mostrar todos os perfis com role_extended = 'dentist'
      if (currentProfile?.role_extended === 'admin_master') {
        console.log('User is admin_master, fetching all dentists')
        query = query.eq('role_extended', 'dentist')
      } 
      // Se for admin_matriz (admin matriz), mostrar dentistas da sua matriz
      else if (currentProfile?.role_extended === 'admin_matriz' || currentProfile?.role_extended === 'admin_filial') {
        console.log('User is admin_matriz/admin_filial, fetching dentists from their matriz')
        if (currentProfile?.matriz_id || currentProfile?.filial_id) {
          // Buscar dentistas da mesma matriz (matriz_id)
          query = query
            .eq('role_extended', 'dentist')
            .eq('matriz_id', currentProfile.matriz_id ?? currentProfile.filial_id)
        } else {
          // Sem matriz definida, retornar vazio
          return []
        }
      }
      // Se for admin_clinica, mostrar dentistas da sua clínica (que estão na mesma matriz)
      else if (currentProfile?.role_extended === 'admin_clinica') {
        console.log('User is admin_clinica, fetching dentists from their clinica and matriz')
        if (currentProfile?.clinica_id && (currentProfile?.matriz_id || currentProfile?.filial_id)) {
          // Buscar dentistas da mesma matriz (matriz_id) 
          query = query
            .eq('role_extended', 'dentist')
            .eq('matriz_id', currentProfile.matriz_id ?? currentProfile.filial_id)
        } else {
          // Se não tem clinica_id ou matriz_id, retornar vazio
          return []
        }
      }
      // Se for dentist, mostrar apenas dentistas da mesma matriz
      else if (currentProfile?.role_extended === 'dentist') {
        console.log('User is dentist, fetching dentists from same matriz')
        if (currentProfile?.matriz_id) {
          // Buscar dentistas da mesma matriz
          query = query
            .eq('role_extended', 'dentist')
            .eq('matriz_id', currentProfile.matriz_id)
        } else {
          // Se não tem matriz_id, mostrar apenas ele mesmo
          query = query.eq('id', (await supabase.auth.getUser()).data.user?.id)
        }
      }
      // Se não for nenhum dos casos acima, retornar vazio
      else {
        return []
      }

      const { data, error } = await query.order('nome_completo', { ascending: true })

      if (error) {
        console.error('Error fetching dentists for patients:', error)
        throw error
      }

      console.log('Fetched dentists for patients:', data)
      return data
    },
  })
}