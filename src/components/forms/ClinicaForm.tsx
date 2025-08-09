import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ClinicaFormData {
  nome_completo: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: string;
  cep: string;
  cidade: string;
  estado: string;
  numero: string;
  complemento?: string;
  filial_id?: string;
  ativo?: boolean;
}

interface ClinicaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ClinicaFormData) => Promise<void>;
  isLoading?: boolean;
  initialData?: Partial<ClinicaFormData> | null;
  filiais?: { id: string; nome_completo: string }[];
  forceFilialId?: string | null;
}

export const ClinicaForm = ({ open, onOpenChange, onSubmit, isLoading, initialData, filiais, forceFilialId }: ClinicaFormProps) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<ClinicaFormData>({
    defaultValues: {
      ...initialData,
    }
  });

  useEffect(() => {
    if (open) {
      reset({
        ...initialData,
      } as ClinicaFormData);
      if (typeof forceFilialId !== 'undefined') {
        setValue('filial_id', forceFilialId ?? undefined);
      }
    }
  }, [open, initialData, forceFilialId, reset, setValue]);

  const handleFormSubmit = async (data: ClinicaFormData) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "Editar Clínica" : "Nova Clínica"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nome_completo">Nome Completo da Clínica *</Label>
              <Input
                id="nome_completo"
                {...register("nome_completo", { required: "Nome completo é obrigatório" })}
                placeholder="Nome da clínica"
              />
              {errors.nome_completo && (
                <p className="text-sm text-destructive mt-1">{errors.nome_completo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cnpj">CNPJ *</Label>
              <Input
                id="cnpj"
                {...register("cnpj", { required: "CNPJ é obrigatório" })}
                placeholder="00.000.000/0000-00"
              />
              {errors.cnpj && (
                <p className="text-sm text-destructive mt-1">{errors.cnpj.message}</p>
              )}
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
                placeholder="contato@clinica.com"
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

            {/* Filial selection - forced for admin_filial, selectable for admin_master */}
            <div className="md:col-span-2">
              <Label htmlFor="filial_id">Filial</Label>
              {typeof forceFilialId !== 'undefined' ? (
                <Select value={forceFilialId ?? 'none'} onValueChange={() => {}} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Filial vinculada" />
                  </SelectTrigger>
                  <SelectContent>
                    {forceFilialId === null && <SelectItem value="none">Sem filial</SelectItem>}
                    {filiais?.filter(f => f.id === forceFilialId).map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nome_completo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={(watch('filial_id') ?? 'none') as string}
                  onValueChange={(val) => setValue('filial_id', val === 'none' ? undefined : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar filial" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sem filial</SelectItem>
                    {filiais?.map((f) => (
                      <SelectItem key={f.id} value={f.id}>{f.nome_completo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (initialData ? "Salvando..." : "Criando...") : (initialData ? "Salvar Alterações" : "Criar Clínica")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
