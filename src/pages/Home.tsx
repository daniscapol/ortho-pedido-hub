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
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import * as XLSX from 'xlsx';
import { Order } from "@/hooks/useOrders";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getStatusLabel } from "@/lib/status-config";

const Home = () => {
  const { data: orders, isLoading } = useOrders();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { signOut } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdminMaster = isSuperAdmin();

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

  const exportToExcel = async () => {
    console.log("🔍 Iniciando exportação Excel...");
    
    if (!filteredOrders.length) {
      console.log("❌ Nenhum pedido para exportar");
      return;
    }

    console.log("📊 Exportando", filteredOrders.length, "pedidos");

    try {
      // Aba 1: Resumo dos Pedidos - SIMPLIFICADO PARA TESTE
      console.log("📋 Criando aba de resumo...");
      
      const ordersData = [];
      
      for (let i = 0; i < filteredOrders.length; i++) {
        const order = filteredOrders[i];
        console.log(`📝 Processando pedido ${i + 1}/${filteredOrders.length}: ${order.id}`);
        
        try {
          const orderData = {
            "ID do Pedido": order.id || "N/A",
            "Paciente": order.patients?.nome_completo || "N/A",
            "Dentista": order.dentist || "N/A",
            "Status": order.status || "N/A",
            "Prioridade": order.priority || "N/A"
          };
          
          ordersData.push(orderData);
          console.log(`✅ Pedido ${i + 1} processado com sucesso`);
        } catch (orderError) {
          console.error(`❌ Erro ao processar pedido ${i + 1}:`, orderError);
          // Adicionar linha de erro
          ordersData.push({
            "ID do Pedido": order.id || `Erro-${i}`,
            "Paciente": "Erro",
            "Dentista": "Erro", 
            "Status": "Erro",
            "Prioridade": "Erro"
          });
        }
      }

      console.log("✅ Aba de resumo criada com", ordersData.length, "registros");

      // Criar workbook simples apenas com resumo
      console.log("📊 Criando workbook Excel simples...");
      const workbook = XLSX.utils.book_new();

      if (ordersData.length === 0) {
        throw new Error("Nenhum dado foi processado para exportar");
      }

      // Apenas a aba de resumo por enquanto
      console.log("📋 Criando planilha de resumo...");
      const ordersWorksheet = XLSX.utils.json_to_sheet(ordersData);
      XLSX.utils.book_append_sheet(workbook, ordersWorksheet, "Resumo dos Pedidos");

      // Baixar arquivo
      console.log("💾 Iniciando download do arquivo...");
      const fileName = `pedidos_simples_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
      console.log("📁 Nome do arquivo:", fileName);
      
      XLSX.writeFile(workbook, fileName);
      console.log("✅ Download iniciado com sucesso!");

      toast({
        title: "Exportação concluída", 
        description: `Arquivo Excel gerado com ${ordersData.length} pedidos`,
      });

    } catch (error) {
      console.error("❌ Erro durante exportação:", error);
      toast({
        title: "Erro na exportação",
        description: `Falha ao gerar arquivo Excel: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  // Separar pedidos por status
  const ordersSolicitados = filteredOrders.filter(order => 
    order.status === "pedido_solicitado"
  );
  
  const ordersEmAndamento = filteredOrders.filter(order => 
    order.status === "baixado_verificado" || 
    order.status === "projeto_realizado" || 
    order.status === "projeto_modelo_realizado"
  );
  
  const ordersFinalizando = filteredOrders.filter(order => 
    order.status === "aguardando_entrega" || 
    order.status === "entregue"
  );

  // Para usuários não admin master, mostrar todos os pedidos na primeira coluna
  const displayOrdersSolicitados = isAdminMaster ? ordersSolicitados : filteredOrders;
  const displayOrdersEmAndamento = isAdminMaster ? ordersEmAndamento : [];
  const displayOrdersFinalizando = isAdminMaster ? ordersFinalizando : [];

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
            <div className={`grid gap-6 ${isAdminMaster ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {/* Pedidos Solicitados */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-yellow-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {isAdminMaster ? 'Pedidos Solicitados' : 'Meus Pedidos'}
                  </h2>
                  <Badge variant="secondary" className="ml-2">
                    {displayOrdersSolicitados.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </div>
                  ) : displayOrdersSolicitados.length > 0 ? (
                    displayOrdersSolicitados.map((order) => (
                      <OrderCard 
                        key={order.id} 
                        order={order} 
                        onClick={() => handleOrderClick(order)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum pedido encontrado
                    </div>
                  )}
                </div>
              </div>

              {/* Em Andamento (só para admin master) */}
              {isAdminMaster && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-8 bg-blue-500 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Em Andamento
                    </h2>
                    <Badge variant="secondary" className="ml-2">
                      {displayOrdersEmAndamento.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </div>
                    ) : displayOrdersEmAndamento.length > 0 ? (
                      displayOrdersEmAndamento.map((order) => (
                        <OrderCard 
                          key={order.id} 
                          order={order} 
                          onClick={() => handleOrderClick(order)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum pedido em andamento
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Finalizando (só para admin master) */}
              {isAdminMaster && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-1 w-8 bg-green-500 rounded-full"></div>
                    <h2 className="text-lg font-semibold text-foreground">
                      Finalizando
                    </h2>
                    <Badge variant="secondary" className="ml-2">
                      {displayOrdersFinalizando.length}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {isLoading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Carregando...
                      </div>
                    ) : displayOrdersFinalizando.length > 0 ? (
                      displayOrdersFinalizando.map((order) => (
                        <OrderCard 
                          key={order.id} 
                          order={order} 
                          onClick={() => handleOrderClick(order)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Nenhum pedido finalizando
                      </div>
                    )}
                  </div>
                </div>
              )}
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