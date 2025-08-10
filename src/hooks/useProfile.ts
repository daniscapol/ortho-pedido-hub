import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/AuthProvider'

export interface Profile {
  id: string
  role: 'admin' | 'dentist'
  role_extended?: 'admin_master' | 'admin_clinica' | 'admin_matriz' | 'dentist'
  name: string | null
  email: string | null
  created_at: string
  updated_at: string
  clinica_id?: string | null
  matriz_id?: string | null
}

export const useProfile = () => {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      return data as Profile
    },
    enabled: !!user,
  })
}