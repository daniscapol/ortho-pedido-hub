-- Atualizar alguns pacientes para terem dentistas diferentes (simulando dentistas)
-- Vamos associar alguns pacientes ao daniscapol2 em filiais específicas

-- Primeiro, vamos atualizar o daniscapol2 para estar associado a uma clínica específica
UPDATE public.profiles 
SET 
  clinica_id = '11111111-1111-1111-1111-111111111111',  -- Clínica Sorriso Perfeito
  filial_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'    -- Filial Centro
WHERE id = '96251dd1-5141-4c9c-b947-c6b32bf4f5af';

-- Agora vamos criar alguns pacientes que pertencem a dentistas fictícios
-- (simulando que existem outros dentistas no sistema)
UPDATE public.patients 
SET dentist_id = '96251dd1-5141-4c9c-b947-c6b32bf4f5af'
WHERE filial_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';  -- Pacientes da Filial Centro