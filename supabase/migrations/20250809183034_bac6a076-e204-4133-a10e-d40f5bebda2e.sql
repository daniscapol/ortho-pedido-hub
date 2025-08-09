-- Primeiro criar os tipos enum necessários
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'dentist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE user_role_extended AS ENUM ('admin_master', 'admin_filial', 'admin_clinica', 'dentist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Corrigir o trigger para usar os tipos corretos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, role_extended)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'dentist')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'role_extended', 'dentist')::user_role_extended
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Agora criar um usuário admin master para você poder acessar
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
  'admin@protese.com',
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