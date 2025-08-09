-- Atualizar a senha do usuário daniscapol2@gmail.com para 'teste123'
UPDATE auth.users 
SET encrypted_password = crypt('teste123', gen_salt('bf'))
WHERE email = 'daniscapol2@gmail.com';