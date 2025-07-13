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
    name: string
    cpf: string
    phone: string
    email: string
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

export const useOrdersForAdmin = () => {
  return useQuery({
    queryKey: ['admin-orders'],
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
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Order[]
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
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as Order[]
    },
    enabled: !!patientId,
  })
}