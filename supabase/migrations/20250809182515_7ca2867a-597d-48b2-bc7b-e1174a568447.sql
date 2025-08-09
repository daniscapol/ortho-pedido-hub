-- Limpar completamente todas as tabelas relacionadas aos usuários para recomeçar do zero

-- Limpar todas as dependências primeiro
DELETE FROM audit_logs;
DELETE FROM notifications;
DELETE FROM support_conversations;
DELETE FROM support_chat_messages;
DELETE FROM support_typing_indicators;
DELETE FROM production_queue;
DELETE FROM order_images;
DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM patients;
DELETE FROM profiles;

-- Limpar usuários da autenticação
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

-- Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();