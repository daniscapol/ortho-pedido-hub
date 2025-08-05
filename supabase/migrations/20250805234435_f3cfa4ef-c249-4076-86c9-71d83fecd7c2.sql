-- Criar enum para os novos tipos de usuário
CREATE TYPE public.user_role_extended AS ENUM ('admin_master', 'admin_clinica', 'admin_filial', 'dentist');

-- Criar tabela de clínicas
CREATE TABLE public.clinicas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    nome TEXT NOT NULL,
    cnpj TEXT UNIQUE,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    ativo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Atualizar tabela de filiais para incluir referência à clínica
ALTER TABLE public.filiais 
ADD COLUMN clinica_id UUID REFERENCES public.clinicas(id),
ADD COLUMN cnpj TEXT,
ADD COLUMN telefone TEXT,
ADD COLUMN email TEXT;

-- Atualizar tabela de profiles para a nova estrutura hierárquica
ALTER TABLE public.profiles 
ADD COLUMN role_extended public.user_role_extended DEFAULT 'dentist',
ADD COLUMN clinica_id UUID REFERENCES public.clinicas(id),
ADD COLUMN filial_id UUID REFERENCES public.filiais(id),
ADD COLUMN created_by UUID REFERENCES public.profiles(id),
ADD COLUMN telefone TEXT,
ADD COLUMN documento TEXT;

-- Atualizar tabela de pacientes para incluir filial
ALTER TABLE public.patients
ADD COLUMN filial_id UUID REFERENCES public.filiais(id);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;

-- Criar trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER update_clinicas_updated_at
    BEFORE UPDATE ON public.clinicas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_filiais_updated_at
    BEFORE UPDATE ON public.filiais
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Funções auxiliares para verificar permissões
CREATE OR REPLACE FUNCTION public.get_user_role_extended()
RETURNS public.user_role_extended
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role_extended FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_clinica_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT clinica_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_filial_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT filial_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Função para verificar se é admin master
CREATE OR REPLACE FUNCTION public.is_admin_master()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role_extended = 'admin_master'
  );
$$;

