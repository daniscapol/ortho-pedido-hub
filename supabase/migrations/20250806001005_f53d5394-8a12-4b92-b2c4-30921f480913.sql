-- Verificar e corrigir a função is_admin_master
-- Primeiro vamos ver se a função está sendo executada corretamente

-- Verificar se o usuário atual tem role_extended = 'admin_master'
DO $$
DECLARE
    current_role user_role_extended;
    current_user_id uuid;
BEGIN
    -- Obter ID do usuário atual
    SELECT auth.uid() INTO current_user_id;
    
    -- Obter role_extended
    SELECT role_extended INTO current_role
    FROM public.profiles 
    WHERE id = current_user_id;
    
    RAISE NOTICE 'Current user ID: %, Role Extended: %', current_user_id, current_role;
END $$;

-- Recriar a função is_admin_master para ter certeza que está correta
CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role_extended = 'admin_master'
  );
$function$;