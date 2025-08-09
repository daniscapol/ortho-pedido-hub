-- Criar perfil para o usuário atual (admin master)
INSERT INTO profiles (id, name, email, role, role_extended) 
VALUES (
  '96251dd1-5141-4c9c-b947-c6b32bf4f5af',
  'Admin Master',
  'daniscapol2@gmail.com',
  'admin',
  'admin_master'
);

-- Verificar se o novo usuário criado existe
INSERT INTO profiles (id, name, email, role, role_extended) 
VALUES (
  '0c992a8d-8d7c-44ac-a8da-dfe40e5f2e4a',
  'zequinha dono da filial A',
  'siridani2@hotmail.com',
  'admin',
  'admin_filial'
) ON CONFLICT (id) DO NOTHING;