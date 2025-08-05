-- Update products table structure and create related tables for the new product system

-- First, let's backup the existing products table by renaming it
ALTER TABLE IF EXISTS public.products RENAME TO products_backup;

-- Create the main products table with new structure
CREATE TABLE public.products (
    id SERIAL PRIMARY KEY,
    nome_produto TEXT NOT NULL,
    categoria TEXT NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tipos_protese table
CREATE TABLE public.tipos_protese (
    id SERIAL PRIMARY KEY,
    nome_tipo TEXT NOT NULL,
    categoria_tipo TEXT NOT NULL,
    compativel_produtos INTEGER[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create materiais table
CREATE TABLE public.materiais (
    id SERIAL PRIMARY KEY,
    nome_material TEXT NOT NULL,
    tipo_material TEXT NOT NULL,
    compativel_produtos INTEGER[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cores table
CREATE TABLE public.cores (
    id SERIAL PRIMARY KEY,
    codigo_cor TEXT NOT NULL,
    nome_cor TEXT NOT NULL,
    escala TEXT,
    grupo TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create compatibility table
CREATE TABLE public.compatibilidade_produto_material_cor (
    id SERIAL PRIMARY KEY,
    id_produto INTEGER NOT NULL,
    materiais_compativeis INTEGER[] NOT NULL DEFAULT '{}',
    cores_compativeis TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert products data
INSERT INTO public.products (id, nome_produto, categoria, ativo) VALUES
(1, 'Coroa E-max', 'Coroa', true),
(2, 'Coroa Impressa', 'Coroa', true),
(3, 'Coroa E-max sobre Implante', 'Implante', true),
(4, 'Inlay/Onlay Impressa', 'Restauração', true),
(5, 'Inlay/Onlay E-max', 'Restauração', true),
(6, 'Provisórios Impressos (Ocado)', 'Provisório', true),
(7, 'Provisórios com Aletas Adesivas', 'Provisório', true),
(8, 'Faceta E-max', 'Estética', true),
(9, 'Placa de Bruxismo', 'Auxiliar', true),
(10, 'Modelo 3D', 'Auxiliar', true);

-- Insert tipos_protese data
INSERT INTO public.tipos_protese (id, nome_tipo, categoria_tipo, compativel_produtos) VALUES
(1, 'Coroa anatômica', 'Coroa', '{1,2,3}'),
(2, 'Coroa reduzida', 'Coroa', '{1,2,3}'),
(3, 'Coroa para injeção', 'Coroa', '{1,2}'),
(4, 'Coroa casca de ovo (Provisória)', 'Coroa', '{6,7}'),
(5, 'Coroa telescópica', 'Coroa', '{1,2}'),
(6, 'Coping simples', 'Coroa', '{1,2}'),
(7, 'Inlay', 'Restauração', '{4,5}'),
(8, 'Onlay', 'Restauração', '{4,5}'),
(9, 'Overlay', 'Restauração', '{4,5}'),
(10, 'Faceta (Veneer)', 'Estética', '{8}'),
(11, 'Mockup', 'Estética', '{6,7}'),
(12, 'Pôntico anatômico', 'Pôntico', '{1,2}'),
(13, 'Pôntico reduzido', 'Pôntico', '{1,2}'),
(14, 'Pilar personalizado', 'Implante', '{3}'),
(15, 'Parafusada', 'Implante', '{3}'),
(16, 'Placa de mordida', 'Auxiliar', '{9}'),
(17, 'Modelo', 'Auxiliar', '{10}');

-- Insert materiais data
INSERT INTO public.materiais (id, nome_material, tipo_material, compativel_produtos) VALUES
(1, 'E-max (Dissilicato de Lítio)', 'Cerâmica', '{1,3,5,8}'),
(2, 'Zircônia', 'Cerâmica', '{1,3}'),
(3, 'Porcelana pura', 'Cerâmica', '{1,8}'),
(4, 'Resina Impressa 3D', 'Polímero', '{2,4,6,7,9,10}'),
(5, 'Acrílico/PMMA', 'Polímero', '{2,4,6,7,9}'),
(6, 'Compósito', 'Polímero', '{2,4}'),
(7, 'Metal NP', 'Metal', '{3}'),
(8, 'Titânio', 'Metal', '{3}'),
(9, 'Cera', 'Outros', '{10}');

-- Insert cores data
INSERT INTO public.cores (id, codigo_cor, nome_cor, escala, grupo) VALUES
(1, 'A1', 'A1', 'VITA Classical', 'A'),
(2, 'A2', 'A2', 'VITA Classical', 'A'),
(3, 'A3', 'A3', 'VITA Classical', 'A'),
(4, 'A3.5', 'A3.5', 'VITA Classical', 'A'),
(5, 'A4', 'A4', 'VITA Classical', 'A'),
(6, 'B1', 'B1', 'VITA Classical', 'B'),
(7, 'B2', 'B2', 'VITA Classical', 'B'),
(8, 'B3', 'B3', 'VITA Classical', 'B'),
(9, 'B4', 'B4', 'VITA Classical', 'B'),
(10, 'C1', 'C1', 'VITA Classical', 'C'),
(11, 'C2', 'C2', 'VITA Classical', 'C'),
(12, 'C3', 'C3', 'VITA Classical', 'C'),
(13, 'C4', 'C4', 'VITA Classical', 'C'),
(14, 'D2', 'D2', 'VITA Classical', 'D'),
(15, 'D3', 'D3', 'VITA Classical', 'D'),
(16, 'D4', 'D4', 'VITA Classical', 'D'),
(17, '60', '60', 'Biolux', ''),
(18, '62', '62', 'Biolux', ''),
(19, '66', '66', 'Biolux', ''),
(20, '67', '67', 'Biolux', ''),
(21, '69', '69', 'Biolux', ''),
(22, '77', '77', 'Biolux', ''),
(23, 'BL1', 'BL1', 'Bleach', ''),
(24, '0M1', '0M1', 'VITA 3D-Master', ''),
(25, '0M2', '0M2', 'VITA 3D-Master', ''),
(26, '0M3', '0M3', 'VITA 3D-Master', '');

-- Insert compatibility data
INSERT INTO public.compatibilidade_produto_material_cor (id_produto, materiais_compativeis, cores_compativeis) VALUES
(1, '{1,2,3}', '1-26'),
(2, '{4,5,6}', '1-26'),
(3, '{1,2,7,8}', '1-26'),
(4, '{4,5,6}', '1-26'),
(5, '{1}', '1-26'),
(6, '{4,5}', '1-26'),
(7, '{4,5}', '1-26'),
(8, '{1,3}', '1-26'),
(9, '{4,5}', 'NA'),
(10, '{9}', 'NA');

-- Reset sequences to continue from the inserted data
SELECT setval('products_id_seq', 10, true);
SELECT setval('tipos_protese_id_seq', 17, true);
SELECT setval('materiais_id_seq', 9, true);
SELECT setval('cores_id_seq', 26, true);
SELECT setval('compatibilidade_produto_material_cor_id_seq', 10, true);

-- Add triggers for updated_at columns
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON public.products
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tipos_protese_updated_at
    BEFORE UPDATE ON public.tipos_protese
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_materiais_updated_at
    BEFORE UPDATE ON public.materiais
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cores_updated_at
    BEFORE UPDATE ON public.cores
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_compatibilidade_updated_at
    BEFORE UPDATE ON public.compatibilidade_produto_material_cor
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all new tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tipos_protese ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materiais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compatibilidade_produto_material_cor ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for products table
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (ativo = true OR is_admin(auth.uid()));
CREATE POLICY "Only admins can insert products" ON public.products FOR INSERT WITH CHECK (is_admin(auth.uid()));
CREATE POLICY "Only admins can update products" ON public.products FOR UPDATE USING (is_admin(auth.uid()));
CREATE POLICY "Only admins can delete products" ON public.products FOR DELETE USING (is_admin(auth.uid()));

-- Create RLS policies for tipos_protese table
CREATE POLICY "Anyone can view tipos_protese" ON public.tipos_protese FOR SELECT USING (true);
CREATE POLICY "Only admins can manage tipos_protese" ON public.tipos_protese FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create RLS policies for materiais table
CREATE POLICY "Anyone can view materiais" ON public.materiais FOR SELECT USING (true);
CREATE POLICY "Only admins can manage materiais" ON public.materiais FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create RLS policies for cores table
CREATE POLICY "Anyone can view cores" ON public.cores FOR SELECT USING (true);
CREATE POLICY "Only admins can manage cores" ON public.cores FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create RLS policies for compatibility table
CREATE POLICY "Anyone can view compatibility" ON public.compatibilidade_produto_material_cor FOR SELECT USING (true);
CREATE POLICY "Only admins can manage compatibility" ON public.compatibilidade_produto_material_cor FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Add useful indexes
CREATE INDEX idx_products_categoria ON public.products(categoria);
CREATE INDEX idx_products_ativo ON public.products(ativo);
CREATE INDEX idx_tipos_protese_categoria ON public.tipos_protese(categoria_tipo);
CREATE INDEX idx_materiais_tipo ON public.materiais(tipo_material);
CREATE INDEX idx_cores_escala ON public.cores(escala);
CREATE INDEX idx_cores_grupo ON public.cores(grupo);
CREATE INDEX idx_compatibilidade_produto ON public.compatibilidade_produto_material_cor(id_produto);