import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateProduct, useUpdateProduct, Product, CreateProduct } from "@/hooks/useProducts";

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
      codigo: product.codigo,
      nome_produto: product.nome_produto,
      categoria: product.categoria,
      subcategoria: product.subcategoria,
      material: product.material,
      tipo_resina: product.tipo_resina || '',
      necessita_cor: product.necessita_cor,
      necessita_implante: product.necessita_implante,
      ativo: product.ativo,
    } : {
      codigo: '',
      nome_produto: '',
      categoria: '',
      subcategoria: '',
      material: '',
      tipo_resina: '',
      necessita_cor: false,
      necessita_implante: false,
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
    'COROA',
    'RESTAURACAO',
    'PROVISORIO',
    'ESTETICA',
    'DISPOSITIVO'
  ];

  const materiais = [
    'E-MAX',
    'RESINA',
    'CERÔMERO',
    'ACRÍLICO',
    'EVA',
    'RESINA_3D'
  ];

  const tiposResina = [
    'NACIONAL',
    'BIOLUX',
    'BIOLUX_60',
    'BIOLUX_62',
    'BIOLUX_66',
    'BIOLUX_67',
    'BIOLUX_69',
    'BIOLUX_77',
    'IMPORTADA'
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="codigo">Código *</Label>
          <Input
            id="codigo"
            {...register("codigo", { required: "Código é obrigatório" })}
            placeholder="Ex: CRE-FRE-POR"
          />
          {errors.codigo && (
            <p className="text-sm text-destructive">{errors.codigo.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="categoria">Categoria *</Label>
          <Select
            value={watchedValues.categoria}
            onValueChange={(value) => setValue("categoria", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {categorias.map((categoria) => (
                <SelectItem key={categoria} value={categoria}>
                  {categoria}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="nome_produto">Nome do Produto *</Label>
        <Input
          id="nome_produto"
          {...register("nome_produto", { required: "Nome é obrigatório" })}
          placeholder="Ex: Coroa E-max Fresada com Porcelana"
        />
        {errors.nome_produto && (
          <p className="text-sm text-destructive">{errors.nome_produto.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subcategoria">Subcategoria *</Label>
          <Input
            id="subcategoria"
            {...register("subcategoria", { required: "Subcategoria é obrigatória" })}
            placeholder="Ex: EMAX"
          />
          {errors.subcategoria && (
            <p className="text-sm text-destructive">{errors.subcategoria.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="material">Material *</Label>
          <Select
            value={watchedValues.material}
            onValueChange={(value) => setValue("material", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o material" />
            </SelectTrigger>
            <SelectContent>
              {materiais.map((material) => (
                <SelectItem key={material} value={material}>
                  {material}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {watchedValues.material === 'RESINA' && (
        <div className="space-y-2">
          <Label htmlFor="tipo_resina">Tipo de Resina</Label>
          <Select
            value={watchedValues.tipo_resina}
            onValueChange={(value) => setValue("tipo_resina", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo de resina" />
            </SelectTrigger>
            <SelectContent>
              {tiposResina.map((tipo) => (
                <SelectItem key={tipo} value={tipo}>
                  {tipo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="necessita_cor"
            checked={watchedValues.necessita_cor}
            onCheckedChange={(checked) => setValue("necessita_cor", checked)}
          />
          <Label htmlFor="necessita_cor">Necessita Cor</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="necessita_implante"
            checked={watchedValues.necessita_implante}
            onCheckedChange={(checked) => setValue("necessita_implante", checked)}
          />
          <Label htmlFor="necessita_implante">Necessita Implante</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="ativo"
            checked={watchedValues.ativo}
            onCheckedChange={(checked) => setValue("ativo", checked)}
          />
          <Label htmlFor="ativo">Ativo</Label>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="submit"
          disabled={createProduct.isPending || updateProduct.isPending}
        >
          {isEditing ? 'Atualizar' : 'Criar'} Produto
        </Button>
      </div>
    </form>
  );
};