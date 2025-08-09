-- Create an optimized RPC function to get filiais with counts
CREATE OR REPLACE FUNCTION get_filiais_with_counts()
RETURNS TABLE (
  id uuid,
  nome_completo text,
  endereco text,
  telefone text,
  email text,
  ativo boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  cep text,
  cidade text,
  estado text,
  numero text,
  complemento text,
  cnpj text,
  qntd_clinicas bigint,
  qntd_pacientes bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    f.id,
    f.nome_completo,
    f.endereco,
    f.telefone,
    f.email,
    f.ativo,
    f.created_at,
    f.updated_at,
    f.cep,
    f.cidade,
    f.estado,
    f.numero,
    f.complemento,
    f.cnpj,
    COALESCE(COUNT(DISTINCT c.id), 0) as qntd_clinicas,
    COALESCE(COUNT(DISTINCT p.id), 0) as qntd_pacientes
  FROM filiais f
  LEFT JOIN clinicas c ON c.filial_id = f.id
  LEFT JOIN patients p ON p.clinica_id = c.id
  GROUP BY f.id, f.nome_completo, f.endereco, f.telefone, f.email, f.ativo, f.created_at, f.updated_at, f.cep, f.cidade, f.estado, f.numero, f.complemento, f.cnpj
  ORDER BY f.nome_completo;
$$;