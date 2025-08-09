-- Add missing filial_id column to clinicas and link to filiais
ALTER TABLE public.clinicas
  ADD COLUMN IF NOT EXISTS filial_id uuid;

-- Ensure FK points to filiais(id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'clinicas_filial_id_fkey'
  ) THEN
    ALTER TABLE public.clinicas
      ADD CONSTRAINT clinicas_filial_id_fkey
      FOREIGN KEY (filial_id) REFERENCES public.filiais(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Helpful index for lookups
CREATE INDEX IF NOT EXISTS idx_clinicas_filial_id ON public.clinicas(filial_id);