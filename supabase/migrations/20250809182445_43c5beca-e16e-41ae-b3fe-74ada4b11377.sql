-- Limpar completamente a autenticação e perfis para recomeçar do zero

-- Primeiro limpar perfis (se existirem)
DELETE FROM profiles;

-- Limpar usuários da autenticação (isso vai deletar em cascata)
DELETE FROM auth.users;

-- Recriar o trigger para criar perfis automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, role_extended)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'dentist')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'role_extended', 'dentist')::user_role_extended
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;

-- Criar o trigger se não existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();