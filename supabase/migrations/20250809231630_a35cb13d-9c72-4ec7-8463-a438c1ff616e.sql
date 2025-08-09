-- Realign primary key sequence for compatibilidade_produto_material_cor to avoid duplicate key on insert
-- Safe for repeated runs
SELECT setval(
  pg_get_serial_sequence('public.compatibilidade_produto_material_cor', 'id'),
  COALESCE((SELECT MAX(id) FROM public.compatibilidade_produto_material_cor), 0)
);
