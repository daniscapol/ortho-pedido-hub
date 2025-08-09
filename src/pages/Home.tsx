import Sidebar from "@/components/layout/Sidebar";
import OrderCard from "@/components/dashboard/OrderCard";
import OrderDetailsModal from "@/components/dashboard/OrderDetailsModal";

import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Bell, User, LogOut, Settings, Plus, Download, LayoutGrid } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import * as XLSX from 'xlsx';
import { Order } from "@/hooks/useOrders";

const Home = () => {
  const { data: orders, isLoading } = useOrders();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Enable real-time notifications
  useRealtimeNotifications();

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

  // Filtrar pedidos baseado no role do usuário
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Se ainda estiver carregando o perfil, não filtrar por enquanto (mostrar tudo para evitar flash)
    // Se não for admin, mostrar apenas pedidos do próprio usuário
    if (!isProfileLoading && profile?.role !== 'admin') {
      filtered = orders.filter(order => order.user_id === profile?.id);
    }
    
    // Aplicar filtro de busca
    if (searchQuery.trim()) {
      filtered = filtered.filter(order => 
        order.patients?.nome_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.dentist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.prosthesis_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [orders, profile, searchQuery, isProfileLoading]);

  const exportToExcel = () => {
    if (!filteredOrders.length) {
      return;
    }

    // Preparar dados para exportação
    const excelData = filteredOrders.map(order => ({
      'ID do Pedido': order.id,
      'Data de Criação': new Date(order.created_at).toLocaleDateString('pt-BR'),
      'Data de Atualização': new Date(order.updated_at).toLocaleDateString('pt-BR'),
      'Paciente': order.patients?.nome_completo || 'N/A',
      'CPF do Paciente': order.patients?.cpf || 'N/A',
      'Email do Paciente': order.patients?.email_contato || 'N/A',
      'Telefone do Paciente': order.patients?.telefone_contato || 'N/A',
      'Dentista': order.dentist,
      'Tipo de Prótese': order.prosthesis_type,
      'Material': order.material || 'N/A',
      'Cor': order.color || 'N/A',
      'Status': order.status,
      'Prioridade': order.priority,
      'Prazo': order.deadline,
      'Dentes Selecionados': order.selected_teeth?.join(', ') || 'N/A',
      'Endereço de Entrega': order.delivery_address || 'N/A',
      'Observações': order.observations || 'N/A'
    }));

    // Criar planilha
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    // Ajustar largura das colunas
    const colWidths = Object.keys(excelData[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    // Baixar arquivo
    const fileName = `pedidos_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Separar pedidos por status
  const ordersPending = filteredOrders.filter(order => 
    order.status === "pending"
  );
  
  const ordersInProduction = filteredOrders.filter(order => 
    order.status === "producao"
  );
  
  const ordersCompleted = filteredOrders.filter(order => 
    order.status === "pronto" || order.status === "entregue"
  );

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex sticky top-0 z-10">
          {/* Main header content - now full width and centered */}
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
        <div className="flex-1 flex overflow-hidden">
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-sm"></div>
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  Dashboard - Visão Geral
                </h1>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => navigate('/pedidos')} 
                  variant="outline" 
                  className="gap-2"
                >
                  <LayoutGrid className="w-4 h-4" />
                  Ver Todos os Pedidos
                </Button>
                <Button 
                  onClick={exportToExcel} 
                  variant="outline" 
                  className="gap-2"
                  disabled={!filteredOrders.length}
                >
                  <Download className="w-4 h-4" />
                  Exportar Excel
                </Button>
                <Button onClick={() => navigate('/novo-pedido')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Caso
                </Button>
              </div>
            </div>



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

        </div>

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

export default Home;