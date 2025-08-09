-- Primeiro, vamos criar uma nova estrutura temporária
-- Remover foreign key atual da filiais para clinicas
ALTER TABLE filiais DROP COLUMN IF EXISTS clinica_id;

-- Adicionar filial_id na tabela clinicas
ALTER TABLE clinicas ADD COLUMN IF NOT EXISTS filial_id uuid REFERENCES filiais(id);

-- Atualizar as RLS policies para refletir a nova hierarquia

-- Políticas para filiais (nível mais alto após super admin)
DROP POLICY IF EXISTS "Admin clínica pode ver filiais da sua clínica" ON filiais;
DROP POLICY IF EXISTS "Admin filial pode ver sua filial" ON filiais;
DROP POLICY IF EXISTS "Dentistas podem ver filiais ativas da sua clínica" ON filiais;
DROP POLICY IF EXISTS "Admins podem gerenciar filiais" ON filiais;

CREATE POLICY "Admin master pode gerenciar todas as filiais" ON filiais
FOR ALL USING (is_admin_master()) WITH CHECK (is_admin_master());

CREATE POLICY "Admin filial pode ver e gerenciar sua filial" ON filiais
FOR ALL USING (get_user_filial_id() = id) WITH CHECK (get_user_filial_id() = id);

CREATE POLICY "Admin clínica pode ver sua filial" ON filiais
FOR SELECT USING (EXISTS (
  SELECT 1 FROM clinicas 
  WHERE filial_id = filiais.id AND id = get_user_clinica_id()
));

-- Políticas para clínicas (agora pertence a filiais)
DROP POLICY IF EXISTS "Admin clínica pode ver sua clínica" ON clinicas;
DROP POLICY IF EXISTS "Admin master pode gerenciar clínicas" ON clinicas;
DROP POLICY IF EXISTS "Admin master pode ver todas as clinicas" ON clinicas;
DROP POLICY IF EXISTS "Admin master pode ver todas as clínicas" ON clinicas;

CREATE POLICY "Admin master pode gerenciar todas as clínicas" ON clinicas
FOR ALL USING (is_admin_master()) WITH CHECK (is_admin_master());

CREATE POLICY "Admin filial pode gerenciar clínicas da sua filial" ON clinicas
FOR ALL USING (filial_id = get_user_filial_id()) 
WITH CHECK (filial_id = get_user_filial_id());

CREATE POLICY "Admin clínica pode ver e gerenciar sua clínica" ON clinicas
FOR ALL USING (id = get_user_clinica_id()) 
WITH CHECK (id = get_user_clinica_id());

-- Atualizar funções de permissão
CREATE OR REPLACE FUNCTION public.can_manage_clinica(target_clinica_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    public.is_admin_master() OR 
    (public.get_user_role_extended() = 'admin_filial' AND EXISTS (
      SELECT 1 FROM public.clinicas 
      WHERE id = target_clinica_id AND filial_id = public.get_user_filial_id()
    )) OR
    (public.get_user_role_extended() = 'admin_clinica' AND public.get_user_clinica_id() = target_clinica_id);
$function$;

-- Recriar função can_manage_filial sem referência a clínica
CREATE OR REPLACE FUNCTION public.can_manage_filial(target_filial_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    public.is_admin_master() OR 
    (public.get_user_role_extended() = 'admin_filial' AND public.get_user_filial_id() = target_filial_id);
$function$;