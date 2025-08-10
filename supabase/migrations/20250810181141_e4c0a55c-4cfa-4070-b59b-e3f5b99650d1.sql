-- Atualizar política de INSERT para permitir admin_matriz criar pedidos para dentistas da sua matriz
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;

CREATE POLICY "Users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  -- Usuário pode criar pedido para si mesmo
  auth.uid() = user_id 
  OR
  -- Admin_matriz pode criar pedidos para dentistas da sua matriz
  (
    get_user_role_extended() = 'admin_matriz' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = orders.user_id 
      AND role_extended = 'dentist' 
      AND matriz_id = get_user_matriz_id()
    )
  )
  OR
  -- Admin_clinica pode criar pedidos para dentistas da sua clínica
  (
    get_user_role_extended() = 'admin_clinica' 
    AND EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = orders.user_id 
      AND role_extended = 'dentist' 
      AND clinica_id = get_user_clinica_id()
    )
  )
  OR
  -- Admin_master pode criar pedidos para qualquer dentista
  is_admin_master()
);