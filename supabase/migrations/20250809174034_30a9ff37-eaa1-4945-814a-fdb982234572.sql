-- Optimized RPC to fetch clinicas with filial name and counts
CREATE OR REPLACE FUNCTION public.get_clinicas_with_counts()
RETURNS TABLE (
  id uuid,
  nome_completo text,
  cnpj text,
  endereco text,
  telefone text,
  email text,
  cep text,
  cidade text,
  estado text,
  numero text,
  complemento text,
  ativo boolean,
  filial_id uuid,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  filial_nome text,
  qntd_dentistas bigint,
  qntd_pacientes bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    c.id,
    c.nome_completo,
    c.cnpj,
    c.endereco,
    c.telefone,
    c.email,
    c.cep,
    c.cidade,
    c.estado,
    c.numero,
    c.complemento,
    c.ativo,
    c.filial_id,
    c.created_at,
    c.updated_at,
    f.nome_completo AS filial_nome,
    COUNT(DISTINCT d.id) AS qntd_dentistas,
    COUNT(DISTINCT p.id) AS qntd_pacientes
  FROM clinicas c
  LEFT JOIN filiais f ON f.id = c.filial_id
  LEFT JOIN profiles d ON d.clinica_id = c.id AND d.role_extended = 'dentist'
  LEFT JOIN patients p ON p.clinica_id = c.id
  GROUP BY c.id, c.nome_completo, c.cnpj, c.endereco, c.telefone, c.email, c.cep, c.cidade, c.estado, c.numero, c.complemento, c.ativo, c.filial_id, c.created_at, c.updated_at, f.nome_completo
  ORDER BY c.nome_completo;
$$;