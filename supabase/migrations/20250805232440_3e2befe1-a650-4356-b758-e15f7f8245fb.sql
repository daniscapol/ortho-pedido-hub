-- Correção dos dados de produtos conforme especificação do usuário

-- Limpar e recriar dados corretos
DELETE FROM public.compatibilidade_produto_material_cor;
DELETE FROM public.tipos_protese;
DELETE FROM public.materiais;
DELETE FROM public.products;

-- Inserir produtos corretos (14 produtos)
INSERT INTO public.products (id, nome_produto, categoria, ativo) VALUES
(1, 'Coroa E-max', 'Coroa', true),
(2, 'Coroa Impressa', 'Coroa', true),
(3, 'Coroa E-max sobre Implante', 'Implante', true),
(4, 'Inlay Impressa', 'Restauração', true),
(5, 'Inlay E-max', 'Restauração', true),
(6, 'Onlay Impressa', 'Restauração', true),
(7, 'Onlay E-max', 'Restauração', true),
(8, 'Overlay Impressa', 'Restauração', true),
(9, 'Overlay E-max', 'Restauração', true),
(10, 'Provisórios Impressos (Ocado)', 'Provisório', true),
(11, 'Provisórios com Aletas Adesivas', 'Provisório', true),
(12, 'Faceta E-max', 'Estética', true),
(13, 'Placa de Bruxismo', 'Auxiliar', true),
(14, 'Modelo 3D', 'Auxiliar', true);

-- Inserir tipos de prótese corretos
INSERT INTO public.tipos_protese (id, nome_tipo, categoria_tipo, compativel_produtos) VALUES
(1, 'Coroa anatômica', 'Coroa', '{1,2,3}'),
(2, 'Coroa reduzida', 'Coroa', '{1,2,3}'),
(3, 'Coroa para injeção', 'Coroa', '{1,2}'),
(4, 'Coroa casca de ovo (Provisória)', 'Coroa', '{10,11}'),
(5, 'Coroa telescópica', 'Coroa', '{1,2}'),
(6, 'Coping simples', 'Coroa', '{1,2}'),
(7, 'Inlay', 'Restauração', '{4,5}'),
(8, 'Onlay', 'Restauração', '{6,7}'),
(9, 'Overlay', 'Restauração', '{8,9}'),
(10, 'Faceta (Veneer)', 'Estética', '{12}'),
(11, 'Mockup', 'Estética', '{10,11}'),
(12, 'Pôntico anatômico', 'Pôntico', '{1,2}'),
(13, 'Pôntico reduzido', 'Pôntico', '{1,2}'),
(14, 'Pilar personalizado', 'Implante', '{3}'),
(15, 'Parafusada', 'Implante', '{3}'),
(16, 'Placa de mordida', 'Auxiliar', '{13}'),
(17, 'Modelo', 'Auxiliar', '{14}');

-- Inserir materiais corretos
INSERT INTO public.materiais (id, nome_material, tipo_material, compativel_produtos) VALUES
(1, 'E-max (Dissilicato de Lítio)', 'Cerâmica', '{1,3,5,7,9,12}'),
(2, 'Zircônia', 'Cerâmica', '{1,3}'),
(3, 'Porcelana pura', 'Cerâmica', '{1,12}'),
(4, 'Resina Impressa 3D', 'Polímero', '{2,4,6,8,10,11,13,14}'),
(5, 'Acrílico/PMMA', 'Polímero', '{2,4,6,8,10,11,13}'),
(6, 'Compósito', 'Polímero', '{2,4,6,8}'),
(7, 'Metal NP', 'Metal', '{3}'),
(8, 'Titânio', 'Metal', '{3}'),
(9, 'Cera', 'Outros', '{14}');

-- Inserir compatibilidade produto-material-cor correta
INSERT INTO public.compatibilidade_produto_material_cor (id_produto, materiais_compativeis, cores_compativeis) VALUES
(1, '{1,2,3}', '1-26'),
(2, '{4,5,6}', '1-26'),
(3, '{1,2,7,8}', '1-26'),
(4, '{4,5,6}', '1-26'),
(5, '{1}', '1-26'),
(6, '{4,5,6}', '1-26'),
(7, '{1}', '1-26'),
(8, '{4,5,6}', '1-26'),
(9, '{1}', '1-26'),
(10, '{4,5}', '1-26'),
(11, '{4,5}', '1-26'),
(12, '{1,3}', '1-26'),
(13, '{4,5}', 'NA'),
(14, '{9}', 'NA');

-- Atualizar sequências
SELECT setval('products_id_seq', 14, true);
SELECT setval('tipos_protese_id_seq', 17, true);
SELECT setval('materiais_id_seq', 9, true);
SELECT setval('compatibilidade_produto_material_cor_id_seq', 14, true);