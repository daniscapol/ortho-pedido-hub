-- Standardize hierarchy terminology: replace admin_filial with admin_matriz and prefer matriz_id across policies

-- 1) Rename enum value if needed
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role_extended' AND e.enumlabel = 'admin_filial'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role_extended' AND e.enumlabel = 'admin_matriz'
  ) THEN
    ALTER TYPE public.user_role_extended RENAME VALUE 'admin_filial' TO 'admin_matriz';
  END IF;
END $$;

-- 2) Update policies in clinicas
DROP POLICY IF EXISTS "Admin filial pode gerenciar clinicas da sua filial" ON public.clinicas;
CREATE POLICY "Admin matriz pode gerenciar clinicas da sua matriz"
ON public.clinicas
FOR ALL
TO authenticated
USING (
  public.get_user_role_extended() = 'admin_matriz'::user_role_extended
  AND COALESCE(clinicas.matriz_id, clinicas.filial_id) = public.get_user_matriz_id()
)
WITH CHECK (
  public.get_user_role_extended() = 'admin_matriz'::user_role_extended
  AND COALESCE(clinicas.matriz_id, clinicas.filial_id) = public.get_user_matriz_id()
);

-- 3) Update policies in filiais (matrizes)
DROP POLICY IF EXISTS "Admin filial pode gerenciar sua filial" ON public.filiais;
CREATE POLICY "Admin matriz pode gerenciar sua matriz"
ON public.filiais
FOR ALL
TO authenticated
USING (
  public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND id = public.get_user_matriz_id()
)
WITH CHECK (
  public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND id = public.get_user_matriz_id()
);

-- Keep visibility for admin_master
DROP POLICY IF EXISTS "Admin master pode ver todas as filiais (select)" ON public.filiais;
CREATE POLICY "Admin master pode ver todas as matrizes (select)"
ON public.filiais
FOR SELECT
TO authenticated
USING (public.is_admin_master());

-- 4) Update policies in profiles
DROP POLICY IF EXISTS "Admin filial pode gerenciar dentistas da sua filial" ON public.profiles;
DROP POLICY IF EXISTS "Admin filial pode ver perfis da sua filial" ON public.profiles;
CREATE POLICY "Admin matriz pode gerenciar dentistas da sua matriz"
ON public.profiles
FOR ALL
TO authenticated
USING (
  public.is_admin_master() OR (
    public.get_user_role_extended() = 'admin_matriz'::user_role_extended
    AND COALESCE(profiles.matriz_id, profiles.filial_id) = public.get_user_matriz_id()
    AND profiles.role_extended = 'dentist'::user_role_extended
  )
)
WITH CHECK (
  public.is_admin_master() OR (
    public.get_user_role_extended() = 'admin_matriz'::user_role_extended
    AND COALESCE(profiles.matriz_id, profiles.filial_id) = public.get_user_matriz_id()
    AND profiles.role_extended = 'dentist'::user_role_extended
  )
);
CREATE POLICY "Admin matriz pode ver perfis da sua matriz"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  public.get_user_role_extended() = 'admin_matriz'::user_role_extended
  AND COALESCE(profiles.matriz_id, profiles.filial_id) = public.get_user_matriz_id()
);

-- 5) Update policies in orders (replace admin_filial -> admin_matriz and use matriz lookup)
DROP POLICY IF EXISTS "Admins podem atualizar status dos pedidos conforme hierarquia" ON public.orders;
CREATE POLICY "Admins podem atualizar status dos pedidos conforme hierarquia (matriz)"
ON public.orders
FOR UPDATE
TO authenticated
USING (
  public.is_admin_master() OR (
    public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN clinicas c ON p.clinica_id = c.id
      WHERE p.id = orders.user_id AND COALESCE(c.matriz_id, c.filial_id) = public.get_user_matriz_id()
    )
  ) OR (
    public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = orders.user_id AND p.clinica_id = public.get_user_clinica_id()
    )
  )
);

