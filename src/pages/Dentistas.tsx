import Sidebar from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Bell, User, LogOut, Settings, UserCheck, Calendar, Mail, Phone, UserPlus, Edit } from "lucide-react";
import { useDentists, useUpdateDentist, Dentist } from "@/hooks/useDentists";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { DentistaForm } from "@/components/forms/DentistaForm";
import { useClinicas } from "@/hooks/useClinicas";

interface DentistCardProps {
  dentist: Dentist;
  onClick: () => void;
  onEdit: (dentist: Dentist) => void;
  canEdit: boolean;
}

const DentistCard = ({ dentist, onClick, onEdit, canEdit }: DentistCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow relative">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={onClick}>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">{dentist.name || 'Dentista'}</CardTitle>
              <p className="text-sm text-muted-foreground">{dentist.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {dentist._count?.orders || 0} pedidos
            </Badge>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(dentist);
                }}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 cursor-pointer" onClick={onClick}>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground truncate">{dentist.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              Desde {format(new Date(dentist.created_at), "MMM yyyy", { locale: ptBR })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dentistas = () => {
  const { data: dentists, isLoading } = useDentists();
  const { data: profile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [editingDentist, setEditingDentist] = useState<Dentist | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: clinicas } = useClinicas();

// Mutation para criar novo dentista via Edge Function
const createDentist = useMutation({
  mutationFn: async (data: any) => {
    const { nome_completo, email, password, clinica_id } = data;
    const { data: resp, error } = await supabase.functions.invoke('admin-create-dentist', {
      body: {
        name: nome_completo,
        email,
        password,
        clinica_id: clinica_id || null,
      },
    })
    if (error) throw error;
    return resp;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dentists'] });
    toast({ title: 'Dentista criado', description: 'Novo dentista criado e vinculado com sucesso.' });
    setShowCreateUser(false);
  },
  onError: (error: any) => {
    console.error('Erro ao criar dentista:', error);
    toast({ title: 'Erro', description: error?.message || 'Erro ao criar dentista.', variant: 'destructive' });
  },
});

// Mutation para atualizar dentista via Edge Function
const updateDentist = useMutation({
  mutationFn: async (data: any) => {
    const { data: resp, error } = await supabase.functions.invoke('admin-update-dentist', {
      body: data,
    })
    if (error) throw error;
    return resp;
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['dentists'] });
    toast({ title: 'Dentista atualizado', description: 'Informações do dentista atualizadas com sucesso.' });
    setEditingDentist(null);
  },
  onError: (error: any) => {
    console.error('Erro ao atualizar dentista:', error);
    toast({ title: 'Erro', description: error?.message || 'Erro ao atualizar dentista.', variant: 'destructive' });
  },
});

  const handleLogout = async () => {
    await signOut();
  };

  const handleDentistClick = (dentist: Dentist) => {
    navigate(`/dentistas/${dentist.id}`);
  };

  const handleCreateDentist = async (data: any) => {
    await createDentist.mutateAsync(data);
  };

  const handleEditDentist = (dentist: Dentist) => {
    setEditingDentist(dentist);
  };

  const handleUpdateDentist = async (data: any) => {
    if (!editingDentist) return;
    await updateDentist.mutateAsync({
      dentist_id: editingDentist.id,
      ...data
    });
  };

  // Filtrar dentistas baseado na busca
  const filteredDentists = useMemo(() => {
    if (!dentists) return [];
    
    if (searchQuery.trim()) {
      return dentists.filter(dentist => 
        dentist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dentist.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return dentists;
  }, [dentists, searchQuery]);

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex">          
          <div className="flex-1 flex items-center justify-end px-6">
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
                <Bell className="w-5 h-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Olá, {profile?.name || 'Usuário'}!</div>
                      <div className="text-xs text-slate-300">
                        SB Prótese Odontológica - {profile?.role === 'admin' ? 'Matriz Zone Sul' : 'Dentista'}
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
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                {profile?.role === 'admin' || profile?.role_extended === 'admin_master' || profile?.role_extended === 'admin_clinica' 
                  ? 'Gerenciamento de Dentistas' 
                  : 'Meu Perfil'
                }
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                {filteredDentists.length} {profile?.role === 'admin' 
                  ? `dentista${filteredDentists.length !== 1 ? 's' : ''}` 
                  : 'perfil'
                }
              </Badge>
              
              {/* Apenas admins podem criar dentistas */}
              {(profile?.role === 'admin' || profile?.role_extended === 'admin_master' || 
                profile?.role_extended === 'admin_clinica' || profile?.role_extended === 'admin_filial') && (
                <>
                  <Button 
                    onClick={() => setShowCreateUser(true)}
                    className="flex items-center gap-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    Novo Dentista
                  </Button>
                  <DentistaForm
                    open={showCreateUser}
                    onOpenChange={setShowCreateUser}
                    onSubmit={handleCreateDentist}
                    isLoading={createDentist.isPending}
                    canCreateAdmin={profile?.role_extended === 'admin_master' || profile?.role_extended === 'admin_clinica'}
                    forceClinicaId={profile?.role_extended === 'admin_clinica' ? (profile?.clinica_id ?? null) : undefined}
                    clinics={clinicas?.map(c => ({ id: c.id, nome_completo: c.nome_completo }))}
                  />
                  <DentistaForm
                    open={!!editingDentist}
                    onOpenChange={(open) => !open && setEditingDentist(null)}
                    onSubmit={handleUpdateDentist}
                    isLoading={updateDentist.isPending}
                    canCreateAdmin={profile?.role_extended === 'admin_master' || profile?.role_extended === 'admin_clinica'}
                    forceClinicaId={profile?.role_extended === 'admin_clinica' ? (profile?.clinica_id ?? null) : undefined}
                    clinics={clinicas?.map(c => ({ id: c.id, nome_completo: c.nome_completo }))}
                    editingDentist={editingDentist ? {
                      id: editingDentist.id,
                      nome_completo: editingDentist.name || editingDentist.nome_completo || '',
                      email: editingDentist.email || '',
                      cro: editingDentist.cro || '',
                      cpf: editingDentist.cpf || '',
                      telefone: editingDentist.telefone || '',
                      endereco: editingDentist.endereco || '',
                      cep: editingDentist.cep || '',
                      cidade: editingDentist.cidade || '',
                      estado: editingDentist.estado || '',
                      numero: editingDentist.numero || '',
                      complemento: editingDentist.complemento || '',
                      clinica_id: editingDentist.clinica_id || null,
                      ativo: editingDentist.ativo ?? true
                    } : null}
                  />
                </>
              )}
            </div>
          </div>

          {/* Search and filters section */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" className="text-foreground">
              {profile?.role === 'admin' ? 'Lista de Dentistas' : 'Informações do Perfil'}
            </Button>
          </div>

          {/* Dentists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : filteredDentists.length > 0 ? (
              filteredDentists.map((dentist) => (
                <DentistCard 
                  key={dentist.id} 
                  dentist={dentist} 
                  onClick={() => handleDentistClick(dentist)}
                  onEdit={handleEditDentist}
                  canEdit={profile?.role === 'admin' || profile?.role_extended === 'admin_master' || 
                          profile?.role_extended === 'admin_clinica' || profile?.role_extended === 'admin_filial'}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <UserCheck className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {searchQuery ? 'Nenhum dentista encontrado' : 'Nenhum dentista cadastrado'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Tente ajustar sua pesquisa para encontrar dentistas.' 
                    : 'Quando dentistas se cadastrarem, eles aparecerão aqui.'
                  }
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dentistas;