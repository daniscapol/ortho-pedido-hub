-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo TEXT NOT NULL UNIQUE,
  nome_produto TEXT NOT NULL,
  categoria TEXT NOT NULL,
  subcategoria TEXT NOT NULL,
  material TEXT NOT NULL,
  tipo_resina TEXT,
  necessita_cor BOOLEAN NOT NULL DEFAULT false,
  necessita_implante BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active products" 
ON public.products 
FOR SELECT 
USING (ativo = true OR is_admin(auth.uid()));

CREATE POLICY "Only admins can insert products" 
ON public.products 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Only admins can update products" 
ON public.products 
FOR UPDATE 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can delete products" 
ON public.products 
FOR DELETE 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert example products
INSERT INTO public.products (codigo, nome_produto, categoria, subcategoria, material, tipo_resina, necessita_cor, necessita_implante, ativo) VALUES
('CRE-FRE-POR', 'Coroa E-max Fresada com Porcelana', 'COROA', 'EMAX', 'E-MAX', NULL, true, false, true),
('CRE-POR-PUR', 'Coroa E-max Porcelana Pura', 'COROA', 'EMAX', 'E-MAX', NULL, true, false, true),
('CRE-CER-TOT', 'Coroa E-max Cerâmica Total', 'COROA', 'EMAX', 'E-MAX', NULL, true, false, true),
('CRE-IMP-CM', 'Coroa E-max sobre Implante - Cone Morse', 'COROA', 'EMAX_IMPLANTE', 'E-MAX', NULL, true, true, true),
('CRE-IMP-CMS', 'Coroa E-max sobre Implante - Cone Morse Strong', 'COROA', 'EMAX_IMPLANTE', 'E-MAX', NULL, true, true, true),
('CRE-IMP-CMSW', 'Coroa E-max sobre Implante - CMSW', 'COROA', 'EMAX_IMPLANTE', 'E-MAX', NULL, true, true, true),
('CRE-IMP-HI', 'Coroa E-max sobre Implante - HI SW', 'COROA', 'EMAX_IMPLANTE', 'E-MAX', NULL, true, true, true),
('CRE-IMP-UNI', 'Coroa E-max sobre Implante - Unitite', 'COROA', 'EMAX_IMPLANTE', 'E-MAX', NULL, true, true, true),
('CRI-RES-NAC', 'Coroa Impressa - Resina Nacional', 'COROA', 'IMPRESSA', 'RESINA', 'NACIONAL', true, false, true),
('CRI-RES-B60', 'Coroa Impressa - Resina Biolux 60', 'COROA', 'IMPRESSA', 'RESINA', 'BIOLUX_60', true, false, true),
('CRI-RES-B62', 'Coroa Impressa - Resina Biolux 62', 'COROA', 'IMPRESSA', 'RESINA', 'BIOLUX_62', true, false, true),
('CRI-RES-B66', 'Coroa Impressa - Resina Biolux 66', 'COROA', 'IMPRESSA', 'RESINA', 'BIOLUX_66', true, false, true),
('CRI-RES-B67', 'Coroa Impressa - Resina Biolux 67', 'COROA', 'IMPRESSA', 'RESINA', 'BIOLUX_67', true, false, true),
('CRI-RES-B69', 'Coroa Impressa - Resina Biolux 69', 'COROA', 'IMPRESSA', 'RESINA', 'BIOLUX_69', true, false, true),
('CRI-RES-B77', 'Coroa Impressa - Resina Biolux 77', 'COROA', 'IMPRESSA', 'RESINA', 'BIOLUX_77', true, false, true),
('CRI-RES-IMP', 'Coroa Impressa - Resina Importada', 'COROA', 'IMPRESSA', 'RESINA', 'IMPORTADA', true, false, true),
('CRI-CER', 'Coroa Impressa - Cerômero', 'COROA', 'IMPRESSA', 'CERÔMERO', NULL, true, false, true),
('INL-IMP-NAC', 'Inlay Impressa - Resina Nacional', 'RESTAURACAO', 'INLAY', 'RESINA', 'NACIONAL', true, false, true),
('INL-IMP-BIO', 'Inlay Impressa - Resina Biolux', 'RESTAURACAO', 'INLAY', 'RESINA', 'BIOLUX', true, false, true),
('INL-EMAX', 'Inlay E-max - Porcelana', 'RESTAURACAO', 'INLAY', 'E-MAX', NULL, true, false, true),
('ONL-IMP-NAC', 'Onlay Impressa - Resina Nacional', 'RESTAURACAO', 'ONLAY', 'RESINA', 'NACIONAL', true, false, true),
('ONL-IMP-B60', 'Onlay Impressa - Resina Biolux 60', 'RESTAURACAO', 'ONLAY', 'RESINA', 'BIOLUX_60', true, false, true),
('ONL-IMP-B62', 'Onlay Impressa - Resina Biolux 62', 'RESTAURACAO', 'ONLAY', 'RESINA', 'BIOLUX_62', true, false, true),
('ONL-IMP-B66', 'Onlay Impressa - Resina Biolux 66', 'RESTAURACAO', 'ONLAY', 'RESINA', 'BIOLUX_66', true, false, true),
('ONL-IMP-B69', 'Onlay Impressa - Resina Biolux 69', 'RESTAURACAO', 'ONLAY', 'RESINA', 'BIOLUX_69', true, false, true),
('ONL-EMAX', 'Onlay E-max - Porcelana', 'RESTAURACAO', 'ONLAY', 'E-MAX', NULL, true, false, true),
('OVL-IMP-RES', 'Overlay Impressa - Resina', 'RESTAURACAO', 'OVERLAY', 'RESINA', 'NACIONAL', true, false, true),
('PRO-OCA-UNI', 'Provisório Ocado - Unitário', 'PROVISORIO', 'OCADO', 'RESINA', 'NACIONAL', true, false, true),
('PRO-OCA-MUL', 'Provisório Ocado - Múltiplo', 'PROVISORIO', 'OCADO', 'RESINA', 'NACIONAL', true, false, true),
('PRO-ALE-ANT', 'Provisório com Aletas - Unitário Anterior', 'PROVISORIO', 'ALETAS', 'RESINA', 'NACIONAL', true, false, true),
('PRO-ALE-POS', 'Provisório com Aletas - Unitário Posterior', 'PROVISORIO', 'ALETAS', 'RESINA', 'NACIONAL', true, false, true),
('PRO-ALE-PON', 'Provisório com Aletas - Ponte Fixa', 'PROVISORIO', 'ALETAS', 'RESINA', 'NACIONAL', true, false, true),
('CRP-OCA-RES', 'Coroa Provisória Ocada - Resina', 'PROVISORIO', 'COROA_PROV', 'RESINA', 'NACIONAL', true, false, true),
('CRP-ALE-RES', 'Coroa Provisória com Aletas - Resina', 'PROVISORIO', 'COROA_PROV', 'RESINA', 'NACIONAL', true, false, true),
('CRP-PRE-RES', 'Coroa Provisória sobre Preparo - Resina', 'PROVISORIO', 'COROA_PROV', 'RESINA', 'NACIONAL', true, false, true),
('FAC-EMAX', 'Faceta E-max - Laminado Cerâmico', 'ESTETICA', 'FACETA', 'E-MAX', NULL, true, false, true),
('FAC-IMP-RES', 'Faceta Impressa - Resina Composta', 'ESTETICA', 'FACETA', 'RESINA', 'NACIONAL', true, false, true),
('FAC-LENS', 'Faceta Contact Lens - Ultrafina', 'ESTETICA', 'FACETA', 'E-MAX', NULL, true, false, true),
('PLA-BRX-SUP', 'Placa de Bruxismo - Superior Rígida', 'DISPOSITIVO', 'PLACA', 'ACRÍLICO', NULL, false, false, true),
('PLA-BRX-INF', 'Placa de Bruxismo - Inferior Rígida', 'DISPOSITIVO', 'PLACA', 'ACRÍLICO', NULL, false, false, true),
('PLA-BRX-RES', 'Placa de Bruxismo - Resiliente', 'DISPOSITIVO', 'PLACA', 'EVA', NULL, false, false, true),
('PLA-BRX-MIC', 'Placa de Bruxismo - Michigan', 'DISPOSITIVO', 'PLACA', 'ACRÍLICO', NULL, false, false, true),
('MOD-3D-EST', 'Modelo 3D - Estudo Simples', 'DISPOSITIVO', 'MODELO', 'RESINA_3D', NULL, false, false, true),
('MOD-3D-DIA', 'Modelo 3D - Diagnóstico Completo', 'DISPOSITIVO', 'MODELO', 'RESINA_3D', NULL, false, false, true),
('MOD-3D-CIR', 'Modelo 3D - Planejamento Cirúrgico', 'DISPOSITIVO', 'MODELO', 'RESINA_3D', NULL, false, false, true);

-- Create index for performance
CREATE INDEX idx_products_codigo ON public.products(codigo);
CREATE INDEX idx_products_categoria ON public.products(categoria);
CREATE INDEX idx_products_ativo ON public.products(ativo);