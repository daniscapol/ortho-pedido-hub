import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface DentistProfile {
  email: string
  telefone: string
  nome_completo: string
}

export const useDentistProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['dentist-profile', userId],
    queryFn: async () => {
      if (!userId) return null
      
      const { data, error } = await supabase
        .from('profiles')
        .select('email, telefone, nome_completo')
        .eq('id', userId)
        .single()

      if (error) throw error
      return data as DentistProfile
    },
    enabled: !!userId,
  })
}