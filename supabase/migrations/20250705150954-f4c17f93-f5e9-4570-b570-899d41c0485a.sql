-- Criar política para admins visualizarem todos os profiles
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() = id) OR  -- Usuários podem ver seus próprios profiles
  (EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.id = auth.uid() AND p.role = 'admin'
  ))  -- Admins podem ver todos os profiles
);