-- Sexta parte: Atualizar políticas RLS para profiles

-- Remover políticas antigas dos profiles
DROP POLICY IF EXISTS "Admins can view all complete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

-- Criar novas políticas para profiles
CREATE POLICY "Admin master pode ver todos os perfis" 
ON public.profiles FOR SELECT 
USING (public.is_admin_master());

CREATE POLICY "Admin clínica pode ver perfis da sua clínica" 
ON public.profiles FOR SELECT 
USING (public.get_user_role_extended() = 'admin_clinica' AND clinica_id = public.get_user_clinica_id());

CREATE POLICY "Admin filial pode ver perfis da sua filial" 
ON public.profiles FOR SELECT 
USING (public.get_user_role_extended() = 'admin_filial' AND filial_id = public.get_user_filial_id());

CREATE POLICY "Admin master pode gerenciar todos os perfis" 
ON public.profiles FOR ALL 
USING (public.is_admin_master())
WITH CHECK (public.is_admin_master());

CREATE POLICY "Admin clínica pode gerenciar perfis da sua clínica" 
ON public.profiles FOR ALL 
USING (public.get_user_role_extended() = 'admin_clinica' AND clinica_id = public.get_user_clinica_id())
WITH CHECK (public.get_user_role_extended() = 'admin_clinica' AND clinica_id = public.get_user_clinica_id());

CREATE POLICY "Admin filial pode gerenciar dentistas da sua filial" 
ON public.profiles FOR ALL 
USING (public.get_user_role_extended() = 'admin_filial' AND filial_id = public.get_user_filial_id() AND role_extended = 'dentist')
WITH CHECK (public.get_user_role_extended() = 'admin_filial' AND filial_id = public.get_user_filial_id() AND role_extended = 'dentist');