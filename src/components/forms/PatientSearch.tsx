import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  lastVisit: string;
  ordersCount: number;
}

const PatientSearch = ({ onPatientSelect }: { onPatientSelect: (patient: Patient | null) => void }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    cpf: "",
    phone: "",
    email: ""
  });

  // Dados simulados - em produção viria do banco
  const patients: Patient[] = [
    {
      id: "1",
      name: "Maria Silva Santos",
      cpf: "123.456.789-00",
      phone: "(11) 99999-9999",
      email: "maria@email.com",
      lastVisit: "2024-01-10",
      ordersCount: 3
    },
    {
      id: "2", 
      name: "João Carlos Oliveira",
      cpf: "987.654.321-00",
      phone: "(11) 88888-8888",
      email: "joao@email.com",
      lastVisit: "2024-01-08",
      ordersCount: 1
    }
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm)
  );

  const handleCreatePatient = () => {
    const patient: Patient = {
      id: Date.now().toString(),
      name: newPatient.name,
      cpf: newPatient.cpf,
      phone: newPatient.phone,
      email: newPatient.email,
      lastVisit: new Date().toISOString().split('T')[0],
      ordersCount: 0
    };
    
    onPatientSelect(patient);
    setShowNewForm(false);
    setNewPatient({ name: "", cpf: "", phone: "", email: "" });
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
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleCreatePatient} disabled={!newPatient.name || !newPatient.cpf}>
              Criar Paciente
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
        
        {searchTerm && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {filteredPatients.map((patient) => (
              <div
                key={patient.id}
                className="p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => onPatientSelect(patient)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-foreground">{patient.name}</h4>
                    <p className="text-sm text-muted-foreground">CPF: {patient.cpf}</p>
                    <p className="text-sm text-muted-foreground">Tel: {patient.phone}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">
                      {patient.ordersCount} pedidos
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Último: {patient.lastVisit}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredPatients.length === 0 && (
              <div className="text-center py-4 text-muted-foreground">
                <p>Nenhum paciente encontrado</p>
                <Button variant="link" onClick={() => setShowNewForm(true)}>
                  Criar novo paciente
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PatientSearch;