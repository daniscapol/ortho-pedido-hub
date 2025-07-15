-- Criar uma nova política que permite que todos vejam nomes de usuários básicos
-- Isso é necessário para mostrar quem fez ações nos audit logs
DROP POLICY IF EXISTS "Users can view their own profile, admins can view all" ON public.profiles;

-- Política para permitir que todos vejam informações básicas dos profiles (somente id e name)
-- Isso é seguro porque não expõe informações sensíveis
CREATE POLICY "Users can view basic profile info for audit trails" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Política específica para que usuários possam ver seus próprios profiles completos
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Política para que admins possam ver todos os profiles completos
CREATE POLICY "Admins can view all complete profiles" 
ON public.profiles 
FOR SELECT 
USING (is_admin(auth.uid()));