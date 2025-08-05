-- Criar enum para os novos tipos de usuário
CREATE TYPE public.user_role_extended AS ENUM ('admin_master', 'admin_clinica', 'admin_filial', 'dentist');

-- Criar tabela de clínicas
CREATE TABLE public.clinicas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de filiais para incluir referência à clínica
ALTER TABLE public.filiais 
ADD COLUMN clinica_id UUID REFERENCES public.clinicas(id),
ADD COLUMN cnpj TEXT,
ADD COLUMN telefone TEXT,
ADD COLUMN email TEXT;

-- Atualizar tabela de profiles para a nova estrutura hierárquica
ALTER TABLE public.profiles 
ADD COLUMN role_extended public.user_role_extended DEFAULT 'dentist',
ADD COLUMN clinica_id UUID REFERENCES public.clinicas(id),
ADD COLUMN filial_id UUID REFERENCES public.filiais(id),
ADD COLUMN created_by UUID REFERENCES public.profiles(id),
ADD COLUMN telefone TEXT,
ADD COLUMN documento TEXT;

-- Atualizar tabela de pacientes para incluir filial
ALTER TABLE public.patients
ADD COLUMN filial_id UUID REFERENCES public.filiais(id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;

-- Criar trigger para atualizar updated_at nas novas tabelas (apenas clínicas)
CREATE TRIGGER update_clinicas_updated_at
    BEFORE UPDATE ON public.clinicas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Funções auxiliares para verificar permissões
CREATE OR REPLACE FUNCTION public.get_user_role_extended()
RETURNS public.user_role_extended
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role_extended FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_clinica_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT clinica_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_filial_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT filial_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Função para verificar se é admin master
CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role_extended = 'admin_master'
  );
$$;

-- Função para verificar se pode gerenciar uma clínica
CREATE OR REPLACE FUNCTION public.can_manage_clinica(target_clinica_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    public.is_admin_master() OR 
    (get_user_role_extended() = 'admin_clinica' AND get_user_clinica_id() = target_clinica_id);
$$;

-- Função para verificar se pode gerenciar uma filial
CREATE OR REPLACE FUNCTION public.can_manage_filial(target_filial_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    public.is_admin_master() OR 
    (get_user_role_extended() = 'admin_clinica' AND EXISTS (
      SELECT 1 FROM public.filiais 
      WHERE id = target_filial_id AND clinica_id = get_user_clinica_id()
    )) OR
    (get_user_role_extended() = 'admin_filial' AND get_user_filial_id() = target_filial_id);
$$;