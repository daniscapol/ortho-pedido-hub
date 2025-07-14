import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageCircle, Send, User } from 'lucide-react';
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
  profiles?: {
    name: string;
    email: string;
  };
}

export const SupportChatAdmin: React.FC = () => {
  const [conversations, setConversations] = useState<SupportConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<SupportConversation | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const fetchConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('support_conversations')
        .select(`
          *,
          profiles:user_id (
            name,
            email
          )
        `)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as conversas.",
        variant: "destructive",
      });
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || !selectedConversation) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          conversation_id: selectedConversation.id,
          user_id: user.id,
          message: newMessage.trim(),
          sender_type: 'admin',
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a mensagem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    try {
      await supabase.rpc('mark_conversation_read_by_admin', {
        p_conversation_id: conversationId
      });
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const selectConversation = (conversation: SupportConversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
    markAsRead(conversation.id);
  };

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('admin-support-chat')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_conversations',
        },
        () => {
          fetchConversations();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_chat_messages',
        },
        (payload) => {
          if (selectedConversation && (payload.new as any)?.conversation_id === selectedConversation.id) {
            fetchMessages(selectedConversation.id);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedConversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[600px] max-w-6xl mx-auto">
      {/* Conversations List */}
      <Card className="w-1/3 mr-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Conversas de Suporte
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhuma conversa encontrada
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 border-b ${
                      selectedConversation?.id === conversation.id ? 'bg-muted' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium text-sm">
                          {conversation.profiles?.name || 'Usuário'}
                        </span>
                      </div>
                      {conversation.unread_count_admin > 0 && (
                        <Badge variant="destructive" className="h-5 text-xs">
                          {conversation.unread_count_admin}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {conversation.profiles?.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(conversation.last_message_at).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle>
            {selectedConversation 
              ? `Chat com ${selectedConversation.profiles?.name || 'Usuário'}`
              : 'Selecione uma conversa'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {selectedConversation ? (
            <>
              <ScrollArea className="h-[400px] mb-4">
                <div className="space-y-2">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Nenhuma mensagem ainda</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender_type === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg text-sm ${
                            message.sender_type === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p>{message.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(message.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              <Separator className="my-4" />
              
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Digite sua resposta..."
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={loading || !newMessage.trim()}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-[400px] text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Selecione uma conversa para começar</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};