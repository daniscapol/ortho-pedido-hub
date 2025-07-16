-- Adicionar policy para permitir que admins atualizem qualquer perfil
CREATE POLICY "Admins can update any profile" 
ON public.profiles 
FOR UPDATE 
USING (is_admin(auth.uid()));