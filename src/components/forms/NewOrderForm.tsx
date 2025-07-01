import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const NewOrderForm = () => {
  const [formData, setFormData] = useState({
    patientName: "",
    dentistName: "",
    clinic: "",
    prosthesisType: "",
    priority: "",
    deadline: "",
    observations: "",
    images: [] as File[]
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Novo pedido:", formData);
    // Aqui seria implementada a lógica de envio
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Novo Pedido de Prótese</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="patientName">Nome do Paciente</Label>
              <Input
                id="patientName"
                value={formData.patientName}
                onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
                placeholder="Digite o nome completo"
                required
              />
            </div>

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
              <Label htmlFor="clinic">Clínica/Consultório</Label>
              <Input
                id="clinic"
                value={formData.clinic}
                onChange={(e) => setFormData(prev => ({ ...prev, clinic: e.target.value }))}
                placeholder="Nome da clínica"
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
            <Button type="submit" className="flex-1">
              Criar Pedido
            </Button>
            <Button type="button" variant="outline" className="flex-1">
              Salvar Rascunho
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewOrderForm;