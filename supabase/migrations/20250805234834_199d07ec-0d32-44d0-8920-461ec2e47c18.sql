-- Sétima parte: Atualizar políticas RLS para patients

-- Remover políticas antigas dos patients
DROP POLICY IF EXISTS "Users can view their patients or admins can view all" ON public.patients;
DROP POLICY IF EXISTS "Users can update their patients or admins can update all" ON public.patients;

-- Criar novas políticas para patients
CREATE POLICY "Admin master pode ver todos os pacientes" 
ON public.patients FOR SELECT 
USING (public.is_admin_master());

CREATE POLICY "Admin clínica pode ver pacientes da sua clínica" 
ON public.patients FOR SELECT 
USING (public.get_user_role_extended() = 'admin_clinica' AND EXISTS (
  SELECT 1 FROM public.filiais 
  WHERE id = patients.filial_id AND clinica_id = public.get_user_clinica_id()
));

CREATE POLICY "Admin filial pode ver pacientes da sua filial" 
ON public.patients FOR SELECT 
USING (public.get_user_role_extended() = 'admin_filial' AND filial_id = public.get_user_filial_id());

CREATE POLICY "Dentistas podem ver seus pacientes" 
ON public.patients FOR SELECT 
USING (public.get_user_role_extended() = 'dentist' AND dentist_id = auth.uid());

CREATE POLICY "Usuários podem gerenciar pacientes conforme hierarquia" 
ON public.patients FOR ALL 
USING (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_clinica' AND EXISTS (
    SELECT 1 FROM public.filiais 
    WHERE id = patients.filial_id AND clinica_id = public.get_user_clinica_id()
  )) OR
  (public.get_user_role_extended() = 'admin_filial' AND filial_id = public.get_user_filial_id()) OR
  (public.get_user_role_extended() = 'dentist' AND dentist_id = auth.uid())
)
WITH CHECK (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_clinica' AND EXISTS (
    SELECT 1 FROM public.filiais 
    WHERE id = patients.filial_id AND clinica_id = public.get_user_clinica_id()
  )) OR
  (public.get_user_role_extended() = 'admin_filial' AND filial_id = public.get_user_filial_id()) OR
  (public.get_user_role_extended() = 'dentist' AND dentist_id = auth.uid())
);