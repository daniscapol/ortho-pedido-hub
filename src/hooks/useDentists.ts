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
      // Primeiro, verificar se o usuário atual é admin
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('role, role_extended')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single()

      console.log('Current profile:', currentProfile)

      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          role,
          role_extended,
          created_at,
          updated_at
        `)

      // Se for admin_master, mostrar todos os perfis com role_extended = 'dentist'
      if (currentProfile?.role_extended === 'admin_master') {
        console.log('User is admin_master, fetching all dentists')
        query = query.eq('role_extended', 'dentist')
      } 
      // Se for admin de clínica ou matriz, mostrar dentistas da hierarquia
      else if (currentProfile?.role === 'admin') {
        console.log('User is admin, fetching dentists')
        query = query.eq('role', 'dentist')
      }
      // Se não for admin, mostrar apenas o próprio perfil
      else {
        console.log('User is not admin, fetching own profile')
        query = query.eq('id', (await supabase.auth.getUser()).data.user?.id)
      }

      const { data, error } = await query.order('name', { ascending: true })

      if (error) {
        console.error('Error fetching dentists:', error)
        throw error
      }

      console.log('Fetched dentists:', data)

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