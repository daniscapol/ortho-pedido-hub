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
import { Plus, Search, Edit, User } from "lucide-react"
import { usePatients, useCreatePatient, Patient } from "@/hooks/usePatients"
import { useToast } from "@/hooks/use-toast"
import { format } from "date-fns"
import Header from "@/components/layout/Header"
import Sidebar from "@/components/layout/Sidebar"

const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos"),
  phone: z.string().min(10, "Telefone deve ter pelo menos 10 dígitos"),
  email: z.string().email("Email inválido"),
})

type PatientFormData = z.infer<typeof patientSchema>

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [isNewPatientOpen, setIsNewPatientOpen] = useState(false)
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  
  const { data: patients, isLoading } = usePatients(searchTerm)
  const createPatient = useCreatePatient()
  const { toast } = useToast()

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      cpf: "",
      phone: "",
      email: "",
    },
  })

  const onSubmit = async (data: PatientFormData) => {
    try {
      await createPatient.mutateAsync({
        name: data.name,
        cpf: data.cpf,
        phone: data.phone,
        email: data.email,
      })
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
    setIsNewPatientOpen(true)
  }

  const handleCloseDialog = () => {
    setIsNewPatientOpen(false)
    setEditingPatient(null)
    form.reset()
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
              
              <Dialog open={isNewPatientOpen} onOpenChange={handleCloseDialog}>
                <DialogTrigger asChild>
                  <Button>
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
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleCloseDialog}>
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={createPatient.isPending}>
                          {createPatient.isPending 
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
                              <span>{patient.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>{patient.cpf}</TableCell>
                          <TableCell>{patient.phone}</TableCell>
                          <TableCell>{patient.email}</TableCell>
                          <TableCell>
                            {format(new Date(patient.created_at), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(patient)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default Patients