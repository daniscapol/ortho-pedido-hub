-- Verificar e corrigir o perfil do daniscapol2@gmail.com
DO $$
DECLARE
    user_uuid uuid;
    profile_exists boolean;
BEGIN
    -- Pegar o ID do usuário
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'daniscapol2@gmail.com';
    
    IF user_uuid IS NOT NULL THEN
        -- Verificar se o perfil existe
        SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_uuid) INTO profile_exists;
        
        IF profile_exists THEN
            -- Atualizar o perfil existente
            UPDATE profiles 
            SET 
                role = 'admin'::user_role,
                role_extended = 'admin_master'::user_role_extended,
                name = 'Admin Master',
                email = 'daniscapol2@gmail.com'
            WHERE id = user_uuid;
            
            RAISE NOTICE 'Perfil admin master atualizado para daniscapol2@gmail.com';
        ELSE
            -- Criar o perfil
            INSERT INTO profiles (id, name, email, role, role_extended)
            VALUES (
                user_uuid,
                'Admin Master',
                'daniscapol2@gmail.com',
                'admin'::user_role,
                'admin_master'::user_role_extended
            );
            
            RAISE NOTICE 'Perfil admin master criado para daniscapol2@gmail.com';
        END IF;
    ELSE
        RAISE NOTICE 'Usuário daniscapol2@gmail.com não encontrado';
    END IF;
END $$;

-- Verificar se as funções estão funcionando corretamente
SELECT 
    'Verificação das funções:' as info,
    id,
    email,
    role,
    role_extended
FROM profiles 
WHERE email = 'daniscapol2@gmail.com';