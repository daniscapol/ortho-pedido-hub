-- Fix Security Definer View by replacing order_analytics view with a security definer function

-- Drop the existing view
DROP VIEW IF EXISTS public.order_analytics;

-- Create a security definer function to replace the view
CREATE OR REPLACE FUNCTION public.get_order_analytics()
RETURNS TABLE(
    date timestamp with time zone,
    total_orders bigint,
    completed_orders bigint,
    in_production bigint,
    pending_orders bigint,
    avg_completion_hours numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
    SELECT 
        date_trunc('day', created_at) AS date,
        count(*) AS total_orders,
        count(
            CASE
                WHEN status = 'concluido' THEN 1
                ELSE NULL
            END) AS completed_orders,
        count(
            CASE
                WHEN status = 'producao' THEN 1
                ELSE NULL
            END) AS in_production,
        count(
            CASE
                WHEN status = 'pendente' THEN 1
                ELSE NULL
            END) AS pending_orders,
        (avg(EXTRACT(epoch FROM (updated_at - created_at)) / 3600))::numeric(10,2) AS avg_completion_hours
    FROM orders
    GROUP BY date_trunc('day', created_at)
    ORDER BY date;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_order_analytics() TO authenticated;

-- Create RLS policy for the function (it will respect the orders table RLS)
COMMENT ON FUNCTION public.get_order_analytics() IS 'Returns order analytics data. Respects RLS policies on orders table.';