import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface Clinica {
  id: string;
  nome_completo: string;
  cnpj: string;
  endereco?: string;
  telefone: string;
  email: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
  ativo: boolean;
  filial_id?: string;
  created_at: string;
  updated_at: string;
  qntd_dentistas?: number;
  qntd_pacientes?: number;
  filial?: {
    nome_completo: string;
  };
}

export const useClinicas = () => {
  return useQuery({
    queryKey: ["clinicas"],
    queryFn: async () => {
      console.log("🔍 Fetching clinicas...");
      
      const { data, error } = await supabase
        .from("clinicas")
        .select(`
          *,
          filial:filiais(nome_completo)
        `)
        .order("nome_completo");
      
      if (error) {
        console.error("❌ Error fetching clinicas:", error);
        throw error;
      }
      
      console.log("✅ Clinicas data received:", data);
      
      // Para cada clínica, contar quantos dentistas e pacientes estão associados
      const clinicasWithCount = await Promise.all(
        data.map(async (clinica) => {
          try {
            // Contar dentistas da clínica
            const { data: dentistas, error: dentistasError } = await supabase
              .from("profiles")
              .select("id")
              .eq("clinica_id", clinica.id)
              .eq("role_extended", "dentist");
            
            if (dentistasError) {
              console.error("Error fetching dentistas:", dentistasError);
            }
            
            // Contar pacientes da clínica
            const { data: pacientes, error: pacientesError } = await supabase
              .from("patients")
              .select("id")
              .eq("clinica_id", clinica.id);
            
            if (pacientesError) {
              console.error("Error fetching pacientes:", pacientesError);
            }
            
            return {
              ...clinica,
              qntd_dentistas: dentistas?.length || 0,
              qntd_pacientes: pacientes?.length || 0
            };
          } catch (err) {
            console.error("Error processing clinica:", err);
            return {
              ...clinica,
              qntd_dentistas: 0,
              qntd_pacientes: 0
            };
          }
        })
      );
      
      console.log("✅ Clinicas with counts:", clinicasWithCount);
      return clinicasWithCount;
    },
  });
};

export const useCreateClinica = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (clinica: { 
      nome_completo: string; 
      cnpj: string;
      endereco?: string;
      telefone: string; 
      email: string; 
      filial_id?: string;
      cep?: string;
      cidade?: string;
      estado?: string;
      numero?: string;
      complemento?: string;
      ativo?: boolean 
    }) => {
      const { data, error } = await supabase
        .from("clinicas")
        .insert([clinica])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicas"] });
      toast({
        title: "Clínica criada",
        description: "A clínica foi criada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar clínica",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateClinica = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Clinica> & { id: string }) => {
      const { data, error } = await supabase
        .from("clinicas")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicas"] });
      toast({
        title: "Clínica atualizada",
        description: "A clínica foi atualizada com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar clínica",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteClinica = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clinicas")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clinicas"] });
      toast({
        title: "Clínica removida",
        description: "A clínica foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover clínica",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};