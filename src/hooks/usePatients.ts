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

// Hook para buscar dentistas para o dropdown
export const useDentistsForPatients = () => {
  return useQuery({
    queryKey: ['dentists-for-patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, nome_completo, email')
        .eq('role', 'dentist')
        .order('nome_completo')

      if (error) throw error
      return data
    },
  })
}