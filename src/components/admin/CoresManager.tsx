import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Plus } from "lucide-react";
import { useCores } from "@/hooks/useProducts";
import { CorForm } from "./CorForm";
import type { Cor } from "@/hooks/useProducts";

export function CoresManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCor, setSelectedCor] = useState<Cor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: cores, isLoading } = useCores();

  const filteredCores = cores?.filter(cor =>
    cor.nome_cor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cor.codigo_cor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (cor.escala && cor.escala.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cor.grupo && cor.grupo.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleEdit = (cor: Cor) => {
    setSelectedCor(cor);
    setShowEditModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedCor(null);
  };

  if (isLoading) {
    return <div>Carregando cores...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Gerenciamento de Cores
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Cor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Cor</DialogTitle>
              </DialogHeader>
              <CorForm onSuccess={handleCreateSuccess} />
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Input
            placeholder="Buscar cores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Escala</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCores.map((cor) => (
                <TableRow key={cor.id}>
                  <TableCell>{cor.id}</TableCell>
                  <TableCell className="font-mono">{cor.codigo_cor}</TableCell>
                  <TableCell className="font-medium">{cor.nome_cor}</TableCell>
                  <TableCell>
                    {cor.escala && (
                      <Badge variant="outline">{cor.escala}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {cor.grupo && (
                      <Badge variant="secondary">{cor.grupo}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(cor)}
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cor</DialogTitle>
          </DialogHeader>
          {selectedCor && (
            <CorForm 
              cor={selectedCor} 
              onSuccess={handleEditSuccess} 
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}