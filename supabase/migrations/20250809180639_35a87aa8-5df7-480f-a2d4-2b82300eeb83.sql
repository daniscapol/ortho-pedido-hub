-- Limpar todos os dados respeitando as foreign keys
-- Primeiro, remover as referências foreign key temporariamente

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

-- 6. Primeiro, atualizar profiles para remover referências às clínicas e filiais
UPDATE profiles 
SET clinica_id = NULL, filial_id = NULL 
WHERE role_extended != 'admin_master';

-- 7. Agora deletar perfis que não são admin master
DELETE FROM profiles 
WHERE role_extended != 'admin_master';

-- 8. Deletar todas as clínicas
DELETE FROM clinicas;

-- 9. Deletar todas as filiais
DELETE FROM filiais;