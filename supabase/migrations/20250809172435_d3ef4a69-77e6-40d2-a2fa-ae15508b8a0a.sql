-- Verificar quais policies ainda referenciam clinica_id
-- Remover todas as políticas da tabela filiais e recriar corretamente
DROP POLICY IF EXISTS "Admin master pode gerenciar todas as filiais" ON filiais;
DROP POLICY IF EXISTS "Admin filial pode ver e gerenciar sua filial" ON filiais;
DROP POLICY IF EXISTS "Admin clínica pode ver filiais através das suas clínicas" ON filiais;

-- Recriar políticas corretas para filiais (sem referência a clinica_id)
CREATE POLICY "Admin master pode gerenciar todas as filiais" ON filiais
FOR ALL USING (is_admin_master()) WITH CHECK (is_admin_master());

CREATE POLICY "Admin filial pode gerenciar sua filial" ON filiais
FOR ALL USING (get_user_filial_id() = id) WITH CHECK (get_user_filial_id() = id);

CREATE POLICY "Admin clínica pode ver filiais das suas clínicas" ON filiais
FOR SELECT USING (
  (get_user_role_extended() = 'admin_clinica'::user_role_extended) 
  AND EXISTS (
    SELECT 1 FROM clinicas 
    WHERE filial_id = filiais.id AND id = get_user_clinica_id()
  )
);