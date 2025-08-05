-- Quarta parte: Criar funções de permissão e políticas RLS para clínicas
CREATE OR REPLACE FUNCTION public.can_manage_clinica(target_clinica_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    public.is_admin_master() OR 
    (public.get_user_role_extended() = 'admin_clinica' AND public.get_user_clinica_id() = target_clinica_id);
$$;

CREATE OR REPLACE FUNCTION public.can_manage_filial(target_filial_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    public.is_admin_master() OR 
    (public.get_user_role_extended() = 'admin_clinica' AND EXISTS (
      SELECT 1 FROM public.filiais 
      WHERE id = target_filial_id AND clinica_id = public.get_user_clinica_id()
    )) OR
    (public.get_user_role_extended() = 'admin_filial' AND public.get_user_filial_id() = target_filial_id);
$$;

-- Políticas RLS para clínicas (resolve o warning de RLS sem políticas)
CREATE POLICY "Admin master pode ver todas as clínicas" 
ON public.clinicas FOR SELECT 
USING (public.is_admin_master());

CREATE POLICY "Admin clínica pode ver sua clínica" 
ON public.clinicas FOR SELECT 
USING (public.get_user_clinica_id() = id);

CREATE POLICY "Admin master pode gerenciar clínicas" 
ON public.clinicas FOR ALL 
USING (public.is_admin_master())
WITH CHECK (public.is_admin_master());