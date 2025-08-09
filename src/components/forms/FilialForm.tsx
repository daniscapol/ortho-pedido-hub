import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface FilialFormData {
  nome_completo: string;
  endereco: string;
  telefone: string;
  email: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
  cnpj?: string;
  ativo: boolean;
}

interface FilialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FilialFormData) => Promise<void>;
  isLoading?: boolean;
}

export const FilialForm = ({ open, onOpenChange, onSubmit, isLoading }: FilialFormProps) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FilialFormData>({
    defaultValues: {
      ativo: true
    }
  });

  const ativo = watch("ativo");

  const handleFormSubmit = async (data: FilialFormData) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nova Filial</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nome_completo">Nome Completo da Filial *</Label>
              <Input
                id="nome_completo"
                {...register("nome_completo", { required: "Nome completo é obrigatório" })}
                placeholder="Nome da filial"
              />
              {errors.nome_completo && (
                <p className="text-sm text-destructive mt-1">{errors.nome_completo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input
                id="cnpj"
                {...register("cnpj")}
                placeholder="00.000.000/0000-00"
              />
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <Input
                id="telefone"
                {...register("telefone", { required: "Telefone é obrigatório" })}
                placeholder="(11) 99999-9999"
              />
              {errors.telefone && (
                <p className="text-sm text-destructive mt-1">{errors.telefone.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...register("email", { 
                  required: "Email é obrigatório",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email inválido"
                  }
                })}
                placeholder="filial@clinica.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="endereco">Endereço</Label>
              <Input
                id="endereco"
                {...register("endereco")}
                placeholder="Rua, Avenida, etc."
              />
            </div>

            <div>
              <Label htmlFor="numero">Número</Label>
              <Input
                id="numero"
                {...register("numero")}
                placeholder="123"
              />
            </div>

            <div>
              <Label htmlFor="complemento">Complemento</Label>
              <Input
                id="complemento"
                {...register("complemento")}
                placeholder="Apto, Sala, etc."
              />
            </div>

            <div>
              <Label htmlFor="cep">CEP</Label>
              <Input
                id="cep"
                {...register("cep")}
                placeholder="00000-000"
              />
            </div>

            <div>
              <Label htmlFor="cidade">Cidade</Label>
              <Input
                id="cidade"
                {...register("cidade")}
                placeholder="São Paulo"
              />
            </div>

            <div>
              <Label htmlFor="estado">Estado</Label>
              <Input
                id="estado"
                {...register("estado")}
                placeholder="SP"
                maxLength={2}
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={ativo}
                  onCheckedChange={(checked) => setValue("ativo", checked)}
                />
                <Label htmlFor="ativo">Filial Ativa</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Criando..." : "Criar Filial"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};