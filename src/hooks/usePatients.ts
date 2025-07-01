import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface Patient {
  id: string
  name: string
  cpf: string
  phone: string
  email: string
  created_at: string
  updated_at: string
}

export const usePatients = (searchTerm?: string) => {
  return useQuery({
    queryKey: ['patients', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('patients')
        .select('*')
        .order('name')

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,cpf.ilike.%${searchTerm}%`)
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
    mutationFn: async (patientData: Omit<Patient, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
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