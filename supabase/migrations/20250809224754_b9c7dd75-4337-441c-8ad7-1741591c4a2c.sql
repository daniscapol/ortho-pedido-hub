-- Remove temporary insecure policy
DROP POLICY IF EXISTS "Temporary allow all updates" ON public.profiles;

-- Recreate restrictive policies to include admin master override
DROP POLICY IF EXISTS "Admin clínica pode gerenciar perfis da sua clínica" ON public.profiles;
CREATE POLICY "Admin clínica pode gerenciar perfis da sua clínica"
AS RESTRICTIVE
ON public.profiles
FOR ALL
USING (
  is_admin_master() OR (
    get_user_role_extended() = 'admin_clinica'::user_role_extended AND clinica_id = get_user_clinica_id()
  )
)
WITH CHECK (
  is_admin_master() OR (
    get_user_role_extended() = 'admin_clinica'::user_role_extended AND clinica_id = get_user_clinica_id()
  )
);

DROP POLICY IF EXISTS "Admin filial pode gerenciar dentistas da sua filial" ON public.profiles;
CREATE POLICY "Admin filial pode gerenciar dentistas da sua filial"
AS RESTRICTIVE
ON public.profiles
FOR ALL
USING (
  is_admin_master() OR (
    get_user_role_extended() = 'admin_filial'::user_role_extended AND filial_id = get_user_filial_id() AND role_extended = 'dentist'::user_role_extended
  )
)
WITH CHECK (
  is_admin_master() OR (
    get_user_role_extended() = 'admin_filial'::user_role_extended AND filial_id = get_user_filial_id() AND role_extended = 'dentist'::user_role_extended
  )
);
