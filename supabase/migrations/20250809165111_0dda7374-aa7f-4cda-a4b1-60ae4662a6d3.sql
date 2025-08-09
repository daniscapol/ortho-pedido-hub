-- Verificar e corrigir as funções que podem estar causando problemas

-- Atualizar função get_user_role_extended para ser mais robusta
CREATE OR REPLACE FUNCTION public.get_user_role_extended()
 RETURNS user_role_extended
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT role_extended FROM public.profiles WHERE id = auth.uid()),
    'dentist'::user_role_extended
  );
$$;

-- Atualizar função get_user_clinica_id para ser mais robusta
CREATE OR REPLACE FUNCTION public.get_user_clinica_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT clinica_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Atualizar função get_user_filial_id para ser mais robusta
CREATE OR REPLACE FUNCTION public.get_user_filial_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT filial_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Atualizar função can_manage_filial para incluir admin master
CREATE OR REPLACE FUNCTION public.can_manage_filial(target_filial_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    public.is_admin_master() OR 
    (public.get_user_role_extended() = 'admin_clinica' AND EXISTS (
      SELECT 1 FROM public.filiais 
      WHERE id = target_filial_id AND clinica_id = public.get_user_clinica_id()
    )) OR
    (public.get_user_role_extended() = 'admin_filial' AND public.get_user_filial_id() = target_filial_id);
$$;

-- Atualizar função can_manage_clinica para incluir admin master
CREATE OR REPLACE FUNCTION public.can_manage_clinica(target_clinica_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT 
    public.is_admin_master() OR 
    (public.get_user_role_extended() = 'admin_clinica' AND public.get_user_clinica_id() = target_clinica_id);
$$;