import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatients, useCreatePatient, useDentistsForPatients, Patient } from "@/hooks/usePatients";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";

const PatientSearch = ({ onPatientSelect, autoSelectAfterCreate = true }: { onPatientSelect: (patient: Patient | null) => void, autoSelectAfterCreate?: boolean }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: "",
    dentist_id: ""
  });

  const { data: patients, isLoading } = usePatients(searchTerm);
  const { data: allPatients, isLoading: isLoadingAll } = usePatients('');
  const { data: dentists } = useDentistsForPatients();
  const { data: profile } = useProfile();
  const createPatient = useCreatePatient();

  const filteredPatients = patients || [];
  
  // Filtrar pacientes do dentista atual
  const currentDentistPatients = (allPatients || []).filter(patient => {
    if (profile?.role === 'admin') return true;
    return patient.dentist_id === profile?.id;
  });

  const handleCreatePatient = async () => {
    try {
      const result = await createPatient.mutateAsync({
        nome_completo: newPatient.name,
        cpf: newPatient.cpf,
        telefone_contato: newPatient.phone,
        email_contato: newPatient.email,
        dentist_id: newPatient.dentist_id || (profile?.role === 'dentist' ? profile.id : '')
      });
      
      if (autoSelectAfterCreate) {
        onPatientSelect(result);
      }
      setShowNewForm(false);
      setNewPatient({ name: "", cpf: "", phone: "", email: "", dentist_id: "" });
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
    }
  };

  if (showNewForm) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Novo Paciente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={newPatient.name}
                onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do paciente"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                value={newPatient.cpf}
                onChange={(e) => setNewPatient(prev => ({ ...prev, cpf: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={newPatient.phone}
                onChange={(e) => setNewPatient(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="(00) 00000-0000"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={newPatient.email}
                onChange={(e) => setNewPatient(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            
            {profile?.role === 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="dentist">Dentista Responsável</Label>
                <Select onValueChange={(value) => setNewPatient(prev => ({ ...prev, dentist_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um dentista" />
                  </SelectTrigger>
                  <SelectContent>
                    {dentists?.map((dentist) => (
                      <SelectItem key={dentist.id} value={dentist.id}>
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4" />
                        {dentist.nome_completo || dentist.email}
                      </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleCreatePatient} 
              disabled={!newPatient.name || !newPatient.cpf || createPatient.isPending}
            >
              {createPatient.isPending ? "Criando..." : "Criar Paciente"}
            </Button>
            <Button variant="outline" onClick={() => setShowNewForm(false)}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecionar Paciente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar por nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={() => setShowNewForm(true)}>
            + Novo Paciente
          </Button>
        </div>
        
        {/* Lista de pacientes filtrados por busca */}
        {searchTerm && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">Resultados da busca:</h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <div className="text-right space-y-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {filteredPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onPatientSelect(patient)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-foreground">{patient.nome_completo}</h4>
                          <p className="text-sm text-muted-foreground">CPF: {patient.cpf}</p>
                          <p className="text-sm text-muted-foreground">Tel: {patient.telefone_contato}</p>
                          <p className="text-sm text-muted-foreground">Email: {patient.email_contato}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            Cadastrado
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {filteredPatients.length === 0 && !isLoading && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Nenhum paciente encontrado</p>
                      <Button variant="link" onClick={() => setShowNewForm(true)}>
                        Criar novo paciente
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
        
        {/* Lista de todos os pacientes do dentista */}
        {!searchTerm && (
          <div>
            <h4 className="text-sm font-medium mb-2 text-muted-foreground">
              {profile?.role === 'admin' ? 'Todos os pacientes:' : 'Seus pacientes:'}
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {isLoadingAll ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-32" />
                          <Skeleton className="h-3 w-28" />
                        </div>
                        <div className="text-right space-y-1">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {currentDentistPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => onPatientSelect(patient)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-foreground">{patient.nome_completo}</h4>
                          <p className="text-sm text-muted-foreground">CPF: {patient.cpf}</p>
                          <p className="text-sm text-muted-foreground">Tel: {patient.telefone_contato}</p>
                          <p className="text-sm text-muted-foreground">Email: {patient.email_contato}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">
                            Cadastrado
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {currentDentistPatients.length === 0 && !isLoadingAll && (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Nenhum paciente cadastrado ainda</p>
                      <Button variant="link" onClick={() => setShowNewForm(true)}>
                        Criar primeiro paciente
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSearch;