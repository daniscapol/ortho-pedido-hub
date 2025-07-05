-- Remover a política antiga que era muito restritiva
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- A nova política já foi criada, vamos agora testar se funciona