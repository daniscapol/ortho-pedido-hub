-- Atualizar pedidos existentes com os novos status
-- Mapear status antigos para os novos e distribuir aleatoriamente

-- Primeiro, vamos mapear os status existentes conhecidos
UPDATE orders 
SET status = 'pedido_solicitado' 
WHERE status = 'pending';

UPDATE orders 
SET status = 'projeto_realizado' 
WHERE status = 'producao';

UPDATE orders 
SET status = 'aguardando_entrega' 
WHERE status = 'pronto';

UPDATE orders 
SET status = 'entregue' 
WHERE status = 'entregue';

-- Para pedidos que possam ter outros status, vamos distribuí-los aleatoriamente
-- usando uma função que gera números aleatórios baseados no ID do pedido
UPDATE orders 
SET status = CASE 
    WHEN (ABS(HASHTEXT(id::text)) % 6) = 0 THEN 'pedido_solicitado'
    WHEN (ABS(HASHTEXT(id::text)) % 6) = 1 THEN 'baixado_verificado'
    WHEN (ABS(HASHTEXT(id::text)) % 6) = 2 THEN 'projeto_realizado'
    WHEN (ABS(HASHTEXT(id::text)) % 6) = 3 THEN 'projeto_modelo_realizado'
    WHEN (ABS(HASHTEXT(id::text)) % 6) = 4 THEN 'aguardando_entrega'
    ELSE 'entregue'
END
WHERE status NOT IN ('pedido_solicitado', 'baixado_verificado', 'projeto_realizado', 'projeto_modelo_realizado', 'aguardando_entrega', 'entregue');

-- Garantir que pelo menos alguns pedidos estejam em cada status para demonstração
-- Vamos pegar alguns pedidos aleatórios e distribuir pelos status

-- Atualizar alguns pedidos para cada status (cerca de 15-20% cada)
WITH random_orders AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn,
           COUNT(*) OVER() as total_count
    FROM orders
),
status_distribution AS (
    SELECT id,
           CASE 
               WHEN rn <= (total_count * 0.25) THEN 'pedido_solicitado'
               WHEN rn <= (total_count * 0.45) THEN 'baixado_verificado'
               WHEN rn <= (total_count * 0.65) THEN 'projeto_realizado'
               WHEN rn <= (total_count * 0.80) THEN 'projeto_modelo_realizado'
               WHEN rn <= (total_count * 0.95) THEN 'aguardando_entrega'
               ELSE 'entregue'
           END as new_status
    FROM random_orders
)
UPDATE orders 
SET status = status_distribution.new_status
FROM status_distribution
WHERE orders.id = status_distribution.id;