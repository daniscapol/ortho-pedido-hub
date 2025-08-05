-- Criar usuários de diferentes níveis para teste

-- 3. Inserir profiles para diferentes tipos de administradores
INSERT INTO public.profiles (id, name, email, role, role_extended, clinica_id, filial_id, telefone, documento) VALUES
-- Admin de Clínica - Sorriso Perfeito
('44444444-4444-4444-4444-444444444444', 'Dr. João Silva', 'joao.silva@sorrisoperfeito.com.br', 'admin', 'admin_clinica', '11111111-1111-1111-1111-111111111111', null, '(11) 98765-4321', '123.456.789-00'),

-- Admin de Clínica - Dental Care
('55555555-5555-5555-5555-555555555555', 'Dra. Maria Santos', 'maria.santos@dentalcare.com.br', 'admin', 'admin_clinica', '22222222-2222-2222-2222-222222222222', null, '(21) 97654-3210', '987.654.321-00'),

-- Admin de Filial - Centro Sorriso Perfeito
('66666666-6666-6666-6666-666666666666', 'Carlos Oliveira', 'carlos.oliveira@sorrisoperfeito.com.br', 'admin', 'admin_filial', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '(11) 96543-2109', '456.789.123-00'),

-- Admin de Filial - Copacabana Dental Care
('77777777-7777-7777-7777-777777777777', 'Ana Costa', 'ana.costa@dentalcare.com.br', 'admin', 'admin_filial', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '(21) 95432-1098', '789.123.456-00'),

-- Dentistas
('88888888-8888-8888-8888-888888888888', 'Dr. Pedro Almeida', 'pedro.almeida@sorrisoperfeito.com.br', 'dentist', 'dentist', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '(11) 94321-0987', '321.654.987-00'),

('99999999-9999-9999-9999-999999999999', 'Dra. Lucia Fernandes', 'lucia.fernandes@sorrisoperfeito.com.br', 'dentist', 'dentist', '11111111-1111-1111-1111-111111111111', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '(11) 93210-9876', '654.987.321-00'),

('10101010-1010-1010-1010-101010101010', 'Dr. Roberto Lima', 'roberto.lima@dentalcare.com.br', 'dentist', 'dentist', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '(21) 92109-8765', '147.258.369-00'),

('11111111-1111-1111-1111-111111111112', 'Dra. Fernanda Rocha', 'fernanda.rocha@odontomax.com.br', 'dentist', 'dentist', '33333333-3333-3333-3333-333333333333', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '(31) 91098-7654', '258.369.147-00');