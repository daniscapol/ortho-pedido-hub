import { useState } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PatientSearch from "@/components/forms/PatientSearch";
import Odontogram from "@/components/forms/Odontogram";
import ImageAnnotation from "@/components/forms/ImageAnnotation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { Patient } from "@/hooks/usePatients";
import { useImageUpload, type AnnotatedImage } from "@/hooks/useImageUpload";

const NewOrderAdvanced = () => {
  const navigate = useNavigate();
  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const { uploadImages, isUploading } = useImageUpload();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [images, setImages] = useState<AnnotatedImage[]>([]);
  const [orderData, setOrderData] = useState({
    dentist: "",
    prosthesisType: "",
    material: "",
    color: "",
    priority: "",
    deadline: "",
    observations: "",
    deliveryAddress: ""
  });

  const steps = [
    { number: 1, title: "Paciente", completed: !!selectedPatient },
    { number: 2, title: "Detalhes", completed: orderData.prosthesisType && orderData.dentist },
    { number: 3, title: "Odontograma", completed: selectedTeeth.length > 0 },
    { number: 4, title: "Imagens", completed: images.length > 0 },
    { number: 5, title: "Finalização", completed: orderData.deadline && orderData.priority }
  ];

  const canProceed = (step: number) => {
    switch (step) {
      case 1: return !!selectedPatient;
      case 2: return orderData.prosthesisType && orderData.dentist;
      case 3: return selectedTeeth.length > 0;
      case 4: return images.length > 0;
      case 5: return orderData.deadline && orderData.priority;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    if (!selectedPatient) return;
    
    try {
      // Primeiro criar o pedido
      const order = await createOrder.mutateAsync({
        patient_id: selectedPatient.id,
        dentist: orderData.dentist,
        prosthesis_type: orderData.prosthesisType,
        material: orderData.material,
        color: orderData.color,
        priority: orderData.priority,
        deadline: orderData.deadline,
        observations: orderData.observations,
        delivery_address: orderData.deliveryAddress,
        selected_teeth: selectedTeeth,
        status: "pending"
      });

      // Depois fazer upload das imagens se houver
      if (images.length > 0) {
        await uploadImages(images, order.id);
      }

      toast({
        title: "Pedido criado",
        description: "Pedido criado com sucesso" + (images.length > 0 ? " e imagens enviadas!" : "!"),
      });

      navigate("/");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-6">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
              <Button variant="outline" onClick={() => navigate(-1)}>
                ← Voltar
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Novo Pedido Avançado</h1>
                <p className="text-muted-foreground">Fluxo completo de criação de pedido</p>
              </div>
            </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.number === currentStep 
                      ? "bg-primary text-primary-foreground"
                      : step.completed 
                        ? "bg-success text-success-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.completed ? "✓" : step.number}
                </div>
                <div className="ml-2 hidden md:block">
                  <p className={`text-sm font-medium ${
                    step.number === currentStep ? "text-foreground" : "text-muted-foreground"
                  }`}>
                    {step.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 w-16 mx-4 ${
                    step.completed ? "bg-success" : "bg-muted"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <div className="space-y-6">
              <PatientSearch onPatientSelect={setSelectedPatient} />
              {selectedPatient && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paciente Selecionado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-medium">{selectedPatient.name}</p>
                        <p className="text-sm text-muted-foreground">CPF: {selectedPatient.cpf}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tel: {selectedPatient.phone}</p>
                        <Badge variant="outline">Paciente selecionado</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Detalhes do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dentist">Dentista Responsável</Label>
                    <Input
                      id="dentist"
                      value={orderData.dentist}
                      onChange={(e) => setOrderData(prev => ({ ...prev, dentist: e.target.value }))}
                      placeholder="Nome do dentista"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prosthesisType">Tipo de Prótese</Label>
                    <Select onValueChange={(value) => setOrderData(prev => ({ ...prev, prosthesisType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coroa-ceramica">Coroa Cerâmica</SelectItem>
                        <SelectItem value="protese-total">Prótese Total</SelectItem>
                        <SelectItem value="protese-parcial">Prótese Parcial</SelectItem>
                        <SelectItem value="implante">Implante</SelectItem>
                        <SelectItem value="ponte-fixa">Ponte Fixa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Select onValueChange={(value) => setOrderData(prev => ({ ...prev, material: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ceramica">Cerâmica</SelectItem>
                        <SelectItem value="porcelana">Porcelana</SelectItem>
                        <SelectItem value="resina">Resina</SelectItem>
                        <SelectItem value="metal-ceramica">Metal-Cerâmica</SelectItem>
                        <SelectItem value="zirconia">Zircônia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Cor/Tonalidade</Label>
                    <Input
                      id="color"
                      value={orderData.color}
                      onChange={(e) => setOrderData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="Ex: A2, B1, etc."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Odontogram onToothSelect={setSelectedTeeth} />
          )}

          {currentStep === 4 && (
            <ImageAnnotation images={images} onImagesChange={setImages} />
          )}

          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Finalização do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select onValueChange={(value) => setOrderData(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a prioridade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="alta">Alta</SelectItem>
                        <SelectItem value="urgente">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Prazo de Entrega</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={orderData.deadline}
                      onChange={(e) => setOrderData(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Endereço de Entrega</Label>
                  <Textarea
                    id="deliveryAddress"
                    value={orderData.deliveryAddress}
                    onChange={(e) => setOrderData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    placeholder="Endereço completo para entrega"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações Finais</Label>
                  <Textarea
                    id="observations"
                    value={orderData.observations}
                    onChange={(e) => setOrderData(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Observações adicionais, instruções especiais, etc."
                    rows={4}
                  />
                </div>

                {/* Resumo do pedido */}
                <div className="border-t border-border pt-4">
                  <h3 className="font-medium mb-2">Resumo do Pedido</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p><strong>Paciente:</strong> {selectedPatient?.name}</p>
                    <p><strong>Tipo:</strong> {orderData.prosthesisType}</p>
                    <p><strong>Dentes:</strong> {selectedTeeth.join(", ")}</p>
                    <p><strong>Imagens:</strong> {images.length} arquivo(s)</p>
                    <p><strong>Prazo:</strong> {orderData.deadline}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8 max-w-4xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            ← Anterior
          </Button>

          {currentStep < 5 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed(currentStep)}
            >
              Próximo →
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed(currentStep) || createOrder.isPending || isUploading}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              {createOrder.isPending ? "Criando Pedido..." : 
               isUploading ? "Enviando Imagens..." : 
               "Finalizar Pedido"}
            </Button>
          )}
        </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NewOrderAdvanced;