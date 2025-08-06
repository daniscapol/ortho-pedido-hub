-- Vou criar usuários usando a extensão pg_crypto para gerar hash correto da senha
-- Primeiro, vamos garantir que a extensão está habilitada
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criar usuários com hash correto para senha 'teste123'
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- Admin Clínica
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin.clinica@sorrisoperfeito.com',
  crypt('teste123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Clínica Sorriso","role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Admin Filial
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin.filial@centro.com',
  crypt('teste123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin Filial Centro","role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Dentista Centro
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dentista.centro@clinica.com',
  crypt('teste123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Dr. João Silva","role":"dentist"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
),
-- Dentista Zona Sul
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'dentista.zonasul@clinica.com',
  crypt('teste123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Dra. Maria Santos","role":"dentist"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Criar profiles correspondentes
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
) VALUES 
-- Admin Clínica
(
  '11111111-1111-1111-1111-111111111111',
  'Admin Clínica Sorriso',
  'admin.clinica@sorrisoperfeito.com',
  'admin',
  'admin_clinica',
  '11111111-1111-1111-1111-111111111111',
  NULL,
  '111.222.333-44',
  '(11) 99999-1111',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
),
-- Admin Filial
(
  '22222222-2222-2222-2222-222222222222',
  'Admin Filial Centro',
  'admin.filial@centro.com',
  'admin',
  'admin_filial',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '222.333.444-55',
  '(11) 99999-2222',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
),
-- Dentista Centro
(
  '33333333-3333-3333-3333-333333333333',
  'Dr. João Silva',
  'dentista.centro@clinica.com',
  'dentist',
  'dentist',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '333.444.555-66',
  '(11) 99999-3333',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
),
-- Dentista Zona Sul
(
  '44444444-4444-4444-4444-444444444444',
  'Dra. Maria Santos',
  'dentista.zonasul@clinica.com',
  'dentist',
  'dentist',
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '444.555.666-77',
  '(11) 99999-4444',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
);