import Sidebar from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { Search, Filter, Download, Plus, Eye, Edit, User, LogOut, Settings, MoreHorizontal, Calendar as CalendarIcon, Grid3X3, List, Kanban, Clock, CheckSquare, ArrowUpDown, X, TrendingUp, AlertTriangle, Package, CheckCircle } from "lucide-react";
import { useOrders } from "@/hooks/useOrders";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import * as XLSX from 'xlsx';
import { Order } from "@/hooks/useOrders";
import { format, subDays, subWeeks, subMonths, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { DateRange } from "react-day-picker";

const Pedidos = () => {
  const { data: orders, isLoading } = useOrders();
  const { data: profile, isLoading: isProfileLoading } = useProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Estados de filtros básicos
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  // Estados de filtros avançados
  const [dentistFilter, setDentistFilter] = useState<string>("all");
  const [prosthesisTypeFilter, setProsthesisTypeFilter] = useState<string>("all");
  const [materialFilter, setMaterialFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [quickDateFilter, setQuickDateFilter] = useState<string>("all");
  
  // Estados de visualização
  const [viewMode, setViewMode] = useState<"table" | "grid" | "kanban">("table");
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{key: string; direction: "asc" | "desc"}>({key: "created_at", direction: "desc"});
  

  // Enable real-time notifications
  useRealtimeNotifications();

  const handleLogout = async () => {
    await signOut();
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'producao': { label: 'Produção', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'pronto': { label: 'Pronto', className: 'bg-green-100 text-green-800 border-green-200' },
      'entregue': { label: 'Entregue', className: 'bg-gray-100 text-gray-800 border-gray-200' }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, className: 'bg-gray-100 text-gray-800' };
    
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityMap = {
      'baixa': { label: 'Baixa', className: 'bg-gray-100 text-gray-600' },
      'normal': { label: 'Normal', className: 'bg-blue-100 text-blue-600' },
      'alta': { label: 'Alta', className: 'bg-orange-100 text-orange-600' },
      'urgente': { label: 'Urgente', className: 'bg-red-100 text-red-600' }
    };
    
    const priorityInfo = priorityMap[priority as keyof typeof priorityMap] || { label: priority, className: 'bg-gray-100 text-gray-600' };
    
    return (
      <Badge variant="secondary" className={priorityInfo.className}>
        {priorityInfo.label}
      </Badge>
    );
  };

  // Dados únicos para filtros
  const uniqueDentists = useMemo(() => {
    if (!orders) return [];
    return [...new Set(orders.map(order => order.dentist))].sort();
  }, [orders]);
  
  const uniqueProsthesisTypes = useMemo(() => {
    if (!orders) return [];
    return [...new Set(orders.map(order => order.prosthesis_type))].sort();
  }, [orders]);
  
  const uniqueMaterials = useMemo(() => {
    if (!orders) return [];
    return [...new Set(orders.map(order => order.material).filter(Boolean))].sort();
  }, [orders]);

  // Aplicar filtro de data rápida
  const applyQuickDateFilter = (range: string) => {
    const now = new Date();
    switch (range) {
      case "today":
        setDateRange({ from: now, to: now });
        break;
      case "week":
        setDateRange({ from: subDays(now, 7), to: now });
        break;
      case "month":
        setDateRange({ from: subMonths(now, 1), to: now });
        break;
      case "quarter":
        setDateRange({ from: subMonths(now, 3), to: now });
        break;
      default:
        setDateRange(undefined);
    }
    setQuickDateFilter(range);
  };

  // Filtrar pedidos baseado no role do usuário e filtros aplicados
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    let filtered = orders;
    
    // Se ainda estiver carregando o perfil, não filtrar por enquanto
    // Se não for admin, mostrar apenas pedidos do próprio usuário
    if (!isProfileLoading && profile?.role !== 'admin') {
      filtered = orders.filter(order => order.user_id === profile?.id);
    }
    
    // Aplicar filtros
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (priorityFilter !== "all") {
      filtered = filtered.filter(order => order.priority === priorityFilter);
    }
    
    if (dentistFilter !== "all") {
      filtered = filtered.filter(order => order.dentist === dentistFilter);
    }
    
    if (prosthesisTypeFilter !== "all") {
      filtered = filtered.filter(order => order.prosthesis_type === prosthesisTypeFilter);
    }
    
    if (materialFilter !== "all") {
      filtered = filtered.filter(order => order.material === materialFilter);
    }
    
    // Filtro de data
    if (dateRange?.from) {
      filtered = filtered.filter(order => isAfter(new Date(order.created_at), dateRange.from!));
    }
    if (dateRange?.to) {
      filtered = filtered.filter(order => isBefore(new Date(order.created_at), dateRange.to!));
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
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Order];
      const bValue = b[sortConfig.key as keyof Order];
      
      if (sortConfig.direction === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
    
    return filtered;
  }, [orders, profile, searchQuery, statusFilter, priorityFilter, dentistFilter, prosthesisTypeFilter, materialFilter, dateRange, sortConfig, isProfileLoading]);

  // KPIs
  const kpis = useMemo(() => {
    if (!filteredOrders) return { total: 0, pending: 0, production: 0, ready: 0, delivered: 0 };
    
    return {
      total: filteredOrders.length,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      production: filteredOrders.filter(o => o.status === 'producao').length,
      ready: filteredOrders.filter(o => o.status === 'pronto').length,
      delivered: filteredOrders.filter(o => o.status === 'entregue').length
    };
  }, [filteredOrders]);

  const exportToExcel = () => {
    if (!filteredOrders.length) return;

    const excelData = filteredOrders.map(order => ({
      'ID do Pedido': order.id,
      'Data de Criação': format(new Date(order.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR }),
      'Paciente': order.patients?.nome_completo || 'N/A',
      'CPF do Paciente': order.patients?.cpf || 'N/A',
      'Dentista': order.dentist,
      'Tipo de Prótese': order.prosthesis_type,
      'Material': order.material || 'N/A',
      'Cor': order.color || 'N/A',
      'Status': order.status,
      'Prioridade': order.priority,
      'Prazo': format(new Date(order.deadline), 'dd/MM/yyyy', { locale: ptBR }),
      'Observações': order.observations || 'N/A'
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Pedidos');

    const colWidths = Object.keys(excelData[0]).map(key => ({
      wch: Math.max(key.length, 15)
    }));
    worksheet['!cols'] = colWidths;

    const fileName = `pedidos_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <div className="sticky top-0 h-screen">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex sticky top-0 z-10">
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
                        SB Prótese Odontológica - {profile?.role === 'admin' ? 'Administrador' : 'Dentista'}
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
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Gerenciamento de Pedidos
                </h1>
                <p className="text-muted-foreground">
                  Visualize e gerencie todos os pedidos de próteses
                </p>
              </div>
              
              <div className="flex gap-2">
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
                  Novo Pedido
                </Button>
              </div>
            </div>

            {/* KPIs Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total</p>
                      <p className="text-2xl font-bold">{kpis.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Pendentes</p>
                      <p className="text-2xl font-bold">{kpis.pending}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Produção</p>
                      <p className="text-2xl font-bold">{kpis.production}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Prontos</p>
                      <p className="text-2xl font-bold">{kpis.ready}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CheckSquare className="h-6 w-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Entregues</p>
                      <p className="text-2xl font-bold">{kpis.delivered}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros Avançados */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtros Avançados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Linha 1: Busca e Filtros Rápidos de Data */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Buscar por paciente, dentista ou ID..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {["all", "today", "week", "month", "quarter"].map((range) => (
                        <Button
                          key={range}
                          variant={quickDateFilter === range ? "default" : "outline"}
                          size="sm"
                          onClick={() => applyQuickDateFilter(range)}
                        >
                          {range === "all" ? "Todos" : 
                           range === "today" ? "Hoje" :
                           range === "week" ? "7 dias" :
                           range === "month" ? "30 dias" : "90 dias"}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Linha 2: Filtros de Período Custom */}
                  <div className="flex flex-wrap gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "dd/MM/yy", { locale: ptBR })} -{" "}
                                {format(dateRange.to, "dd/MM/yy", { locale: ptBR })}
                              </>
                            ) : (
                              format(dateRange.from, "dd/MM/yy", { locale: ptBR })
                            )
                          ) : (
                            <span>Período personalizado</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={dateRange}
                          onSelect={(range) => {
                            setDateRange(range);
                            setQuickDateFilter("custom");
                          }}
                          numberOfMonths={2}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    
                    {(dateRange?.from || dateRange?.to) && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setDateRange(undefined);
                          setQuickDateFilter("all");
                        }}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>
                  
                  {/* Linha 3: Filtros por Categorias */}
                  <div className="flex flex-wrap gap-4">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Status</SelectItem>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="producao">Em Produção</SelectItem>
                        <SelectItem value="pronto">Pronto</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[160px]">
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

                    <Select value={dentistFilter} onValueChange={setDentistFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Dentista" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Dentistas</SelectItem>
                        {uniqueDentists.map((dentist) => (
                          <SelectItem key={dentist} value={dentist}>{dentist}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={prosthesisTypeFilter} onValueChange={setProsthesisTypeFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Tipo de Prótese" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        {uniqueProsthesisTypes.map((type) => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={materialFilter} onValueChange={setMaterialFilter}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        {uniqueMaterials.map((material) => (
                          <SelectItem key={material} value={material}>{material}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controles de Visualização e Ações */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span>Pedidos ({filteredOrders.length})</span>
                    {selectedOrders.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{selectedOrders.length} selecionados</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Implementar ações em lote aqui
                            toast({
                              title: "Ação em lote",
                              description: `${selectedOrders.length} pedidos selecionados`,
                            });
                          }}
                        >
                          Ações em Lote
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedOrders([])}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
                      <TabsList>
                        <TabsTrigger value="table" className="gap-1">
                          <List className="w-4 h-4" />
                          Tabela
                        </TabsTrigger>
                        <TabsTrigger value="grid" className="gap-1">
                          <Grid3X3 className="w-4 h-4" />
                          Cards
                        </TabsTrigger>
                        <TabsTrigger value="kanban" className="gap-1">
                          <Kanban className="w-4 h-4" />
                          Kanban
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[50px]" />
                      </div>
                    ))}
                  </div>
                ) : filteredOrders.length > 0 ? (
                  <>
                    {/* Table View */}
                    {viewMode === "table" && (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[50px]">
                                <Checkbox
                                  checked={selectedOrders.length === filteredOrders.length}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedOrders(filteredOrders.map(o => o.id));
                                    } else {
                                      setSelectedOrders([]);
                                    }
                                  }}
                                />
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => setSortConfig({key: "id", direction: sortConfig.key === "id" && sortConfig.direction === "asc" ? "desc" : "asc"})}>
                                ID <ArrowUpDown className="inline w-4 h-4 ml-1" />
                              </TableHead>
                              <TableHead className="cursor-pointer" onClick={() => setSortConfig({key: "created_at", direction: sortConfig.key === "created_at" && sortConfig.direction === "asc" ? "desc" : "asc"})}>
                                Data <ArrowUpDown className="inline w-4 h-4 ml-1" />
                              </TableHead>
                              <TableHead>Paciente</TableHead>
                              <TableHead>Dentista</TableHead>
                              <TableHead>Tipo</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Prioridade</TableHead>
                              <TableHead className="cursor-pointer" onClick={() => setSortConfig({key: "deadline", direction: sortConfig.key === "deadline" && sortConfig.direction === "asc" ? "desc" : "asc"})}>
                                Prazo <ArrowUpDown className="inline w-4 h-4 ml-1" />
                              </TableHead>
                              <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredOrders.map((order) => (
                              <TableRow key={order.id} className="hover:bg-muted/50">
                                <TableCell>
                                  <Checkbox
                                    checked={selectedOrders.includes(order.id)}
                                    onCheckedChange={(checked) => {
                                      if (checked) {
                                        setSelectedOrders([...selectedOrders, order.id]);
                                      } else {
                                        setSelectedOrders(selectedOrders.filter(id => id !== order.id));
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell className="font-mono text-sm">
                                  {order.id.slice(0, 8)}...
                                </TableCell>
                                <TableCell>
                                  {format(new Date(order.created_at), 'dd/MM/yy', { locale: ptBR })}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {order.patients?.nome_completo || 'N/A'}
                                </TableCell>
                                <TableCell>{order.dentist}</TableCell>
                                <TableCell>{order.prosthesis_type}</TableCell>
                                <TableCell>{getStatusBadge(order.status)}</TableCell>
                                <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                                <TableCell>
                                  {format(new Date(order.deadline), 'dd/MM/yy', { locale: ptBR })}
                                </TableCell>
                                <TableCell className="text-right">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => navigate(`/pedido/${order.id}`)}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        Ver Detalhes
                                      </DropdownMenuItem>
                                      {profile?.role === 'admin' && (
                                        <DropdownMenuItem onClick={() => {
                                          toast({
                                            title: "Ação rápida",
                                            description: "Mudança de status implementada",
                                          });
                                        }}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Alterar Status
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}

                    {/* Grid View */}
                    {viewMode === "grid" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOrders.map((order) => (
                          <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/pedido/${order.id}`)}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div className="font-mono text-sm text-muted-foreground">
                                  {order.id.slice(0, 8)}...
                                </div>
                                <div className="flex gap-1">
                                  {getStatusBadge(order.status)}
                                  {getPriorityBadge(order.priority)}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="font-medium">{order.patients?.nome_completo || 'N/A'}</div>
                                <div className="text-sm text-muted-foreground">Dentista: {order.dentist}</div>
                                <div className="text-sm text-muted-foreground">Tipo: {order.prosthesis_type}</div>
                                <div className="text-sm text-muted-foreground">
                                  Prazo: {format(new Date(order.deadline), 'dd/MM/yyyy', { locale: ptBR })}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Kanban View */}
                    {viewMode === "kanban" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {["pending", "producao", "pronto", "entregue"].map((status) => {
                          const statusOrders = filteredOrders.filter(order => order.status === status);
                          const statusLabels = {
                            pending: "Pendentes",
                            producao: "Em Produção", 
                            pronto: "Prontos",
                            entregue: "Entregues"
                          };
                          
                          return (
                            <div key={status} className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium">{statusLabels[status as keyof typeof statusLabels]}</h3>
                                <Badge variant="secondary">{statusOrders.length}</Badge>
                              </div>
                              <div className="space-y-2 min-h-[400px]">
                                {statusOrders.map((order) => (
                                  <Card key={order.id} className="p-3 cursor-pointer hover:shadow-sm" onClick={() => navigate(`/pedido/${order.id}`)}>
                                    <div className="space-y-2">
                                      <div className="font-medium text-sm">{order.patients?.nome_completo}</div>
                                      <div className="text-xs text-muted-foreground">{order.dentist}</div>
                                      <div className="text-xs text-muted-foreground">{order.prosthesis_type}</div>
                                      <div className="flex justify-between items-center">
                                        {getPriorityBadge(order.priority)}
                                        <div className="text-xs text-muted-foreground">
                                          {format(new Date(order.deadline), 'dd/MM', { locale: ptBR })}
                                        </div>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <div className="text-lg font-medium text-muted-foreground mb-2">
                      {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || dentistFilter !== "all" || prosthesisTypeFilter !== "all" || materialFilter !== "all" || dateRange?.from
                        ? "Nenhum pedido encontrado" 
                        : "Nenhum pedido cadastrado"}
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== "all" || priorityFilter !== "all" || dentistFilter !== "all" || prosthesisTypeFilter !== "all" || materialFilter !== "all" || dateRange?.from
                        ? "Tente ajustar os filtros para encontrar pedidos"
                        : "Comece criando seu primeiro pedido"}
                    </div>
                    <Button onClick={() => navigate('/novo-pedido')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Primeiro Pedido
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Pedidos;