import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrdersForAdmin, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Search, Eye, Filter, BarChart3, UserPlus, Trash2, Mail, Package, Layers, Palette, Settings, Link, Users, Building2 } from "lucide-react";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { ProductsManager } from "@/components/admin/ProductsManager";
import { TiposProteseManager } from "@/components/admin/TiposProteseManager";
import { MateriaisManager } from "@/components/admin/MateriaisManager";
import { CoresManager } from "@/components/admin/CoresManager";
import { CompatibilidadeManager } from "@/components/admin/CompatibilidadeManager";
import { useFiliais } from "@/hooks/useFiliais";
import { useClinicas } from "@/hooks/useClinicas";

interface User {
  id: string;
  role_extended: 'admin_master' | 'admin_filial' | 'admin_clinica' | 'dentist';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newUserData, setNewUserData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    role_extended: 'dentist' as 'admin_master' | 'admin_filial' | 'admin_clinica' | 'dentist'
  });
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const updateOrderStatus = useUpdateOrderStatus();

  // Hook para filiais
  const { data: filiais, isLoading: filiaisLoading } = useFiliais();
  // Hook para clínicas
  const { data: clinicas } = useClinicas();

  // Componente interno para seção de filiais
  const FiliaisSection = () => (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Filiais</CardTitle>
      </CardHeader>
      <CardContent>
        {filiaisLoading ? (
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
              {filiais?.map((filial) => (
                <TableRow key={filial.id}>
                  <TableCell className="font-medium">
                    {filial.nome_completo}
                  </TableCell>
                  <TableCell>
                    {filial.endereco}
                  </TableCell>
                  <TableCell>
                    {filial.telefone}
                  </TableCell>
                  <TableCell>
                    {filial.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {filial.qntd_clinicas || 0} clínicas
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {filial.qntd_pacientes || 0} pacientes
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={filial.ativo ? 'default' : 'secondary'}>
                      {filial.ativo ? 'Ativa' : 'Inativa'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(filial.created_at), 'dd/MM/yyyy', { locale: ptBR })}
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
      const { data, error } = await supabase.functions.invoke('admin-list-users');
      if (error) throw error;
      return (data?.users || []) as User[];
    },
    enabled: profile?.role_extended === 'admin_master',
  });

  // Buscar todos os pedidos para admin
  const { data: orders, isLoading: ordersLoading } = useOrdersForAdmin();

  // Buscar estatísticas dos pedidos
  const { data: orderStats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('status')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const stats = {
        total: data.length,
        pending: data.filter(o => o.status === 'pending').length,
        producao: data.filter(o => o.status === 'producao').length,
        pronto: data.filter(o => o.status === 'pronto').length,
        entregue: data.filter(o => o.status === 'entregue').length,
      };

      return stats;
    },
    enabled: profile?.role_extended === 'admin_master',
  });

  // Mutation para alterar role do usuário
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin_master' | 'admin_filial' | 'admin_clinica' | 'dentist' }) => {
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

  // Mutation para alterar filial do usuário
  const updateUserFilial = useMutation({
    mutationFn: async ({ userId, filialId }: { userId: string; filialId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ filial_id: filialId })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Filial atualizada',
        description: 'O usuário foi associado à filial com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a filial do usuário.',
        variant: 'destructive',
      });
    },
  });

  // Mutation para alterar clínica do usuário
  const updateUserClinica = useMutation({
    mutationFn: async ({ userId, clinicaId }: { userId: string; clinicaId: string | null }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ clinica_id: clinicaId })
        .eq('id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Clínica atualizada',
        description: 'O usuário foi associado à clínica com sucesso.',
      });
    },
    onError: () => {
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a clínica do usuário.',
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
      role_extended: 'admin_master' | 'admin_filial' | 'admin_clinica' | 'dentist'
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

  // Verificar se o usuário é admin
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6">
            <Skeleton className="h-8 w-64" />
          </main>
        </div>
      </div>
    );
  }

  if (profile?.role_extended !== 'admin_master') {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6">
            <div className="container mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground mb-4">
                Apenas administradores master podem acessar esta página.
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

  const handleRoleChange = (userId: string, newRole: 'admin_master' | 'admin_filial' | 'admin_clinica' | 'dentist') => {
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

  const handleSendResetPassword = (email: string) => {
    sendResetPassword.mutate(email);
  };

  const handleOrderStatusChange = (orderId: string, newStatus: string) => {
    updateOrderStatus.mutate({ id: orderId, status: newStatus });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      producao: "bg-blue-100 text-blue-800 border-blue-200",
      pronto: "bg-green-100 text-green-800 border-green-200", 
      entregue: "bg-gray-100 text-gray-800 border-gray-200"
    };

    const labels = {
      pending: "Pendente",
      producao: "Produção",
      pronto: "Pronto",
      entregue: "Entregue"
    };

    return (
      <Badge className={colors[status as keyof typeof colors] || colors.pending}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  // Filtrar pedidos
  const filteredOrders = orders?.filter((order) => {
    const matchesSearch = 
      order.patients?.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.dentist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.prosthesis_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-7xl">
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
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Visão Geral
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
            variant={activeTab === "filiais" ? "default" : "outline"}
            onClick={() => setActiveTab("filiais")}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Filiais
          </Button>
        </div>

        {activeTab === "users" ? (
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
                          onValueChange={(value: 'admin_master' | 'admin_filial' | 'admin_clinica' | 'dentist') => 
                            setNewUserData(prev => ({ ...prev, role_extended: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="dentist">Dentista</SelectItem>
                            <SelectItem value="admin_clinica">Admin de Clínica</SelectItem>
                            <SelectItem value="admin_filial">Admin de Filial</SelectItem>
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
              ) : (
                <Table>
                  <TableHeader>
                     <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Verificação</TableHead>
                        <TableHead>Filial</TableHead>
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
                            <Badge variant={user.email_verified ? 'default' : 'secondary'}>
                              {user.email_verified ? 'Verificado' : 'Não verificado'}
                            </Badge>
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
                                 <SelectValue placeholder="Selecionar filial" />
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="none">Sem filial</SelectItem>
                                 {filiais?.map((f) => (
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
                                  {(clinicas || []).filter(c => !user.filial_id || c.filial_id === user.filial_id).map((c) => (
                                    <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge variant={
                               user.role_extended === 'admin_master' ? 'default' : 
                               user.role_extended === 'admin_filial' ? 'default' : 
                               user.role_extended === 'admin_clinica' ? 'default' : 'secondary'
                             }>
                               {user.role_extended === 'admin_master' ? 'Admin Master' :
                                user.role_extended === 'admin_filial' ? 'Admin Filial' :
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
                                 onValueChange={(newRole: 'admin_master' | 'admin_filial' | 'admin_clinica' | 'dentist') => 
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
                                   <SelectItem value="admin_filial">Admin Filial</SelectItem>
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
        ) : activeTab === "filiais" ? (
          <FiliaisSection />
        ) : (
          <div className="space-y-6">
            {/* Estatísticas dos Pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Pedidos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold">{orderStats?.total || 0}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pendentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-yellow-600">{orderStats?.pending || 0}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Em Produção
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-blue-600">{orderStats?.producao || 0}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Prontos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-green-600">{orderStats?.pronto || 0}</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Entregues
                </CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  <div className="text-2xl font-bold text-gray-600">{orderStats?.entregue || 0}</div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Gerenciamento de Pedidos */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle>Gerenciamento de Pedidos</CardTitle>
                <div className="flex flex-col md:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por paciente, dentista ou ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Status</SelectItem>
                      <SelectItem value="pending">Pendente</SelectItem>
                      <SelectItem value="producao">Produção</SelectItem>
                      <SelectItem value="pronto">Pronto</SelectItem>
                      <SelectItem value="entregue">Entregue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
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
                    {filteredOrders?.map((order) => (
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
                                <SelectItem value="pending">Pendente</SelectItem>
                                <SelectItem value="producao">Produção</SelectItem>
                                <SelectItem value="pronto">Pronto</SelectItem>
                                <SelectItem value="entregue">Entregue</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          </div>
        )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;