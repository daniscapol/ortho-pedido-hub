import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: number;
  nome_produto: string;
  categoria: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface TipoProtese {
  id: number;
  nome_tipo: string;
  categoria_tipo: string;
  compativel_produtos: number[];
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: number;
  nome_material: string;
  tipo_material: string;
  compativel_produtos: number[];
  created_at: string;
  updated_at: string;
}

export interface Cor {
  id: number;
  codigo_cor: string;
  nome_cor: string;
  escala?: string;
  grupo?: string;
  created_at: string;
  updated_at: string;
}

export interface CompatibilidadeProductMaterialCor {
  id: number;
  id_produto: number;
  materiais_compativeis: number[];
  cores_compativeis: string;
  created_at: string;
  updated_at: string;
}

export type CreateProduct = Omit<Product, 'id' | 'created_at' | 'updated_at'>;
export type CreateTipoProtese = Omit<TipoProtese, 'id' | 'created_at' | 'updated_at'>;
export type CreateMaterial = Omit<Material, 'id' | 'created_at' | 'updated_at'>;
export type CreateCor = Omit<Cor, 'id' | 'created_at' | 'updated_at'>;
export type CreateCompatibilidade = Omit<CompatibilidadeProductMaterialCor, 'id' | 'created_at' | 'updated_at'>;

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome_produto', { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useActiveProducts = () => {
  return useQuery({
    queryKey: ['products', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true })
        .order('nome_produto', { ascending: true });

      if (error) throw error;
      return data as Product[];
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (product: CreateProduct) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto criado",
        description: "Produto criado com sucesso",
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Product> & { id: number }) => {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso",
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({
        title: "Produto removido",
        description: "Produto removido com sucesso",
      });
    },
  });
};

// Hooks for tipos_protese
export const useTiposProtese = () => {
  return useQuery({
    queryKey: ['tipos_protese'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tipos_protese')
        .select('*')
        .order('categoria_tipo', { ascending: true })
        .order('nome_tipo', { ascending: true });

      if (error) throw error;
      return data as TipoProtese[];
    },
  });
};

export const useCreateTipoProtese = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tipo: CreateTipoProtese) => {
      const { data, error } = await supabase
        .from('tipos_protese')
        .insert(tipo)
        .select()
        .single();

      if (error) throw error;
      return data as TipoProtese;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos_protese'] });
      toast({
        title: "Tipo criado",
        description: "Tipo de prótese criado com sucesso",
      });
    },
  });
};

export const useUpdateTipoProtese = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TipoProtese> & { id: number }) => {
      const { data, error } = await supabase
        .from('tipos_protese')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as TipoProtese;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos_protese'] });
      toast({
        title: "Tipo atualizado",
        description: "Tipo de prótese atualizado com sucesso",
      });
    },
  });
};

// Hooks for materiais
export const useMateriais = () => {
  return useQuery({
    queryKey: ['materiais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiais')
        .select('*')
        .order('tipo_material', { ascending: true })
        .order('nome_material', { ascending: true });

      if (error) throw error;
      return data as Material[];
    },
  });
};

export const useCreateMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (material: CreateMaterial) => {
      const { data, error } = await supabase
        .from('materiais')
        .insert(material)
        .select()
        .single();

      if (error) throw error;
      return data as Material;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais'] });
      toast({
        title: "Material criado",
        description: "Material criado com sucesso",
      });
    },
  });
};

export const useUpdateMaterial = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Material> & { id: number }) => {
      const { data, error } = await supabase
        .from('materiais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Material;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiais'] });
      toast({
        title: "Material atualizado",
        description: "Material atualizado com sucesso",
      });
    },
  });
};

// Hooks for cores
export const useCores = () => {
  return useQuery({
    queryKey: ['cores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cores')
        .select('*')
        .order('escala', { ascending: true })
        .order('codigo_cor', { ascending: true });

      if (error) throw error;
      return data as Cor[];
    },
  });
};

export const useCreateCor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (cor: CreateCor) => {
      const { data, error } = await supabase
        .from('cores')
        .insert(cor)
        .select()
        .single();

      if (error) throw error;
      return data as Cor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cores'] });
      toast({
        title: "Cor criada",
        description: "Cor criada com sucesso",
      });
    },
  });
};

export const useUpdateCor = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cor> & { id: number }) => {
      const { data, error } = await supabase
        .from('cores')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Cor;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cores'] });
      toast({
        title: "Cor atualizada",
        description: "Cor atualizada com sucesso",
      });
    },
  });
};

// Hooks for compatibility
export const useCompatibilidade = () => {
  return useQuery({
    queryKey: ['compatibilidade'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('compatibilidade_produto_material_cor')
        .select('*')
        .order('id_produto', { ascending: true });

      if (error) throw error;
      return data as CompatibilidadeProductMaterialCor[];
    },
  });
};

// Get compatible materials for a product
export const useCompatibleMaterials = (productId: number) => {
  const { data: compatibility } = useCompatibilidade();
  const { data: materials } = useMateriais();
  
  return useQuery({
    queryKey: ['compatible_materials', productId],
    queryFn: () => {
      const productCompat = compatibility?.find(c => c.id_produto === productId);
      if (!productCompat || !materials) return [];
      
      return materials.filter(material => 
        productCompat.materiais_compativeis.includes(material.id)
      );
    },
    enabled: !!compatibility && !!materials,
  });
};

// Get compatible colors for a product
export const useCompatibleColors = (productId: number) => {
  const { data: compatibility } = useCompatibilidade();
  const { data: colors } = useCores();
  
  return useQuery({
    queryKey: ['compatible_colors', productId],
    queryFn: () => {
      const productCompat = compatibility?.find(c => c.id_produto === productId);
      if (!productCompat || !colors) return [];
      
      if (productCompat.cores_compativeis === 'NA') return [];
      
      // Parse "1-26" format
      const [start, end] = productCompat.cores_compativeis.split('-').map(Number);
      return colors.filter(color => color.id >= start && color.id <= end);
    },
    enabled: !!compatibility && !!colors,
  });
};

// Get compatible prosthetic types for a product
export const useCompatibleTiposProtese = (productId: number) => {
  const { data: tiposProtese } = useTiposProtese();
  
  return useQuery({
    queryKey: ['compatible_tipos_protese', productId],
    queryFn: () => {
      if (!tiposProtese) return [];
      
      return tiposProtese.filter(tipo => 
        tipo.compativel_produtos.includes(productId)
      );
    },
    enabled: !!tiposProtese,
  });
};