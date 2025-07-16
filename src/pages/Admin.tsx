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
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useOrdersForAdmin, useUpdateOrderStatus } from "@/hooks/useOrders";
import { Search, Eye, Filter, BarChart3, UserPlus } from "lucide-react";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";

interface User {
  id: string;
  role: 'admin' | 'dentist';
  name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
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
  const [newUserData, setNewUserData] = useState({ name: '', email: '', password: '' });
  const updateOrderStatus = useUpdateOrderStatus();

  // Buscar todos os usuários
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as User[];
    },
    enabled: profile?.role === 'admin',
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
    enabled: profile?.role === 'admin',
  });

  // Mutation para alterar role do usuário
  const updateUserRole = useMutation({
    mutationFn: async ({ userId, newRole }: { userId: string; newRole: 'admin' | 'dentist' }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Role atualizado",
        description: "O tipo de usuário foi alterado com sucesso!",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao alterar tipo de usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para criar novo usuário
  const createUser = useMutation({
    mutationFn: async ({ name, email, password }: { name: string; email: string; password: string }) => {
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: { name }
        }
      });

      if (error) throw error;

      // Enviar email de boas-vindas personalizado
      try {
        const { error: emailError } = await supabase.functions.invoke('send-welcome-email', {
          body: {
            name,
            email,
            temporaryPassword: password
          }
        });

        if (emailError) {
          console.error('Erro ao enviar email de boas-vindas:', emailError);
          // Não falha a criação do usuário se o email falhar
        }
      } catch (emailError) {
        console.error('Erro ao enviar email de boas-vindas:', emailError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: "Usuário criado",
        description: "Novo dentista criado com sucesso! Email de boas-vindas enviado.",
      });
      setShowCreateUser(false);
      setNewUserData({ name: '', email: '', password: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message === "User already registered" 
          ? "Este email já está cadastrado"
          : "Erro ao criar usuário. Tente novamente.",
        variant: "destructive",
      });
    },
  });

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

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          <Header />
          
          <main className="flex-1 p-6">
            <div className="container mx-auto text-center">
              <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
              <p className="text-muted-foreground mb-4">
                Você não tem permissão para acessar esta página.
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

  const handleRoleChange = (userId: string, newRole: 'admin' | 'dentist') => {
    updateUserRole.mutate({ userId, newRole });
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name || !newUserData.email || !newUserData.password) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }
    createUser.mutate(newUserData);
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
      order.patients?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
          <div className="container mx-auto max-w-6xl">
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
        <div className="flex gap-2 mb-6">
          <Button 
            variant={activeTab === "overview" ? "default" : "outline"}
            onClick={() => setActiveTab("overview")}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Visão Geral
          </Button>
          <Button 
            variant={activeTab === "analytics" ? "default" : "outline"}
            onClick={() => setActiveTab("analytics")}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
        </div>

        {activeTab === "analytics" ? (
          <AnalyticsSection />
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
                          {order.patients?.name}
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

          {/* Gerenciamento de Usuários */}
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
                      <DialogTitle>Criar Novo Dentista</DialogTitle>
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
                          placeholder="email@exemplo.com"
                          value={newUserData.email}
                          onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                          required
                        />
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
                      <TableHead>Tipo</TableHead>
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
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role === 'admin' ? 'Administrador' : 'Dentista'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(newRole: 'admin' | 'dentist') => 
                              handleRoleChange(user.id, newRole)
                            }
                            disabled={user.id === profile?.id || updateUserRole.isPending}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="dentist">Dentista</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
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