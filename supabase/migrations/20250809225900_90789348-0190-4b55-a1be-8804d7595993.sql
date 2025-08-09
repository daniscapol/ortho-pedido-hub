-- Fix RLS visibility for filiais and clinicas according to the hierarchy

-- ========== FILIAIS ==========
-- Drop incorrect policies
DROP POLICY IF EXISTS "Admin clinica pode gerenciar sua filial" ON public.filiais;
DROP POLICY IF EXISTS "Admin filial pode gerenciar filiais da sua clinica" ON public.filiais;

-- Admin filial: can manage only their own filial
CREATE POLICY "Admin filial pode gerenciar sua filial"
ON public.filiais
FOR ALL
USING (get_user_role_extended() = 'admin_filial'::user_role_extended AND id = get_user_filial_id())
WITH CHECK (get_user_role_extended() = 'admin_filial'::user_role_extended AND id = get_user_filial_id());

-- Admin clínica: can view the filial that owns their clinic
CREATE POLICY "Admin clinica pode ver filial da sua clinica"
ON public.filiais
FOR SELECT
USING (
  get_user_role_extended() = 'admin_clinica'::user_role_extended AND 
  id = (
    SELECT filial_id FROM public.clinicas WHERE id = get_user_clinica_id()
  )
);

-- Keep Admin master existing policies (manage + select) as-is

-- ========== CLINICAS ==========
-- Drop incorrect policies
DROP POLICY IF EXISTS "Admin clinica pode ver clinicas das suas filiais" ON public.clinicas;
DROP POLICY IF EXISTS "Admin filial pode gerenciar sua clinica" ON public.clinicas;
DROP POLICY IF EXISTS "Admin filial pode ver sua clinica" ON public.clinicas;

-- Admin filial: can manage clinics that belong to their filial
CREATE POLICY "Admin filial pode gerenciar clinicas da sua filial"
ON public.clinicas
FOR ALL
USING (get_user_role_extended() = 'admin_filial'::user_role_extended AND filial_id = get_user_filial_id())
WITH CHECK (get_user_role_extended() = 'admin_filial'::user_role_extended AND filial_id = get_user_filial_id());

-- Admin clínica: can manage only their own clinic
CREATE POLICY "Admin clinica pode gerenciar sua clinica"
ON public.clinicas
FOR ALL
USING (get_user_role_extended() = 'admin_clinica'::user_role_extended AND id = get_user_clinica_id())
WITH CHECK (get_user_role_extended() = 'admin_clinica'::user_role_extended AND id = get_user_clinica_id());

-- Admin clínica: can view their own clinic (explicit)
CREATE POLICY "Admin clinica pode ver sua clinica"
ON public.clinicas
FOR SELECT
USING (get_user_role_extended() = 'admin_clinica'::user_role_extended AND id = get_user_clinica_id());