-- Migração para corrigir a estrutura de clínicas e filiais

-- Primeiro, criar a clínica corretamente na tabela clinicas
INSERT INTO public.clinicas (
  id, 
  nome_completo, 
  cnpj, 
  endereco, 
  telefone, 
  email, 
  cep, 
  cidade, 
  estado, 
  numero, 
  complemento, 
  ativo, 
  created_at, 
  updated_at
)
SELECT 
  id,
  nome_completo,
  cnpj,
  endereco,
  telefone,
  email,
  cep,
  cidade,
  estado,
  numero,
  complemento,
  ativo,
  created_at,
  updated_at
FROM public.filiais 
WHERE clinica_id IS NULL;

-- Remover o registro incorreto da tabela filiais
DELETE FROM public.filiais WHERE clinica_id IS NULL;

-- Atualizar as foreign keys para garantir consistência
-- Adicionar foreign key constraint para clinica_id em profiles se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_clinica_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_clinica_id_fkey 
        FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id);
    END IF;
END $$;

-- Adicionar foreign key constraint para filial_id em profiles se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_filial_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles 
        ADD CONSTRAINT profiles_filial_id_fkey 
        FOREIGN KEY (filial_id) REFERENCES public.filiais(id);
    END IF;
END $$;

-- Adicionar foreign key constraint para clinica_id em filiais se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'filiais_clinica_id_fkey' 
        AND table_name = 'filiais'
    ) THEN
        ALTER TABLE public.filiais 
        ADD CONSTRAINT filiais_clinica_id_fkey 
        FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id);
    END IF;
END $$;