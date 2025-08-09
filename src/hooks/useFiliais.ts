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
      console.log("🔍 Fetching filiais...");
      
      // Using direct SELECT to respect RLS; do not use RPC here
      
      // Fallback to original approach
      const { data, error } = await supabase
        .from("filiais")
        .select("*")
        .order("nome_completo");
      
      if (error) {
        console.error("❌ Error fetching basic filiais:", error);
        throw error;
      }
      
      console.log("✅ Filiais data received (fallback):", data);
      
      // Para cada filial, contar quantas clínicas e pacientes estão associados
      const filiaisWithCount = await Promise.all(
        data.map(async (filial) => {
          try {
            // Contar clínicas da filial
            const { data: clinicas, error: clinicasError } = await supabase
              .from("clinicas")
              .select("id")
              .eq("filial_id", filial.id);
            
            if (clinicasError) {
              console.error("Error fetching clinicas:", clinicasError);
              return { ...filial, qntd_clinicas: 0, qntd_pacientes: 0 };
            }
            
            // Contar pacientes das clínicas desta filial
            const clinicaIds = clinicas?.map(c => c.id) || [];
            let pacientesCount = 0;
            
            if (clinicaIds.length > 0) {
              const { data: pacientes, error: pacientesError } = await supabase
                .from("patients")
                .select("id")
                .in("clinica_id", clinicaIds);
              
              if (pacientesError) {
                console.error("Error fetching pacientes:", pacientesError);
              } else {
                pacientesCount = pacientes?.length || 0;
              }
            }
            
            return {
              ...filial,
              qntd_clinicas: clinicas?.length || 0,
              qntd_pacientes: pacientesCount
            };
          } catch (err) {
            console.error("Error processing filial:", err);
            return { ...filial, qntd_clinicas: 0, qntd_pacientes: 0 };
          }
        })
      );
      
      console.log("✅ Filiais with counts (fallback):", filiaisWithCount);
      return filiaisWithCount;
    },
  });
};

export const useCreateFilial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (filial: { nome_completo: string; endereco: string; telefone: string; email: string; ativo?: boolean; cnpj?: string; cep?: string; cidade?: string; estado?: string; numero?: string; complemento?: string }) => {
      const { data, error } = await supabase.functions.invoke('admin-create-filial', {
        body: filial,
      })
      if (error) throw error
      return (data as any)?.filial
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