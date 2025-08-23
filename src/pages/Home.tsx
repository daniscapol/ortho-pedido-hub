import Sidebar from "@/components/layout/Sidebar";
import OrderCard from "@/components/dashboard/OrderCard";
import OrderDetailsModal from "@/components/dashboard/OrderDetailsModal";

import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Bell, User, LogOut, Settings, Plus, LayoutGrid } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { Order } from "@/hooks/useOrders";
import { MASTER_STATUS_OPTIONS } from "@/lib/status-config";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const Home = () => {
  const { data: orders, isLoading } = useOrders();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { signOut } = useAuth();
  const { isSuperAdmin } = usePermissions();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAdminMaster = isSuperAdmin();

  // Paginação
  const itemsPerPage = 5; // Menos itens por página para dashboard
  const [currentPageSolicitados, setCurrentPageSolicitados] = useState(1);

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

  // Paginação - calcular dados apenas para a primeira coluna principal
  const totalPagesSolicitados = Math.ceil(displayOrdersSolicitados.length / itemsPerPage);
  const paginatedOrdersSolicitados = displayOrdersSolicitados.slice(
    (currentPageSolicitados - 1) * itemsPerPage,
    currentPageSolicitados * itemsPerPage
  );

  // Para as outras colunas, mostrar apenas os primeiros itens (sem paginação)
  const limitedOrdersAndamento = displayOrdersEmAndamento.slice(0, itemsPerPage);
  const limitedOrdersFinalizando = displayOrdersFinalizando.slice(0, itemsPerPage);


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
                <Button onClick={() => navigate('/novo-pedido')} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Novo Caso
                </Button>
              </div>
            </div>



            {/* Orders columns */}
            <div className={`grid gap-6 ${isAdminMaster ? 'grid-cols-3' : 'grid-cols-1'}`}>
              {/* Pedidos Solicitados */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-yellow-500 rounded-full"></div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {isAdminMaster ? 'Pedidos Solicitados' : 'Meus Pedidos'}
                  </h2>
                  <Badge variant="secondary" className="ml-2">
                    {displayOrdersSolicitados.length}
                  </Badge>
                </div>
                
                <div className="space-y-3 min-h-[400px] flex-grow">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </div>
                  ) : paginatedOrdersSolicitados.length > 0 ? (
                    paginatedOrdersSolicitados.map((order) => (
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
                
                {/* Paginação fixa no final da coluna */}
                {totalPagesSolicitados > 1 && (
                  <div className="mt-auto pt-8 border-t border-border">
                    <div className="flex justify-center w-full">
                      <Pagination className="mx-auto">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              onClick={() => setCurrentPageSolicitados(Math.max(1, currentPageSolicitados - 1))}
                              className={currentPageSolicitados === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                          
                          {/* Primeira página */}
                          {currentPageSolicitados > 3 && (
                            <>
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => setCurrentPageSolicitados(1)}
                                  className="cursor-pointer"
                                >
                                  1
                                </PaginationLink>
                              </PaginationItem>
                              {currentPageSolicitados > 4 && (
                                <PaginationItem>
                                  <span className="px-3 py-2 text-sm">...</span>
                                </PaginationItem>
                              )}
                            </>
                          )}
                          
                          {/* Páginas próximas à atual */}
                          {Array.from({ length: Math.min(5, totalPagesSolicitados) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(totalPagesSolicitados - 4, currentPageSolicitados - 2)) + i;
                            if (pageNum > totalPagesSolicitados) return null;
                            
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  onClick={() => setCurrentPageSolicitados(pageNum)}
                                  isActive={currentPageSolicitados === pageNum}
                                  className="cursor-pointer"
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }).filter(Boolean)}
                          
                          {/* Última página */}
                          {currentPageSolicitados < totalPagesSolicitados - 2 && (
                            <>
                              {currentPageSolicitados < totalPagesSolicitados - 3 && (
                                <PaginationItem>
                                  <span className="px-3 py-2 text-sm">...</span>
                                </PaginationItem>
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => setCurrentPageSolicitados(totalPagesSolicitados)}
                                  className="cursor-pointer"
                                >
                                  {totalPagesSolicitados}
                                </PaginationLink>
                              </PaginationItem>
                            </>
                          )}
                          
                          <PaginationItem>
                            <PaginationNext
                              onClick={() => setCurrentPageSolicitados(Math.min(totalPagesSolicitados, currentPageSolicitados + 1))}
                              className={currentPageSolicitados === totalPagesSolicitados ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  </div>
                )}
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
                     ) : limitedOrdersAndamento.length > 0 ? (
                       limitedOrdersAndamento.map((order) => (
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
                     {displayOrdersEmAndamento.length > itemsPerPage && (
                       <div className="text-center text-sm text-muted-foreground pt-2">
                         Mostrando {limitedOrdersAndamento.length} de {displayOrdersEmAndamento.length} pedidos
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
                     ) : limitedOrdersFinalizando.length > 0 ? (
                       limitedOrdersFinalizando.map((order) => (
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
                     {displayOrdersFinalizando.length > itemsPerPage && (
                       <div className="text-center text-sm text-muted-foreground pt-2">
                         Mostrando {limitedOrdersFinalizando.length} de {displayOrdersFinalizando.length} pedidos
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