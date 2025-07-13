-- Criar tabela de filiais
CREATE TABLE public.filiais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  endereco_entrega TEXT NOT NULL,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.filiais ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas admins podem gerenciar filiais
CREATE POLICY "Admins can manage filiais" 
ON public.filiais 
FOR ALL 
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Usuários podem visualizar filiais ativas
CREATE POLICY "Users can view active filiais" 
ON public.filiais 
FOR SELECT 
USING (ativo = true OR is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_filiais_updated_at
BEFORE UPDATE ON public.filiais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();