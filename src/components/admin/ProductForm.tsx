import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProduct, useUpdateProduct, type Product, type CreateProduct } from "@/hooks/useProducts";

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
}

export const ProductForm = ({ product, onSuccess }: ProductFormProps) => {
  const isEditing = !!product;
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<CreateProduct>({
    defaultValues: product ? {
      nome_produto: product.nome_produto,
      categoria: product.categoria,
      ativo: product.ativo,
    } : {
      nome_produto: '',
      categoria: '',
      ativo: true,
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: CreateProduct) => {
    try {
      if (isEditing) {
        await updateProduct.mutateAsync({ id: product.id, ...data });
      } else {
        await createProduct.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const categorias = [
    "Coroa",
    "Implante", 
    "Restauração",
    "Provisório",
    "Estética",
    "Auxiliar",
    "Pôntico"
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nome_produto">Nome do Produto</Label>
          <Input
            id="nome_produto"
            {...register("nome_produto", { required: "Nome do produto é obrigatório" })}
          />
          {errors.nome_produto && (
            <p className="text-sm text-destructive">{errors.nome_produto.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria</Label>
          <Select 
            value={watchedValues.categoria} 
            onValueChange={(value) => setValue("categoria", value)}
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
          {errors.categoria && (
            <p className="text-sm text-destructive">{errors.categoria.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="ativo"
          checked={watchedValues.ativo}
          onCheckedChange={(checked) => setValue("ativo", checked)}
        />
        <Label htmlFor="ativo">Produto Ativo</Label>
      </div>

      <Button 
        type="submit" 
        className="w-full"
        disabled={createProduct.isPending || updateProduct.isPending}
      >
        {createProduct.isPending || updateProduct.isPending 
          ? "Salvando..." 
          : isEditing 
            ? "Atualizar Produto" 
            : "Criar Produto"
        }
      </Button>
    </form>
  );
};