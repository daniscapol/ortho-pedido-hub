-- Inversão de nomenclatura entre filiais e clinicas com ajuste de RLS
BEGIN;

-- 1) Renomear as tabelas trocando os nomes
-- clinicas (filha) -> filiais_tmp
-- filiais (pai)    -> clinicas
-- filiais_tmp      -> filiais
DO $$
BEGIN
  IF to_regclass('public.clinicas') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.clinicas RENAME TO filiais_tmp';
  END IF;
  IF to_regclass('public.filiais') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.filiais RENAME TO clinicas';
  END IF;
  IF to_regclass('public.filiais_tmp') IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.filiais_tmp RENAME TO filiais';
  END IF;
END $$;

-- 2) Renomear coluna de relacionamento na tabela filha (agora chamada filiais): filial_id -> clinica_id
DO $$
BEGIN
  IF to_regclass('public.filiais') IS NOT NULL AND
     EXISTS (
       SELECT 1 FROM information_schema.columns 
       WHERE table_schema = 'public' AND table_name = 'filiais' AND column_name = 'filial_id'
     )
  THEN
    EXECUTE 'ALTER TABLE public.filiais RENAME COLUMN filial_id TO clinica_id';
  END IF;
END $$;

-- 3) Remover políticas existentes nas duas tabelas para recriá-las com a nova semântica
DO $$
DECLARE pol RECORD;
BEGIN
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='clinicas' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.clinicas', pol.policyname);
  END LOOP;
  FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname='public' AND tablename='filiais' LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.filiais', pol.policyname);
  END LOOP;
END $$;

-- 4) Garantir RLS habilitado
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.filiais ENABLE ROW LEVEL SECURITY;

-- 5) Recriar políticas com semântica equivalente após a troca
-- Tabela pai: clinicas (antes era filiais)
CREATE POLICY "Admin master pode gerenciar todas as clinicas" ON public.clinicas
FOR ALL
USING (public.is_admin_master())
WITH CHECK (public.is_admin_master());

CREATE POLICY "Admin filial pode gerenciar sua clinica" ON public.clinicas
FOR ALL
USING (public.get_user_filial_id() = id)
WITH CHECK (public.get_user_filial_id() = id);

CREATE POLICY "Admin filial pode ver sua clinica" ON public.clinicas
FOR SELECT
USING (
  public.get_user_role_extended() = 'admin_filial'::public.user_role_extended
  AND id = public.get_user_filial_id()
);

-- Mantém a visibilidade para admin_clinica sobre registros do 'pai' que tenham 'filiais' associadas à sua clínica atual
CREATE POLICY "Admin clinica pode ver clinicas das suas filiais" ON public.clinicas
FOR SELECT
USING (
  public.get_user_role_extended() = 'admin_clinica'::public.user_role_extended
  AND EXISTS (
    SELECT 1 FROM public.filiais f
    WHERE f.clinica_id = public.clinicas.id
      AND f.id = public.get_user_clinica_id()
  )
);

-- Tabela filha: filiais (antes era clinicas)
CREATE POLICY "Admin master pode gerenciar todas as filiais" ON public.filiais
FOR ALL
USING (public.is_admin_master())
WITH CHECK (public.is_admin_master());

CREATE POLICY "Admin clinica pode gerenciar sua filial" ON public.filiais
FOR ALL
USING (id = public.get_user_clinica_id())
WITH CHECK (id = public.get_user_clinica_id());

CREATE POLICY "Admin filial pode gerenciar filiais da sua clinica" ON public.filiais
FOR ALL
USING (clinica_id = public.get_user_filial_id())
WITH CHECK (clinica_id = public.get_user_filial_id());

CREATE POLICY "Admin master pode ver todas as filiais (select)" ON public.filiais
FOR SELECT
USING (public.is_admin_master());

COMMIT;