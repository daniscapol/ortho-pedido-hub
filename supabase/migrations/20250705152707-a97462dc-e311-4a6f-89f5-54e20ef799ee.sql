-- Remover a política que está causando recursão infinita
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Criar uma função security definer para evitar recursão
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Criar nova política usando a função security definer
CREATE POLICY "Users can view their own profile or admins can view all" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = id) OR (public.get_current_user_role() = 'admin')
);