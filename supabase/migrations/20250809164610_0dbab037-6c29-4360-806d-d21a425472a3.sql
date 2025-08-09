-- Remove old columns that are causing conflicts
ALTER TABLE public.patients DROP COLUMN IF EXISTS name;
ALTER TABLE public.patients DROP COLUMN IF EXISTS phone;
ALTER TABLE public.patients DROP COLUMN IF EXISTS email;

-- Ensure the new columns have proper constraints
ALTER TABLE public.patients ALTER COLUMN nome_completo SET NOT NULL;
ALTER TABLE public.patients ALTER COLUMN telefone_contato SET NOT NULL;
ALTER TABLE public.patients ALTER COLUMN email_contato SET NOT NULL;