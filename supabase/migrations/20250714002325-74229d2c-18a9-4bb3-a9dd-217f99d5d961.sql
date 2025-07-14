-- Create triggers for automatic notifications

-- Function to notify about new orders
CREATE OR REPLACE FUNCTION notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user RECORD;
BEGIN
    -- Notify the dentist who created the order
    PERFORM create_notification(
        NEW.user_id,
        'Novo Pedido Criado',
        'Seu pedido para o paciente foi criado com sucesso.',
        'order_created',
        NEW.id
    );
    
    -- Notify all admin users
    FOR admin_user IN 
        SELECT id FROM profiles WHERE role = 'admin'
    LOOP
        PERFORM create_notification(
            admin_user.id,
            'Novo Pedido Recebido',
            'Um novo pedido foi criado e aguarda processamento.',
            'order_created',
            NEW.id
        );
    END LOOP;
    
    RETURN NEW;
END;
$$;

-- Function to notify about status changes
CREATE OR REPLACE FUNCTION notify_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    admin_user RECORD;
    status_message TEXT;
BEGIN
    -- Only trigger if status actually changed
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Set message based on new status
        CASE NEW.status
            WHEN 'producao' THEN
                status_message := 'Seu pedido entrou em produção.';
            WHEN 'pronto' THEN
                status_message := 'Seu pedido está pronto para retirada.';
            WHEN 'entregue' THEN
                status_message := 'Seu pedido foi entregue com sucesso.';
            ELSE
                status_message := 'O status do seu pedido foi atualizado.';
        END CASE;
        
        -- Notify the dentist who owns the order
        PERFORM create_notification(
            NEW.user_id,
            'Status do Pedido Atualizado',
            status_message,
            'status_change',
            NEW.id
        );
        
        -- Notify all admin users
        FOR admin_user IN 
            SELECT id FROM profiles WHERE role = 'admin'
        LOOP
            PERFORM create_notification(
                admin_user.id,
                'Status de Pedido Atualizado',
                'O status de um pedido foi alterado para: ' || NEW.status,
                'status_change',
                NEW.id
            );
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_new_order ON orders;
CREATE TRIGGER trigger_notify_new_order
    AFTER INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_order();

DROP TRIGGER IF EXISTS trigger_notify_status_change ON orders;
CREATE TRIGGER trigger_notify_status_change
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION notify_status_change();