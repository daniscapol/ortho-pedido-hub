import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

export interface Order {
  id: string
  patient_id: string
  dentist: string
  prosthesis_type: string
  material?: string
  color?: string
  priority: string
  deadline: string
  observations?: string
  delivery_address?: string
  selected_teeth: string[]
  status: string
  created_at: string
  updated_at: string
  user_id: string
  patients?: {
    nome_completo: string
    cpf: string
    telefone_contato: string
    email_contato: string
  }
  order_images?: Array<{
    id: string
    image_url: string
    annotations?: any
  }>
}

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          patients (
            nome_completo,
            cpf,
            telefone_contato,
            email_contato
          ),
          order_images (
            id,
            image_url,
            annotations
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Order[]
    },
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'patients'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          user_id: user.id,
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({
        title: "Pedido criado",
        description: "Pedido criado com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar pedido: " + error.message,
        variant: "destructive",
      })
    },
  })
}

export const useCreateOrderForDentist = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'patients'> & { user_id?: string }) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('orders')
        .insert([{
          ...orderData,
          user_id: orderData.user_id || user.id, // Use provided user_id or fallback to current user
        }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({
        title: "Pedido criado",
        description: "Pedido criado com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao criar pedido: " + error.message,
        variant: "destructive",
      })
    },
  })
}

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      toast({
        title: "Status atualizado",
        description: "Status do pedido atualizado com sucesso!",
      })
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar status: " + error.message,
        variant: "destructive",
      })
    },
  })
}

export const useUniqueDentists = () => {
  return useQuery({
    queryKey: ['unique-dentists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('dentist')
        .not('dentist', 'is', null)
        .order('dentist')

      if (error) throw error
      
      // Filtrar valores únicos
      const uniqueDentists = [...new Set(data.map(order => order.dentist).filter(Boolean))]
      return uniqueDentists
    },
  })
}

interface AdminOrdersFilters {
  searchTerm?: string;
  statusFilter?: string;
  priorityFilter?: string;
  dentistFilter?: string;
  dateFilter?: string;
}

