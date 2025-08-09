BEGIN;

-- Clinicas: inverter "clínica/clinica" ↔ "filial"
-- Passo 1: clinica -> TMP
UPDATE public.clinicas
SET nome_completo = regexp_replace(nome_completo, '(?i)cl[ií]nica', '__TMP_CLINICA__', 'g')
WHERE nome_completo ~* 'cl[ií]nica';

-- Passo 2: filial -> clinica
UPDATE public.clinicas
SET nome_completo = regexp_replace(nome_completo, '(?i)filial', 'clinica', 'g')
WHERE nome_completo ~* 'filial';

-- Passo 3: TMP -> filial
UPDATE public.clinicas
SET nome_completo = regexp_replace(nome_completo, '__TMP_CLINICA__', 'filial', 'g')
WHERE nome_completo LIKE '%__TMP_CLINICA__%';

-- Filiais: inverter "clínica/clinica" ↔ "filial"
-- Passo 1: clinica -> TMP
UPDATE public.filiais
SET nome_completo = regexp_replace(nome_completo, '(?i)cl[ií]nica', '__TMP_CLINICA__', 'g')
WHERE nome_completo ~* 'cl[ií]nica';

-- Passo 2: filial -> clinica
UPDATE public.filiais
SET nome_completo = regexp_replace(nome_completo, '(?i)filial', 'clinica', 'g')
WHERE nome_completo ~* 'filial';

-- Passo 3: TMP -> filial
UPDATE public.filiais
SET nome_completo = regexp_replace(nome_completo, '__TMP_CLINICA__', 'filial', 'g')
WHERE nome_completo LIKE '%__TMP_CLINICA__%';

COMMIT;