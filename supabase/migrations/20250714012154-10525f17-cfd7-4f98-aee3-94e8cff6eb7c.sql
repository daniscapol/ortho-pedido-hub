-- Create support conversations table
CREATE TABLE public.support_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  dentist_id UUID NOT NULL,
  dentist_name TEXT NOT NULL,
  last_message_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed')),
  unread_by_admin INTEGER DEFAULT 0,
  unread_by_dentist INTEGER DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE public.support_conversations ENABLE ROW LEVEL SECURITY;

-- Create policies for support conversations
CREATE POLICY "Users can view their own conversations or admins can view all" 
ON public.support_conversations 
FOR SELECT 
USING (
  auth.uid() = dentist_id OR 
  is_admin(auth.uid())
);

CREATE POLICY "Users can create their own conversations" 
ON public.support_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = dentist_id);

CREATE POLICY "Users can update their own conversations or admins can update all" 
ON public.support_conversations 
FOR UPDATE 
USING (
  auth.uid() = dentist_id OR 
  is_admin(auth.uid())
);

-- Update support_chat_messages to include conversation_id
ALTER TABLE public.support_chat_messages ADD COLUMN conversation_id UUID;

-- Create foreign key relationship
ALTER TABLE public.support_chat_messages 
ADD CONSTRAINT fk_conversation 
FOREIGN KEY (conversation_id) REFERENCES public.support_conversations(id) ON DELETE CASCADE;

-- Function to create or get conversation
CREATE OR REPLACE FUNCTION public.get_or_create_conversation(p_dentist_id UUID, p_dentist_name TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_conversation_id UUID;
BEGIN
    -- Try to find existing active conversation
    SELECT id INTO v_conversation_id
    FROM public.support_conversations
    WHERE dentist_id = p_dentist_id AND status = 'active'
    ORDER BY last_message_at DESC
    LIMIT 1;
    
    -- If no conversation found, create new one
    IF v_conversation_id IS NULL THEN
        INSERT INTO public.support_conversations (dentist_id, dentist_name)
        VALUES (p_dentist_id, p_dentist_name)
        RETURNING id INTO v_conversation_id;
    END IF;
    
    RETURN v_conversation_id;
END;
$$;

-- Function to update conversation on new message
CREATE OR REPLACE FUNCTION public.update_conversation_on_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update last_message_at and unread counts
    UPDATE public.support_conversations
    SET 
        last_message_at = NEW.created_at,
        unread_by_admin = CASE 
            WHEN NEW.sender_type = 'dentist' THEN unread_by_admin + 1
            ELSE unread_by_admin
        END,
        unread_by_dentist = CASE 
            WHEN NEW.sender_type = 'admin' THEN unread_by_dentist + 1
            ELSE unread_by_dentist
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$;

-- Create trigger for updating conversation
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON public.support_chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION public.update_conversation_on_message();

-- Enable realtime for conversations
ALTER TABLE public.support_conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_conversations;