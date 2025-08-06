-- Atualizar tabela clinicas
ALTER TABLE public.clinicas 
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS complemento text;

-- Renomear campos para português na tabela clinicas
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinicas' AND column_name = 'nome') THEN
        ALTER TABLE public.clinicas RENAME COLUMN nome TO nome_completo;
    END IF;
END $$;

-- Atualizar tabela filiais
ALTER TABLE public.filiais 
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS complemento text;

-- Renomear campos para português na tabela filiais
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'filiais' AND column_name = 'nome') THEN
        ALTER TABLE public.filiais RENAME COLUMN nome TO nome_completo;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'filiais' AND column_name = 'endereco_entrega') THEN
        ALTER TABLE public.filiais RENAME COLUMN endereco_entrega TO endereco;
    END IF;
END $$;

-- Atualizar tabela profiles (dentistas)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS nome_completo text,
ADD COLUMN IF NOT EXISTS cro text,
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS endereco text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS estado text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS complemento text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS filial_padrao_id uuid REFERENCES public.filiais(id);

-- Migrar dados existentes de 'name' para 'nome_completo' se não existir
UPDATE public.profiles 
SET nome_completo = name 
WHERE nome_completo IS NULL AND name IS NOT NULL;

-- Atualizar tabela patients
ALTER TABLE public.patients 
ADD COLUMN IF NOT EXISTS nome_completo text,
ADD COLUMN IF NOT EXISTS telefone_contato text,
ADD COLUMN IF NOT EXISTS email_contato text,
ADD COLUMN IF NOT EXISTS observacoes text,
ADD COLUMN IF NOT EXISTS ativo boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS clinica_id uuid;

-- Migrar dados existentes
UPDATE public.patients 
SET nome_completo = name,
    telefone_contato = phone,
    email_contato = email
WHERE nome_completo IS NULL;

-- Preencher clinica_id baseado na filial
UPDATE public.patients 
SET clinica_id = f.clinica_id
FROM public.filiais f
WHERE patients.filial_id = f.id AND patients.clinica_id IS NULL;

-- Tornar campos obrigatórios onde faz sentido
ALTER TABLE public.clinicas 
ALTER COLUMN nome_completo SET NOT NULL,
ALTER COLUMN cnpj SET NOT NULL,
ALTER COLUMN email SET NOT NULL,
ALTER COLUMN telefone SET NOT NULL;

ALTER TABLE public.filiais 
ALTER COLUMN nome_completo SET NOT NULL;

ALTER TABLE public.patients 
ALTER COLUMN nome_completo SET NOT NULL,
ALTER COLUMN cpf SET NOT NULL;