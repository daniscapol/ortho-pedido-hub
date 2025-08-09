-- Verificar e limpar dados de forma mais específica

-- 1. Deletar todos os pedidos e itens relacionados primeiro
DELETE FROM order_items;
DELETE FROM order_images;
DELETE FROM orders;

-- 2. Deletar todos os pacientes
DELETE FROM patients;

-- 3. Limpar chat de suporte
DELETE FROM support_chat_messages;
DELETE FROM support_conversations;
DELETE FROM support_typing_indicators;

-- 4. Limpar notificações
DELETE FROM notifications;

-- 5. Limpar fila de produção e estágios
DELETE FROM production_queue;
DELETE FROM production_stages;

-- 6. Deletar TODOS os profiles (incluindo admin master)
DELETE FROM profiles;

-- 7. Deletar todas as clínicas
DELETE FROM clinicas;

-- 8. Deletar todas as filiais
DELETE FROM filiais;