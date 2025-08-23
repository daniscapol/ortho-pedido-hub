import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus, Search, Edit, User, FileText, CheckCircle, UserCheck, Settings, LogOut, Filter, X } from "lucide-react"
import { usePatients, useCreatePatient, useUpdatePatient, useDentistsForPatients, Patient } from "@/hooks/usePatients"
import { useOrders, usePatientOrders } from "@/hooks/useOrders"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import Sidebar from "@/components/layout/Sidebar"
import { NotificationDropdown } from "@/components/notifications/NotificationDropdown"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProfile } from "@/hooks/useProfile"
import { useAuth } from "@/components/auth/AuthProvider"
import { useNavigate } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { PacienteForm } from "@/components/forms/PacienteForm"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const patientSchema = z.object({
  nome_completo: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  telefone_contato: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email_contato: z.string().email("Email inválido"),
  dentist_id: z.string().min(1, "Dentista é obrigatório"),
})

type PatientFormData = z.infer<typeof patientSchema>

const Patients = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false)
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Patient | null>(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [dentistFilter, setDentistFilter] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<Date>()
  const [dateTo, setDateTo] = useState<Date>()
  const [showFilters, setShowFilters] = useState(false)
  
  const { data: patients, isLoading } = usePatients(searchTerm)
  const { data: patientOrders } = usePatientOrders(selectedPatientHistory?.id)
  const { data: profile } = useProfile()
  const { data: dentists } = useDentistsForPatients()
  const createPatient = useCreatePatient()
  const { toast } = useToast()
  
  // Apply filters to patients data
  const filteredPatients = patients?.filter((patient) => {
    // Status filter
    if (statusFilter && statusFilter !== "all") {
      const isActive = patient.ativo ?? true
      if (statusFilter === "active" && !isActive) return false
      if (statusFilter === "inactive" && isActive) return false
    }
    
    // Dentist filter
    if (dentistFilter && dentistFilter !== "all") {
      if (!patient.dentist_id || patient.dentist_id !== dentistFilter) return false
    }
    
    // Date filter
    if (dateFrom && new Date(patient.created_at) < dateFrom) return false
    if (dateTo && new Date(patient.created_at) > dateTo) return false
    
    return true
  }) || []
  
  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  const clearFilters = () => {
    setStatusFilter("")
    setDentistFilter("")
    setDateFrom(undefined)
    setDateTo(undefined)
    setCurrentPage(1)
  }
  
  const hasActiveFilters = statusFilter || dentistFilter || dateFrom || dateTo

  const handleLogout = async () => {
    await signOut()
  }

  const handleCreatePatient = async (data: { nome_completo: string; cpf?: string; telefone_contato?: string; email_contato?: string; observacoes?: string; ativo: boolean }) => {
    try {
      await createPatient.mutateAsync({
        ...data,
        dentist_id: profile?.role === 'dentist' ? profile.id : '',
      });
      toast({
        title: "Sucesso",
        description: "Paciente criado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar paciente",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: "Pendente", variant: "secondary" as const },
      producao: { label: "Em Produção", variant: "default" as const },
      completed: { label: "Concluído", variant: "outline" as const },
      delivered: { label: "Entregue", variant: "outline" as const },
    }
    return statusMap[status as keyof typeof statusMap] || { label: status, variant: "secondary" as const }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-slate-800 border-b border-slate-700 h-16 flex">          
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
        
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
                <p className="text-gray-600 mt-1">Gerencie os pacientes do consultório</p>
              </div>
              
              <Button onClick={() => setIsNewPatientOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Paciente
              </Button>
            </div>
            
            <PacienteForm 
              open={isNewPatientOpen} 
              onOpenChange={setIsNewPatientOpen}
              onSubmit={handleCreatePatient}
              isLoading={createPatient.isPending}
            />

            <Card>
              <CardHeader>
                <CardTitle>Lista de Pacientes</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os pacientes ({filteredPatients.length} {filteredPatients.length === 1 ? 'paciente encontrado' : 'pacientes encontrados'})
                </CardDescription>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar por nome ou CPF..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => setShowFilters(!showFilters)}
                      className={cn(
                        "gap-2",
                        hasActiveFilters && "border-blue-500 text-blue-600"
                      )}
                    >
                      <Filter className="h-4 w-4" />
                      Filtros
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {[statusFilter, dentistFilter, dateFrom, dateTo].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Limpar
                      </Button>
                    )}
                  </div>
                  
                  {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Status</label>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="active">Ativo</SelectItem>
                            <SelectItem value="inactive">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Dentista</label>
                        <Select value={dentistFilter} onValueChange={setDentistFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="Todos" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            {dentists?.map((dentist) => (
                              <SelectItem key={dentist.id} value={dentist.id}>
                                {dentist.nome_completo || dentist.email}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Data Início</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              {dateFrom ? format(dateFrom, "dd/MM/yyyy") : "Selecionar"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateFrom}
                              onSelect={setDateFrom}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-2 block">Data Fim</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              {dateTo ? format(dateTo, "dd/MM/yyyy") : "Selecionar"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateTo}
                              onSelect={setDateTo}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Carregando pacientes...</div>
                  </div>
                ) : filteredPatients.length > 0 ? (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>CPF</TableHead>
                          <TableHead>Telefone</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Dentista Responsável</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Data de Cadastro</TableHead>
                          <TableHead className="w-[100px]">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedPatients.map((patient) => (
                        <TableRow key={patient.id}>
                           <TableCell className="font-medium">
                             <div className="flex items-center space-x-2">
                               <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                 <User className="w-4 h-4 text-blue-600" />
                               </div>
                               <button 
                                 onClick={() => setSelectedPatientHistory(patient)}
                                 className="text-left hover:text-blue-600 hover:underline transition-colors"
                               >
                                 {patient.nome_completo}
                               </button>
                             </div>
                           </TableCell>
                           <TableCell>{patient.cpf || 'Não informado'}</TableCell>
                           <TableCell>{patient.telefone_contato || 'Não informado'}</TableCell>
                           <TableCell>{patient.email_contato || 'Não informado'}</TableCell>
                           <TableCell>
                             {patient.dentist ? (
                               <div className="flex items-center gap-2">
                                 <UserCheck className="h-4 w-4 text-blue-600" />
                                 <span>{patient.dentist.nome_completo || patient.dentist.email}</span>
                               </div>
                             ) : (
                               <span className="text-muted-foreground">Não atribuído</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant={patient.ativo ? "default" : "secondary"}>
                                {patient.ativo ? "Ativo" : "Inativo"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {format(new Date(patient.created_at), "dd/MM/yyyy")}
                            </TableCell>
                           <TableCell>
                             <div className="flex items-center space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setSelectedPatientHistory(patient)}
                                  title="Ver Histórico"
                                >
                                  <FileText className="w-4 h-4" />
                                </Button>
                             </div>
                           </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    
                    {/* Pagination */}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum paciente encontrado</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm 
                        ? "Tente ajustar os filtros de busca." 
                        : "Comece adicionando seu primeiro paciente."
                      }
                    </p>
                    {!searchTerm && (
                      <Button onClick={() => setIsNewPatientOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar Paciente
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Paginação */}
            {filteredPatients.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredPatients.length)} de {filteredPatients.length} pacientes
                </div>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}

            {/* Modal de Histórico do Paciente */}
            <Dialog open={!!selectedPatientHistory} onOpenChange={() => setSelectedPatientHistory(null)}>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Histórico do Paciente</DialogTitle>
                  <DialogDescription>
                    Pedidos e informações de {selectedPatientHistory?.nome_completo}
                  </DialogDescription>
                </DialogHeader>
                
                {selectedPatientHistory && (
                  <div className="space-y-6">
                    {/* Informações do Paciente */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Informações Pessoais</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Nome</p>
                            <p className="font-medium">{selectedPatientHistory.nome_completo}</p>
                          </div>
                           <div>
                             <p className="text-sm text-muted-foreground">CPF</p>
                             <p className="font-medium">{selectedPatientHistory.cpf || 'Não informado'}</p>
                           </div>
                           <div>
                             <p className="text-sm text-muted-foreground">Telefone</p>
                             <p className="font-medium">{selectedPatientHistory.telefone_contato || 'Não informado'}</p>
                           </div>
                           <div>
                             <p className="text-sm text-muted-foreground">Email</p>
                             <p className="font-medium">{selectedPatientHistory.email_contato || 'Não informado'}</p>
                           </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Dentista Responsável</p>
                            <p className="font-medium">
                              {selectedPatientHistory.dentist?.nome_completo || 'Não atribuído'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Data de Cadastro</p>
                            <p className="font-medium">
                              {format(new Date(selectedPatientHistory.created_at), "dd/MM/yyyy 'às' HH:mm")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Histórico de Pedidos */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Histórico de Pedidos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {patientOrders && patientOrders.length > 0 ? (
                          <div className="space-y-4">
                            {patientOrders.map((order) => (
                              <div 
                                key={order.id} 
                                className="border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">Pedido #{order.id.slice(0, 8)}</h4>
                                      <Badge {...getStatusBadge(order.status)}>
                                        {getStatusBadge(order.status).label}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Tipo:</strong> {order.prosthesis_type}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Material:</strong> {order.material || 'Não especificado'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Dentes:</strong> {order.selected_teeth?.join(', ') || 'Não especificado'}
                                    </p>
                                    {order.observations && (
                                      <p className="text-sm text-muted-foreground">
                                        <strong>Observações:</strong> {order.observations}
                                      </p>
                                    )}
                                  </div>
                                  <div className="text-right space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(order.created_at), "dd/MM/yyyy")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      <strong>Prazo:</strong> {format(new Date(order.deadline), "dd/MM/yyyy")}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Nenhum pedido encontrado para este paciente.</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Patients