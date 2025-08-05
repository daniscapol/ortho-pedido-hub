import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus } from "lucide-react";
import { useCompatibilidade, useProducts, useMateriais } from "@/hooks/useProducts";
import { CompatibilidadeForm } from "./CompatibilidadeForm";
import type { CompatibilidadeProductMaterialCor } from "@/hooks/useProducts";

export function CompatibilidadeManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompatibilidade, setSelectedCompatibilidade] = useState<CompatibilidadeProductMaterialCor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: compatibilidades, isLoading } = useCompatibilidade();
  const { data: products } = useProducts();
  const { data: materials } = useMateriais();

  const filteredCompatibilidades = compatibilidades?.filter(comp => {
    const product = products?.find(p => p.id === comp.id_produto);
    return product?.nome_produto.toLowerCase().includes(searchTerm.toLowerCase());
  }) || [];

  const handleEdit = (compatibilidade: CompatibilidadeProductMaterialCor) => {
    setSelectedCompatibilidade(compatibilidade);
    setShowEditModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedCompatibilidade(null);
  };

  const getProductName = (productId: number) => {
    return products?.find(p => p.id === productId)?.nome_produto || `Produto ${productId}`;
  };

  const getMaterialNames = (materialIds: number[]) => {
    if (!materials) return [];
    return materials
      .filter(material => materialIds.includes(material.id))
      .map(material => material.nome_material);
  };

  if (isLoading) {
    return <div>Carregando compatibilidades...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gerenciamento de Compatibilidades
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Compatibilidade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Compatibilidade</DialogTitle>
              </DialogHeader>
              <CompatibilidadeForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Buscar por produto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Materiais Compatíveis</TableHead>
                <TableHead>Cores Compatíveis</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCompatibilidades.map((comp) => (
                <TableRow key={comp.id}>
                  <TableCell className="font-medium">
                    {getProductName(comp.id_produto)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getMaterialNames(comp.materiais_compativeis).map((name, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={comp.cores_compativeis === 'NA' ? "destructive" : "default"}>
                      {comp.cores_compativeis}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(comp)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Compatibilidade</DialogTitle>
          </DialogHeader>
          {selectedCompatibilidade && (
            <CompatibilidadeForm 
              compatibilidade={selectedCompatibilidade} 
              onSuccess={handleEditSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}