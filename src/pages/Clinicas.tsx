import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Plus, MoreHorizontal, Bell } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useProfile } from "@/hooks/useProfile";
import { useClinicas, useCreateClinica, useUpdateClinica, useDeleteClinica, type Clinica } from "@/hooks/useClinicas";
import { ClinicaForm } from "@/components/forms/ClinicaForm";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const Clinicas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showClinicaForm, setShowClinicaForm] = useState(false);
  
  const { data: clinicas, isLoading } = useClinicas();
  const { data: profile } = useProfile();
  const createClinica = useCreateClinica();
  const updateClinica = useUpdateClinica();
  
  const filteredClinicas = clinicas?.filter(clinica =>
    clinica.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clinica.cnpj.includes(searchTerm) ||
    clinica.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateClinica = async (data: any) => {
    await createClinica.mutateAsync(data);
  };

  const handleToggleAtivo = async (clinica: Clinica) => {
    await updateClinica.mutateAsync({
      id: clinica.id,
      ativo: !clinica.ativo
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <div className="p-6">
            <p className="text-lg">Carregando...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Clínicas</h1>
            <div className="flex items-center gap-2">
              <NotificationDropdown />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {profile?.name?.charAt(0)?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.name || "Usuário"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {profile?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Perfil</DropdownMenuItem>
                  <DropdownMenuItem>Configurações</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Lista de Clínicas</CardTitle>
                {(profile?.role === "admin" || profile?.role_extended === "admin_master" || profile?.role_extended === "admin_filial") && (
                  <Button onClick={() => setShowClinicaForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Clínica
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar clínicas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-8 w-24" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>CNPJ</TableHead>
                      <TableHead>Filial</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Dentistas</TableHead>
                      <TableHead>Pacientes</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Criado em</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClinicas?.map((clinica) => (
                      <TableRow key={clinica.id}>
                        <TableCell className="font-medium">
                          {clinica.nome_completo}
                        </TableCell>
                        <TableCell>
                          {clinica.cnpj}
                        </TableCell>
                        <TableCell>
                          {clinica.filial?.nome_completo || "N/A"}
                        </TableCell>
                        <TableCell>
                          {clinica.telefone}
                        </TableCell>
                        <TableCell>
                          {clinica.email}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {clinica.qntd_dentistas || 0} dentistas
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {clinica.qntd_pacientes || 0} pacientes
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={clinica.ativo}
                              onCheckedChange={() => handleToggleAtivo(clinica)}
                              disabled={updateClinica.isPending}
                            />
                            <Badge variant={clinica.ativo ? 'default' : 'secondary'}>
                              {clinica.ativo ? 'Ativa' : 'Inativa'}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {format(new Date(clinica.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                Ver detalhes
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Editar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <ClinicaForm
        open={showClinicaForm}
        onOpenChange={setShowClinicaForm}
        onSubmit={handleCreateClinica}
        isLoading={createClinica.isPending}
      />
    </div>
  );
};

export default Clinicas;