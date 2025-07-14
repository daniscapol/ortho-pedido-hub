-- Fix RLS policy for support_chat_messages to allow conversation participants to see all messages
DROP POLICY "Users can view their own support messages or admins can view al" ON public.support_chat_messages;

CREATE POLICY "Users can view messages in their conversations" 
ON public.support_chat_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations sc 
    WHERE sc.id = support_chat_messages.conversation_id 
    AND (sc.dentist_id = auth.uid() OR is_admin(auth.uid()))
  )
);