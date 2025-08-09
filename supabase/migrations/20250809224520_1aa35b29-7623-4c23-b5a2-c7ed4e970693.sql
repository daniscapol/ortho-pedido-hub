-- Temporarily allow all updates to profiles table to test the fix
-- This is just for testing, we'll fix it properly after
DROP POLICY IF EXISTS "Temporary allow all updates" ON public.profiles;

CREATE POLICY "Temporary allow all updates" 
ON public.profiles 
FOR UPDATE 
USING (true);