-- Criar alguns pedidos de teste para verificar RLS

INSERT INTO public.orders (id, user_id, patient_id, dentist, prosthesis_type, material, color, priority, observations, delivery_address, deadline, status, selected_teeth) VALUES
-- Pedidos do admin_master (daniscapol2) para pacientes de diferentes filiais
('ord11111-1111-1111-1111-111111111111', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', '11111111-1111-1111-1111-111111111111', 'daniscapol2', 'Coroa', 'Porcelana', 'A1', 'normal', 'Paciente com sensibilidade', 'Rua das Flores, 123 - Centro', '2024-08-15', 'pending', ARRAY['11','12']),

('ord22222-2222-2222-2222-222222222222', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', '22222222-2222-2222-2222-222222222222', 'daniscapol2', 'Implante', 'Titânio', 'Natural', 'urgente', 'Caso complexo', 'Rua das Flores, 123 - Centro', '2024-08-20', 'producao', ARRAY['21']),

('ord33333-3333-3333-3333-333333333333', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', '66666666-6666-6666-6666-666666666666', 'daniscapol2', 'Ponte', 'Zircônia', 'A2', 'normal', 'Ponte de 3 elementos', 'Av. Atlântica, 100 - Copacabana', '2024-08-25', 'pronto', ARRAY['14','15','16']),

('ord44444-4444-4444-4444-444444444444', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', '88888888-8888-8888-8888-888888888888', 'daniscapol2', 'Prótese Total', 'Resina', 'A3', 'normal', 'Prótese superior', 'Rua Vieira Souto, 200 - Ipanema', '2024-09-01', 'entregue', ARRAY['11','12','13','14','15','16','17','18']),

('ord55555-5555-5555-5555-555555555555', '96251dd1-5141-4c9c-b947-c6b32bf4f5af', '10101010-1010-1010-1010-101010101010', 'daniscapol2', 'Faceta', 'Porcelana', 'B1', 'normal', 'Facetas estéticas', 'Rua Pernambuco, 300 - Savassi', '2024-08-30', 'pending', ARRAY['11','21']);