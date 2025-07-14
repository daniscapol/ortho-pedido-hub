-- Create support chat table
CREATE TABLE public.support_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('dentist', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_by_admin BOOLEAN DEFAULT false,
  read_by_dentist BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.support_chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for support chat
CREATE POLICY "Users can view their own support messages or admins can view all" 
ON public.support_chat_messages 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  is_admin(auth.uid())
);

CREATE POLICY "Users can create support messages" 
ON public.support_chat_messages 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own messages or admins can update all" 
ON public.support_chat_messages 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  is_admin(auth.uid())
);

-- Enable realtime for support chat
ALTER TABLE public.support_chat_messages REPLICA IDENTITY FULL;

-- Add the table to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_chat_messages;