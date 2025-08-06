-- Criar usuários de teste para cada role

-- 1. Admin Clínica (Clínica Sorriso Perfeito)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin.clinica@sorrisoperfeito.com',
  '$2a$10$g5XzGGAhcAhCxACCJ1YfNO7/Fv4mXKPnG8Gn0Wn1Kn5vMXdKxH2rO', -- senha: teste123
  now(),
  now(),
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin Clínica Sorriso", "role": "admin"}',
  false,
  now()
);

-- 2. Admin Filial (Filial Centro)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin.filial@centro.com',
  '$2a$10$g5XzGGAhcAhCxACCJ1YfNO7/Fv4mXKPnG8Gn0Wn1Kn5vMXdKxH2rO', -- senha: teste123
  now(),
  now(),
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin Filial Centro", "role": "admin"}',
  false,
  now()
);

-- 3. Dentista (Filial Centro)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dentista.centro@clinica.com',
  '$2a$10$g5XzGGAhcAhCxACCJ1YfNO7/Fv4mXKPnG8Gn0Wn1Kn5vMXdKxH2rO', -- senha: teste123
  now(),
  now(),
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Dr. João Silva", "role": "dentist"}',
  false,
  now()
);

-- 4. Dentista (Filial Zona Sul)
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_sent_at,
  recovery_sent_at,
  email_change_sent_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  last_sign_in_at
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dentista.zonasul@clinica.com',
  '$2a$10$g5XzGGAhcAhCxACCJ1YfNO7/Fv4mXKPnG8Gn0Wn1Kn5vMXdKxH2rO', -- senha: teste123
  now(),
  now(),
  now(),
  now(),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Dra. Maria Santos", "role": "dentist"}',
  false,
  now()
);

-- Agora criar os perfis correspondentes

-- 1. Profile Admin Clínica
INSERT INTO public.profiles (
  id,
  name,
  email,
  role,
  role_extended,
  clinica_id,
  filial_id,
  documento,
  telefone,
  created_by
) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Admin Clínica Sorriso',
  'admin.clinica@sorrisoperfeito.com',
  'admin',
  'admin_clinica',
  '11111111-1111-1111-1111-111111111111', -- Clínica Sorriso Perfeito
  NULL,
  '111.222.333-44',
  '(11) 99999-1111',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
);

-- 2. Profile Admin Filial
INSERT INTO public.profiles (
  id,
  name,
  email,
  role,
  role_extended,
  clinica_id,
  filial_id,
  documento,
  telefone,
  created_by
) VALUES (
  '22222222-2222-2222-2222-222222222222',
  'Admin Filial Centro',
  'admin.filial@centro.com',
  'admin',
  'admin_filial',
  '11111111-1111-1111-1111-111111111111', -- Clínica Sorriso Perfeito
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Filial Centro
  '222.333.444-55',
  '(11) 99999-2222',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
);

-- 3. Profile Dentista Centro
INSERT INTO public.profiles (
  id,
  name,
  email,
  role,
  role_extended,
  clinica_id,
  filial_id,
  documento,
  telefone,
  created_by
) VALUES (
  '33333333-3333-3333-3333-333333333333',
  'Dr. João Silva',
  'dentista.centro@clinica.com',
  'dentist',
  'dentist',
  '11111111-1111-1111-1111-111111111111', -- Clínica Sorriso Perfeito
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Filial Centro
  '333.444.555-66',
  '(11) 99999-3333',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
);

-- 4. Profile Dentista Zona Sul
INSERT INTO public.profiles (
  id,
  name,
  email,
  role,
  role_extended,
  clinica_id,
  filial_id,
  documento,
  telefone,
  created_by
) VALUES (
  '44444444-4444-4444-4444-444444444444',
  'Dra. Maria Santos',
  'dentista.zonasul@clinica.com',
  'dentist',
  'dentist',
  '11111111-1111-1111-1111-111111111111', -- Clínica Sorriso Perfeito
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- Filial Zona Sul
  '444.555.666-77',
  '(11) 99999-4444',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
);

-- Associar alguns pacientes aos dentistas de teste usando subquery
UPDATE public.patients 
SET dentist_id = '33333333-3333-3333-3333-333333333333'  -- Dr. João Silva
WHERE id IN (
  SELECT id FROM public.patients 
  WHERE filial_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
  AND dentist_id IS NULL
  ORDER BY created_at
  LIMIT 3
);

UPDATE public.patients 
SET dentist_id = '44444444-4444-4444-4444-444444444444'  -- Dra. Maria Santos
WHERE id IN (
  SELECT id FROM public.patients 
  WHERE filial_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' 
  AND dentist_id IS NULL
  ORDER BY created_at
  LIMIT 2
);