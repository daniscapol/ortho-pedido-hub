-- Primeiro, remover todas as políticas que dependem de clinica_id em filiais
DROP POLICY IF EXISTS "Admin clínica pode ver filiais da sua clínica" ON filiais;
DROP POLICY IF EXISTS "Dentistas podem ver filiais ativas da sua clínica" ON filiais;
DROP POLICY IF EXISTS "Admin clínica pode ver pacientes da sua clínica" ON patients;
DROP POLICY IF EXISTS "Usuários podem gerenciar pacientes conforme hierarquia" ON patients;
DROP POLICY IF EXISTS "Usuários podem ver pedidos conforme hierarquia" ON orders;
DROP POLICY IF EXISTS "Admins podem atualizar status dos pedidos" ON orders;

-- Agora remover a coluna clinica_id de filiais
ALTER TABLE filiais DROP COLUMN clinica_id;

-- Adicionar filial_id na tabela clinicas
ALTER TABLE clinicas ADD COLUMN filial_id uuid REFERENCES filiais(id);

-- Recriar as políticas de filiais com a nova estrutura
CREATE POLICY "Admin master pode gerenciar todas as filiais" ON filiais
FOR ALL USING (is_admin_master()) WITH CHECK (is_admin_master());

CREATE POLICY "Admin filial pode ver e gerenciar sua filial" ON filiais
FOR ALL USING (get_user_filial_id() = id) WITH CHECK (get_user_filial_id() = id);

CREATE POLICY "Admin clínica pode ver sua filial através da clínica" ON filiais
FOR SELECT USING (EXISTS (
  SELECT 1 FROM clinicas 
  WHERE filial_id = filiais.id AND id = get_user_clinica_id()
));

-- Políticas para clínicas
DROP POLICY IF EXISTS "Admin clínica pode ver sua clínica" ON clinicas;
DROP POLICY IF EXISTS "Admin master pode gerenciar clínicas" ON clinicas;

CREATE POLICY "Admin master pode gerenciar todas as clínicas" ON clinicas
FOR ALL USING (is_admin_master()) WITH CHECK (is_admin_master());

CREATE POLICY "Admin filial pode gerenciar clínicas da sua filial" ON clinicas
FOR ALL USING (filial_id = get_user_filial_id()) 
WITH CHECK (filial_id = get_user_filial_id());

CREATE POLICY "Admin clínica pode ver e gerenciar sua clínica" ON clinicas
FOR ALL USING (id = get_user_clinica_id()) 
WITH CHECK (id = get_user_clinica_id());