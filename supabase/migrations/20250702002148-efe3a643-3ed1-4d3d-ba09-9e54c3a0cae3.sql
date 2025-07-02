-- Habilitar Row Level Security nas tabelas que têm políticas mas RLS desabilitado

-- Habilitar RLS na tabela orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela patients  
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela order_images
ALTER TABLE public.order_images ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Criar políticas básicas para order_images (que não tinha políticas)
CREATE POLICY "Users can view order images" 
ON public.order_images 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_images.order_id 
  AND (orders.user_id = auth.uid() OR is_admin(auth.uid()))
));

CREATE POLICY "Users can create order images" 
ON public.order_images 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_images.order_id 
  AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can update their order images" 
ON public.order_images 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE orders.id = order_images.order_id 
  AND (orders.user_id = auth.uid() OR is_admin(auth.uid()))
));

-- Criar políticas básicas para chat_messages (que não tinha políticas)
CREATE POLICY "Users can view their chat messages" 
ON public.chat_messages 
FOR SELECT 
USING (user_id = auth.uid() OR is_admin(auth.uid()));

CREATE POLICY "Users can create chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their chat messages" 
ON public.chat_messages 
FOR UPDATE 
USING (user_id = auth.uid() OR is_admin(auth.uid()));