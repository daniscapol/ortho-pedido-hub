-- Remove as políticas existentes da tabela patients
DROP POLICY IF EXISTS "Users can view patients" ON public.patients;
DROP POLICY IF EXISTS "Users can create patients" ON public.patients;
DROP POLICY IF EXISTS "Users can update patients" ON public.patients;

-- Cria novas políticas RLS para pacientes
-- Dentistas podem ver apenas pacientes que têm pedidos criados por eles
-- Admins podem ver todos os pacientes
CREATE POLICY "Users can view their patients or admins can view all" 
ON public.patients 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.patient_id = patients.id 
    AND orders.user_id = auth.uid()
  )
);

-- Dentistas podem criar pacientes
CREATE POLICY "Users can create patients" 
ON public.patients 
FOR INSERT 
WITH CHECK (true);

-- Dentistas podem atualizar apenas pacientes que têm pedidos criados por eles
-- Admins podem atualizar todos os pacientes
CREATE POLICY "Users can update their patients or admins can update all" 
ON public.patients 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.patient_id = patients.id 
    AND orders.user_id = auth.uid()
  )
);