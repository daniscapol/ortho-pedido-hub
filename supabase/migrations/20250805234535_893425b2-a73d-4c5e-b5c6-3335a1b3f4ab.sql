-- Primeira parte: Criar estruturas básicas
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

-- Habilitar RLS na tabela de clínicas
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;

-- Criar trigger para atualizar updated_at na tabela clínicas
CREATE TRIGGER update_clinicas_updated_at
    BEFORE UPDATE ON public.clinicas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();