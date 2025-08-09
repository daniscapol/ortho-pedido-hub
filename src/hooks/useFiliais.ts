import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface Filial {
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

export const useFiliais = () => {
  return useQuery({
    queryKey: ["filiais"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("filiais")
        .select("*")
        .order("nome_completo");
      
      if (error) throw error;
      
      // Para cada filial, contar quantas clínicas e pacientes estão associados
      const filiaisWithCount = await Promise.all(
        data.map(async (filial) => {
          // Contar clínicas da filial
          const { data: clinicas } = await supabase
            .from("clinicas")
            .select("id")
            .eq("filial_id", filial.id);
          
          // Contar pacientes das clínicas desta filial
          const { data: pacientes } = await supabase
            .from("patients")
            .select("id")
            .in("clinica_id", clinicas?.map(c => c.id) || []);
          
          return {
            ...filial,
            qntd_clinicas: clinicas?.length || 0,
            qntd_pacientes: pacientes?.length || 0
          };
        })
      );
      
      return filiaisWithCount;
    },
  });
};

export const useCreateFilial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (filial: { nome_completo: string; endereco: string; telefone: string; email: string; ativo?: boolean }) => {
      const { data, error } = await supabase
        .from("filiais")
        .insert([filial])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filiais"] });
      toast({
        title: "Filial criada",
        description: "A filial foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar filial",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateFilial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Filial> & { id: string }) => {
      const { data, error } = await supabase
        .from("filiais")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filiais"] });
      toast({
        title: "Filial atualizada",
        description: "A filial foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar filial",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteFilial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("filiais")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["filiais"] });
      toast({
        title: "Filial removida",
        description: "A filial foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover filial",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};