export const useOrdersForAdmin = (page: number = 1, limit: number = 50, filters?: AdminOrdersFilters) => {
  return useQuery({
    queryKey: ['admin-orders', page, limit, filters],
    queryFn: async () => {
      const start = (page - 1) * limit
      const end = start + limit - 1

      let query = supabase
        .from('orders')
        .select(`
          *,
          patients (
            nome_completo,
            cpf,
            telefone_contato,
            email_contato
          ),
          order_images (
            id,
            image_url,
            annotations
          )
        `, { count: 'exact' })

      // Aplicar filtros básicos
      if (filters?.statusFilter && filters.statusFilter !== 'all') {
        query = query.eq('status', filters.statusFilter)
      }

      if (filters?.priorityFilter && filters.priorityFilter !== 'all') {
        query = query.eq('priority', filters.priorityFilter)
      }

      if (filters?.dentistFilter && filters.dentistFilter !== 'all') {
        query = query.eq('dentist', filters.dentistFilter)
      }

      if (filters?.dateFilter && filters.dateFilter !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (filters.dateFilter) {
          case 'today':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
            query = query.gte('created_at', startDate.toISOString())
            break
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            query = query.gte('created_at', startDate.toISOString())
            break
          case 'month':
            startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            query = query.gte('created_at', startDate.toISOString())
            break
        }
      }

      // Para busca por texto, primeiro tentamos nos campos diretos
      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        console.log('🔍 Termo de busca:', term)
        // Busca apenas nos campos diretos da tabela orders (PostgREST não suporta OR em relacionamentos)
        query = query.or(`id.ilike.%${term}%,dentist.ilike.%${term}%`)
        console.log('🔍 Query direta criada')
      }

      const { data, error, count } = await query
        .range(start, end)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      let orders = data as Order[]
      let totalCount = count || 0

      console.log('🔍 Primeira busca (diretos):', orders.length, 'pedidos encontrados')
      
      // Debug: mostrar alguns pedidos para entender a estrutura
      if (orders.length > 0) {
        console.log('🔍 Exemplo de pedido encontrado:', {
          id: orders[0].id,
          patients: orders[0].patients,
          patient_name: orders[0].patients?.nome_completo
        });
      }

      // Se há termo de busca, SEMPRE fazer busca por paciente também
      if (filters?.searchTerm) {
        const term = filters.searchTerm.toLowerCase()
        console.log('🔍 Fazendo busca por paciente com termo:', term)
        
        try {
          // Segunda query para buscar por nome do paciente
          let patientQuery = supabase
            .from('orders')
            .select(`
              *,
              patients!inner (
                nome_completo,
                cpf,
                telefone_contato,
                email_contato
              ),
              order_images (
                id,
                image_url,
                annotations
              )
            `, { count: 'exact' })
            .ilike('patients.nome_completo', `%${term}%`)

          console.log('🔍 Query de paciente criada para termo:', term)

          // Aplicar os mesmos filtros básicos da primeira query
          if (filters?.statusFilter && filters.statusFilter !== 'all') {
            patientQuery = patientQuery.eq('status', filters.statusFilter)
            console.log('🔍 Filtro status aplicado:', filters.statusFilter)
          }

          if (filters?.priorityFilter && filters.priorityFilter !== 'all') {
            patientQuery = patientQuery.eq('priority', filters.priorityFilter)
            console.log('🔍 Filtro prioridade aplicado:', filters.priorityFilter)
          }

          if (filters?.dentistFilter && filters.dentistFilter !== 'all') {
            patientQuery = patientQuery.eq('dentist', filters.dentistFilter)
            console.log('🔍 Filtro dentista aplicado:', filters.dentistFilter)
          }

          if (filters?.dateFilter && filters.dateFilter !== 'all') {
            const now = new Date()
            let startDate: Date

            switch (filters.dateFilter) {
              case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
                patientQuery = patientQuery.gte('created_at', startDate.toISOString())
                break
              case 'week':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                patientQuery = patientQuery.gte('created_at', startDate.toISOString())
                break
              case 'month':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                patientQuery = patientQuery.gte('created_at', startDate.toISOString())
                break
            }
            console.log('🔍 Filtro data aplicado:', filters.dateFilter)
          }

          console.log('🔍 Executando busca por paciente...')
          const { data: patientOrders, count: patientCount, error: patientError } = await patientQuery
            .order('created_at', { ascending: false })

          if (patientError) {
            console.error('❌ Erro na query de paciente:', patientError)
            throw patientError
          }

          console.log('🔍 Segunda busca (pacientes):', patientOrders?.length || 0, 'pedidos encontrados')
          console.log('🔍 Count pacientes:', patientCount)

          // Combinar resultados removendo duplicatas pelo ID
          const allOrders = [...orders, ...(patientOrders || [])];
          const uniqueOrdersMap = new Map();
          
          allOrders.forEach(order => {
            uniqueOrdersMap.set(order.id, order);
          });
          
          const uniqueOrders = Array.from(uniqueOrdersMap.values());
          
          console.log('🔍 Total único após combinação:', uniqueOrders.length, 'pedidos')
          
          // Reordenar por data de criação
          uniqueOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          
          // Aplicar paginação ao resultado combinado
          orders = uniqueOrders.slice(start, start + limit);
          totalCount = uniqueOrders.length; // Total real dos resultados combinados
          
          console.log('🔍 Resultado final paginado:', orders.length, 'pedidos (de', totalCount, 'total)')
        } catch (patientError) {
          console.error('❌ Erro na busca por paciente:', patientError);
          // Em caso de erro, manter apenas os resultados diretos
        }
      }
      
      return { 
        orders, 
        totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    },
  })
}

export const usePatientOrders = (patientId?: string) => {
  return useQuery({
    queryKey: ['patient-orders', patientId],
    queryFn: async () => {
      if (!patientId) return []
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          patients (
            nome_completo,
            cpf,
            telefone_contato,
            email_contato
          ),
          order_images (
            id,
            image_url,
            annotations
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Order[]
    },
    enabled: !!patientId,
  })
}