import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Cor, type CreateCor } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CorFormProps {
  cor?: Cor;
  onSuccess: () => void;
}

export function CorForm({ cor, onSuccess }: CorFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!cor;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCor>({
    defaultValues: {
      codigo_cor: cor?.codigo_cor || "",
      nome_cor: cor?.nome_cor || "",
      escala: cor?.escala || "",
      grupo: cor?.grupo || "",
    },
  });

  const createCor = useMutation({
    mutationFn: async (data: CreateCor) => {
      const { data: result, error } = await supabase
        .from('cores')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cores'] });
      toast({
        title: "Cor criada",
        description: "Cor criada com sucesso",
      });
    },
  });

  const updateCor = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cor> & { id: number }) => {
      const { data, error } = await supabase
        .from('cores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cores'] });
      toast({
        title: "Cor atualizada",
        description: "Cor atualizada com sucesso",
      });
    },
  });

  const onSubmit = async (data: CreateCor) => {
    try {
      if (isEditing) {
        await updateCor.mutateAsync({ id: cor.id, ...data });
      } else {
        await createCor.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar cor:", error);
    }
  };

  const escalas = [
    "VITA Classical",
    "Biolux",
    "Bleach",
    "VITA 3D-Master"
  ];

  const grupos = [
    "A", "B", "C", "D"
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo_cor">Código da Cor</Label>
          <Input
            id="codigo_cor"
            {...register("codigo_cor", { required: "Código é obrigatório" })}
            placeholder="Ex: A1, BL1, 60"
          />
          {errors.codigo_cor && (
            <p className="text-sm text-destructive">{errors.codigo_cor.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="nome_cor">Nome da Cor</Label>
          <Input
            id="nome_cor"
            {...register("nome_cor", { required: "Nome é obrigatório" })}
            placeholder="Ex: A1, Bleach 1"
          />
          {errors.nome_cor && (
            <p className="text-sm text-destructive">{errors.nome_cor.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="escala">Escala</Label>
          <Select 
            value={watch("escala")} 
            onValueChange={(value) => setValue("escala", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma escala" />
            </SelectTrigger>
            <SelectContent>
              {escalas.map((escala) => (
                <SelectItem key={escala} value={escala}>
                  {escala}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="grupo">Grupo</Label>
          <Select 
            value={watch("grupo")} 
            onValueChange={(value) => setValue("grupo", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {grupos.map((grupo) => (
                <SelectItem key={grupo} value={grupo}>
                  {grupo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={createCor.isPending || updateCor.isPending}
      >
        {createCor.isPending || updateCor.isPending 
          ? "Salvando..." 
          : isEditing 
            ? "Atualizar Cor" 
            : "Criar Cor"
        }
      </Button>
    </form>
  );
}