-- Função para verificar se pode gerenciar uma clínica
CREATE OR REPLACE FUNCTION public.can_manage_clinica(target_clinica_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    public.is_admin_master() OR 
    (get_user_role_extended() = 'admin_clinica' AND get_user_clinica_id() = target_clinica_id);
$$;

-- Função para verificar se pode gerenciar uma filial
CREATE OR REPLACE FUNCTION public.can_manage_filial(target_filial_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT 
    public.is_admin_master() OR 
    (get_user_role_extended() = 'admin_clinica' AND EXISTS (
      SELECT 1 FROM public.filiais 
      WHERE id = target_filial_id AND clinica_id = get_user_clinica_id()
    )) OR
    (get_user_role_extended() = 'admin_filial' AND get_user_filial_id() = target_filial_id);
$$;

-- Políticas RLS para clínicas
CREATE POLICY "Admin master pode ver todas as clínicas" 
ON public.clinicas FOR SELECT 
USING (public.is_admin_master());

CREATE POLICY "Admin clínica pode ver sua clínica" 
ON public.clinicas FOR SELECT 
USING (get_user_clinica_id() = id);

CREATE POLICY "Admin master pode gerenciar clínicas" 
ON public.clinicas FOR ALL 
USING (public.is_admin_master())
WITH CHECK (public.is_admin_master());

-- Políticas RLS para filiais (atualizadas)
DROP POLICY IF EXISTS "Admins can manage filiais" ON public.filiais;
DROP POLICY IF EXISTS "Users can view active filiais" ON public.filiais;

CREATE POLICY "Admin master pode ver todas as filiais" 
ON public.filiais FOR SELECT 
USING (public.is_admin_master());

CREATE POLICY "Admin clínica pode ver filiais da sua clínica" 
ON public.filiais FOR SELECT 
USING (get_user_role_extended() = 'admin_clinica' AND clinica_id = get_user_clinica_id());

CREATE POLICY "Admin filial pode ver sua filial" 
ON public.filiais FOR SELECT 
USING (get_user_role_extended() = 'admin_filial' AND id = get_user_filial_id());

CREATE POLICY "Dentistas podem ver filiais ativas da sua clínica" 
ON public.filiais FOR SELECT 
USING (get_user_role_extended() = 'dentist' AND ativo = true AND clinica_id = get_user_clinica_id());

CREATE POLICY "Admins podem gerenciar filiais" 
ON public.filiais FOR ALL 
USING (public.can_manage_filial(id))
WITH CHECK (public.can_manage_filial(id));

-- Políticas RLS para profiles (atualizadas)
DROP POLICY IF EXISTS "Admins can view all complete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;

CREATE POLICY "Admin master pode ver todos os perfis" 
ON public.profiles FOR SELECT 
USING (public.is_admin_master());

CREATE POLICY "Admin clínica pode ver perfis da sua clínica" 
ON public.profiles FOR SELECT 
USING (get_user_role_extended() = 'admin_clinica' AND clinica_id = get_user_clinica_id());

CREATE POLICY "Admin filial pode ver perfis da sua filial" 
ON public.profiles FOR SELECT 
USING (get_user_role_extended() = 'admin_filial' AND filial_id = get_user_filial_id());

CREATE POLICY "Admin master pode gerenciar todos os perfis" 
ON public.profiles FOR ALL 
USING (public.is_admin_master())
WITH CHECK (public.is_admin_master());

CREATE POLICY "Admin clínica pode gerenciar perfis da sua clínica" 
ON public.profiles FOR ALL 
USING (get_user_role_extended() = 'admin_clinica' AND clinica_id = get_user_clinica_id())
WITH CHECK (get_user_role_extended() = 'admin_clinica' AND clinica_id = get_user_clinica_id());

CREATE POLICY "Admin filial pode gerenciar dentistas da sua filial" 
ON public.profiles FOR ALL 
USING (get_user_role_extended() = 'admin_filial' AND filial_id = get_user_filial_id() AND role_extended = 'dentist')
WITH CHECK (get_user_role_extended() = 'admin_filial' AND filial_id = get_user_filial_id() AND role_extended = 'dentist');

-- Políticas RLS para pacientes (atualizadas)
DROP POLICY IF EXISTS "Users can view their patients or admins can view all" ON public.patients;
DROP POLICY IF EXISTS "Users can update their patients or admins can update all" ON public.patients;

CREATE POLICY "Admin master pode ver todos os pacientes" 
ON public.patients FOR SELECT 
USING (public.is_admin_master());

CREATE POLICY "Admin clínica pode ver pacientes da sua clínica" 
ON public.patients FOR SELECT 
USING (get_user_role_extended() = 'admin_clinica' AND EXISTS (
  SELECT 1 FROM public.filiais 
  WHERE id = patients.filial_id AND clinica_id = get_user_clinica_id()
));

CREATE POLICY "Admin filial pode ver pacientes da sua filial" 
ON public.patients FOR SELECT 
USING (get_user_role_extended() = 'admin_filial' AND filial_id = get_user_filial_id());

CREATE POLICY "Dentistas podem ver seus pacientes" 
ON public.patients FOR SELECT 
USING (get_user_role_extended() = 'dentist' AND dentist_id = auth.uid());

CREATE POLICY "Usuários podem gerenciar pacientes conforme hierarquia" 
ON public.patients FOR ALL 
USING (
  public.is_admin_master() OR
  (get_user_role_extended() = 'admin_clinica' AND EXISTS (
    SELECT 1 FROM public.filiais 
    WHERE id = patients.filial_id AND clinica_id = get_user_clinica_id()
  )) OR
  (get_user_role_extended() = 'admin_filial' AND filial_id = get_user_filial_id()) OR
  (get_user_role_extended() = 'dentist' AND dentist_id = auth.uid())
)
WITH CHECK (
  public.is_admin_master() OR
  (get_user_role_extended() = 'admin_clinica' AND EXISTS (
    SELECT 1 FROM public.filiais 
    WHERE id = patients.filial_id AND clinica_id = get_user_clinica_id()
  )) OR
  (get_user_role_extended() = 'admin_filial' AND filial_id = get_user_filial_id()) OR
  (get_user_role_extended() = 'dentist' AND dentist_id = auth.uid())
);

-- Políticas RLS para pedidos (atualizadas)
DROP POLICY IF EXISTS "Dentists can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Only admins can update order status" ON public.orders;

CREATE POLICY "Usuários podem ver pedidos conforme hierarquia" 
ON public.orders FOR SELECT 
USING (
  public.is_admin_master() OR
  (get_user_role_extended() = 'admin_clinica' AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.filiais f ON p.filial_id = f.id
    WHERE p.id = orders.user_id AND f.clinica_id = get_user_clinica_id()
  )) OR
  (get_user_role_extended() = 'admin_filial' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = orders.user_id AND filial_id = get_user_filial_id()
  )) OR
  (get_user_role_extended() = 'dentist' AND user_id = auth.uid())
);

CREATE POLICY "Admins podem atualizar status dos pedidos" 
ON public.orders FOR UPDATE 
USING (
  public.is_admin_master() OR
  (get_user_role_extended() = 'admin_clinica' AND EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.filiais f ON p.filial_id = f.id
    WHERE p.id = orders.user_id AND f.clinica_id = get_user_clinica_id()
  )) OR
  (get_user_role_extended() = 'admin_filial' AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = orders.user_id AND filial_id = get_user_filial_id()
  ))
);

-- Atualizar função handle_new_user para usar o novo role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role, role_extended)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'dentist')::user_role,
    COALESCE(NEW.raw_user_meta_data->>'role_extended', 'dentist')::user_role_extended
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$;