-- Verificar se o usuário daniscapol2@gmail.com ainda existe
DO $$
DECLARE
    user_exists boolean;
    user_uuid uuid;
BEGIN
    -- Verificar se o usuário existe no auth.users
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'daniscapol2@gmail.com') INTO user_exists;
    
    IF user_exists THEN
        -- Se existe, pegar o ID e criar/atualizar o perfil
        SELECT id INTO user_uuid FROM auth.users WHERE email = 'daniscapol2@gmail.com';
        
        INSERT INTO public.profiles (id, name, email, role, role_extended)
        VALUES (
            user_uuid,
            'Admin Master',
            'daniscapol2@gmail.com',
            'admin'::user_role,
            'admin_master'::user_role_extended
        )
        ON CONFLICT (id) DO UPDATE SET
            role = 'admin'::user_role,
            role_extended = 'admin_master'::user_role_extended,
            name = 'Admin Master';
            
        RAISE NOTICE 'Perfil admin master criado/atualizado para daniscapol2@gmail.com';
    ELSE
        -- Se não existe, criar o usuário e perfil
        INSERT INTO auth.users (
            instance_id,
            id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            created_at,
            updated_at,
            raw_user_meta_data,
            is_super_admin,
            confirmation_token,
            email_change,
            email_change_token_new,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            gen_random_uuid(),
            'authenticated',
            'authenticated',
            'daniscapol2@gmail.com',
            crypt('123456', gen_salt('bf')),
            now(),
            now(),
            now(),
            '{"role": "admin", "role_extended": "admin_master", "name": "Admin Master"}'::jsonb,
            false,
            '',
            '',
            '',
            ''
        );
        
        RAISE NOTICE 'Usuário daniscapol2@gmail.com criado como admin master';
    END IF;
END $$;