-- Update RLS policies for profiles table to allow admin_master to update user associations

-- First, drop the restrictive policies that are blocking admin_master updates
DROP POLICY IF EXISTS "Admin master pode gerenciar todos os perfis" ON public.profiles;

-- Create a new policy that allows admin_master to manage all profiles
CREATE POLICY "Admin master pode gerenciar todos os perfis" 
ON public.profiles 
FOR ALL 
USING (is_admin_master())
WITH CHECK (is_admin_master());

-- Also ensure admin_master can read all profiles  
DROP POLICY IF EXISTS "Admin master pode ver todos os perfis" ON public.profiles;

CREATE POLICY "Admin master pode ver todos os perfis" 
ON public.profiles 
FOR SELECT 
USING (is_admin_master());