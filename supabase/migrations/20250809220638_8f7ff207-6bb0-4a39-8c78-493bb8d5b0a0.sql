BEGIN;

-- Remover dados dependentes de pedidos primeiro
DELETE FROM public.chat_messages;
DELETE FROM public.order_images;
DELETE FROM public.order_items;
DELETE FROM public.production_stages;
DELETE FROM public.production_queue;

-- Remover pedidos
DELETE FROM public.orders;

-- Remover pacientes
DELETE FROM public.patients;

-- Remover usuários: dentistas e admins não-master
DELETE FROM public.profiles WHERE role_extended IN ('dentist','admin_clinica','admin_filial');

-- Remover filiais (filha) e clínicas (pai)
DELETE FROM public.filiais;
DELETE FROM public.clinicas;

COMMIT;