-- Criar pacientes de teste com UUIDs válidos

INSERT INTO public.patients (id, name, cpf, phone, email, dentist_id, filial_id) VALUES
-- Pacientes da Filial Centro - Sorriso Perfeito (associados ao daniscapol2 que é admin_master)
('11111111-1111-1111-1111-111111111111', 'José Santos Silva', '111.222.333-44', '(11) 91234-5678', 'jose.santos@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('22222222-2222-2222-2222-222222222222', 'Maria Oliveira Costa', '222.333.444-55', '(11) 92345-6789', 'maria.oliveira@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),
('33333333-3333-3333-3333-333333333333', 'Carlos Eduardo Lima', '333.444.555-66', '(11) 93456-7890', 'carlos.lima@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'),

-- Pacientes da Filial Shopping - Sorriso Perfeito
('44444444-4444-4444-4444-444444444444', 'Ana Paula Rocha', '444.555.666-77', '(11) 94567-8901', 'ana.rocha@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('55555555-5555-5555-5555-555555555555', 'Roberto Ferreira', '555.666.777-88', '(11) 95678-9012', 'roberto.ferreira@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),

-- Pacientes da Filial Copacabana - Dental Care
('66666666-6666-6666-6666-666666666666', 'Fernanda Alves', '666.777.888-99', '(21) 96789-0123', 'fernanda.alves@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),
('77777777-7777-7777-7777-777777777777', 'João Pedro Nascimento', '777.888.999-00', '(21) 97890-1234', 'joao.nascimento@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'cccccccc-cccc-cccc-cccc-cccccccccccc'),

-- Pacientes da Filial Ipanema - Dental Care
('88888888-8888-8888-8888-888888888888', 'Lucia Montenegro', '888.999.000-11', '(21) 98901-2345', 'lucia.montenegro@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('99999999-9999-9999-9999-999999999999', 'Pedro Henrique Souza', '999.000.111-22', '(21) 99012-3456', 'pedro.souza@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),

-- Pacientes da Filial Savassi - OdontoMax
('10101010-1010-1010-1010-101010101010', 'Beatriz Carvalho', '100.200.300-40', '(31) 90123-4567', 'beatriz.carvalho@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('12121212-1212-1212-1212-121212121212', 'Gabriel Santos', '200.300.400-50', '(31) 91234-5678', 'gabriel.santos@email.com', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee');