import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Plus, Search, Edit, User, FileText, Clock, CheckCircle, UserCheck } from "lucide-react"
import { usePatients, useCreatePatient, useUpdatePatient, useDentistsForPatients, Patient } from "@/hooks/usePatients"
import { useOrders, usePatientOrders } from "@/hooks/useOrders"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useProfile } from "@/hooks/useProfile"

const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
  dentist_id: z.string().min(1, "Dentista é obrigatório"),
})

type PatientFormData = z.infer<typeof patientSchema>

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Patient | null>(null)
  
  const { data: patients, isLoading } = usePatients(searchTerm)
  const { data: patientOrders } = usePatientOrders(selectedPatientHistory?.id)
  const { data: dentists } = useDentistsForPatients()
  const { data: profile } = useProfile()
  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()
  const { toast } = useToast()

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      email: "",
      dentist_id: "",
    },
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      if (editingPatient) {
        await updatePatient.mutateAsync({
          id: editingPatient.id,
          name: data.name,
          cpf: data.cpf,
          phone: data.phone,
          email: data.email,
          dentist_id: data.dentist_id,
        })
      } else {
        await createPatient.mutateAsync({
          name: data.name,
          cpf: data.cpf,
          phone: data.phone,
          email: data.email,
          dentist_id: data.dentist_id,
        })
      }
      form.reset()
      setIsNewPatientOpen(false)
      setEditingPatient(null)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar paciente",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient)
    form.setValue("name", patient.name)
    form.setValue("cpf", patient.cpf)
    form.setValue("phone", patient.phone)
    form.setValue("email", patient.email)
    form.setValue("dentist_id", patient.dentist_id || "")
    setIsNewPatientOpen(true)
  }

  const handleCloseDialog = () => {
    setIsNewPatientOpen(false)
    setEditingPatient(null)
    form.reset()
  }

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
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
                <p className="text-gray-600 mt-1">Gerencie os pacientes do consultório</p>
              </div>
              
              <Dialog open={isNewPatientOpen} onOpenChange={setIsNewPatientOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setIsNewPatientOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Paciente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>
                      {editingPatient ? "Editar Paciente" : "Novo Paciente"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingPatient 
                        ? "Atualize as informações do paciente." 
                        : "Adicione um novo paciente ao sistema."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF</FormLabel>
                            <FormControl>
                              <Input placeholder="000.000.000-00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(11) 99999-9999" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@exemplo.com" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="dentist_id"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Dentista Responsável</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione um dentista" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {dentists?.map((dentist) => (
                                  <SelectItem key={dentist.id} value={dentist.id}>
                                    <div className="flex items-center gap-2">
                                      <UserCheck className="h-4 w-4" />
                                      {dentist.name || dentist.email}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseDialog}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createPatient.isPending || updatePatient.isPending}>
                          {(createPatient.isPending || updatePatient.isPending)
                            ? "Salvando..." 
                            : editingPatient ? "Atualizar" : "Criar"
                          }
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Pacientes</CardTitle>
                <CardDescription>
                  Visualize e gerencie todos os pacientes
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por nome ou CPF..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">Carregando pacientes...</div>
                  </div>
                ) : patients && patients.length > 0 ? (
                  <Table>
                     <TableHeader>
                       <TableRow>
                         <TableHead>Nome</TableHead>
                         <TableHead>CPF</TableHead>
                         <TableHead>Telefone</TableHead>
                         <TableHead>Email</TableHead>
                         <TableHead>Dentista</TableHead>
                         <TableHead>Data de Cadastro</TableHead>
                         <TableHead className="w-[100px]">Ações</TableHead>
                       </TableRow>
                     </TableHeader>
                    <TableBody>
                      {patients.map((patient) => (
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
                                 {patient.name}
                               </button>
                             </div>
                           </TableCell>
                           <TableCell>{patient.cpf}</TableCell>
                           <TableCell>{patient.phone}</TableCell>
                           <TableCell>{patient.email}</TableCell>
                           <TableCell>
                             {patient.dentist ? (
                               <div className="flex items-center gap-2">
                                 <UserCheck className="h-4 w-4 text-blue-600" />
                                 <span>{patient.dentist.name || patient.dentist.email}</span>
                               </div>
                             ) : (
                               <span className="text-muted-foreground">Não atribuído</span>
                             )}
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
                               <Button
                                 variant="ghost"
                                 size="sm"
                                 onClick={() => handleEdit(patient)}
                                 title="Editar Paciente"
                               >
                                 <Edit className="w-4 h-4" />
                               </Button>
                             </div>
                           </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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

            {/* Modal de Histórico do Paciente */}
            <Dialog open={!!selectedPatientHistory} onOpenChange={() => setSelectedPatientHistory(null)}>
              <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Histórico do Paciente</DialogTitle>
                  <DialogDescription>
                    {selectedPatientHistory && (
                      <div className="space-y-2">
                        <p><strong>Nome:</strong> {selectedPatientHistory.name}</p>
                        <p><strong>CPF:</strong> {selectedPatientHistory.cpf}</p>
                        <p><strong>Telefone:</strong> {selectedPatientHistory.phone}</p>
                        <p><strong>Email:</strong> {selectedPatientHistory.email}</p>
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Pedidos do Paciente
                  </h3>
                  
                  {patientOrders && patientOrders.length > 0 ? (
                    <div className="space-y-4">
                      {patientOrders.map((order) => (
                        <Card key={order.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h4 className="font-semibold">{order.prosthesis_type}</h4>
                                <Badge variant={getStatusBadge(order.status).variant}>
                                  {getStatusBadge(order.status).label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                <strong>Dentista:</strong> {order.dentist}
                              </p>
                              {order.material && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Material:</strong> {order.material}
                                </p>
                              )}
                              {order.color && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Cor:</strong> {order.color}
                                </p>
                              )}
                              <p className="text-sm text-muted-foreground">
                                <strong>Prioridade:</strong> {order.priority}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Prazo:</strong> {format(new Date(order.deadline), "dd/MM/yyyy")}
                              </p>
                              {order.observations && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Observações:</strong> {order.observations}
                                </p>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              <p>Criado em</p>
                              <p>{format(new Date(order.created_at), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Nenhum pedido encontrado</h3>
                      <p className="text-muted-foreground">
                        Este paciente ainda não possui pedidos registrados.
                      </p>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelectedPatientHistory(null)}>
                    Fechar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Patients