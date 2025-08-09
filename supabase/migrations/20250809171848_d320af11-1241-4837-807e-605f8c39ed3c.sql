-- Remover todas as políticas problemáticas que ainda referenciam clinica_id em filiais
DROP POLICY IF EXISTS "Admin clínica pode ver sua filial através da clínica" ON filiais;

-- Recriar política correta para admin_clinica ver filiais através das clínicas
CREATE POLICY "Admin clínica pode ver filiais através das suas clínicas" ON filiais
FOR SELECT USING (
  (get_user_role_extended() = 'admin_clinica'::user_role_extended) 
  AND EXISTS (
    SELECT 1 FROM clinicas 
    WHERE filial_id = filiais.id AND id = get_user_clinica_id()
  )
);