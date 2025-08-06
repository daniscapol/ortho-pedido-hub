-- Criar mais dentistas para teste do sistema
-- Vamos criar dentistas distribuídos pelas diferentes filiais

-- Dentista 1 - Filial Centro (Clínica Sorriso Perfeito)
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
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'Dr. Ana Silva', 
  'ana.silva@clinica.com', 
  'dentist', 
  'dentist',
  '11111111-1111-1111-1111-111111111111', -- Clínica Sorriso Perfeito
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', -- Filial Centro
  '123.456.789-01',
  '(11) 98765-4321',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af' -- criado pelo admin master
);

-- Dentista 2 - Filial Zona Sul (Clínica Sorriso Perfeito)
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
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
  'Dr. Carlos Oliveira', 
  'carlos.oliveira@clinica.com', 
  'dentist', 
  'dentist',
  '11111111-1111-1111-1111-111111111111', -- Clínica Sorriso Perfeito
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', -- Filial Zona Sul
  '234.567.890-12',
  '(11) 97654-3210',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af' -- criado pelo admin master
);

-- Dentista 3 - Filial Norte (Clínica Dental Care)
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
  'ffffffff-ffff-ffff-ffff-ffffffffffff',
  'Dra. Maria Santos', 
  'maria.santos@dentalcare.com', 
  'dentist', 
  'dentist',
  '22222222-2222-2222-2222-222222222222', -- Clínica Dental Care
  'cccccccc-cccc-cccc-cccc-cccccccccccc', -- Filial Norte
  '345.678.901-23',
  '(11) 96543-2109',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af' -- criado pelo admin master
);

-- Dentista 4 - Filial Leste (Clínica Dental Care)
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
  'gggggggg-gggg-gggg-gggg-gggggggggggg',
  'Dr. Roberto Lima', 
  'roberto.lima@dentalcare.com', 
  'dentist', 
  'dentist',
  '22222222-2222-2222-2222-222222222222', -- Clínica Dental Care
  'dddddddd-dddd-dddd-dddd-dddddddddddd', -- Filial Leste
  '456.789.012-34',
  '(11) 95432-1098',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af' -- criado pelo admin master
);

-- Dentista 5 - Filial Oeste (Clínica OdontoMax)
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
  'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh',
  'Dra. Patricia Costa', 
  'patricia.costa@odontomax.com', 
  'dentist', 
  'dentist',
  '33333333-3333-3333-3333-333333333333', -- Clínica OdontoMax
  'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', -- Filial Oeste
  '567.890.123-45',
  '(11) 94321-0987',
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af' -- criado pelo admin master
);

-- Associar alguns pacientes aos novos dentistas
UPDATE public.patients 
SET dentist_id = 'dddddddd-dddd-dddd-dddd-dddddddddddd'  -- Dr. Ana Silva
WHERE filial_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
AND id IN (
  SELECT id FROM public.patients 
  WHERE filial_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
  LIMIT 2
);

UPDATE public.patients 
SET dentist_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'  -- Dr. Carlos Oliveira
WHERE filial_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' 
AND id IN (
  SELECT id FROM public.patients 
  WHERE filial_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb' 
  LIMIT 2
);

UPDATE public.patients 
SET dentist_id = 'ffffffff-ffff-ffff-ffff-ffffffffffff'  -- Dra. Maria Santos
WHERE filial_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' 
AND id IN (
  SELECT id FROM public.patients 
  WHERE filial_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' 
  LIMIT 2
);