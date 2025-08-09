-- Debug: verificar se a função is_admin_master está funcionando corretamente
SELECT 
  auth.uid() as current_user_id,
  (SELECT role_extended FROM public.profiles WHERE id = auth.uid()) as current_role_extended,
  (SELECT role_extended = 'admin_master' FROM public.profiles WHERE id = auth.uid()) as is_master_check;

-- Recriar a função is_admin_master para garantir que funcione
CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT COALESCE(
    (SELECT role_extended = 'admin_master'::user_role_extended FROM public.profiles WHERE id = auth.uid()),
    false
  );
$function$;