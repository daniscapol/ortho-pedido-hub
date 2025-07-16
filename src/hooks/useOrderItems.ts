import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface OrderItem {
  id: string;
  order_id: string;
  product_name: string;
  prosthesis_type: string;
  material?: string;
  color?: string;
  selected_teeth: string[];
  quantity: number;
  unit_price?: number;
  observations?: string;
  created_at: string;
  updated_at: string;
}

export type CreateOrderItem = Omit<OrderItem, 'id' | 'created_at' | 'updated_at'>;

export const useOrderItems = (orderId?: string) => {
  return useQuery({
    queryKey: ['order-items', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      
      const { data, error } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!orderId,
  });
};

export const useCreateOrderItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderItem: CreateOrderItem) => {
      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItem)
        .select()
        .single();

      if (error) throw error;
      return data as OrderItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order-items', data.order_id] });
      toast({
        title: "Item adicionado",
        description: "Item do pedido criado com sucesso",
      });
    },
  });
};

export const useUpdateOrderItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<OrderItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('order_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as OrderItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['order-items', data.order_id] });
      toast({
        title: "Item atualizado",
        description: "Item do pedido foi atualizado",
      });
    },
  });
};

export const useDeleteOrderItem = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-items'] });
      toast({
        title: "Item removido",
        description: "Item do pedido foi removido",
      });
    },
  });
};

export const useCreateOrderItems = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (orderItems: CreateOrderItem[]) => {
      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItems)
        .select();

      if (error) throw error;
      return data as OrderItem[];
    },
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['order-items', data[0].order_id] });
      }
      toast({
        title: "Itens criados",
        description: `${data.length} itens do pedido foram criados`,
      });
    },
  });
};