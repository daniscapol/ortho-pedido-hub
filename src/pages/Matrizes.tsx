import { useState } from "react";
import { Building2, Plus, Search, Eye, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useMatrizes, useCreateMatriz, useUpdateMatriz, useDeleteMatriz, type Matriz } from "@/hooks/useMatrizes";
import Sidebar from "@/components/layout/Sidebar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import { MatrizForm } from "@/components/forms/MatrizForm";

const Matrizes = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewFilialOpen, setIsNewFilialOpen] = useState(false)
  const [editingFilial, setEditingFilial] = useState<Matriz | null>(null)
  const [deleteFilialId, setDeleteFilialId] = useState<string | null>(null)
  
  const { data: filiais, isLoading } = useMatrizes();
  const { data: profile } = useProfile();
  const createFilial = useCreateMatriz();
  const updateFilial = useUpdateMatriz();
  const deleteFilial = useDeleteMatriz();

  const canManageFiliais = profile?.role_extended === 'admin_master';
  const canCreateFiliais = profile?.role_extended === 'admin_master';

  const visibleFiliais = (filiais || []).filter((f) => {
    if (profile?.role_extended === 'admin_master') return true
    if (profile?.role_extended === 'admin_filial' || profile?.role_extended === 'admin_clinica') return f.id === profile?.filial_id
    return false
  })

  const filteredFiliais = visibleFiliais.filter(filial =>
    filial.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];


  const handleCreateFilial = async (data: any) => {
    await createFilial.mutateAsync(data);
  };

  const handleToggleAtivo = async (filial: Matriz) => {
    try {
      await updateFilial.mutateAsync({
        id: filial.id,
        ativo: !filial.ativo
      });
    } catch (error) {
      console.error("Erro ao atualizar matriz:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <header className="bg-slate-800 border-b border-slate-700 h-16 flex">          
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-white">Carregando...</div>
            </div>
          </header>
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">Carregando...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex">          
          <div className="flex-1 flex items-center justify-end px-6">
            
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Olá, Usuário!</div>
                      <div className="text-xs text-slate-300">
                        SB Prótese Odontológica - Admin
                      </div>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/perfil")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => console.log('logout')}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        <main className="flex-1 p-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="h-6 w-6" />
                  <CardTitle className="text-2xl">Matrizes</CardTitle>
                </div>
                {canCreateFiliais && (
                  <>
                    <Button 
                      onClick={() => setIsNewFilialOpen(true)}
                      className="bg-slate-700 hover:bg-slate-800"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Matriz
                    </Button>
                    <MatrizForm
                      open={isNewFilialOpen}
                      onOpenChange={setIsNewFilialOpen}
                      onSubmit={handleCreateFilial}
                      isLoading={createFilial.isPending}
                    />
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>

              <div className="border rounded-lg">
                <div className="grid grid-cols-5 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
                  <div>Nome</div>
                  <div>Endereço de entrega</div>
                  <div>Qntd. de Pacientes</div>
                  <div>Ativo</div>
                  <div></div>
                </div>
                
                {filteredFiliais.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    {searchTerm ? "Nenhuma matriz encontrada." : "Nenhuma matriz cadastrada."}
                  </div>
                ) : (
                  filteredFiliais.map((filial) => (
                    <div key={filial.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center">
                      <div className="font-medium">{filial.nome_completo}</div>
                      <div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Building2 className="h-3 w-3 mr-1" />
                          {filial.endereco}
                        </Badge>
                      </div>
                      <div className="text-center">{filial.qntd_pacientes}</div>
                      <div className="flex items-center gap-2">
                        {canManageFiliais ? (
                          <>
                            <Switch
                              checked={filial.ativo}
                              onCheckedChange={() => handleToggleAtivo(filial)}
                              disabled={updateFilial.isPending}
                            />
                            <span className={filial.ativo ? "text-green-600" : "text-red-600"}>
                              {filial.ativo ? "Sim" : "Não"}
                            </span>
                          </>
                        ) : (
                          <span className={filial.ativo ? "text-green-600" : "text-red-600"}>
                            {filial.ativo ? "Sim" : "Não"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalhes
                        </Button>
                        {canManageFiliais && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setEditingFilial(filial)}>
                              Editar
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteFilialId(filial.id)} disabled={deleteFilial.isPending}>
                              Remover
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Edit Matriz Form */}
          <MatrizForm
            open={!!editingFilial}
            onOpenChange={(open) => {
              if (!open) setEditingFilial(null);
            }}
            onSubmit={async (data) => {
              if (editingFilial) {
                await updateFilial.mutateAsync({ id: editingFilial.id, ...data });
              }
              setEditingFilial(null);
            }}
            isLoading={updateFilial.isPending}
            initialData={editingFilial || undefined}
          />

          {/* Delete confirmation */}
          <AlertDialog open={!!deleteFilialId} onOpenChange={(o) => { if (!o) setDeleteFilialId(null); }}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remover matriz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. A matriz será removida permanentemente.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    if (deleteFilialId) {
                      await deleteFilial.mutateAsync(deleteFilialId);
                      setDeleteFilialId(null);
                    }
                  }}
                >
                  Remover
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </main>
      </div>
    </div>
  );
};

export default Matrizes;