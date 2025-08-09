-- Fix swapped foreign keys on profiles.filial_id and profiles.clinica_id
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_filial_id_fkey;
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_clinica_id_fkey;

-- Correct constraints
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_filial_id_fkey
  FOREIGN KEY (filial_id) REFERENCES public.filiais(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_clinica_id_fkey
  FOREIGN KEY (clinica_id) REFERENCES public.clinicas(id) ON DELETE SET NULL;