import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePatients, useCreatePatient, Patient } from "@/hooks/usePatients";
import { useProfile } from "@/hooks/useProfile";
import { PacienteForm } from "@/components/forms/PacienteForm";

const PatientSearch = ({ onPatientSelect, autoSelectAfterCreate = true }: { onPatientSelect: (patient: Patient | null) => void, autoSelectAfterCreate?: boolean }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);

  const { data: patients, isLoading } = usePatients(searchTerm);
  const { data: allPatients, isLoading: isLoadingAll } = usePatients('');
  const { data: profile } = useProfile();
  const createPatient = useCreatePatient();

  const filteredPatients = patients || [];
  
  // Filtrar pacientes do dentista atual
  const currentDentistPatients = (allPatients || []).filter(patient => {
    if (profile?.role === 'admin') return true;
    return patient.dentist_id === profile?.id;
  });

  const handleCreatePatient = async (data: { nome_completo: string; cpf?: string; telefone_contato?: string; email_contato?: string; observacoes?: string; ativo: boolean }) => {
    try {
      const result = await createPatient.mutateAsync({
        ...data,
        dentist_id: profile?.role === 'dentist' ? profile.id : '',
      });
      
      if (autoSelectAfterCreate) {
        onPatientSelect(result);
      }
      setShowNewForm(false);
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
    }
  };

  if (showNewForm) {
    return (
      <PacienteForm 
        open={showNewForm} 
        onOpenChange={setShowNewForm}
        onSubmit={handleCreatePatient}
        isLoading={createPatient.isPending}
      />
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
                          <p className="text-sm text-muted-foreground">CPF: {patient.cpf || 'Não informado'}</p>
                          <p className="text-sm text-muted-foreground">Tel: {patient.telefone_contato || 'Não informado'}</p>
                          <p className="text-sm text-muted-foreground">Email: {patient.email_contato || 'Não informado'}</p>
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
                          <p className="text-sm text-muted-foreground">CPF: {patient.cpf || 'Não informado'}</p>
                          <p className="text-sm text-muted-foreground">Tel: {patient.telefone_contato || 'Não informado'}</p>
                          <p className="text-sm text-muted-foreground">Email: {patient.email_contato || 'Não informado'}</p>
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