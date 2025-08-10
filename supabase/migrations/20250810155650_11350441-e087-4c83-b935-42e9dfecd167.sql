BEGIN;

-- 1) Add matriz columns to profiles, keep in sync with existing filial columns
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS matriz_id uuid;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS matriz_padrao_id uuid;

-- Populate new columns from existing values
UPDATE public.profiles 
SET matriz_id = filial_id 
WHERE matriz_id IS NULL AND filial_id IS NOT NULL;

UPDATE public.profiles 
SET matriz_padrao_id = filial_padrao_id 
WHERE matriz_padrao_id IS NULL AND filial_padrao_id IS NOT NULL;

-- Trigger function to keep matriz_* and filial_* in sync on profiles
CREATE OR REPLACE FUNCTION public.sync_profiles_matriz_filial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.matriz_id IS NULL AND NEW.filial_id IS NOT NULL THEN
    NEW.matriz_id = NEW.filial_id;
  END IF;
  IF NEW.filial_id IS NULL AND NEW.matriz_id IS NOT NULL THEN
    NEW.filial_id = NEW.matriz_id;
  END IF;
  IF NEW.matriz_padrao_id IS NULL AND NEW.filial_padrao_id IS NOT NULL THEN
    NEW.matriz_padrao_id = NEW.filial_padrao_id;
  END IF;
  IF NEW.filial_padrao_id IS NULL AND NEW.matriz_padrao_id IS NOT NULL THEN
    NEW.filial_padrao_id = NEW.matriz_padrao_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_profiles_matriz_filial ON public.profiles;
CREATE TRIGGER trg_sync_profiles_matriz_filial
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.sync_profiles_matriz_filial();

-- 2) Add matriz_id to clinicas and keep in sync with filial_id
ALTER TABLE public.clinicas ADD COLUMN IF NOT EXISTS matriz_id uuid;

-- Populate new column from existing value
UPDATE public.clinicas 
SET matriz_id = filial_id 
WHERE matriz_id IS NULL AND filial_id IS NOT NULL;

-- Trigger function to keep columns in sync on clinicas
CREATE OR REPLACE FUNCTION public.sync_clinicas_matriz_filial()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.matriz_id IS NULL AND NEW.filial_id IS NOT NULL THEN
    NEW.matriz_id = NEW.filial_id;
  END IF;
  IF NEW.filial_id IS NULL AND NEW.matriz_id IS NOT NULL THEN
    NEW.filial_id = NEW.matriz_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_clinicas_matriz_filial ON public.clinicas;
CREATE TRIGGER trg_sync_clinicas_matriz_filial
BEFORE INSERT OR UPDATE ON public.clinicas
FOR EACH ROW EXECUTE FUNCTION public.sync_clinicas_matriz_filial();

-- 3) Create a compatibility view "matrizes" over existing table "filiais"
CREATE OR REPLACE VIEW public.matrizes AS
SELECT * FROM public.filiais;

-- 4) New helper functions using matriz naming
CREATE OR REPLACE FUNCTION public.get_user_matriz_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT matriz_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_matrizes_with_counts()
RETURNS TABLE(
  id uuid,
  nome_completo text,
  endereco text,
  telefone text,
  email text,
  ativo boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  cep text,
  cidade text,
  estado text,
  numero text,
  complemento text,
  cnpj text,
  qntd_clinicas bigint,
  qntd_pacientes bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    f.id,
    f.nome_completo,
    f.endereco,
    f.telefone,
    f.email,
    f.ativo,
    f.created_at,
    f.updated_at,
    f.cep,
    f.cidade,
    f.estado,
    f.numero,
    f.complemento,
    f.cnpj,
    COALESCE(COUNT(DISTINCT c.id), 0) as qntd_clinicas,
    COALESCE(COUNT(DISTINCT p.id), 0) as qntd_pacientes
  FROM public.filiais f
  LEFT JOIN public.clinicas c ON (c.filial_id = f.id OR c.matriz_id = f.id)
  LEFT JOIN public.patients p ON p.clinica_id = c.id
  GROUP BY f.id, f.nome_completo, f.endereco, f.telefone, f.email, f.ativo, f.created_at, f.updated_at, f.cep, f.cidade, f.estado, f.numero, f.complemento, f.cnpj
  ORDER BY f.nome_completo;
$$;

CREATE OR REPLACE FUNCTION public.can_manage_matriz(target_matriz_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    public.is_admin_master() OR 
    (public.get_user_role_extended() = 'admin_clinica' AND EXISTS (
      SELECT 1 FROM public.clinicas c
      WHERE c.id = public.get_user_clinica_id() AND (c.filial_id = target_matriz_id OR c.matriz_id = target_matriz_id)
    )) OR
    (public.get_user_role_extended() = 'admin_filial' AND public.get_user_matriz_id() = target_matriz_id);
$$;

COMMIT;