-- Associar clínicas existentes às filiais para que o super admin veja dados
-- Primeiro, verificar quais clínicas e filiais existem
UPDATE clinicas 
SET filial_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' 
WHERE id = '11111111-1111-1111-1111-111111111111';

UPDATE clinicas 
SET filial_id = 'cccccccc-cccc-cccc-cccc-cccccccccccc' 
WHERE id = '22222222-2222-2222-2222-222222222222';

UPDATE clinicas 
SET filial_id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee' 
WHERE id = '33333333-3333-3333-3333-333333333333';