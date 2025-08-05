import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useProducts, type TipoProtese, type CreateTipoProtese } from "@/hooks/useProducts";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface TipoProteseFormProps {
  tipo?: TipoProtese;
  onSuccess: () => void;
}

export function TipoProteseForm({ tipo, onSuccess }: TipoProteseFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: products } = useProducts();
  const isEditing = !!tipo;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTipoProtese & { compativel_produtos_selected: number[] }>({
    defaultValues: {
      nome_tipo: tipo?.nome_tipo || "",
      categoria_tipo: tipo?.categoria_tipo || "",
      compativel_produtos: tipo?.compativel_produtos || [],
      compativel_produtos_selected: tipo?.compativel_produtos || [],
    },
  });

  const createTipo = useMutation({
    mutationFn: async (data: CreateTipoProtese) => {
      const { data: result, error } = await supabase
        .from('tipos_protese')
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos_protese'] });
      toast({
        title: "Tipo criado",
        description: "Tipo de prótese criado com sucesso",
      });
    },
  });

  const updateTipo = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TipoProtese> & { id: number }) => {
      const { data, error } = await supabase
        .from('tipos_protese')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos_protese'] });
      toast({
        title: "Tipo atualizado",
        description: "Tipo de prótese atualizado com sucesso",
      });
    },
  });

  const onSubmit = async (data: CreateTipoProtese & { compativel_produtos_selected: number[] }) => {
    try {
      const submitData = {
        nome_tipo: data.nome_tipo,
        categoria_tipo: data.categoria_tipo,
        compativel_produtos: data.compativel_produtos_selected,
      };

      if (isEditing) {
        await updateTipo.mutateAsync({ id: tipo.id, ...submitData });
      } else {
        await createTipo.mutateAsync(submitData);
      }
      onSuccess();
    } catch (error) {
      console.error("Erro ao salvar tipo:", error);
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

  const categorias = [
    "Coroa",
    "Restauração",
    "Estética",
    "Pôntico",
    "Implante",
    "Auxiliar"
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome_tipo">Nome do Tipo</Label>
          <Input
            id="nome_tipo"
            {...register("nome_tipo", { required: "Nome é obrigatório" })}
          />
          {errors.nome_tipo && (
            <p className="text-sm text-destructive">{errors.nome_tipo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria_tipo">Categoria</Label>
          <Select 
            value={watch("categoria_tipo")} 
            onValueChange={(value) => setValue("categoria_tipo", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.categoria_tipo && (
            <p className="text-sm text-destructive">{errors.categoria_tipo.message}</p>
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
        disabled={createTipo.isPending || updateTipo.isPending}
      >
        {createTipo.isPending || updateTipo.isPending 
          ? "Salvando..." 
          : isEditing 
            ? "Atualizar Tipo" 
            : "Criar Tipo"
        }
      </Button>
    </form>
  );
}