import Sidebar from "@/components/layout/Sidebar";
import OrderCard from "@/components/dashboard/OrderCard";
import OrderDetailsModal from "@/components/dashboard/OrderDetailsModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Bell, User, LogOut, Settings, UserCheck, Calendar, Mail, Phone, ArrowLeft, BarChart3 } from "lucide-react";
import { useDentistOrders } from "@/hooks/useDentists";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { Order } from "@/hooks/useOrders";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DentistInfo {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
}

const DentistDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { data: orders, isLoading } = useDentistOrders(id!);
  const { data: profile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dentistInfo, setDentistInfo] = useState<DentistInfo | null>(null);

  useEffect(() => {
    const fetchDentistInfo = async () => {
      if (id && profile) {
        // Se não for admin, só pode ver seu próprio perfil
        if (profile.role !== 'admin' && profile.id !== id) {
          navigate('/dentistas');
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, name, email, created_at')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching dentist:', error);
          navigate('/dentistas');
          return;
        }

        setDentistInfo(data);
      }
    };

    fetchDentistInfo();
  }, [id, navigate, profile]);

  const handleLogout = async () => {
    await signOut();
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Filtrar pedidos baseado na busca
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    if (searchQuery.trim()) {
      return orders.filter(order => 
        order.patients?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.prosthesis_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return orders;
  }, [orders, searchQuery]);

  // Separar pedidos por status
  const ordersPending = filteredOrders.filter(order => order.status === "pending");
  const ordersInProduction = filteredOrders.filter(order => order.status === "producao");
  const ordersCompleted = filteredOrders.filter(order => 
    order.status === "pronto" || order.status === "entregue"
  );

  // Estatísticas
  const totalOrders = filteredOrders.length;
  const completedOrdersCount = ordersCompleted.length;
  const completionRate = totalOrders > 0 ? Math.round((completedOrdersCount / totalOrders) * 100) : 0;

  if (!dentistInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando informações do dentista...</p>
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
                        SB Prótese Odontológica - {profile?.role === 'admin' ? 'Filial Zone Sul' : 'Dentista'}
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
          {/* Breadcrumb and dentist info */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dentistas')}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                {dentistInfo.name || 'Dentista'}
              </h1>
            </div>
          </div>

          {/* Dentist Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <UserCheck className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{dentistInfo.name || 'Dentista'}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {dentistInfo.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Cadastrado em {format(new Date(dentistInfo.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{totalOrders}</div>
                    <div className="text-xs text-muted-foreground">Total de Pedidos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-success">{completionRate}%</div>
                    <div className="text-xs text-muted-foreground">Taxa de Conclusão</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Orders columns */}
          <div className="grid grid-cols-3 gap-6">
            {/* Pendente */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-yellow-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-foreground">
                  Pendente
                </h2>
                <Badge variant="secondary" className="ml-2">
                  {ordersPending.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </div>
                ) : ordersPending.length > 0 ? (
                  ordersPending.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onClick={() => handleOrderClick(order)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pedido pendente
                  </div>
                )}
              </div>
            </div>

            {/* Em Produção */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-foreground">
                  Em Produção
                </h2>
                <Badge variant="secondary" className="ml-2">
                  {ordersInProduction.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </div>
                ) : ordersInProduction.length > 0 ? (
                  ordersInProduction.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onClick={() => handleOrderClick(order)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pedido em produção
                  </div>
                )}
              </div>
            </div>

            {/* Concluído */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-1 w-8 bg-green-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-foreground">
                  Concluído
                </h2>
                <Badge variant="secondary" className="ml-2">
                  {ordersCompleted.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Carregando...
                  </div>
                ) : ordersCompleted.length > 0 ? (
                  ordersCompleted.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      onClick={() => handleOrderClick(order)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pedido concluído
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Order Details Modal */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    </div>
  );
};

export default DentistDetails;