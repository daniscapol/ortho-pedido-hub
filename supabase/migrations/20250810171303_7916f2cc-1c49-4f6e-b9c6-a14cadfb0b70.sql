-- Fix RLS for patients to allow inserts/updates respecting hierarchy and remove problematic restrictive ALL policy

-- Ensure RLS is enabled
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can create patients" ON public.patients;
DROP POLICY IF EXISTS "Usuários podem gerenciar pacientes conforme nova hierarquia" ON public.patients;

-- INSERT: allow based on role and ownership
CREATE POLICY "Patients insert per hierarchy"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_filial'::user_role_extended AND patients.filial_id = public.get_user_filial_id()) OR
  (public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND patients.clinica_id = public.get_user_clinica_id()) OR
  (public.get_user_role_extended() = 'dentist'::user_role_extended AND patients.dentist_id = auth.uid())
);

-- UPDATE: allow when user can manage the row; also ensure new values remain consistent
CREATE POLICY "Patients update per hierarchy"
ON public.patients
FOR UPDATE
TO authenticated
USING (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_filial'::user_role_extended AND patients.filial_id = public.get_user_filial_id()) OR
  (public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND patients.clinica_id = public.get_user_clinica_id()) OR
  (public.get_user_role_extended() = 'dentist'::user_role_extended AND patients.dentist_id = auth.uid())
)
WITH CHECK (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_filial'::user_role_extended AND patients.filial_id = public.get_user_filial_id()) OR
  (public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND patients.clinica_id = public.get_user_clinica_id()) OR
  (public.get_user_role_extended() = 'dentist'::user_role_extended AND patients.dentist_id = auth.uid())
);

-- DELETE: allow when user can manage the row
CREATE POLICY "Patients delete per hierarchy"
ON public.patients
FOR DELETE
TO authenticated
USING (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_filial'::user_role_extended AND patients.filial_id = public.get_user_filial_id()) OR
  (public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND patients.clinica_id = public.get_user_clinica_id()) OR
  (public.get_user_role_extended() = 'dentist'::user_role_extended AND patients.dentist_id = auth.uid())
);
