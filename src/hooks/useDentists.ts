import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Dentist {
  id: string
  name: string | null
  email: string | null
  role: 'admin' | 'dentist'
  created_at: string
  updated_at: string
  _count?: {
    orders: number
  }
}

export const useDentists = () => {
  return useQuery({
    queryKey: ['dentists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          created_at,
          updated_at
        `)
        .eq('role', 'dentist')
        .order('name', { ascending: true })

      if (error) throw error

      // Get order counts for each dentist
      const dentistsWithCounts = await Promise.all(
        data.map(async (dentist) => {
          const { count } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', dentist.id)

          return {
            ...dentist,
            _count: {
              orders: count || 0
            }
          }
        })
      )

      return dentistsWithCounts as Dentist[]
    },
  })
}

export const useDentistOrders = (dentistId: string) => {
  return useQuery({
    queryKey: ['dentist-orders', dentistId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          patients (
            name,
            cpf,
            phone,
            email
          ),
          order_images (
            id,
            image_url,
            annotations
          )
        `)
        .eq('user_id', dentistId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },
    enabled: !!dentistId,
  })
}