import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon, ChevronLeft, ChevronRight, Search, User, Settings, LogOut, Clock, Filter, BarChart3, Eye, MapPin, Phone, Calendar as CalendarLucide } from "lucide-react"
import { addDays } from "date-fns"
import { useOrders, Order } from "@/hooks/useOrders"
import { useProfile } from "@/hooks/useProfile"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO, isToday, isPast, isFuture, startOfMonth, endOfMonth, eachWeekOfInterval, addMonths, subMonths, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import Sidebar from "@/components/layout/Sidebar"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/AuthProvider"
import { useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const Agenda = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [viewMode, setViewMode] = useState("week")
  const [selectedStatus, setSelectedStatus] = useState<string[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const { data: orders, isLoading } = useOrders()
  const { data: profile } = useProfile()

  const handleLogout = async () => {
    await signOut()
  }

  // Tipos de próteses únicos dos pedidos
  const prosthesisTypes = useMemo(() => {
    if (!orders) return []
    const types = [...new Set(orders.map(order => order.prosthesis_type))]
    return types
  }, [orders])

  // Status únicos dos pedidos
  const statusOptions = useMemo(() => {
    const statuses = [
      { value: 'pending', label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      { value: 'producao', label: 'Em Produção', color: 'bg-blue-100 text-blue-800' },
      { value: 'pronto', label: 'Pronto', color: 'bg-green-100 text-green-800' },
      { value: 'entregue', label: 'Entregue', color: 'bg-gray-100 text-gray-800' }
    ]
    return statuses
  }, [])

  // Filtrar pedidos com base nos filtros selecionados
  const filteredOrders = useMemo(() => {
    if (!orders) return []
    
    return orders.filter(order => {
      // Filtro por tipo de prótese
      if (selectedTypes.length > 0 && !selectedTypes.includes(order.prosthesis_type)) {
        return false
      }
      
      // Filtro por status
      if (selectedStatus.length > 0 && !selectedStatus.includes(order.status)) {
        return false
      }
      
      // Filtro por busca (dentista ou paciente)
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          order.dentist.toLowerCase().includes(searchLower) ||
          order.patients?.name.toLowerCase().includes(searchLower)
        )
      }
      
      return true
    })
  }, [orders, selectedTypes, selectedStatus, searchTerm])

  // Obter dias da semana atual
  const weekStart = startOfWeek(currentDate, { locale: ptBR })
  const weekEnd = endOfWeek(currentDate, { locale: ptBR })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Obter pedidos para cada dia da semana
  // Obter dias do mês atual
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthWeeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 0 })
  
  const getOrdersForDay = (day: Date) => {
    return filteredOrders.filter(order => {
      const orderDate = parseISO(order.deadline)
      return isSameDay(orderDate, day)
    })
  }

  // Estatísticas dos pedidos
  const orderStats = useMemo(() => {
    if (!filteredOrders) return { total: 0, pending: 0, production: 0, ready: 0, delivered: 0 }
    return {
      total: filteredOrders.length,
      pending: filteredOrders.filter(o => o.status === 'pending').length,
      production: filteredOrders.filter(o => o.status === 'producao').length,
      ready: filteredOrders.filter(o => o.status === 'pronto').length,
      delivered: filteredOrders.filter(o => o.status === 'entregue').length
    }
  }, [filteredOrders])

  // Cores para diferentes tipos de próteses
  const getTypeColor = (type: string) => {
    const colors = {
      "Coroa Emax": "border-l-4 border-l-blue-500 bg-blue-50",
      "Coroa Impressa": "border-l-4 border-l-green-500 bg-green-50",
      "Coroa sobre Implante": "border-l-4 border-l-purple-500 bg-purple-50",
      "Inlay/Onlay Emax": "border-l-4 border-l-orange-500 bg-orange-50",
      "Inlay/Olay Implante": "border-l-4 border-l-pink-500 bg-pink-50",
      "Facetas": "border-l-4 border-l-indigo-500 bg-indigo-50",
    }
    return colors[type as keyof typeof colors] || "border-l-4 border-l-gray-500 bg-gray-50"
  }

  const getStatusColor = (status: string) => {
    const colors = statusOptions.find(s => s.value === status)
    return colors?.color || "bg-gray-100 text-gray-800"
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800'
      case 'media': return 'bg-yellow-100 text-yellow-800'
      case 'baixa': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const toggleStatusFilter = (status: string) => {
    setSelectedStatus(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    )
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1)
    )
  }

  const getDayDensity = (count: number) => {
    if (count === 0) return ''
    if (count <= 2) return 'bg-blue-100 text-blue-800'
    if (count <= 4) return 'bg-blue-200 text-blue-900'
    if (count <= 6) return 'bg-blue-300 text-blue-900'
    return 'bg-blue-500 text-white'
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="fixed inset-y-0 left-0 z-50">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col ml-64">
          {/* Header */}
          <header className="fixed top-0 right-0 left-64 z-40 bg-slate-800 border-b border-slate-700 h-20">
            <div className="flex-1 flex items-center justify-center px-6 h-full">
              <div className="text-white">Carregando agenda...</div>
            </div>
          </header>
          <main className="flex-1 flex items-center justify-center pt-20">
            <div className="text-muted-foreground">Carregando agenda...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="fixed inset-y-0 left-0 z-50">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col ml-64">
        {/* Header */}
        <header className="fixed top-0 right-0 left-64 z-40 bg-slate-800 border-b border-slate-700 h-20">
          <div className="flex-1 flex items-center justify-between px-8 h-full">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold text-white">Hub da Agenda</h1>
            </div>
            
            <div className="flex items-center gap-6">
              <NotificationDropdown />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-slate-700 px-4 py-3 h-auto">
                    <User className="w-6 h-6" />
                    <div className="text-left">
                      <div className="text-base font-semibold">Olá, {profile?.name || 'Usuário'}!</div>
                      <div className="text-sm text-slate-300">
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
        
        <main className="flex-1 p-6 bg-gradient-to-br from-slate-50 to-slate-100 pt-24">
          <div className="max-w-7xl mx-auto">
            {/* Header com estatísticas */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Hub da Agenda</h1>
                    <p className="text-gray-600">Visualize e gerencie todos os seus pedidos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
                    <Clock className="w-4 h-4 mr-2" />
                    Hoje
                  </Button>
                  <Select value={viewMode} onValueChange={setViewMode}>
                    <SelectTrigger className="w-36">
                      <Eye className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Visualização Semanal</SelectItem>
                      <SelectItem value="month">Visualização Mensal</SelectItem>
                      <SelectItem value="list">Lista Completa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Cards de estatísticas */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-100 text-sm">Total de Pedidos</p>
                        <p className="text-2xl font-bold">{orderStats.total}</p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-blue-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-yellow-100 text-sm">Pendentes</p>
                        <p className="text-2xl font-bold">{orderStats.pending}</p>
                      </div>
                      <Clock className="w-8 h-8 text-yellow-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-purple-100 text-sm">Em Produção</p>
                        <p className="text-2xl font-bold">{orderStats.production}</p>
                      </div>
                      <Settings className="w-8 h-8 text-purple-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-green-100 text-sm">Prontos</p>
                        <p className="text-2xl font-bold">{orderStats.ready}</p>
                      </div>
                      <CalendarLucide className="w-8 h-8 text-green-200" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-gradient-to-r from-gray-500 to-gray-600 text-white">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-100 text-sm">Entregues</p>
                        <p className="text-2xl font-bold">{orderStats.delivered}</p>
                      </div>
                      <MapPin className="w-8 h-8 text-gray-200" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="week">Visualização Semanal</TabsTrigger>
                <TabsTrigger value="month">Visualização Mensal</TabsTrigger>
                <TabsTrigger value="list">Lista Completa</TabsTrigger>
              </TabsList>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filtros laterais */}
                <div className="space-y-4">
                  {/* Busca */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Buscar
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Dentista ou paciente..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mini calendário */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4" />
                        Navegar
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="w-full"
                        locale={ptBR}
                      />
                    </CardContent>
                  </Card>

                  {/* Filtros por status */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {statusOptions.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={status.value}
                            checked={selectedStatus.includes(status.value)}
                            onChange={() => toggleStatusFilter(status.value)}
                            className="rounded border-gray-300"
                          />
                          <label 
                            htmlFor={status.value} 
                            className="flex items-center gap-2 text-sm font-medium cursor-pointer"
                          >
                            <Badge className={`${status.color} text-xs`}>
                              {status.label}
                            </Badge>
                          </label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Filtros por tipo de serviço */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Tipos de Serviço</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {prosthesisTypes.map((type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={type}
                            checked={selectedTypes.includes(type)}
                            onChange={() => toggleTypeFilter(type)}
                            className="rounded border-gray-300"
                          />
                          <label 
                            htmlFor={type} 
                            className="text-sm font-medium cursor-pointer"
                          >
                            {type}
                          </label>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Conteúdo principal */}
                <div className="lg:col-span-3">
                  <TabsContent value="week" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateWeek('prev')}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <h2 className="text-xl font-semibold">
                            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                          </h2>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateWeek('next')}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Cabeçalho dos dias da semana */}
                        <div className="grid grid-cols-7 gap-4 mb-6">
                          {weekDays.map((day) => (
                            <div key={day.toISOString()} className="text-center">
                              <div className="text-sm text-gray-500 mb-2">
                                {format(day, "EEE", { locale: ptBR })}
                              </div>
                              <div className={cn(
                                "text-lg font-semibold w-10 h-10 mx-auto rounded-full flex items-center justify-center transition-colors",
                                isToday(day) 
                                  ? "bg-primary text-white shadow-lg" 
                                  : isPast(day) 
                                    ? "text-gray-400" 
                                    : "text-gray-900 hover:bg-gray-100"
                              )}>
                                {format(day, "d")}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Grid com os pedidos */}
                        <div className="grid grid-cols-7 gap-4 min-h-[500px]">
                          {weekDays.map((day) => {
                            const dayOrders = getOrdersForDay(day)
                            return (
                              <div key={day.toISOString()} className="space-y-2">
                                {dayOrders.map((order) => (
                                  <Card 
                                    key={order.id}
                                    className={cn(
                                      "p-3 cursor-pointer hover:shadow-md transition-shadow",
                                      getTypeColor(order.prosthesis_type)
                                    )}
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <div className="space-y-2">
                                      <div className="font-medium text-sm truncate">
                                        {order.prosthesis_type}
                                      </div>
                                      <div className="text-xs text-gray-600 truncate">
                                        {order.dentist}
                                      </div>
                                      {order.patients && (
                                        <div className="text-xs text-gray-500 truncate">
                                          {order.patients.name}
                                        </div>
                                      )}
                                      <div className="flex flex-col gap-1">
                                        <Badge className={cn("text-xs", getStatusColor(order.status))}>
                                          {statusOptions.find(s => s.value === order.status)?.label}
                                        </Badge>
                                        <Badge className={cn("text-xs", getPriorityColor(order.priority))}>
                                          {order.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="month" className="space-y-4">
                    <Card>
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateMonth('prev')}
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </Button>
                          <h2 className="text-xl font-semibold">
                            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
                          </h2>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateMonth('next')}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="text-sm text-gray-500">
                          Clique em um dia para ver os detalhes
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Cabeçalho dos dias da semana */}
                        <div className="grid grid-cols-7 gap-2 mb-4">
                          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dayName) => (
                            <div key={dayName} className="text-center text-sm font-medium text-gray-500 py-2">
                              {dayName}
                            </div>
                          ))}
                        </div>

                        {/* Grid do calendário mensal */}
                        <div className="space-y-2">
                          {monthWeeks.map((weekStart) => {
                            const weekDays = eachDayOfInterval({
                              start: weekStart,
                              end: addDays(weekStart, 6)
                            })
                            
                            return (
                              <div key={weekStart.toISOString()} className="grid grid-cols-7 gap-2">
                                {weekDays.map((day) => {
                                  const dayOrders = getOrdersForDay(day)
                                  const isCurrentMonth = isSameMonth(day, currentDate)
                                  const dayCount = dayOrders.length
                                  
                                  return (
                                    <div
                                      key={day.toISOString()}
                                      className={cn(
                                        "min-h-[80px] p-2 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                                        isCurrentMonth ? "bg-white" : "bg-gray-50",
                                        isToday(day) && "ring-2 ring-primary",
                                        !isCurrentMonth && "opacity-50"
                                      )}
                                      onClick={() => setSelectedDate(day)}
                                    >
                                      {/* Número do dia */}
                                      <div className="flex items-center justify-between mb-1">
                                        <span className={cn(
                                          "text-sm font-medium",
                                          isToday(day) ? "text-primary font-bold" : "text-gray-900",
                                          !isCurrentMonth && "text-gray-400"
                                        )}>
                                          {format(day, "d")}
                                        </span>
                                        
                                        {/* Indicador de densidade */}
                                        {dayCount > 0 && (
                                          <div className={cn(
                                            "text-xs px-2 py-1 rounded-full font-medium",
                                            getDayDensity(dayCount)
                                          )}>
                                            {dayCount}
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Preview dos pedidos (máximo 2) */}
                                      <div className="space-y-1">
                                        {dayOrders.slice(0, 2).map((order) => (
                                          <div
                                            key={order.id}
                                            className="text-xs p-1 rounded bg-gray-100 truncate"
                                            title={`${order.prosthesis_type} - ${order.dentist}`}
                                          >
                                            <div className="font-medium truncate">
                                              {order.prosthesis_type}
                                            </div>
                                            <div className="text-gray-600 truncate">
                                              {order.dentist}
                                            </div>
                                          </div>
                                        ))}
                                        
                                        {/* Indicador de mais pedidos */}
                                        {dayCount > 2 && (
                                          <div className="text-xs text-center text-gray-500 font-medium">
                                            +{dayCount - 2} mais
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )
                          })}
                        </div>

                        {/* Legenda */}
                        <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-100 rounded"></div>
                            <span>1-2 pedidos</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-200 rounded"></div>
                            <span>3-4 pedidos</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-300 rounded"></div>
                            <span>5-6 pedidos</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-blue-500 rounded"></div>
                            <span>7+ pedidos</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detalhes do dia selecionado */}
                    {selectedDate && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5" />
                            Pedidos para {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const selectedDayOrders = getOrdersForDay(selectedDate)
                            if (selectedDayOrders.length === 0) {
                              return (
                                <div className="text-center py-8 text-gray-500">
                                  Nenhum pedido para este dia
                                </div>
                              )
                            }
                            
                            return (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {selectedDayOrders.map((order) => (
                                  <Card 
                                    key={order.id}
                                    className={cn(
                                      "p-4 cursor-pointer hover:shadow-md transition-shadow",
                                      getTypeColor(order.prosthesis_type)
                                    )}
                                    onClick={() => setSelectedOrder(order)}
                                  >
                                    <div className="space-y-2">
                                      <div className="font-medium">{order.prosthesis_type}</div>
                                      <div className="text-sm text-gray-600">
                                        <div>Dr(a). {order.dentist}</div>
                                        {order.patients && <div>{order.patients.name}</div>}
                                      </div>
                                      <div className="flex gap-2">
                                        <Badge className={getStatusColor(order.status)}>
                                          {statusOptions.find(s => s.value === order.status)?.label}
                                        </Badge>
                                        <Badge className={getPriorityColor(order.priority)}>
                                          {order.priority}
                                        </Badge>
                                      </div>
                                    </div>
                                  </Card>
                                ))}
                              </div>
                            )
                          })()}
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="list" className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Todos os Pedidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {filteredOrders.map((order) => (
                            <Card 
                              key={order.id}
                              className={cn(
                                "p-4 cursor-pointer hover:shadow-md transition-shadow",
                                getTypeColor(order.prosthesis_type)
                              )}
                              onClick={() => setSelectedOrder(order)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="font-medium">{order.prosthesis_type}</div>
                                  <div className="text-sm text-gray-600">
                                    {order.dentist} • {order.patients?.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    Prazo: {format(parseISO(order.deadline), "dd/MM/yyyy")}
                                  </div>
                                </div>
                                <div className="flex flex-col gap-2">
                                  <Badge className={getStatusColor(order.status)}>
                                    {statusOptions.find(s => s.value === order.status)?.label}
                                  </Badge>
                                  <Badge className={getPriorityColor(order.priority)}>
                                    {order.priority}
                                  </Badge>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Agenda