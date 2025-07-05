import Sidebar from "@/components/layout/Sidebar";
import OrderCard from "@/components/dashboard/OrderCard";
import AgendaSidebar from "@/components/dashboard/AgendaSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Bell, User, LogOut, Settings, Plus } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";

const Dashboard = () => {
  const { data: orders, isLoading } = useOrders();
  const { data: profile } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = async () => {
    await signOut();
  };

  // Filtrar pedidos baseado no role do usuário
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Se não for admin, mostrar apenas pedidos do próprio usuário
    if (profile?.role !== 'admin') {
      filtered = orders.filter(order => order.user_id === profile?.id);
    }
    
    // Aplicar filtro de busca
    if (searchQuery.trim()) {
      filtered = filtered.filter(order => 
        order.patients?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.dentist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.prosthesis_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [orders, profile, searchQuery]);

  // Separar pedidos por status
  const ordersInProgress = filteredOrders.filter(order => 
    order.status === "pending" || order.status === "producao" || order.status === "pronto"
  );
  
  const ordersCompleted = filteredOrders.filter(order => 
    order.status === "entregue"
  );

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex">
          {/* Header section that aligns with sidebar */}
          <div className="w-48 flex items-center px-4 border-r border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-slate-800 font-bold text-lg">SB</span>
              </div>
              <div>
                <h1 className="text-white font-semibold text-lg">SB</h1>
                <p className="text-slate-300 text-xs">PRÓTESE ODONTOLÓGICA</p>
              </div>
            </div>
          </div>
          
          {/* Main header content */}
          <div className="flex-1 flex items-center justify-between px-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Input
                    placeholder="Pesquise um clínica, dentista ou paciente"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            
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
                        {profile?.role === 'admin' ? 'Filial Zone Sul' : 'Dentista'}
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
        <div className="flex-1 flex">
          <main className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary-foreground rounded-sm"></div>
                </div>
                <h1 className="text-xl font-semibold text-foreground">
                  Gerenciamento de Pedidos
                </h1>
              </div>
              
              <Button onClick={() => navigate('/novo-pedido')} className="gap-2">
                <Plus className="w-4 h-4" />
                Novo Caso
              </Button>
            </div>

            {/* Search and filters section */}
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" className="text-foreground">
                Pesquisa
              </Button>
              <div className="h-6 w-px bg-border"></div>
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Pesquise uma palavra-chave
              </Button>
            </div>

            {/* Orders columns */}
            <div className="grid grid-cols-2 gap-6">
              {/* Em andamento */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-warning rounded-full"></div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Em andamento
                  </h2>
                  <Badge variant="secondary" className="ml-2">
                    {ordersInProgress.length}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Carregando...
                    </div>
                  ) : ordersInProgress.length > 0 ? (
                    ordersInProgress.map((order) => (
                      <OrderCard key={order.id} order={order} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum caso em andamento
                    </div>
                  )}
                </div>
              </div>

              {/* Concluído */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-1 w-8 bg-success rounded-full"></div>
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
                      <OrderCard key={order.id} order={order} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum caso concluído
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>

          {/* Agenda Sidebar */}
          <div className="w-96 p-6 border-l border-border">
            <AgendaSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;