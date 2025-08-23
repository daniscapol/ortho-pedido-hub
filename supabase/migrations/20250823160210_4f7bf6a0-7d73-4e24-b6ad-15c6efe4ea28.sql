-- Alterar a coluna cpf da tabela patients para permitir valores nulos
ALTER TABLE public.patients ALTER COLUMN cpf DROP NOT NULL;

-- Alterar também as colunas telefone_contato e email_contato para permitir nulos
ALTER TABLE public.patients ALTER COLUMN telefone_contato DROP NOT NULL;
ALTER TABLE public.patients ALTER COLUMN email_contato DROP NOT NULL;

-- Atualizar registros existentes que possam ter valores vazios
UPDATE public.patients SET cpf = NULL WHERE cpf = '';
UPDATE public.patients SET telefone_contato = NULL WHERE telefone_contato = '';
UPDATE public.patients SET email_contato = NULL WHERE email_contato = '';