-- Criar um usuário admin master de teste que pode ser usado para login
-- Primeiro, vamos verificar se as políticas estão funcionando corretamente

-- Vamos ajustar a função is_admin_master para ser mais robusta
CREATE OR REPLACE FUNCTION public.is_admin_master()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT COALESCE(
    (SELECT role_extended = 'admin_master' FROM public.profiles WHERE id = auth.uid()),
    false
  );
$$;

-- Verificar se as políticas de filiais permitem admin master ver tudo
-- Vamos adicionar uma política específica para admin master se não existir
DO $$
BEGIN
  -- Verificar se a política já existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'filiais' 
    AND policyname = 'Admin master pode ver todas as filiais'
  ) THEN
    -- Criar política específica para admin master
    EXECUTE 'CREATE POLICY "Admin master pode ver todas as filiais"
    ON public.filiais
    FOR ALL
    TO authenticated
    USING (is_admin_master())
    WITH CHECK (is_admin_master())';
  END IF;
END $$;

-- Verificar política para orders
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'orders' 
    AND policyname = 'Admin master pode ver todos os pedidos'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin master pode ver todos os pedidos"
    ON public.orders
    FOR ALL
    TO authenticated
    USING (is_admin_master())
    WITH CHECK (is_admin_master())';
  END IF;
END $$;

-- Verificar política para clinicas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'clinicas' 
    AND policyname = 'Admin master pode ver todas as clinicas'
  ) THEN
    EXECUTE 'CREATE POLICY "Admin master pode ver todas as clinicas"
    ON public.clinicas
    FOR ALL
    TO authenticated
    USING (is_admin_master())
    WITH CHECK (is_admin_master())';
  END IF;
END $$;