-- Adicionar coluna dentist_id à tabela patients
ALTER TABLE public.patients 
ADD COLUMN dentist_id UUID REFERENCES public.profiles(id);

-- Atualizar a trigger function para incluir o updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para updated_at se não existir
DROP TRIGGER IF EXISTS update_patients_updated_at ON public.patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Atualizar as políticas RLS para incluir a nova relação
DROP POLICY IF EXISTS "Users can view their patients or admins can view all" ON public.patients;
DROP POLICY IF EXISTS "Users can update their patients or admins can update all" ON public.patients;

-- Nova política para visualizar pacientes
CREATE POLICY "Users can view their patients or admins can view all" 
ON public.patients 
FOR SELECT 
USING (
  is_admin(auth.uid()) OR 
  dentist_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.patient_id = patients.id 
    AND orders.user_id = auth.uid()
  )
);

-- Nova política para atualizar pacientes
CREATE POLICY "Users can update their patients or admins can update all" 
ON public.patients 
FOR UPDATE 
USING (
  is_admin(auth.uid()) OR 
  dentist_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM orders 
    WHERE orders.patient_id = patients.id 
    AND orders.user_id = auth.uid()
  )
);