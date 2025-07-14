import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, X, Minimize2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SupportMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  message: string;
  sender_type: 'dentist' | 'admin';
  created_at: string;
}

interface SupportConversation {
  id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  last_message_at: string;
  unread_count_admin: number;
  unread_count_dentist: number;
}

interface SupportChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SupportChat: React.FC<SupportChatProps> = ({ isOpen, onToggle }) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [conversation, setConversation] = useState<SupportConversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useProfile();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createOrGetConversation = async () => {
    if (!profile) return null;

    try {
      // First, check if user already has a conversation
      const { data: existingConversation, error: fetchError } = await supabase
        .from('support_conversations')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const { data: newConversation, error: createError } = await supabase
        .from('support_conversations')
        .insert({
          user_id: profile.id,
          title: 'Conversa de Suporte',
          status: 'active'
        })
        .select()
        .single();

      if (createError) throw createError;
      return newConversation;
    } catch (error) {
      console.error('Error creating/getting conversation:', error);
      return null;
    }
  };

  const fetchMessages = async () => {
    if (!conversation) return;

    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile || !conversation) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          conversation_id: conversation.id,
          user_id: profile.id,
          message: newMessage.trim(),
          sender_type: 'dentist'
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!conversation) return;

    try {
      await supabase.rpc('mark_conversation_read_by_dentist', {
        p_conversation_id: conversation.id
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  useEffect(() => {
    const initializeChat = async () => {
      if (isOpen && profile) {
        const conv = await createOrGetConversation();
        setConversation(conv);
      }
    };
    initializeChat();
  }, [isOpen, profile]);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      markAsRead();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!conversation) return;

    const channel = supabase
      .channel(`support-chat-${conversation.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_chat_messages',
          filter: `conversation_id=eq.${conversation.id}`
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const unreadCount = conversation?.unread_count_dentist || 0;

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 h-96 shadow-xl border-2">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm">Suporte</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-6 w-6"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-full">
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-8">
                Nenhuma mensagem ainda. Comece uma conversa!
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.user_id === profile?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-2 text-sm ${
                        isOwnMessage
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="break-words">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {format(new Date(message.created_at), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};