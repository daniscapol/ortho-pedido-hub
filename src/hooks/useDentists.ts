import { useQuery, useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export interface Dentist {
  id: string
  name: string | null
  nome_completo?: string | null
  email: string | null
  role: 'admin' | 'dentist'
  role_extended?: string
  cro?: string | null
  cpf?: string | null
  telefone?: string | null
  endereco?: string | null
  cep?: string | null
  cidade?: string | null
  estado?: string | null
  numero?: string | null
  complemento?: string | null
  clinica_id?: string | null
  matriz_id?: string | null
  ativo?: boolean
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
          nome_completo,
          email,
          role,
          role_extended,
          cro,
          cpf,
          telefone,
          endereco,
          cep,
          cidade,
          estado,
          numero,
          complemento,
          clinica_id,
          matriz_id,
          ativo,
          created_at,
          updated_at
        `)

      // Se for admin_master, mostrar todos os perfis com role_extended = 'dentist' + ele mesmo
      if (currentProfile?.role_extended === 'admin_master') {
        console.log('User is admin_master, fetching all dentists + admin master')
        
        // Buscar todos os dentistas
        const { data: dentists, error: dentistsError } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            nome_completo,
            email,
            role,
            role_extended,
            cro,
            cpf,
            telefone,
            endereco,
            cep,
            cidade,
            estado,
            numero,
            complemento,
            clinica_id,
            matriz_id,
            ativo,
            created_at,
            updated_at
          `)
          .eq('role_extended', 'dentist')
          .order('name', { ascending: true })

        if (dentistsError) throw dentistsError

        // Buscar o próprio admin master
        const { data: adminMaster, error: adminError } = await supabase
          .from('profiles')
          .select(`
            id,
            name,
            nome_completo,
            email,
            role,
            role_extended,
            cro,
            cpf,
            telefone,
            endereco,
            cep,
            cidade,
            estado,
            numero,
            complemento,
            clinica_id,
            matriz_id,
            ativo,
            created_at,
            updated_at
          `)
          .eq('id', (await supabase.auth.getUser()).data.user?.id)
          .single()

        if (adminError) throw adminError

        // Combinar admin master + dentistas, colocando admin master no início
        const allDentists = adminMaster ? [adminMaster, ...dentists] : dentists
        
        // Get order counts for each dentist
        const dentistsWithCounts = await Promise.all(
          allDentists.map(async (dentist) => {
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

        console.log('Fetched dentists with admin master:', dentistsWithCounts)
        return dentistsWithCounts as Dentist[]
      }
       // Se for admin_matriz (admin matriz), mostrar dentistas da sua matriz
       else if (currentProfile?.role_extended === 'admin_matriz') {
         console.log('User is admin_matriz, fetching dentists from their matriz')
         // Buscar dentistas que pertencem a clínicas da sua matriz
         const { data: userProfile } = await supabase
           .from('profiles')
           .select('matriz_id')
           .eq('id', (await supabase.auth.getUser()).data.user?.id)
           .single()
         
         if (userProfile?.matriz_id) {
           query = query
             .eq('role_extended', 'dentist')
             .eq('matriz_id', userProfile.matriz_id)
         } else {
           // Se não tem matriz_id, não mostra nenhum dentista
           query = query.eq('id', 'never-match')
         }
       }
       // Se for admin_clinica, mostrar dentistas da sua clínica
       else if (currentProfile?.role_extended === 'admin_clinica') {
         console.log('User is admin_clinica, fetching dentists from their clinica')
         const { data: userProfile } = await supabase
           .from('profiles')
           .select('clinica_id')
           .eq('id', (await supabase.auth.getUser()).data.user?.id)
           .single()
         
         if (userProfile?.clinica_id) {
           query = query
             .eq('role_extended', 'dentist')
             .eq('clinica_id', userProfile.clinica_id)
         } else {
           // Se não tem clinica_id, não mostra nenhum dentista
           query = query.eq('id', 'never-match')
         }
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

export const useUpdateDentist = () => {
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Dentist> & { id: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-update-dentist', {
        body: {
          dentist_id: id,
          ...updates
        }
      })
      if (error) throw error
      return data
    }
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