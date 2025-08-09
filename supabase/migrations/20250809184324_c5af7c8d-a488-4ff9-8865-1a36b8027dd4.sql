-- 1) Garantir que o trigger exista (recriar de forma idempotente)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2) Criar perfis que estiverem faltando para usuários já existentes no auth.users
INSERT INTO public.profiles (id, name, email, role, role_extended)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)) AS name,
  u.email,
  COALESCE((u.raw_user_meta_data->>'role')::user_role, 'dentist'::user_role) AS role,
  COALESCE((u.raw_user_meta_data->>'role_extended')::user_role_extended, 'dentist'::user_role_extended) AS role_extended
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 3) Conferir especificamente o usuário siridani2
UPDATE public.profiles
SET role = 'admin'::user_role,
    role_extended = 'admin_filial'::user_role_extended,
    name = COALESCE(name, 'zequinha dono da filial A')
WHERE email = 'siridani2@hotmail.com';