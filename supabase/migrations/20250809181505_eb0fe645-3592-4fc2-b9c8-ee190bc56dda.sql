-- Atualizar políticas RLS para usar role_extended ao invés de role

-- 1. Atualizar política para audit_logs
DROP POLICY IF EXISTS "Only admins can view audit logs" ON audit_logs;
CREATE POLICY "Only admins can view audit logs" 
ON audit_logs 
FOR SELECT 
USING (
  get_user_role_extended() IN ('admin_master', 'admin_filial', 'admin_clinica')
);

-- 2. Atualizar política para production_stages
DROP POLICY IF EXISTS "Admin users can manage production stages" ON production_stages;
CREATE POLICY "Admin users can manage production stages" 
ON production_stages 
FOR ALL 
USING (
  get_user_role_extended() IN ('admin_master', 'admin_filial', 'admin_clinica')
);

-- 3. Atualizar política para production_queue
DROP POLICY IF EXISTS "Admin users can manage production queue" ON production_queue;
CREATE POLICY "Admin users can manage production queue" 
ON production_queue 
FOR ALL 
USING (
  get_user_role_extended() IN ('admin_master', 'admin_filial', 'admin_clinica')
);