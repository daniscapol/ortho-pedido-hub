import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CalendarIcon, ChevronLeft, ChevronRight, Search, User, Settings, LogOut } from "lucide-react"
import { useOrders, Order } from "@/hooks/useOrders"
import { useProfile } from "@/hooks/useProfile"
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, parseISO } from "date-fns"
import { ptBR } from "date-fns/locale"
import Sidebar from "@/components/layout/Sidebar"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/auth/AuthProvider"
import { useNavigate } from "react-router-dom"

const Agenda = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [viewMode, setViewMode] = useState("week")

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

  // Filtrar pedidos com base nos filtros selecionados
  const filteredOrders = useMemo(() => {
    if (!orders) return []
    
    return orders.filter(order => {
      // Filtro por tipo de prótese
      if (selectedTypes.length > 0 && !selectedTypes.includes(order.prosthesis_type)) {
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
  }, [orders, selectedTypes, searchTerm])

  // Obter dias da semana atual
  const weekStart = startOfWeek(currentDate, { locale: ptBR })
  const weekEnd = endOfWeek(currentDate, { locale: ptBR })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

  // Obter pedidos para cada dia da semana
  const getOrdersForDay = (day: Date) => {
    return filteredOrders.filter(order => {
      const orderDate = parseISO(order.deadline)
      return isSameDay(orderDate, day)
    })
  }

  // Cores para diferentes tipos de próteses
  const getTypeColor = (type: string) => {
    const colors = {
      "Coroa Emax": "bg-blue-200 text-blue-800 border-blue-300",
      "Coroa Impressa": "bg-green-200 text-green-800 border-green-300",
      "Coroa sobre Implante": "bg-purple-200 text-purple-800 border-purple-300",
      "Inlay/Onlay Emax": "bg-orange-200 text-orange-800 border-orange-300",
      "Inlay/Olay Implante": "bg-pink-200 text-pink-800 border-pink-300",
      "Facetas": "bg-indigo-200 text-indigo-800 border-indigo-300",
    }
    return colors[type as keyof typeof colors] || "bg-gray-200 text-gray-800 border-gray-300"
  }

  const toggleTypeFilter = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => 
      direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1)
    )
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-slate-800 border-b border-slate-700 h-16 flex">          
            <div className="flex-1 flex items-center justify-center px-6">
              <div className="text-white">Carregando agenda...</div>
            </div>
          </header>
          <main className="flex-1 flex items-center justify-center">
            <div className="text-muted-foreground">Carregando agenda...</div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex">          
          <div className="flex-1 flex items-center justify-center px-6">
            <div className="flex items-center gap-4 flex-1 max-w-4xl">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Input
                    placeholder="Pesquise um dentista ou paciente"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 focus:border-slate-500 focus:ring-slate-500"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>
            
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
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-6 h-6 text-gray-600" />
                <h1 className="text-3xl font-bold text-gray-900">Agenda</h1>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filtrar por:</span>
                <Select value={viewMode} onValueChange={setViewMode}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              {/* Sidebar esquerda com calendário e filtros */}
              <div className="col-span-3 space-y-6">
                {/* Mini calendário */}
                <Card>
                  <CardContent className="p-4">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      className="w-full"
                      locale={ptBR}
                    />
                  </CardContent>
                </Card>

                {/* Busca por dentista */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Buscar</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar dentista"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Filtros por tipo de serviço */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Tipos de serviço</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {prosthesisTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={type}
                          checked={selectedTypes.includes(type)}
                          onCheckedChange={() => toggleTypeFilter(type)}
                        />
                        <label 
                          htmlFor={type} 
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Calendário principal */}
              <div className="col-span-9">
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
                    <div className="grid grid-cols-7 gap-4 mb-4">
                      {weekDays.map((day) => (
                        <div key={day.toISOString()} className="text-center">
                          <div className="text-sm text-gray-500 mb-1">
                            {format(day, "EEE", { locale: ptBR })}
                          </div>
                          <div className={`text-lg font-semibold w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                            isSameDay(day, new Date()) 
                              ? "bg-blue-600 text-white" 
                              : "text-gray-900"
                          }`}>
                            {format(day, "d")}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Grid com os horários e eventos */}
                    <div className="grid grid-cols-7 gap-4 min-h-[400px]">
                      {weekDays.map((day) => {
                        const dayOrders = getOrdersForDay(day)
                        return (
                          <div key={day.toISOString()} className="border-l border-gray-200 pl-2 space-y-2">
                            {dayOrders.map((order) => (
                              <div 
                                key={order.id}
                                className={`p-2 rounded-md border text-xs ${getTypeColor(order.prosthesis_type)}`}
                              >
                                <div className="font-semibold">{order.prosthesis_type}</div>
                                <div className="text-xs opacity-80">
                                  {order.dentist}
                                </div>
                                <div className="text-xs opacity-70">
                                  #{order.id.slice(-6)}
                                </div>
                                {order.patients && (
                                  <div className="text-xs opacity-70 mt-1">
                                    {order.patients.name}
                                  </div>
                                )}
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {order.priority}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        )
                      })}
                    </div>

                    {/* Horários laterais */}
                    <div className="mt-4 text-xs text-gray-500 space-y-8">
                      {['9h', '10h', '11h', '12h', '13h', '14h', '15h'].map((time) => (
                        <div key={time} className="flex items-center">
                          <span className="w-8 text-right mr-2">{time}</span>
                          <div className="flex-1 border-t border-gray-200"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Agenda