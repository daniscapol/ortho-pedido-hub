import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateOrder, useCreateOrderForDentist } from "@/hooks/useOrders";
import { useCreateOrderItems, type CreateOrderItem } from "@/hooks/useOrderItems";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import PatientSearch from "./PatientSearch";
import OrderItemForm from "./OrderItemForm";
import { Patient } from "@/hooks/usePatients";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useProfile } from "@/hooks/useProfile";
import { useDentists } from "@/hooks/useDentists";
import { Camera, Upload } from "lucide-react";

const NewOrderForm = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDentist, setSelectedDentist] = useState<string>("");
  const [orderItems, setOrderItems] = useState<Array<Omit<CreateOrderItem, 'order_id'>>>([]);
  const [formData, setFormData] = useState({
    observations: "",
    deliveryAddress: "",
    images: [] as File[]
  });

  const createOrder = useCreateOrder();
  const createOrderForDentist = useCreateOrderForDentist();
  const createOrderItems = useCreateOrderItems();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { uploadImages, isUploading } = useImageUpload();
  const { data: profile } = useProfile();
  const { data: dentists } = useDentists();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleCameraCapture = async () => {
    try {
      // Tentar acessar a câmera do dispositivo
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Câmera traseira em celulares
        } 
      });
      
      // Criar um elemento de vídeo para mostrar o preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.autoplay = true;
      video.playsInline = true;
      
      // Criar modal para captura
      const modal = document.createElement('div');
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      `;
      
      video.style.cssText = `
        max-width: 90%;
        max-height: 70%;
        border-radius: 8px;
      `;
      
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        margin-top: 20px;
        display: flex;
        gap: 15px;
      `;
      
      const captureBtn = document.createElement('button');
      captureBtn.textContent = 'Capturar';
      captureBtn.style.cssText = `
        background: #3b82f6;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
      `;
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.style.cssText = `
        background: #6b7280;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
      `;
      
      const cleanup = () => {
        stream.getTracks().forEach(track => track.stop());
        document.body.removeChild(modal);
      };
      
      captureBtn.onclick = () => {
        // Criar canvas para capturar a imagem
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0);
        
        // Converter para blob e criar arquivo
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFormData(prev => ({
              ...prev,
              images: [...prev.images, file]
            }));
          }
          cleanup();
        }, 'image/jpeg', 0.8);
      };
      
      cancelBtn.onclick = cleanup;
      
      buttonContainer.appendChild(captureBtn);
      buttonContainer.appendChild(cancelBtn);
      modal.appendChild(video);
      modal.appendChild(buttonContainer);
      document.body.appendChild(modal);
      
    } catch (error) {
      console.error('Erro ao acessar câmera:', error);
      // Fallback para seleção de arquivo se câmera não disponível
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, file]
          }));
        }
      };
      input.click();
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddOrderItem = (item: Omit<CreateOrderItem, 'order_id'>) => {
    setOrderItems(prev => [...prev, item]);
  };

  const handleEditOrderItem = (index: number, item: Omit<CreateOrderItem, 'order_id'>) => {
    setOrderItems(prev => prev.map((existingItem, i) => i === index ? item : existingItem));
  };

  const handleRemoveOrderItem = (index: number) => {
    setOrderItems(prev => prev.filter((_, i) => i !== index));
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

    if (orderItems.length === 0) {
      toast({
        title: "Erro", 
        description: "Adicione pelo menos um produto ao pedido",
        variant: "destructive",
      });
      return;
    }

    try {
      // Determinar o dentista e user_id corretos
      let dentistName = profile?.name || "Dentista";
      let userId = profile?.id;
      let useCustomUserId = false;

      // Se for admin_matriz e selecionou um dentista, usar o dentista selecionado
      if (profile?.role_extended === 'admin_matriz' && selectedDentist) {
        const selectedDentistData = dentists?.find(d => d.id === selectedDentist);
        if (selectedDentistData) {
          dentistName = selectedDentistData.name || selectedDentistData.nome_completo || "Dentista";
          userId = selectedDentistData.id;
          useCustomUserId = true;
        }
      }

      // Usar a função apropriada baseado se é admin_matriz ou não
      const orderMutation = useCustomUserId ? createOrderForDentist : createOrder;
      
      const orderData = {
        patient_id: selectedPatient.id,
        dentist: dentistName,
        prosthesis_type: "multiplos", // Indicador de que tem múltiplos produtos
        material: "",
        color: "",
        priority: "normal",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        observations: formData.observations,
        delivery_address: formData.deliveryAddress,
        selected_teeth: [], // Vazio, pois cada item tem seus próprios dentes
        status: "pending",
        ...(useCustomUserId && { user_id: userId })
      };

      // Primeiro criar o pedido principal
      const order = await orderMutation.mutateAsync(orderData);
      console.log('Pedido criado com sucesso:', order);

      // Criar os itens do pedido
      const itemsWithOrderId: CreateOrderItem[] = orderItems.map(item => ({
        ...item,
        order_id: order.id
      }));
      
      await createOrderItems.mutateAsync(itemsWithOrderId);
      console.log('Itens do pedido criados com sucesso');

      // Depois fazer upload das imagens se houver
      if (formData.images.length > 0) {
        const annotatedImages = formData.images.map(file => ({
          file,
          annotations: []
        }));
        await uploadImages(annotatedImages, order.id);
        console.log('Imagens enviadas com sucesso');
      }

      console.log('Redirecionando para home...');
      toast({
        title: "Pedido criado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      
      // Usar setTimeout para garantir que o toast seja mostrado antes do redirect
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar pedido: " + (error as Error).message,
        variant: "destructive",
      });
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
                <h3 className="font-medium">{selectedPatient.nome_completo}</h3>
                <p className="text-sm text-muted-foreground">CPF: {selectedPatient.cpf}</p>
                <p className="text-sm text-muted-foreground">Tel: {selectedPatient.telefone_contato}</p>
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
          {/* Formulário de Produtos */}
          <OrderItemForm 
            onAddItem={handleAddOrderItem}
            onEditItem={handleEditOrderItem}
            onRemoveItem={handleRemoveOrderItem}
            items={orderItems}
          />

          {/* Formulário do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Gerais do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Seleção de Dentista para admin_matriz */}
                {profile?.role_extended === 'admin_matriz' && (
                  <div className="space-y-2">
                    <Label htmlFor="dentistSelect">Selecionar Dentista</Label>
                    <Select value={selectedDentist} onValueChange={setSelectedDentist}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dentista responsável" />
                      </SelectTrigger>
                      <SelectContent>
                        {dentists?.map((dentist) => (
                          <SelectItem key={dentist.id} value={dentist.id}>
                            {dentist.name || dentist.nome_completo} - CRO: {dentist.cro || 'N/A'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Campo de dentista para outros usuários */}
                {profile?.role_extended !== 'admin_matriz' && (
                  <div className="space-y-2">
                    <Label htmlFor="dentistName">Dentista Responsável</Label>
                    <Input
                      id="dentistName"
                      value={profile?.name || "Carregando..."}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="deliveryAddress">Endereço de Entrega (Opcional)</Label>
                  <Input
                    id="deliveryAddress"
                    value={formData.deliveryAddress}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryAddress: e.target.value }))}
                    placeholder="Endereço completo para entrega"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observations">Observações Gerais do Pedido</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => setFormData(prev => ({ ...prev, observations: e.target.value }))}
                    placeholder="Observações gerais que se aplicam a todo o pedido"
                    rows={4}
                  />
                </div>

          <div className="space-y-4">
            <Label>Imagens e Documentação</Label>
            <div className="flex gap-4">
              <div className="flex-1 border-2 border-dashed border-border rounded-lg p-6 text-center">
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
                    <Upload className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Carregar Imagens</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG até 10MB cada</p>
                  </div>
                </label>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleCameraCapture}
                  className="h-full min-h-[120px] w-32 flex flex-col items-center justify-center gap-2"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">Câmera</span>
                </Button>
              </div>
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
                    disabled={
                      createOrder.isPending || 
                      createOrderForDentist.isPending ||
                      createOrderItems.isPending || 
                      isUploading || 
                      orderItems.length === 0 ||
                      (profile?.role_extended === 'admin_matriz' && !selectedDentist)
                    }
                  >
                    {(createOrder.isPending || createOrderForDentist.isPending) ? "Criando Pedido..." : 
                     createOrderItems.isPending ? "Adicionando Produtos..." :
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