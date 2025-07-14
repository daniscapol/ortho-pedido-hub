-- Add typing indicator table
CREATE TABLE public.support_typing_indicators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.support_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  is_typing BOOLEAN NOT NULL DEFAULT false,
  last_activity TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.support_typing_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for typing indicators
CREATE POLICY "Users can view typing indicators for their conversations" 
ON public.support_typing_indicators 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.support_conversations sc
    WHERE sc.id = conversation_id 
    AND (sc.dentist_id = auth.uid() OR is_admin(auth.uid()))
  )
);

CREATE POLICY "Users can insert their own typing indicators" 
ON public.support_typing_indicators 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own typing indicators" 
ON public.support_typing_indicators 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own typing indicators" 
ON public.support_typing_indicators 
FOR DELETE 
USING (auth.uid() = user_id);

-- Function to cleanup old typing indicators
CREATE OR REPLACE FUNCTION public.cleanup_typing_indicators()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Remove typing indicators older than 10 seconds
    DELETE FROM public.support_typing_indicators
    WHERE last_activity < NOW() - INTERVAL '10 seconds';
END;
$$;

-- Enable realtime for typing indicators
ALTER TABLE public.support_typing_indicators REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_typing_indicators;