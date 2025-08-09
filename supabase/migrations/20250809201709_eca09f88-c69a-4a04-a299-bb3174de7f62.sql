-- Fix filiais listing error: remove policy that references non-existent column clinica_id via helper
-- The other existing policies already cover management for admin_master and admin_filial

DROP POLICY IF EXISTS "Admins podem gerenciar filiais" ON public.filiais;