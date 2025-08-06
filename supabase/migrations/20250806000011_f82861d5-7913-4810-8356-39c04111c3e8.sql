-- Criar dentistas e administradores de teste
-- Nota: Como profiles tem FK para auth.users, vou inserir com IDs fictícios para demonstração

-- Primeiro, inserir alguns usuários fictícios que representam os diferentes níveis
INSERT INTO public.profiles (id, name, email, role, role_extended, clinica_id, filial_id, telefone, documento, created_by) VALUES

-- 1. ADMIN DE CLÍNICA - Sorriso Perfeito
('a1111111-1111-1111-1111-111111111111', 'Dr. João Silva', 'joao.silva@sorrisoperfeito.com.br', 'admin', 'admin_clinica', '11111111-1111-1111-1111-111111111111', null, '(11) 98765-4321', '123.456.789-00', '96251dd1-5141-4c9c-b947-c6b32bf4f5af'),

-- 2. ADMIN DE CLÍNICA - Dental Care  
('a2222222-2222-2222-2222-222222222222', 'Dra. Maria Santos', 'maria.santos@dentalcare.com.br', 'admin', 'admin_clinica', '22222222-2222-2222-2222-222222222222', null, '(21) 97654-3210', '987.654.321-00', '96251dd1-5141-4c9c-b947-c6b32bf4f5af'),

-- 3. ADMIN DE CLÍNICA - OdontoMax
('a3333333-3333-3333-3333-333333333333', 'Dr. Carlos Mendes', 'carlos.mendes@odontomax.com.br', 'admin', 'admin_clinica', '33333333-3333-3333-3333-333333333333', null, '(31) 97777-3333', '456.789.123-00', '96251dd1-5141-4c9c-b947-c6b32bf4f5af'),

-- 4. ADMIN DE FILIAL - Centro Sorriso Perfeito
('af111111-1111-1111-1111-111111111111', 'Carlos Oliveira', 'carlos.oliveira@sorrisoperfeito.com.br', 'admin', 'admin_filial', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '(11) 96543-2109', '456.789.123-01', 'a1111111-1111-1111-1111-111111111111'),

-- 5. ADMIN DE FILIAL - Shopping Sorriso Perfeito  
('af222222-2222-2222-2222-222222222222', 'Patrícia Lima', 'patricia.lima@sorrisoperfeito.com.br', 'admin', 'admin_filial', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '(11) 96543-2110', '456.789.123-02', 'a1111111-1111-1111-1111-111111111111'),

-- 6. ADMIN DE FILIAL - Copacabana Dental Care
('af333333-3333-3333-3333-333333333333', 'Ana Costa', 'ana.costa@dentalcare.com.br', 'admin', 'admin_filial', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '(21) 95432-1098', '789.123.456-00', 'a2222222-2222-2222-2222-222222222222'),

-- 7. ADMIN DE FILIAL - Ipanema Dental Care
('af444444-4444-4444-4444-444444444444', 'Ricardo Pereira', 'ricardo.pereira@dentalcare.com.br', 'admin', 'admin_filial', '22222222-2222-2222-2222-222222222222', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '(21) 95432-1099', '789.123.456-01', 'a2222222-2222-2222-2222-222222222222'),

-- 8. ADMIN DE FILIAL - Savassi OdontoMax
('af555555-5555-5555-5555-555555555555', 'Juliana Rocha', 'juliana.rocha@odontomax.com.br', 'admin', 'admin_filial', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '(31) 97777-3334', '258.369.147-01', 'a3333333-3333-3333-3333-333333333333');