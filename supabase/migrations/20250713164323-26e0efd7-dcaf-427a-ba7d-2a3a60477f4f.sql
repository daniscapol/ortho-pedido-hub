-- Remover a política atual que permite dentistas verem todos os perfis
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.profiles;

-- Criar nova política que permite:
-- 1. Cada usuário ver apenas seu próprio perfil
-- 2. Admins podem ver todos os perfis
CREATE POLICY "Users can view their own profile, admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  is_admin(auth.uid())
);