-- Recriar políticas para pacientes com a nova hierarquia
CREATE POLICY "Admin clínica pode ver pacientes da sua clínica" ON patients
FOR SELECT USING (
  (get_user_role_extended() = 'admin_clinica'::user_role_extended) 
  AND (clinica_id = get_user_clinica_id())
);

CREATE POLICY "Admin filial pode ver pacientes das clínicas da sua filial" ON patients
FOR SELECT USING (
  (get_user_role_extended() = 'admin_filial'::user_role_extended) 
  AND EXISTS (
    SELECT 1 FROM clinicas 
    WHERE id = patients.clinica_id AND filial_id = get_user_filial_id()
  )
);

CREATE POLICY "Usuários podem gerenciar pacientes conforme nova hierarquia" ON patients
FOR ALL USING (
  is_admin_master() OR 
  ((get_user_role_extended() = 'admin_filial'::user_role_extended) AND EXISTS (
    SELECT 1 FROM clinicas 
    WHERE id = patients.clinica_id AND filial_id = get_user_filial_id()
  )) OR
  ((get_user_role_extended() = 'admin_clinica'::user_role_extended) AND (clinica_id = get_user_clinica_id())) OR
  ((get_user_role_extended() = 'dentist'::user_role_extended) AND (dentist_id = auth.uid()))
) 
WITH CHECK (
  is_admin_master() OR 
  ((get_user_role_extended() = 'admin_filial'::user_role_extended) AND EXISTS (
    SELECT 1 FROM clinicas 
    WHERE id = patients.clinica_id AND filial_id = get_user_filial_id()
  )) OR
  ((get_user_role_extended() = 'admin_clinica'::user_role_extended) AND (clinica_id = get_user_clinica_id())) OR
  ((get_user_role_extended() = 'dentist'::user_role_extended) AND (dentist_id = auth.uid()))
);

-- Recriar políticas para pedidos com a nova hierarquia
CREATE POLICY "Usuários podem ver pedidos conforme nova hierarquia" ON orders
FOR SELECT USING (
  is_admin_master() OR 
  ((get_user_role_extended() = 'admin_filial'::user_role_extended) AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN clinicas c ON p.clinica_id = c.id
    WHERE p.id = orders.user_id AND c.filial_id = get_user_filial_id()
  )) OR
  ((get_user_role_extended() = 'admin_clinica'::user_role_extended) AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = orders.user_id AND clinica_id = get_user_clinica_id()
  )) OR
  ((get_user_role_extended() = 'dentist'::user_role_extended) AND (user_id = auth.uid()))
);

CREATE POLICY "Admins podem atualizar status dos pedidos conforme hierarquia" ON orders
FOR UPDATE USING (
  is_admin_master() OR 
  ((get_user_role_extended() = 'admin_filial'::user_role_extended) AND EXISTS (
    SELECT 1 FROM profiles p
    JOIN clinicas c ON p.clinica_id = c.id
    WHERE p.id = orders.user_id AND c.filial_id = get_user_filial_id()
  )) OR
  ((get_user_role_extended() = 'admin_clinica'::user_role_extended) AND EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = orders.user_id AND clinica_id = get_user_clinica_id()
  ))
);