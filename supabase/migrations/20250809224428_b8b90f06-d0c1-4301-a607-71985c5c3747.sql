-- Fix the is_admin_master function to work correctly
DROP FUNCTION IF EXISTS public.is_admin_master();

CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT COALESCE(
    (SELECT role_extended = 'admin_master'::user_role_extended 
     FROM public.profiles 
     WHERE id = auth.uid()),
    false
  );
$$;