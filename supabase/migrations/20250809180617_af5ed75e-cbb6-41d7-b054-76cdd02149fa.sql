-- Limpar todos os dados para começar do zero
-- Manter apenas usuários admin essenciais

-- 1. Deletar todos os pedidos e itens relacionados
DELETE FROM order_items;
DELETE FROM order_images;
DELETE FROM orders;

-- 2. Deletar todos os pacientes
DELETE FROM patients;

-- 3. Deletar perfis que não são admin master
DELETE FROM profiles 
WHERE role_extended != 'admin_master';

-- 4. Deletar todas as clínicas
DELETE FROM clinicas;

-- 5. Deletar todas as filiais
DELETE FROM filiais;

-- 6. Limpar fila de produção e estágios
DELETE FROM production_queue;
DELETE FROM production_stages;

-- 7. Limpar notificações
DELETE FROM notifications;

-- 8. Limpar chat de suporte
DELETE FROM support_chat_messages;
DELETE FROM support_conversations;
DELETE FROM support_typing_indicators;