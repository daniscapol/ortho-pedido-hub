import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts, useMateriais, type CompatibilidadeProductMaterialCor, type CreateCompatibilidade } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CompatibilidadeFormProps {
  compatibilidade?: CompatibilidadeProductMaterialCor;
  onSuccess: () => void;
}

export function CompatibilidadeForm({ compatibilidade, onSuccess }: CompatibilidadeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const { data: materials } = useMateriais();
  const isEditing = !!compatibilidade;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateCompatibilidade & { materiais_selected: number[] }>({
    defaultValues: {
      id_produto: compatibilidade?.id_produto || 0,
      materiais_compativeis: compatibilidade?.materiais_compativeis || [],
      cores_compativeis: compatibilidade?.cores_compativeis || "",
      materiais_selected: compatibilidade?.materiais_compativeis || [],
    },
  });

  const createCompatibilidade = useMutation({
    mutationFn: async (data: CreateCompatibilidade) => {
      const { data: result, error } = await supabase
        .from('compatibilidade_produto_material_cor')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compatibilidade'] });
      toast({
        title: "Compatibilidade criada",
        description: "Compatibilidade criada com sucesso",
      });
    },
  });

  const updateCompatibilidade = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CompatibilidadeProductMaterialCor> & { id: number }) => {
      const { data, error } = await supabase
        .from('compatibilidade_produto_material_cor')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compatibilidade'] });
      toast({
        title: "Compatibilidade atualizada",
        description: "Compatibilidade atualizada com sucesso",
      });
    },
  });

  const onSubmit = async (data: CreateCompatibilidade & { materiais_selected: number[] }) => {
    try {
      const submitData = {
        id_produto: data.id_produto,
        materiais_compativeis: data.materiais_selected,
        cores_compativeis: data.cores_compativeis,
      };

      if (isEditing) {
        await updateCompatibilidade.mutateAsync({ id: compatibilidade.id, ...submitData });
      } else {
        await createCompatibilidade.mutateAsync(submitData);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar compatibilidade:", error);
    }
  };

  const watchedMaterials = watch("materiais_selected") || [];

  const handleMaterialToggle = (materialId: number, checked: boolean) => {
    const current = watchedMaterials;
    if (checked) {
      setValue("materiais_selected", [...current, materialId]);
    } else {
      setValue("materiais_selected", current.filter(id => id !== materialId));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="id_produto">Produto</Label>
        <Select 
          value={watch("id_produto")?.toString()} 
          onValueChange={(value) => setValue("id_produto", Number(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um produto" />
          </SelectTrigger>
          <SelectContent>
            {products?.map((product) => (
              <SelectItem key={product.id} value={product.id.toString()}>
                {product.nome_produto}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.id_produto && (
          <p className="text-sm text-destructive">Produto é obrigatório</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Materiais Compatíveis</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-4">
          {materials?.map((material) => (
            <div key={material.id} className="flex items-center space-x-2">
              <Checkbox
                id={`material-${material.id}`}
                checked={watchedMaterials.includes(material.id)}
                onCheckedChange={(checked) => handleMaterialToggle(material.id, checked as boolean)}
              />
              <Label 
                htmlFor={`material-${material.id}`} 
                className="text-sm font-normal cursor-pointer"
              >
                {material.nome_material}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cores_compativeis">Cores Compatíveis</Label>
        <Input
          id="cores_compativeis"
          {...register("cores_compativeis", { required: "Cores compatíveis é obrigatório" })}
          placeholder="Ex: 1-26, NA"
        />
        <p className="text-xs text-muted-foreground">
          Use "1-26" para faixa de cores ou "NA" se não usa cor
        </p>
        {errors.cores_compativeis && (
          <p className="text-sm text-destructive">{errors.cores_compativeis.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={createCompatibilidade.isPending || updateCompatibilidade.isPending}
      >
        {createCompatibilidade.isPending || updateCompatibilidade.isPending 
          ? "Salvando..." 
          : isEditing 
            ? "Atualizar Compatibilidade" 
            : "Criar Compatibilidade"
        }
      </Button>
    </form>
  );
}