DROP POLICY IF EXISTS "Usuários podem ver pedidos conforme nova hierarquia" ON public.orders;
CREATE POLICY "Usuários podem ver pedidos conforme hierarquia (matriz)"
ON public.orders
FOR SELECT
TO authenticated
USING (
  public.is_admin_master() OR (
    public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN clinicas c ON p.clinica_id = c.id
      WHERE p.id = orders.user_id AND COALESCE(c.matriz_id, c.filial_id) = public.get_user_matriz_id()
    )
  ) OR (
    public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = orders.user_id AND p.clinica_id = public.get_user_clinica_id()
    )
  ) OR (
    public.get_user_role_extended() = 'dentist'::user_role_extended AND orders.user_id = auth.uid()
  )
);

-- 6) Update policies in patients
-- Drop existing related SELECT policies
DROP POLICY IF EXISTS "Admin filial pode ver pacientes da sua filial" ON public.patients;
DROP POLICY IF EXISTS "Admin filial pode ver pacientes das clínicas da sua filial" ON public.patients;

CREATE POLICY "Admin matriz pode ver pacientes da sua matriz"
ON public.patients
FOR SELECT
TO authenticated
USING (
  public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND patients.filial_id = public.get_user_matriz_id()
);

CREATE POLICY "Admin matriz pode ver pacientes das clínicas da sua matriz"
ON public.patients
FOR SELECT
TO authenticated
USING (
  public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND EXISTS (
    SELECT 1 FROM public.clinicas c
    WHERE c.id = patients.clinica_id AND COALESCE(c.matriz_id, c.filial_id) = public.get_user_matriz_id()
  )
);

-- Drop the per-hierarchy policies created earlier and recreate using admin_matriz
DROP POLICY IF EXISTS "Patients insert per hierarchy" ON public.patients;
DROP POLICY IF EXISTS "Patients update per hierarchy" ON public.patients;
DROP POLICY IF EXISTS "Patients delete per hierarchy" ON public.patients;

CREATE POLICY "Patients insert per hierarchy"
ON public.patients
FOR INSERT
TO authenticated
WITH CHECK (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND patients.filial_id = public.get_user_matriz_id()) OR
  (public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND patients.clinica_id = public.get_user_clinica_id()) OR
  (public.get_user_role_extended() = 'dentist'::user_role_extended AND patients.dentist_id = auth.uid())
);

CREATE POLICY "Patients update per hierarchy"
ON public.patients
FOR UPDATE
TO authenticated
USING (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND patients.filial_id = public.get_user_matriz_id()) OR
  (public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND patients.clinica_id = public.get_user_clinica_id()) OR
  (public.get_user_role_extended() = 'dentist'::user_role_extended AND patients.dentist_id = auth.uid())
)
WITH CHECK (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND patients.filial_id = public.get_user_matriz_id()) OR
  (public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND patients.clinica_id = public.get_user_clinica_id()) OR
  (public.get_user_role_extended() = 'dentist'::user_role_extended AND patients.dentist_id = auth.uid())
);

CREATE POLICY "Patients delete per hierarchy"
ON public.patients
FOR DELETE
TO authenticated
USING (
  public.is_admin_master() OR
  (public.get_user_role_extended() = 'admin_matriz'::user_role_extended AND patients.filial_id = public.get_user_matriz_id()) OR
  (public.get_user_role_extended() = 'admin_clinica'::user_role_extended AND patients.clinica_id = public.get_user_clinica_id()) OR
  (public.get_user_role_extended() = 'dentist'::user_role_extended AND patients.dentist_id = auth.uid())
);

-- 7) Update production policies arrays replacing admin_filial with admin_matriz
DROP POLICY IF EXISTS "Admin users can manage production queue" ON public.production_queue;
CREATE POLICY "Admin users can manage production queue"
ON public.production_queue
FOR ALL
TO authenticated
USING (public.get_user_role_extended() = ANY (ARRAY['admin_master'::user_role_extended, 'admin_matriz'::user_role_extended, 'admin_clinica'::user_role_extended]));

DROP POLICY IF EXISTS "Admin users can manage production stages" ON public.production_stages;
CREATE POLICY "Admin users can manage production stages"
ON public.production_stages
FOR ALL
TO authenticated
USING (public.get_user_role_extended() = ANY (ARRAY['admin_master'::user_role_extended, 'admin_matriz'::user_role_extended, 'admin_clinica'::user_role_extended]));
