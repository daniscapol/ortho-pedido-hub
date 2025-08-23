import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PacienteFormData {
  nome_completo: string;
  cpf: string;
  telefone_contato: string;
  email_contato: string;
  observacoes?: string;
  ativo: boolean;
}

interface PacienteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PacienteFormData) => Promise<void>;
  isLoading?: boolean;
}

export const PacienteForm = ({ open, onOpenChange, onSubmit, isLoading }: PacienteFormProps) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PacienteFormData>({
    defaultValues: {
      ativo: true
    }
  });

  const ativo = watch("ativo");

  const handleFormSubmit = async (data: PacienteFormData) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Paciente</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nome_completo">
                Nome Completo <span className="text-red-500">*</span>
              </Label>
              <Input
                id="nome_completo"
                {...register("nome_completo", { required: "Nome completo é obrigatório" })}
                placeholder="Nome completo do paciente"
              />
              {errors.nome_completo && (
                <p className="text-sm text-destructive mt-1">{errors.nome_completo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cpf">
                CPF <span className="text-red-500">*</span>
              </Label>
              <Input
                id="cpf"
                {...register("cpf", { required: "CPF é obrigatório" })}
                placeholder="000.000.000-00"
              />
              {errors.cpf && (
                <p className="text-sm text-destructive mt-1">{errors.cpf.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telefone_contato">
                Telefone <span className="text-red-500">*</span>
              </Label>
              <Input
                id="telefone_contato"
                {...register("telefone_contato", { required: "Telefone é obrigatório" })}
                placeholder="(11) 99999-9999"
              />
              {errors.telefone_contato && (
                <p className="text-sm text-destructive mt-1">{errors.telefone_contato.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email_contato">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email_contato"
                type="email"
                {...register("email_contato", { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
                placeholder="paciente@email.com"
              />
              {errors.email_contato && (
                <p className="text-sm text-destructive mt-1">{errors.email_contato.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                {...register("observacoes")}
                placeholder="Observações sobre o paciente..."
                rows={3}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={ativo}
                  onCheckedChange={(checked) => setValue("ativo", checked)}
                />
                <Label htmlFor="ativo">Paciente Ativo</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Paciente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};