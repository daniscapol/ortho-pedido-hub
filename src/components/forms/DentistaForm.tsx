import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DentistaFormData {
  nome_completo: string;
  email: string;
  password: string;
  cro: string;
  cpf: string;
  telefone?: string;
  endereco?: string;
  cep?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
  clinica_id?: string | null;
  role: 'admin' | 'dentist';
  role_extended: 'admin_master' | 'admin_clinica' | 'admin_matriz' | 'dentist';
  ativo: boolean;
}

interface DentistaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DentistaFormData) => Promise<void>;
  isLoading?: boolean;
  canCreateAdmin?: boolean;
  clinics?: { id: string; nome_completo: string }[];
  forceClinicaId?: string | null;
  editingDentist?: {
    id: string;
    nome_completo?: string;
    email?: string;
    cro?: string;
    cpf?: string;
    telefone?: string;
    endereco?: string;
    cep?: string;
    cidade?: string;
    estado?: string;
    numero?: string;
    complemento?: string;
    clinica_id?: string | null;
    ativo?: boolean;
  } | null;
}

export const DentistaForm = ({ open, onOpenChange, onSubmit, isLoading, canCreateAdmin, clinics, forceClinicaId, editingDentist }: DentistaFormProps) => {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<DentistaFormData>({
    defaultValues: {
      role: 'dentist',
      role_extended: 'dentist',
      ativo: true,
      clinica_id: forceClinicaId ?? null,
    }
  });

  // Adicionar validação personalizada para clinica_id
  register('clinica_id', { 
    required: forceClinicaId ? false : "Clínica é obrigatória" 
  });

  const ativo = watch("ativo");
  const roleExtended = watch("role_extended");

  useEffect(() => {
    if (forceClinicaId !== undefined) {
      setValue('clinica_id', forceClinicaId ?? null);
    }
  }, [forceClinicaId, setValue]);

  useEffect(() => {
    if (editingDentist && open) {
      setValue('nome_completo', editingDentist.nome_completo || '');
      setValue('email', editingDentist.email || '');
      setValue('cro', editingDentist.cro || '');
      setValue('cpf', editingDentist.cpf || '');
      setValue('telefone', editingDentist.telefone || '');
      setValue('endereco', editingDentist.endereco || '');
      setValue('cep', editingDentist.cep || '');
      setValue('cidade', editingDentist.cidade || '');
      setValue('estado', editingDentist.estado || '');
      setValue('numero', editingDentist.numero || '');
      setValue('complemento', editingDentist.complemento || '');
      setValue('clinica_id', editingDentist.clinica_id || null);
      setValue('ativo', editingDentist.ativo ?? true);
    } else if (!editingDentist && open) {
      reset({
        role: 'dentist',
        role_extended: 'dentist',
        ativo: true,
        clinica_id: forceClinicaId ?? null,
      });
    }
  }, [editingDentist, open, setValue, reset, forceClinicaId]);

  const handleFormSubmit = async (data: DentistaFormData) => {
    console.log('DentistaForm handleFormSubmit called with:', data);
    try {
      await onSubmit(data);
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error in handleFormSubmit:', error);
      // Don't close the form if there's an error
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingDentist ? 'Editar Dentista' : 'Novo Dentista'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nome_completo">Nome Completo *</Label>
              <Input
                id="nome_completo"
                {...register("nome_completo", { required: "Nome completo é obrigatório" })}
                placeholder="Nome completo do dentista"
              />
              {errors.nome_completo && (
                <p className="text-sm text-destructive mt-1">{errors.nome_completo.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cro">CRO *</Label>
              <Input
                id="cro"
                {...register("cro", { required: "CRO é obrigatório" })}
                placeholder="SP-12345"
              />
              {errors.cro && (
                <p className="text-sm text-destructive mt-1">{errors.cro.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="cpf">CPF *</Label>
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
                placeholder="dentista@email.com"
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
              )}
            </div>

            {!editingDentist && (
              <div>
                <Label htmlFor="password">Senha *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { 
                    required: !editingDentist ? "Senha é obrigatória" : false,
                    minLength: {
                      value: 6,
                      message: "Senha deve ter pelo menos 6 caracteres"
                    }
                  })}
                  placeholder="Senha temporária"
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                {...register("telefone")}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="clinica_id">Clínica *</Label>
              {forceClinicaId ? (
                <Select value={forceClinicaId ?? ''} onValueChange={() => {}} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Clínica vinculada" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics?.filter(c => c.id === forceClinicaId).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={watch('clinica_id') ?? ''}
                  onValueChange={(val) => setValue('clinica_id', val || null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar clínica" />
                  </SelectTrigger>
                  <SelectContent>
                    {clinics?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.clinica_id && (
                <p className="text-sm text-destructive mt-1">{errors.clinica_id.message}</p>
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
                <Label htmlFor="ativo">Dentista Ativo</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (editingDentist ? "Salvando..." : "Criando...") : (editingDentist ? "Salvar Alterações" : "Criar Dentista")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};