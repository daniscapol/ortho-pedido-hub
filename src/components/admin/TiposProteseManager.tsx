import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { useTiposProtese, useProducts } from "@/hooks/useProducts";
import { TipoProteseForm } from "./TipoProteseForm";
import type { TipoProtese } from "@/hooks/useProducts";

export function TiposProteseManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTipo, setSelectedTipo] = useState<TipoProtese | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: tiposProtese, isLoading } = useTiposProtese();
  const { data: products } = useProducts();

  const filteredTipos = tiposProtese?.filter(tipo =>
    tipo.nome_tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tipo.categoria_tipo.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleEdit = (tipo: TipoProtese) => {
    setSelectedTipo(tipo);
    setShowEditModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedTipo(null);
  };

  const getCompatibleProductNames = (compatibleProducts: number[]) => {
    if (!products) return [];
    return products
      .filter(product => compatibleProducts.includes(product.id))
      .map(product => product.nome_produto);
  };

  if (isLoading) {
    return <div>Carregando tipos de prótese...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gerenciamento de Tipos de Prótese
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Tipo de Prótese</DialogTitle>
              </DialogHeader>
              <TipoProteseForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Buscar tipos de prótese..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Produtos Compatíveis</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell>{tipo.id}</TableCell>
                  <TableCell className="font-medium">{tipo.nome_tipo}</TableCell>
                  <TableCell>{tipo.categoria_tipo}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {getCompatibleProductNames(tipo.compativel_produtos).map((name, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tipo)}
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
            <DialogTitle>Editar Tipo de Prótese</DialogTitle>
          </DialogHeader>
          {selectedTipo && (
            <TipoProteseForm 
              tipo={selectedTipo} 
              onSuccess={handleEditSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}