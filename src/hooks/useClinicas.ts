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

      // Try optimized RPC first
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_clinicas_with_counts');

      if (!rpcError && rpcData) {
        console.log("✅ Clinicas data received (RPC):", rpcData);
        // Map RPC response to expected shape
        return rpcData.map((c: any) => ({
          id: c.id,
          nome_completo: c.nome_completo,
          cnpj: c.cnpj,
          endereco: c.endereco,
          telefone: c.telefone,
          email: c.email,
          cep: c.cep,
          cidade: c.cidade,
          estado: c.estado,
          numero: c.numero,
          complemento: c.complemento,
          ativo: c.ativo,
          filial_id: c.filial_id,
          created_at: c.created_at,
          updated_at: c.updated_at,
          qntd_dentistas: Number(c.qntd_dentistas) || 0,
          qntd_pacientes: Number(c.qntd_pacientes) || 0,
          filial: { nome_completo: c.filial_nome || null }
        }));
      }

      console.warn("⚠️ RPC failed, falling back to manual approach:", rpcError);

      // Fallback to manual approach without implicit FK relationship
      const { data, error } = await supabase
        .from("clinicas")
        .select("*")
        .order("nome_completo");

      if (error) {
        console.error("❌ Error fetching clinicas:", error);
        throw error;
      }

      console.log("✅ Clinicas data received:", data);

      const clinicasWithExtras = await Promise.all(
        data.map(async (clinica) => {
          try {
            // Fetch filial name
            let filialNome: string | null = null;
            if (clinica.filial_id) {
              const { data: filialRow, error: filialError } = await supabase
                .from('filiais')
                .select('nome_completo')
                .eq('id', clinica.filial_id)
                .maybeSingle();
              if (!filialError) filialNome = filialRow?.nome_completo ?? null;
            }

            // Count dentists
            const { data: dentistas, error: dentistasError } = await supabase
              .from("profiles")
              .select("id")
              .eq("clinica_id", clinica.id)
              .eq("role_extended", "dentist");
            if (dentistasError) console.error("Error fetching dentistas:", dentistasError);

            // Count patients
            const { data: pacientes, error: pacientesError } = await supabase
              .from("patients")
              .select("id")
              .eq("clinica_id", clinica.id);
            if (pacientesError) console.error("Error fetching pacientes:", pacientesError);

            return {
              ...clinica,
              qntd_dentistas: dentistas?.length || 0,
              qntd_pacientes: pacientes?.length || 0,
              filial: { nome_completo: filialNome }
            };
          } catch (err) {
            console.error("Error processing clinica:", err);
            return {
              ...clinica,
              qntd_dentistas: 0,
              qntd_pacientes: 0,
              filial: { nome_completo: null }
            };
          }
        })
      );

      console.log("✅ Clinicas with counts (fallback):", clinicasWithExtras);
      return clinicasWithExtras;
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