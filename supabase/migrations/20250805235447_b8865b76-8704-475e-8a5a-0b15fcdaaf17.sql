-- Inserir dados de teste para verificar RLS

-- 1. Criar clínicas de teste
INSERT INTO public.clinicas (id, nome, cnpj, endereco, telefone, email, ativo) VALUES
('11111111-1111-1111-1111-111111111111', 'Clínica Sorriso Perfeito', '11.222.333/0001-44', 'Rua das Flores, 123 - Centro', '(11) 99999-1111', 'contato@sorrisoperfeito.com.br', true),
('22222222-2222-2222-2222-222222222222', 'Clínica Dental Care', '22.333.444/0001-55', 'Av. Principal, 456 - Vila Nova', '(21) 88888-2222', 'admin@dentalcare.com.br', true),
('33333333-3333-3333-3333-333333333333', 'Clínica OdontoMax', '33.444.555/0001-66', 'Rua da Saúde, 789 - Bairro Alto', '(31) 77777-3333', 'gerencia@odontomax.com.br', true);

-- 2. Criar filiais associadas às clínicas
INSERT INTO public.filiais (id, nome, endereco_entrega, ativo, clinica_id, cnpj, telefone, email) VALUES
-- Filiais da Clínica Sorriso Perfeito
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Filial Centro - Sorriso Perfeito', 'Rua das Flores, 123 - Centro', true, '11111111-1111-1111-1111-111111111111', '11.222.333/0002-45', '(11) 99999-1112', 'centro@sorrisoperfeito.com.br'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Filial Shopping - Sorriso Perfeito', 'Shopping Center Mall, Loja 205', true, '11111111-1111-1111-1111-111111111111', '11.222.333/0003-46', '(11) 99999-1113', 'shopping@sorrisoperfeito.com.br'),

-- Filiais da Clínica Dental Care
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Filial Copacabana - Dental Care', 'Av. Atlântica, 100 - Copacabana', true, '22222222-2222-2222-2222-222222222222', '22.333.444/0002-56', '(21) 88888-2223', 'copacabana@dentalcare.com.br'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Filial Ipanema - Dental Care', 'Rua Vieira Souto, 200 - Ipanema', true, '22222222-2222-2222-2222-222222222222', '22.333.444/0003-57', '(21) 88888-2224', 'ipanema@dentalcare.com.br'),

-- Filiais da Clínica OdontoMax
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'Filial Savassi - OdontoMax', 'Rua Pernambuco, 300 - Savassi', true, '33333333-3333-3333-3333-333333333333', '33.444.555/0002-67', '(31) 77777-3334', 'savassi@odontomax.com.br');