import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PatientSearch from "./PatientSearch";
import Odontogram from "./Odontogram";
import { Patient } from "@/hooks/usePatients";
import { useImageUpload } from "@/hooks/useImageUpload";

const NewOrderForm = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    dentistName: "",
    prosthesisType: "",
    material: "",
    color: "",
    priority: "",
    deadline: "",
    observations: "",
    deliveryAddress: "",
    images: [] as File[]
  });

  const createOrder = useCreateOrder();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { uploadImages, isUploading } = useImageUpload();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPatient) {
      toast({
        title: "Erro",
        description: "Selecione um paciente primeiro",
        variant: "destructive",
      });
      return;
    }

    if (selectedTeeth.length === 0) {
      toast({
        title: "Erro", 
        description: "Selecione pelo menos um dente no odontograma",
        variant: "destructive",
      });
      return;
    }

    try {
      // Processar dados do odontograma - extrair apenas os números dos dentes
      const toothNumbers = selectedTeeth.map(tooth => {
        // Se o formato for "dente:procedimento", extrair apenas o dente
        return tooth.includes(':') ? tooth.split(':')[0] : tooth;
      });

      // Primeiro criar o pedido
      const order = await createOrder.mutateAsync({
        patient_id: selectedPatient.id,
        dentist: formData.dentistName,
        prosthesis_type: formData.prosthesisType,
        material: formData.material,
        color: formData.color,
        priority: formData.priority,
        deadline: formData.deadline,
        observations: formData.observations,
        delivery_address: formData.deliveryAddress,
        selected_teeth: toothNumbers, // Usar apenas os números dos dentes
        status: "pending"
      });

      // Depois fazer upload das imagens se houver
      if (formData.images.length > 0) {
        const annotatedImages = formData.images.map(file => ({
          file,
          annotations: []
        }));
        await uploadImages(annotatedImages, order.id);
      }

      navigate("/");
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Seleção de Paciente */}
      {!selectedPatient ? (
        <PatientSearch onPatientSelect={setSelectedPatient} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Paciente Selecionado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{selectedPatient.name}</h3>
                <p className="text-sm text-muted-foreground">CPF: {selectedPatient.cpf}</p>
                <p className="text-sm text-muted-foreground">Tel: {selectedPatient.phone}</p>
              </div>
              <Button variant="outline" onClick={() => setSelectedPatient(null)}>
                Trocar Paciente
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <>
          {/* Odontograma */}
          <Odontogram onToothSelect={setSelectedTeeth} />

          {/* Formulário do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  <div className="space-y-2">
                    <Label htmlFor="dentistName">Dentista Responsável</Label>
                    <Input
                      id="dentistName"
                      value={formData.dentistName}
                      onChange={(e) => setFormData(prev => ({ ...prev, dentistName: e.target.value }))}
                      placeholder="Nome do dentista"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="prosthesisType">Tipo de Prótese</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, prosthesisType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coroa-ceramica">Coroa Cerâmica</SelectItem>
                        <SelectItem value="protese-total">Prótese Total</SelectItem>
                        <SelectItem value="protese-parcial">Prótese Parcial</SelectItem>
                        <SelectItem value="implante">Implante</SelectItem>
                        <SelectItem value="ponte-fixa">Ponte Fixa</SelectItem>
                        <SelectItem value="protese-flexivel">Prótese Flexível</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Input
                      id="material"
                      value={formData.material}
                      onChange={(e) => setFormData(prev => ({ ...prev, material: e.target.value }))}
                      placeholder="Ex: Zircônia, Metal-cerâmica"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">Cor</Label>
                    <Input
                      id="color"
                      value={formData.color}
                      onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="Ex: A2, B1, C3"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Prioridade</Label>
                    <Select onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
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
                      value={formData.deadline}
                      onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="deliveryAddress">Endereço de Entrega (Opcional)</Label>
                    <Input
                      id="deliveryAddress"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                      placeholder="Endereço completo para entrega"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações e Especificações</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Descreva detalhes específicos, cor, material, anatomia, etc."
                    rows={4}
                  />
                </div>

          <div className="space-y-4">
            <Label>Imagens e Documentação</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-primary text-xl">📁</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Clique para adicionar imagens</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG até 10MB cada</p>
                </div>
              </label>
            </div>

            {formData.images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.images.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

                <div className="flex gap-4 pt-6">
                  <Button 
                    type="submit" 
                    className="flex-1"
                    disabled={createOrder.isPending || isUploading}
                  >
                    {createOrder.isPending ? "Criando Pedido..." : 
                     isUploading ? "Enviando Imagens..." : 
                     "Criar Pedido"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate("/")}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default NewOrderForm;