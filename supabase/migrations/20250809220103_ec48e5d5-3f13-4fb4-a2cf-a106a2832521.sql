BEGIN;

-- Atualizar perfis: inverter "clínica/clinica" ↔ "filial" em nome_completo
UPDATE public.profiles
SET nome_completo = regexp_replace(
  regexp_replace(
    regexp_replace(nome_completo, '(?i)cl[ií]nica','__TMP_CLINICA__','g'),
    '(?i)filial','clinica','g'
  ),
  '__TMP_CLINICA__','filial','g'
)
WHERE nome_completo IS NOT NULL
  AND (nome_completo ~* 'cl[ií]nica' OR nome_completo ~* 'filial');

-- Também em name, se existir
UPDATE public.profiles
SET name = regexp_replace(
  regexp_replace(
    regexp_replace(name, '(?i)cl[ií]nica','__TMP_CLINICA__','g'),
    '(?i)filial','clinica','g'
  ),
  '__TMP_CLINICA__','filial','g'
)
WHERE name IS NOT NULL
  AND (name ~* 'cl[ií]nica' OR name ~* 'filial');

COMMIT;