-- Drop the existing INSERT policy for order_items
DROP POLICY IF EXISTS "Users can create order items for their orders" ON order_items;

-- Create new INSERT policy that allows admins to create order items for orders they can manage
CREATE POLICY "Users can create order items for their orders" 
ON order_items 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = order_items.order_id 
    AND (
      -- User owns the order
      orders.user_id = auth.uid() 
      OR 
      -- Admin master can create for any order
      is_admin_master()
      OR
      -- Admin matriz can create for dentists in their matriz
      (get_user_role_extended() = 'admin_matriz' AND EXISTS (
        SELECT 1 FROM profiles p
        JOIN clinicas c ON p.clinica_id = c.id
        WHERE p.id = orders.user_id 
        AND COALESCE(c.matriz_id, c.filial_id) = get_user_matriz_id()
      ))
      OR
      -- Admin clinica can create for dentists in their clinica
      (get_user_role_extended() = 'admin_clinica' AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = orders.user_id 
        AND p.clinica_id = get_user_clinica_id()
      ))
    )
  )
);