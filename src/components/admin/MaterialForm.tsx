import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts, type Material, type CreateMaterial } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface MaterialFormProps {
  material?: Material;
  onSuccess: () => void;
}

export function MaterialForm({ material, onSuccess }: MaterialFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const isEditing = !!material;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateMaterial & { compativel_produtos_selected: number[] }>({
    defaultValues: {
      nome_material: material?.nome_material || "",
      tipo_material: material?.tipo_material || "",
      compativel_produtos: material?.compativel_produtos || [],
      compativel_produtos_selected: material?.compativel_produtos || [],
    },
  });

  const createMaterial = useMutation({
    mutationFn: async (data: CreateMaterial) => {
      const { data: result, error } = await supabase
        .from('materiais')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais'] });
      toast({
        title: "Material criado",
        description: "Material criado com sucesso",
      });
    },
  });

  const updateMaterial = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Material> & { id: number }) => {
      const { data, error } = await supabase
        .from('materiais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais'] });
      toast({
        title: "Material atualizado",
        description: "Material atualizado com sucesso",
      });
    },
  });

  const onSubmit = async (data: CreateMaterial & { compativel_produtos_selected: number[] }) => {
    try {
      const submitData = {
        nome_material: data.nome_material,
        tipo_material: data.tipo_material,
        compativel_produtos: data.compativel_produtos_selected,
      };

      if (isEditing) {
        await updateMaterial.mutateAsync({ id: material.id, ...submitData });
      } else {
        await createMaterial.mutateAsync(submitData);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar material:", error);
    }
  };

  const watchedProducts = watch("compativel_produtos_selected") || [];

  const handleProductToggle = (productId: number, checked: boolean) => {
    const current = watchedProducts;
    if (checked) {
      setValue("compativel_produtos_selected", [...current, productId]);
    } else {
      setValue("compativel_produtos_selected", current.filter(id => id !== productId));
    }
  };

  const tiposMaterial = [
    "Cerâmica",
    "Polímero",
    "Metal",
    "Outros"
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome_material">Nome do Material</Label>
          <Input
            id="nome_material"
            {...register("nome_material", { required: "Nome é obrigatório" })}
          />
          {errors.nome_material && (
            <p className="text-sm text-destructive">{errors.nome_material.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipo_material">Tipo de Material</Label>
          <Select 
            value={watch("tipo_material")} 
            onValueChange={(value) => setValue("tipo_material", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um tipo" />
            </SelectTrigger>
            <SelectContent>
              {tiposMaterial.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.tipo_material && (
            <p className="text-sm text-destructive">{errors.tipo_material.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Produtos Compatíveis</Label>
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded p-4">
          {products?.map((product) => (
            <div key={product.id} className="flex items-center space-x-2">
              <Checkbox
                id={`product-${product.id}`}
                checked={watchedProducts.includes(product.id)}
                onCheckedChange={(checked) => handleProductToggle(product.id, checked as boolean)}
              />
              <Label 
                htmlFor={`product-${product.id}`} 
                className="text-sm font-normal cursor-pointer"
              >
                {product.nome_produto}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={createMaterial.isPending || updateMaterial.isPending}
      >
        {createMaterial.isPending || updateMaterial.isPending 
          ? "Salvando..." 
          : isEditing 
            ? "Atualizar Material" 
            : "Criar Material"
        }
      </Button>
    </form>
  );
}