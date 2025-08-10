import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface Patient {
  id: string
  nome_completo: string
  cpf: string
  telefone_contato: string
  email_contato: string
  dentist_id?: string
  clinica_id?: string
  filial_id?: string
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
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select(`
          *,
          dentist:dentist_id (
            id,
            nome_completo,
            email
          )
        `)
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
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar paciente: " + error.message,
        variant: "destructive",
      })
    },
  })
}

export const useUpdatePatient = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, ...patientData }: { id: string } & Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'dentist'>) => {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', id)
        .select(`
          *,
          dentist:dentist_id (
            id,
            nome_completo,
            email
          )
        `)
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
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar paciente: " + error.message,
        variant: "destructive",
      })
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
        .select('role, role_extended, filial_id, clinica_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      console.log('Current profile for dentists selection:', currentProfile)

      let query = supabase
        .from('profiles')
        .select('id, nome_completo, email, role_extended, filial_id, clinica_id')

      // Se for admin_master, mostrar todos os perfis com role_extended = 'dentist'
      if (currentProfile?.role_extended === 'admin_master') {
        console.log('User is admin_master, fetching all dentists')
        query = query.eq('role_extended', 'dentist')
      } 
      // Se for admin_filial (admin matriz), mostrar dentistas da sua matriz
      else if (currentProfile?.role_extended === 'admin_filial') {
        console.log('User is admin_filial, fetching dentists from their matriz')
        if (currentProfile?.filial_id) {
          // Buscar dentistas que pertencem a clínicas da sua matriz
          query = query
            .eq('role_extended', 'dentist')
            .eq('filial_id', currentProfile.filial_id)
        } else {
          // Se não tem filial_id, não mostra nenhum dentista
          query = query.eq('id', 'never-match')
        }
      }
      // Se for admin_clinica, mostrar dentistas da sua clínica (que estão na mesma matriz)
      else if (currentProfile?.role_extended === 'admin_clinica') {
        console.log('User is admin_clinica, fetching dentists from their clinica and matriz')
        if (currentProfile?.clinica_id && currentProfile?.filial_id) {
          // Buscar dentistas da mesma matriz (filial_id) 
          query = query
            .eq('role_extended', 'dentist')
            .eq('filial_id', currentProfile.filial_id)
        } else {
          // Se não tem clinica_id ou filial_id, não mostra nenhum dentista
          query = query.eq('id', 'never-match')
        }
      }
      // Se for dentist, mostrar apenas dentistas da mesma matriz
      else if (currentProfile?.role_extended === 'dentist') {
        console.log('User is dentist, fetching dentists from same matriz')
        if (currentProfile?.filial_id) {
          // Buscar dentistas da mesma matriz
          query = query
            .eq('role_extended', 'dentist')
            .eq('filial_id', currentProfile.filial_id)
        } else {
          // Se não tem filial_id, mostrar apenas ele mesmo
          query = query.eq('id', (await supabase.auth.getUser()).data.user?.id)
        }
      }
      // Se não for nenhum dos casos acima, não mostrar nenhum dentista
      else {
        query = query.eq('id', 'never-match')
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