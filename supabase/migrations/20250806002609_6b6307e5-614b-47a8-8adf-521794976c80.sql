-- Associar alguns pacientes aos dentistas de teste
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