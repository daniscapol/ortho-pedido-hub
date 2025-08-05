-- Segunda parte: Adicionar colunas às tabelas existentes
ALTER TABLE public.filiais 
ADD COLUMN clinica_id UUID REFERENCES public.clinicas(id),
ADD COLUMN cnpj TEXT,
ADD COLUMN telefone TEXT,
ADD COLUMN email TEXT;

ALTER TABLE public.profiles 
ADD COLUMN role_extended public.user_role_extended DEFAULT 'dentist',
ADD COLUMN clinica_id UUID REFERENCES public.clinicas(id),
ADD COLUMN filial_id UUID REFERENCES public.filiais(id),
ADD COLUMN created_by UUID REFERENCES public.profiles(id),
ADD COLUMN telefone TEXT,
ADD COLUMN documento TEXT;

ALTER TABLE public.patients
ADD COLUMN filial_id UUID REFERENCES public.filiais(id);