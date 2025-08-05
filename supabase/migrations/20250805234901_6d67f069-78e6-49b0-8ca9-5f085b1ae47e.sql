-- Oitava parte: Atualizar políticas RLS para orders e atualizar função handle_new_user

-- Remover políticas antigas dos orders
DROP POLICY IF EXISTS "Dentists can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can update order status" ON public.orders;

-- Criar novas políticas para orders
CREATE POLICY "Usuários podem ver pedidos conforme hierarquia" 
ON public.orders FOR SELECT 
USING (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_clinica' AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.filiais f ON p.filial_id = f.id
    WHERE p.id = orders.user_id AND f.clinica_id = public.get_user_clinica_id()
  )) OR
  (public.get_user_role_extended() = 'admin_filial' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = orders.user_id AND filial_id = public.get_user_filial_id()
  )) OR
  (public.get_user_role_extended() = 'dentist' AND user_id = auth.uid())
);

CREATE POLICY "Admins podem atualizar status dos pedidos" 
ON public.orders FOR UPDATE 
USING (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_clinica' AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.filiais f ON p.filial_id = f.id
    WHERE p.id = orders.user_id AND f.clinica_id = public.get_user_clinica_id()
  )) OR
  (public.get_user_role_extended() = 'admin_filial' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = orders.user_id AND filial_id = public.get_user_filial_id()
  ))
);

-- Atualizar função handle_new_user para usar o novo role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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