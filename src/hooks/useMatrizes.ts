import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface Matriz {
  id: string;
  nome_completo: string;
  endereco: string;
  telefone: string;
  email: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  qntd_clinicas?: number;
  qntd_pacientes?: number;
}

export const useMatrizes = () => {
  return useQuery({
    queryKey: ["matrizes"],
    queryFn: async () => {
      console.log("🔍 Fetching matrizes (via RPC)...");

      const { data, error } = await supabase.rpc('get_matrizes_with_counts');

      if (error) {
        console.error("❌ Error fetching matrizes:", error);
        throw error;
      }

      return (data || []).map((f: any) => ({
        ...f,
        qntd_clinicas: Number(f.qntd_clinicas ?? 0),
        qntd_pacientes: Number(f.qntd_pacientes ?? 0),
      }));
    },
  });
};

export const useCreateMatriz = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (matriz: { nome_completo: string; endereco: string; telefone: string; email: string; ativo?: boolean; cnpj?: string; cep?: string; cidade?: string; estado?: string; numero?: string; complemento?: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-create-matriz', {
        body: matriz,
      })
      if (error) throw error
      return (data as any)?.matriz
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrizes"] });
      toast({
        title: "Matriz criada",
        description: "A matriz foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar matriz",
        description: (error as any)?.message ?? "Erro inesperado",
        variant: "destructive",
      });
    },
  });
};

export const useUpdateMatriz = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Matriz> & { id: string }) => {
      // Remove calculated fields that don't exist in the matrizes table
      const { qntd_clinicas, qntd_pacientes, ...dbUpdates } = updates;
      
      const { data, error } = await supabase
        .from("matrizes")
        .update(dbUpdates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrizes"] });
      toast({
        title: "Matriz atualizada",
        description: "A matriz foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar matriz",
        description: (error as any)?.message ?? "Erro inesperado",
        variant: "destructive",
      });
    },
  });
};

export const useDeleteMatriz = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("matrizes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matrizes"] });
      toast({
        title: "Matriz removida",
        description: "A matriz foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover matriz",
        description: (error as any)?.message ?? "Erro inesperado",
        variant: "destructive",
      });
    },
  });
};