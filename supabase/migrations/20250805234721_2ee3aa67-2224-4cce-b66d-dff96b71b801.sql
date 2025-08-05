-- Quinta parte: Atualizar políticas RLS existentes

-- Remover políticas antigas das filiais
DROP POLICY IF EXISTS "Admins can manage filiais" ON public.filiais;
DROP POLICY IF EXISTS "Users can view active filiais" ON public.filiais;

-- Criar novas políticas para filiais
CREATE POLICY "Admin master pode ver todas as filiais" 
ON public.filiais FOR SELECT 
USING (public.is_admin_master());

CREATE POLICY "Admin clínica pode ver filiais da sua clínica" 
ON public.filiais FOR SELECT 
USING (public.get_user_role_extended() = 'admin_clinica' AND clinica_id = public.get_user_clinica_id());

CREATE POLICY "Admin filial pode ver sua filial" 
ON public.filiais FOR SELECT 
USING (public.get_user_role_extended() = 'admin_filial' AND id = public.get_user_filial_id());

CREATE POLICY "Dentistas podem ver filiais ativas da sua clínica" 
ON public.filiais FOR SELECT 
USING (public.get_user_role_extended() = 'dentist' AND ativo = true AND clinica_id = public.get_user_clinica_id());

CREATE POLICY "Admins podem gerenciar filiais" 
ON public.filiais FOR ALL 
USING (public.can_manage_filial(id))
WITH CHECK (public.can_manage_filial(id));