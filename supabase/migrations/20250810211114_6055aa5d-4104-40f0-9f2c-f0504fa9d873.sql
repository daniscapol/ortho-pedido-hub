-- Limpar usuário órfão que existe apenas em auth.users mas não em profiles
-- Buscar e remover o usuário 'siridani2@hotmail.com' que está orphaned
-- Isso só pode ser feito via SQL pois não temos função para limpar auth.users diretamente

-- Primeiro vamos criar uma função para limpar usuários órfãos
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_auth_users()
RETURNS TABLE(cleaned_email text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find auth users that don't have corresponding profiles
    FOR user_record IN 
        SELECT au.id, au.email
        FROM auth.users au
        LEFT JOIN public.profiles p ON au.id = p.id
        WHERE p.id IS NULL AND au.email = 'siridani2@hotmail.com'
    LOOP
        -- Delete the orphaned auth user
        DELETE FROM auth.users WHERE id = user_record.id;
        
        RETURN NEXT user_record.email;
    END LOOP;
END;
$$;