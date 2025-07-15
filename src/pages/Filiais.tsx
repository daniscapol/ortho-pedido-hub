import { useState } from "react";
import { Building2, Plus, Search, Eye, User, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useFiliais, useCreateFilial, useUpdateFilial, type Filial } from "@/hooks/useFiliais";
import { useForm } from "react-hook-form";
import Sidebar from "@/components/layout/Sidebar";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface FilialForm {
  nome: string;
  endereco_entrega: string;
  ativo: boolean;
}

const Filiais = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewFilialOpen, setIsNewFilialOpen] = useState(false)
  
  const { data: filiais, isLoading } = useFiliais();
  const createFilial = useCreateFilial();
  const updateFilial = useUpdateFilial();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FilialForm>({
    defaultValues: {
      ativo: true
    }
  });

  const filteredFiliais = filiais?.filter(filial =>
    filial.nome.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const onSubmit = async (data: FilialForm) => {
    try {
      await createFilial.mutateAsync(data);
      reset();
      setIsNewFilialOpen(false);
    } catch (error) {
      console.error("Erro ao criar filial:", error);
    }
  };

  const handleToggleAtivo = async (filial: Filial) => {
    try {
      await updateFilial.mutateAsync({
        id: filial.id,
        ativo: !filial.ativo
      });
    } catch (error) {
      console.error("Erro ao atualizar filial:", error);
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
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="flex items-center gap-4 flex-1 max-w-4xl">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Input
                    placeholder="Pesquise uma filial pelo nome"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            
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
                  <CardTitle className="text-2xl">Filiais</CardTitle>
                </div>
                <Dialog open={isNewFilialOpen} onOpenChange={setIsNewFilialOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-slate-700 hover:bg-slate-800">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Filial
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nova Filial</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                      <div>
                        <Label htmlFor="nome">Nome</Label>
                        <Input
                          id="nome"
                          {...register("nome", { required: "Nome é obrigatório" })}
                          placeholder="Nome da filial"
                        />
                        {errors.nome && (
                          <p className="text-sm text-red-500 mt-1">{errors.nome.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="endereco_entrega">Endereço de entrega</Label>
                        <Input
                          id="endereco_entrega"
                          {...register("endereco_entrega", { required: "Endereço é obrigatório" })}
                          placeholder="Endereço completo"
                        />
                        {errors.endereco_entrega && (
                          <p className="text-sm text-red-500 mt-1">{errors.endereco_entrega.message}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch id="ativo" {...register("ativo")} defaultChecked />
                        <Label htmlFor="ativo">Ativo</Label>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsNewFilialOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createFilial.isPending}>
                          {createFilial.isPending ? "Criando..." : "Criar Filial"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Filtros</span>
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Pesquise por uma filial"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

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
                    {searchTerm ? "Nenhuma filial encontrada." : "Nenhuma filial cadastrada."}
                  </div>
                ) : (
                  filteredFiliais.map((filial) => (
                    <div key={filial.id} className="grid grid-cols-5 gap-4 p-4 border-b last:border-b-0 items-center">
                      <div className="font-medium">{filial.nome}</div>
                      <div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                          <Building2 className="h-3 w-3 mr-1" />
                          {filial.endereco_entrega}
                        </Badge>
                      </div>
                      <div className="text-center">{filial.qntd_pacientes}</div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={filial.ativo}
                          onCheckedChange={() => handleToggleAtivo(filial)}
                          disabled={updateFilial.isPending}
                        />
                        <span className={filial.ativo ? "text-green-600" : "text-red-600"}>
                          {filial.ativo ? "Sim" : "Não"}
                        </span>
                      </div>
                      <div>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver detalhes
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default Filiais;