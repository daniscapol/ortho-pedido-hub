import { useState } from "react";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useProducts, useDeleteProduct, Product } from "@/hooks/useProducts";
import { ProductForm } from "./ProductForm";

export const ProductsManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { data: products = [], isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();

  const filteredProducts = products.filter(product =>
    product.nome_produto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.nome_produto}"?`)) {
      deleteProduct.mutate(product.id);
    }
  };

  if (isLoading) {
    return <div>Carregando produtos...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestão de Produtos</CardTitle>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Produto</DialogTitle>
                </DialogHeader>
                <ProductForm
                  onSuccess={() => setIsCreateModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nome, código ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Subcategoria</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead>Implante</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-sm">{product.codigo}</TableCell>
                    <TableCell className="font-medium">{product.nome_produto}</TableCell>
                    <TableCell>{product.categoria}</TableCell>
                    <TableCell>{product.subcategoria}</TableCell>
                    <TableCell>{product.material}</TableCell>
                    <TableCell>
                      {product.necessita_cor ? (
                        <Badge variant="secondary">Sim</Badge>
                      ) : (
                        <Badge variant="outline">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.necessita_implante ? (
                        <Badge variant="secondary">Sim</Badge>
                      ) : (
                        <Badge variant="outline">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.ativo ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="destructive">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(product)}
                          disabled={deleteProduct.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum produto encontrado
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSuccess={() => {
                setIsEditModalOpen(false);
                setSelectedProduct(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};