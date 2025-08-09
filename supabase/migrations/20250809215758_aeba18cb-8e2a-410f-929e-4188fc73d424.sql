BEGIN;

-- Aplicar inversão diretamente em todos os registros
UPDATE public.clinicas
SET nome_completo = regexp_replace(
  regexp_replace(
    regexp_replace(nome_completo, '(?i)cl[ií]nica','__TMP_CLINICA__','g'),
    '(?i)filial','clinica','g'
  ),
  '__TMP_CLINICA__','filial','g'
);

UPDATE public.filiais
SET nome_completo = regexp_replace(
  regexp_replace(
    regexp_replace(nome_completo, '(?i)cl[ií]nica','__TMP_CLINICA__','g'),
    '(?i)filial','clinica','g'
  ),
  '__TMP_CLINICA__','filial','g'
);

COMMIT;