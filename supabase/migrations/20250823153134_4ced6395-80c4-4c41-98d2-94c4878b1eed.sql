-- Habilitar realtime para a tabela audit_logs
-- Isso permite que mudanças na timeline sejam refletidas em tempo real

-- Configurar REPLICA IDENTITY FULL para capturar todos os dados durante updates
ALTER TABLE public.audit_logs REPLICA IDENTITY FULL;

-- Adicionar a tabela à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.audit_logs;