import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/auth/AuthProvider";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrders, useCreateOrder, useUpdateOrderStatus, useOrdersForAdmin, usePatientOrders, useCreateOrderForDentist, useUniqueDentists } from "@/hooks/useOrders";
import { Search, Eye, BarChart3, UserPlus, Trash2, Mail, Package, Layers, Palette, Settings, Link, Users, Building2, Key, User, LogOut, Zap } from "lucide-react";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { TiposProteseManager } from "@/components/admin/TiposProteseManager";
import { MateriaisManager } from "@/components/admin/MateriaisManager";
import { CoresManager } from "@/components/admin/CoresManager";
import { usePermissions } from "@/hooks/usePermissions";
import { getStatusOptions, getStatusColor, getStatusLabel, canChangeStatus } from "@/lib/status-config";
import { CompatibilidadeManager } from "@/components/admin/CompatibilidadeManager";
import { useMatrizes } from "@/hooks/useMatrizes";
import { useClinicas } from "@/hooks/useClinicas";

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

interface User {
  id: string;
  role_extended: 'admin_master' | 'admin_matriz' | 'admin_clinica' | 'dentist';
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  email_confirmed_at?: string | null;
  email_verified?: boolean;
  filial_id?: string | null;
  clinica_id?: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const { signOut, session, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms de delay
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [dentistFilter, setDentistFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;
  const [activeTab, setActiveTab] = useState("pedidos");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role_extended: 'dentist' as 'admin_master' | 'admin_matriz' | 'admin_clinica' | 'dentist'
  });
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({ userId: '', newPassword: '' });
  // Reset page quando filtros mudarem
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, priorityFilter, dentistFilter, dateFilter]);
  
  const updateOrderStatus = useUpdateOrderStatus();

  const handleLogout = async () => {
    await signOut();
  };

  // Hook para matrizes
  const { data: matrizes, isLoading: matrizesLoading } = useMatrizes();
  // Hook para clínicas
  const { data: clinicas } = useClinicas();

  // Componente interno para seção de matrizes
  const FiliaisSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Matrizes</CardTitle>
      </CardHeader>
      <CardContent>
        {matrizesLoading ? (
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
                <TableHead>Endereço</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Clínicas</TableHead>
                <TableHead>Pacientes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrizes?.map((matriz) => (
                <TableRow key={matriz.id}>
                  <TableCell className="font-medium">
                    {matriz.nome_completo}
                  </TableCell>
                  <TableCell>
                    {matriz.endereco}
                  </TableCell>
                  <TableCell>
                    {matriz.telefone}
                  </TableCell>
                  <TableCell>
                    {matriz.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {matriz.qntd_clinicas || 0} clínicas
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {matriz.qntd_pacientes || 0} pacientes
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={matriz.ativo ? 'default' : 'secondary'}>
                      {matriz.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(matriz.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  // Buscar todos os usuários (com status de verificação)
  const { data: users, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      console.log('🔍 Fetching users...');
      console.log('🔍 Profile:', profile);
      console.log('🔍 Session:', session);
      
      if (!profile || profile.role_extended !== 'admin_master') {
        console.log('❌ User is not admin_master:', profile?.role_extended);
        throw new Error('Acesso negado: apenas admin_master pode listar usuários');
      }

      try {
        const { data, error } = await supabase.functions.invoke('admin-list-users');
        
        if (error) {
          console.error('❌ Edge function error:', error);
          throw new Error(`Erro na função: ${error.message || 'Função retornou erro'}`);
        }
        
        console.log('✅ Users data received:', data);
        return (data?.users || []) as User[];
      } catch (err: any) {
        console.error('❌ Complete error details:', err);
        throw err;
      }
    },
    enabled: !!profile && !!session && profile?.role_extended === 'admin_master',
    retry: (failureCount, error) => {
      console.log('🔄 Query retry:', failureCount, error.message);
      return failureCount < 2; // Só tenta 2 vezes
    },
    retryDelay: 2000,
  });

  // Buscar todos os pedidos para admin com filtros
  const { data: ordersData, isLoading: ordersLoading } = useOrdersForAdmin(currentPage, itemsPerPage, {
    searchTerm: debouncedSearchTerm, // Usar o valor com debounce
    statusFilter,
    priorityFilter,
    dentistFilter,
    dateFilter
  });
  const orders = ordersData?.orders || [];
  const totalOrdersCount = ordersData?.totalCount || 0;
  const totalOrdersPages = ordersData?.totalPages || 0;

  // Mutation para alterar role do usuário
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin_master' | 'admin_matriz' | 'admin_clinica' | 'dentist' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role_extended: newRole })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Função atualizada",
        description: "A função do usuário foi alterada com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao alterar função do usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para alterar matriz do usuário
  const updateUserFilial = useMutation({
    mutationFn: async ({ userId, filialId }: { userId: string; filialId: string | null }) => {
      const { error } = await supabase.functions.invoke('admin-update-user-links', {
        body: { userId, filialId },
      })
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Matriz atualizada',
        description: 'O usuário foi associado à matriz com sucesso.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Erro',
        description: err?.message || 'Não foi possível atualizar a matriz do usuário.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para alterar clínica do usuário
  const updateUserClinica = useMutation({
    mutationFn: async ({ userId, clinicaId }: { userId: string; clinicaId: string | null }) => {
      const { error } = await supabase.functions.invoke('admin-update-user-links', {
        body: { userId, clinicaId },
      })
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Clínica atualizada',
        description: 'O usuário foi associado à clínica com sucesso.',
      });
    },
    onError: (err: any) => {
      toast({
        title: 'Erro',
        description: err?.message || 'Não foi possível atualizar a clínica do usuário.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para criar novo usuário
  const createUser = useMutation({
    mutationFn: async ({ name, email, password, role_extended }: { 
      name: string; 
      email: string; 
      password: string; 
      role_extended: 'admin_master' | 'admin_matriz' | 'admin_clinica' | 'dentist'
    }) => {
      // Criar usuário via Edge Function com Service Role
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: { name, email, password, role_extended },
      })

      if (error) throw error;

      // Enviar email de boas-vindas (convite) – não bloqueia criação em caso de erro
      try {
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: { name, email, temporaryPassword: password },
        })
        if (emailError) {
          console.error('Erro ao enviar email de boas-vindas:', emailError)
        }
      } catch (emailError) {
        console.error('Erro ao enviar email de boas-vindas:', emailError)
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário criado",
        description: "Novo usuário criado com sucesso! Email de boas-vindas enviado.",
      });
      setShowCreateUser(false);
      setNewUserData({ 
        name: '', 
        email: '', 
        password: '', 
        role_extended: 'dentist'
      });
    },
    onError: (error: any) => {
      console.error("Erro ao criar usuário:", error);
      let errorMessage = "Erro ao criar usuário. Tente novamente.";
      
      if (error.message === "User already registered") {
        errorMessage = "Este email já está cadastrado";
      } else if (error.message?.includes("email_address_invalid") || error.message?.includes("Email address") && error.message?.includes("is invalid")) {
        errorMessage = "Email inválido. Use um email real com domínio válido (ex: joao@empresa.com). Evite emails de teste ou domínios não reconhecidos.";
      } else if (error.message?.includes("Invalid email")) {
        errorMessage = "Formato de email inválido - use um email real";
      } else if (error.code === "email_address_invalid") {
        errorMessage = "Email rejeitado pelo sistema. Use um email corporativo válido (ex: usuario@suaempresa.com.br)";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  // Mutation para reenviar email de redefinir senha
  const sendResetPassword = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Email enviado",
        description: "Email de redefinição de senha enviado com sucesso!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao enviar email de redefinição de senha. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para confirmar email (liberar acesso)
  const confirmEmail = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke('admin-confirm-email', {
        body: { userId },
      })
      if (error) throw error
    },
    onSuccess: async (_, userId) => {
      // Atualiza cache otimisticamente e refaz busca em seguida
      queryClient.setQueryData<User[] | undefined>(['admin-users'], (old) => {
        if (!old) return old
        return old.map(u => u.id === (userId as unknown as string) ? { ...u, email_verified: true, email_confirmed_at: new Date().toISOString() } : u)
      })
      await refetchUsers()
      toast({
        title: 'Acesso liberado',
        description: 'Email marcado como verificado com sucesso.',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro',
        description: error?.message || 'Não foi possível liberar o acesso.',
        variant: 'destructive',
      })
    },
  })

  // Mutation para deletar usuário (também remove do Auth)
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.functions.invoke('admin-delete-user', {
        body: { userId },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      refetchUsers()
      toast({
        title: 'Usuário deletado',
        description: 'A conta foi removida e o acesso revogado.',
      })
      setUserToDelete(null)
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao deletar usuário',
        description: error?.message || 'Erro ao deletar usuário. Tente novamente.',
        variant: 'destructive',
      })
      setUserToDelete(null)
    },
  })

  // Mutation para alterar senha do usuário
  const changeUserPassword = useMutation({
    mutationFn: async ({ userId, newPassword }: { userId: string; newPassword: string }) => {
      const { error } = await supabase.functions.invoke('admin-change-password', {
        body: { userId, newPassword },
      })
      if (error) throw error
    },
    onSuccess: () => {
      toast({
        title: 'Senha alterada',
        description: 'A senha do usuário foi alterada com sucesso.',
      })
      setShowChangePassword(false)
      setPasswordChangeData({ userId: '', newPassword: '' })
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao alterar senha',
        description: error?.message || 'Não foi possível alterar a senha.',
        variant: 'destructive',
      })
    },
  })


  // Verificar se o usuário é admin
  if (profileLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed left-0 top-0 z-30 h-screen">
          <Sidebar />
        </div>
        
        <div className="ml-48 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6">
            <Skeleton className="h-8 w-64" />
          </main>
        </div>
      </div>
    );
  }

  if (profile?.role_extended !== 'admin_master') {
    console.log('🔒 Current profile:', profile);
    console.log('🔒 Access denied - role:', profile?.role_extended, 'expected: admin_master');
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed left-0 top-0 z-30 h-screen">
          <Sidebar />
        </div>
        
        <div className="ml-48 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6">
            <div className="container mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground mb-4">
                Apenas administradores master podem acessar esta página.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Sua função atual: {profile?.role_extended || 'não definida'}
              </p>
              <Button onClick={() => navigate("/")}>
                Voltar ao Dashboard
              </Button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const handleRoleChange = (userId: string, newRole: 'admin_master' | 'admin_matriz' | 'admin_clinica' | 'dentist') => {
    updateUserRole.mutate({ userId, newRole });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password || !newUserData.role_extended) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createUser.mutate(newUserData);
  };

  const handleDeleteUser = (userId: string) => {
    deleteUser.mutate(userId);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChangeData.newPassword || passwordChangeData.newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }
    changeUserPassword.mutate(passwordChangeData);
  };

  const handleSendResetPassword = (email: string) => {
    sendResetPassword.mutate(email);
  };

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    if (!canChangeStatus(true)) return; // Only admin master can change status in Admin page
    updateOrderStatus.mutate({ id: orderId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={getStatusColor(status)}>
        {getStatusLabel(status, true)} {/* Admin master always sees full labels */}
      </Badge>
    );
  };

  // Buscar dentistas únicos para o filtro
  const { data: uniqueDentists } = useUniqueDentists();

  // Os dados já vêm filtrados e paginados do backend
  const paginatedOrders = orders;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed left-0 top-0 z-30 h-screen">
        <Sidebar />
      </div>
      
      <div className="ml-48 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex sticky top-0 z-30">          
          <div className="flex-1 flex items-center justify-end px-6">
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Olá, {profile?.name || 'Usuário'}!</div>
                      <div className="text-xs text-slate-300">
                        SB Prótese Odontológica - {profile?.role_extended === 'admin_master' ? 'Admin Master' : 'Usuário'}
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
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-none">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => navigate("/")}>
                ← Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-muted-foreground">Gerencie usuários e visualize estatísticas do sistema</p>
              </div>
            </div>

        {/* Navegação por Abas */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button 
            variant={activeTab === "pedidos" ? "default" : "outline"}
            onClick={() => setActiveTab("pedidos")}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Pedidos
          </Button>
          <Button 
            variant={activeTab === "users" ? "default" : "outline"}
            onClick={() => setActiveTab("users")}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Usuários
          </Button>
          <Button 
            variant={activeTab === "analytics" ? "default" : "outline"}
            onClick={() => setActiveTab("analytics")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button 
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Produtos
          </Button>
          <Button 
            variant={activeTab === "tipos" ? "default" : "outline"}
            onClick={() => setActiveTab("tipos")}
            className="flex items-center gap-2"
          >
            <Layers className="h-4 w-4" />
            Tipos de Prótese
          </Button>
          <Button 
            variant={activeTab === "materiais" ? "default" : "outline"}
            onClick={() => setActiveTab("materiais")}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Materiais
          </Button>
          <Button 
            variant={activeTab === "cores" ? "default" : "outline"}
            onClick={() => setActiveTab("cores")}
            className="flex items-center gap-2"
          >
            <Palette className="h-4 w-4" />
            Cores
          </Button>
          <Button 
            variant={activeTab === "compatibilidades" ? "default" : "outline"}
            onClick={() => setActiveTab("compatibilidades")}
            className="flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            Compatibilidades
          </Button>
          <Button 
            variant={activeTab === "matrizes" ? "default" : "outline"}
            onClick={() => setActiveTab("matrizes")}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Matrizes
          </Button>
        </div>

        {activeTab === "pedidos" ? (
          /* Gerenciamento de Pedidos */
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <CardTitle>Gerenciamento de Pedidos</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {totalOrdersCount} pedidos encontrados (Página {currentPage} de {totalOrdersPages})
                  </div>
                </div>
                
                {/* Filtros em linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por paciente, dentista ou ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <Settings className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="pedido_solicitado">Pedido Solicitado</SelectItem>
                      <SelectItem value="baixado_verificado">Baixado e Verificado</SelectItem>
                      <SelectItem value="projeto_realizado">Projeto Realizado</SelectItem>
                      <SelectItem value="projeto_modelo_realizado">Projeto do Modelo Realizado</SelectItem>
                      <SelectItem value="aguardando_entrega">Aguardando Entrega</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="urgente">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="justify-between"
                      >
                        {dentistFilter === "all" ? "Todos Dentistas" : dentistFilter}
                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0 bg-background border shadow-lg z-50">
                      <Command>
                        <CommandInput placeholder="Buscar dentista..." />
                        <CommandList>
                          <CommandEmpty>Nenhum dentista encontrado.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => setDentistFilter("all")}
                            >
                              Todos Dentistas
                            </CommandItem>
                            {(uniqueDentists || []).map((dentist) => (
                              <CommandItem
                                key={dentist}
                                value={dentist}
                                onSelect={() => setDentistFilter(dentist)}
                              >
                                {dentist}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Data" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todo período</SelectItem>
                      <SelectItem value="today">Hoje</SelectItem>
                      <SelectItem value="week">Última semana</SelectItem>
                      <SelectItem value="month">Último mês</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("all");
                      setPriorityFilter("all");
                      setDentistFilter("all");
                      setDateFilter("all");
                      setCurrentPage(1);
                    }}
                  >
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  ))}
                </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Imagem</TableHead>
                          <TableHead>ID</TableHead>
                          <TableHead>Paciente</TableHead>
                          <TableHead>Dentista</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Prioridade</TableHead>
                          <TableHead>Prazo</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedOrders.map((order) => (
                          <TableRow key={order.id}>
                        <TableCell>
                          {order.order_images && order.order_images.length > 0 ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <div className="w-12 h-12 cursor-pointer relative group">
                                  <img
                                    src={`${supabase.storage.from('order-images').getPublicUrl(order.order_images[0].image_url).data.publicUrl}`}
                                    alt="Thumbnail"
                                    className="w-full h-full object-cover rounded border"
                                  />
                                  {order.order_images.length > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                      +{order.order_images.length - 1}
                                    </div>
                                  )}
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>Imagens do Pedido #{order.id.slice(-8)}</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                                  {order.order_images.map((image) => (
                                    <img
                                      key={image.id}
                                      src={`${supabase.storage.from('order-images').getPublicUrl(image.image_url).data.publicUrl}`}
                                      alt="Imagem do pedido"
                                      className="w-full h-40 object-cover rounded border"
                                    />
                                  ))}
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-muted-foreground text-xs">
                              Sem foto
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          #{order.id.slice(-8)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {order.patients?.nome_completo}
                        </TableCell>
                        <TableCell>{order.dentist}</TableCell>
                        <TableCell>{order.prosthesis_type}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{order.priority}</Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(order.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/pedido/${order.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Select
                              value={order.status}
                              onValueChange={(newStatus) => handleOrderStatusChange(order.id, newStatus)}
                              disabled={updateOrderStatus.isPending}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pedido_solicitado">Pedido Solicitado</SelectItem>
                                <SelectItem value="baixado_verificado">Baixado e verificado</SelectItem>
                                <SelectItem value="projeto_realizado">Projeto Realizado</SelectItem>
                                <SelectItem value="projeto_modelo_realizado">Projeto do modelo Realizado</SelectItem>
                                <SelectItem value="aguardando_entrega">Aguardando entrega</SelectItem>
                                <SelectItem value="entregue">Entregue</SelectItem>
                                <SelectItem value="cancelado">Cancelado</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                     ))}
                   </TableBody>
                 </Table>
                 
                  {/* Paginação */}
                  {totalOrdersPages > 1 && (
                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">
                        Página {currentPage} de {totalOrdersPages} ({totalOrdersCount} pedidos no total)
                      </div>
                     <div className="flex items-center space-x-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        
                        {Array.from({ length: Math.min(5, totalOrdersPages) }, (_, i) => {
                          const pageNum = Math.max(1, currentPage - 2) + i;
                          if (pageNum > totalOrdersPages) return null;
                         
                         return (
                           <Button
                             key={pageNum}
                             variant={currentPage === pageNum ? "default" : "outline"}
                             size="sm"
                             onClick={() => setCurrentPage(pageNum)}
                           >
                             {pageNum}
                           </Button>
                         );
                       })}
                       
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalOrdersPages))}
                          disabled={currentPage === totalOrdersPages}
                        >
                          Próximo
                        </Button>
                     </div>
                   </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        ) : activeTab === "users" ? (
          /* Gerenciamento de Usuários */
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      Criar Usuário
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Usuário</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="new-name">Nome Completo</Label>
                        <Input
                          id="new-name"
                          type="text"
                          placeholder="Nome do dentista"
                          value={newUserData.name}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                          required
                        />
                      </div>
                       <div className="space-y-2">
                         <Label htmlFor="new-email">Email</Label>
                         <Input
                           id="new-email"
                           type="email"
                           placeholder="usuario@empresa.com.br (use um email real)"
                           value={newUserData.email}
                           onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                           required
                         />
                         <p className="text-xs text-muted-foreground">
                           ⚠️ Use um email corporativo válido. Emails de teste podem ser rejeitados.
                         </p>
                       </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">Senha</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="Senha temporária"
                          value={newUserData.password}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-role-extended">Função</Label>
                        <Select
                          value={newUserData.role_extended}
                          onValueChange={(value: 'admin_master' | 'admin_matriz' | 'admin_clinica' | 'dentist') => 
                            setNewUserData(prev => ({ ...prev, role_extended: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dentist">Dentista</SelectItem>
                            <SelectItem value="admin_clinica">Admin de Clínica</SelectItem>
                            <SelectItem value="admin_matriz">Admin de Matriz</SelectItem>
                            <SelectItem value="admin_master">Admin Master</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createUser.isPending}>
                          {createUser.isPending ? "Criando..." : "Criar Usuário"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-4 w-48" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-32" />
                    </div>
                  ))}
                </div>
              ) : !users ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Erro ao carregar usuários. Verifique suas permissões.
                  </p>
                  <Button 
                    onClick={() => refetchUsers()} 
                    variant="outline"
                  >
                    Tentar Novamente
                  </Button>
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                      <TableRow>
                         <TableHead>Nome</TableHead>
                         <TableHead>Email</TableHead>
                         <TableHead>Matriz</TableHead>
                         <TableHead>Clínica</TableHead>
                         <TableHead>Função</TableHead>
                         <TableHead>Criado em</TableHead>
                         <TableHead>Ações</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                     {users?.map((user) => (
                       <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.name || 'Nome não informado'}
                          </TableCell>
                           <TableCell className="text-sm text-muted-foreground">
                             {user.email || 'Email não informado'}
                           </TableCell>
                            <TableCell>
                             <Select
                               value={user.filial_id ?? 'none'}
                               onValueChange={(val: string) =>
                                 updateUserFilial.mutate({ userId: user.id, filialId: val === 'none' ? null : val })
                               }
                               disabled={updateUserFilial.isPending}
                             >
                                 <SelectTrigger className="w-52">
                                  <SelectValue placeholder="Selecionar matriz" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem matriz</SelectItem>
                                  {matrizes?.map((f) => (
                                    <SelectItem key={f.id} value={f.id}>{f.nome_completo}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={user.clinica_id ?? 'none'}
                                onValueChange={(val: string) =>
                                  updateUserClinica.mutate({ userId: user.id, clinicaId: val === 'none' ? null : val })
                                }
                                disabled={updateUserClinica.isPending}
                              >
                                <SelectTrigger className="w-56">
                                  <SelectValue placeholder="Selecionar clínica" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none">Sem clínica</SelectItem>
                                  {(clinicas || []).filter(c => !user.filial_id || c.matriz_id === user.filial_id).map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                               user.role_extended === 'admin_master' ? 'default' : 
                               user.role_extended === 'admin_matriz' ? 'default' : 
                               user.role_extended === 'admin_clinica' ? 'default' : 'secondary'
                             }>
                               {user.role_extended === 'admin_master' ? 'Admin Master' :
                                user.role_extended === 'admin_matriz' ? 'Admin Matriz' :
                                user.role_extended === 'admin_clinica' ? 'Admin Clínica' : 'Dentista'}
                             </Badge>
                           </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                         <TableCell>
                            <div className="flex items-center gap-2">
                               <Select
                                 value={user.role_extended}
                                  onValueChange={(newRole: 'admin_master' | 'admin_matriz' | 'admin_clinica' | 'dentist') => 
                                    handleRoleChange(user.id, newRole)
                                  }
                                 disabled={user.id === profile?.id || updateUserRole.isPending}
                               >
                                 <SelectTrigger className="w-40">
                                   <SelectValue />
                                 </SelectTrigger>
                                 <SelectContent>
                                   <SelectItem value="dentist">Dentista</SelectItem>
                                   <SelectItem value="admin_clinica">Admin Clínica</SelectItem>
                                   <SelectItem value="admin_matriz">Admin Matriz</SelectItem>
                                   <SelectItem value="admin_master">Admin Master</SelectItem>
                                 </SelectContent>
                               </Select>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSendResetPassword(user.email || '')}
                                disabled={!user.email || sendResetPassword.isPending}
                                title="Enviar email de redefinição de senha"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>

                              {!user.email_verified && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => confirmEmail.mutate(user.id)}
                                  disabled={confirmEmail.isPending}
                                  title="Marcar email como verificado"
                                >
                                  Liberar acesso
                                </Button>
                              )}

                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setPasswordChangeData({ userId: user.id, newPassword: '' });
                                  setShowChangePassword(true);
                                }}
                                title="Redefinir senha do usuário"
                              >
                                <Key className="h-4 w-4" />
                              </Button>
                              
                              {user.id !== profile?.id && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                      title="Deletar usuário"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja deletar o usuário <strong>{user.name}</strong>?
                                        Esta ação não pode ser desfeita. Todos os pacientes vinculados a este dentista serão desassociados.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteUser(user.id)}
                                        className="bg-destructive hover:bg-destructive/90"
                                      >
                                        Deletar
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                           </div>
                         </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        ) : activeTab === "analytics" ? (
          <AnalyticsSection />
        ) : activeTab === "products" ? (
          <ProductsManager />
        ) : activeTab === "tipos" ? (
          <TiposProteseManager />
        ) : activeTab === "materiais" ? (
          <MateriaisManager />
        ) : activeTab === "cores" ? (
          <CoresManager />
        ) : activeTab === "compatibilidades" ? (
          <CompatibilidadeManager />
        ) : activeTab === "matrizes" ? (
          <FiliaisSection />
        ) : null}
        </div>
        </main>

        {/* Dialog para redefinir senha */}
        <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Redefinir Senha</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite a nova senha"
                  value={passwordChangeData.newPassword}
                  onChange={(e) => setPasswordChangeData(prev => ({ ...prev, newPassword: e.target.value }))}
                  required
                  minLength={6}
                />
                <p className="text-sm text-muted-foreground">
                  A senha deve ter pelo menos 6 caracteres
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowChangePassword(false);
                    setPasswordChangeData({ userId: '', newPassword: '' });
                  }}
                  disabled={changeUserPassword.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={changeUserPassword.isPending}
                >
                  {changeUserPassword.isPending ? "Alterando..." : "Alterar Senha"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Admin;