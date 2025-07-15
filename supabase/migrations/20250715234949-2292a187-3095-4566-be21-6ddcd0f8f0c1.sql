-- Adicionar política RLS para permitir que dentistas vejam audit logs dos seus próprios pedidos
DROP POLICY IF EXISTS "Dentists can view audit logs for their orders" ON public.audit_logs;

CREATE POLICY "Dentists can view audit logs for their orders" 
ON public.audit_logs 
FOR SELECT 
USING (
  -- Admins podem ver todos os logs (política existente)
  is_admin(auth.uid()) OR
  -- Dentistas podem ver logs de pedidos que eles criaram
  (entity_type = 'order' AND EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.id = audit_logs.entity_id::uuid 
    AND orders.user_id = auth.uid()
  ))
);