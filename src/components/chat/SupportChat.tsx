import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send, MessageCircle, X, Users, MessageSquare, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface SupportMessage {
  id: string;
  user_id: string;
  message: string;
  sender_type: 'dentist' | 'admin';
  created_at: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  dentist_id: string;
  dentist_name: string;
  last_message_at: string;
  status: 'active' | 'closed';
  unread_by_admin: number;
  unread_by_dentist: number;
}


interface SupportChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const SupportChat: React.FC<SupportChatProps> = ({ isOpen, onToggle }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState<'conversations' | 'chat'>('conversations');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: profile } = useProfile();
  const { toast } = useToast();

  // Sound effects for messages
  const playSound = (type: 'send' | 'receive') => {
    if (!soundEnabled) return;
    
    try {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Different frequencies for send/receive
      oscillator.frequency.value = type === 'send' ? 800 : 600;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, context.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
      
      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + 0.1);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('support_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    if (!profile) return;
    
    try {
      console.log('Fetching messages for conversation:', conversationId, 'Profile:', profile);
      
      const { data, error } = await supabase
        .from('support_chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      console.log('Messages query result:', { data, error });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createOrGetConversation = async () => {
    if (!profile || profile.role === 'admin') return null;

    try {
      const { data, error } = await supabase.rpc('get_or_create_conversation', {
        p_dentist_id: profile.id,
        p_dentist_name: profile.name || 'Dentista'
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile) return;

    setIsLoading(true);
    try {
      let conversationId = selectedConversation;

      // Se for dentista e não tem conversa selecionada, criar uma nova
      if (profile.role === 'dentist' && !conversationId) {
        conversationId = await createOrGetConversation();
        if (!conversationId) throw new Error('Erro ao criar conversa');
      }

      if (!conversationId) {
        throw new Error('Nenhuma conversa selecionada');
      }

      const { error } = await supabase
        .from('support_chat_messages')
        .insert({
          user_id: profile.id,
          message: newMessage.trim(),
          sender_type: profile.role,
          conversation_id: conversationId
        });

      if (error) throw error;

      playSound('send');
      setNewMessage('');
      
      // Se for dentista, mudar para view de chat
      if (profile.role === 'dentist') {
        setSelectedConversation(conversationId);
        setView('chat');
      }

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

  const markAsRead = async (conversationId: string) => {
    if (!profile) return;

    try {
      const updateField = profile.role === 'admin' ? 'unread_by_admin' : 'unread_by_dentist';
      
      await supabase
        .from('support_conversations')
        .update({ [updateField]: 0 })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  };

  const selectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation.id);
    setView('chat');
    fetchMessages(conversation.id);
    markAsRead(conversation.id);
  };

  const startNewConversation = async () => {
    if (profile?.role === 'dentist') {
      const conversationId = await createOrGetConversation();
      if (conversationId) {
        setSelectedConversation(conversationId);
        setView('chat');
        fetchMessages(conversationId);
      }
    }
  };


  useEffect(() => {
    if (isOpen && profile) {
      fetchConversations();
      
      // Se for dentista, verificar se já tem conversa e ir direto para o chat
      if (profile.role === 'dentist') {
        const dentistConversation = conversations.find(c => c.dentist_id === profile.id);
        if (dentistConversation) {
          selectConversation(dentistConversation);
        }
      }
    }
  }, [isOpen, profile]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Effect for playing sound on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      // Only play sound for messages from others
      if (lastMessage.user_id !== profile?.id) {
        playSound('receive');
      }
    }
  }, [messages, profile?.id]);

  useEffect(() => {
    if (!isOpen) return;

    const conversationChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_conversations'
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_chat_messages'
        },
        () => {
          if (selectedConversation) {
            fetchMessages(selectedConversation);
          }
        }
      )
      .subscribe();


    return () => {
      supabase.removeChannel(conversationChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [isOpen, selectedConversation]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const totalUnread = conversations.reduce((total, conv) => {
    if (profile?.role === 'admin') {
      return total + conv.unread_by_admin;
    }
    return total + conv.unread_by_dentist;
  }, 0);

  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
        {totalUnread > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {totalUnread}
          </Badge>
        )}
      </Button>
    );
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[500px] shadow-xl border-2 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {view === 'chat' && selectedConversationData ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('conversations')}
                className="p-1 h-6"
              >
                ←
              </Button>
              Chat - {selectedConversationData.dentist_name}
            </>
          ) : (
            <>
              <MessageSquare className="h-4 w-4" />
              Suporte
            </>
          )}
        </CardTitle>
        <div className="flex items-center gap-1">
          {/* Sound toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="h-6 w-6"
            title={soundEnabled ? 'Desativar sons' : 'Ativar sons'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </Button>
          
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
      
      <CardContent className="p-0 flex-1 flex flex-col min-h-0">
        {view === 'conversations' ? (
          <div className="flex-1 flex flex-col">
            <div className="p-3 border-b">
              {profile?.role === 'admin' ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Conversas de Suporte
                </div>
              ) : (
                <Button
                  onClick={startNewConversation}
                  className="w-full"
                  size="sm"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Iniciar Conversa
                </Button>
              )}
            </div>
            
            <ScrollArea className="flex-1">
              {conversations.length === 0 ? (
                <div className="text-center text-muted-foreground text-sm py-8">
                  {profile?.role === 'admin' 
                    ? 'Nenhuma conversa ainda' 
                    : 'Clique em "Iniciar Conversa" para começar'
                  }
                </div>
              ) : (
                <div className="p-2">
                  {conversations.map((conversation) => {
                    const unreadCount = profile?.role === 'admin' 
                      ? conversation.unread_by_admin 
                      : conversation.unread_by_dentist;
                    
                    // Se for dentista, só mostrar suas próprias conversas
                    if (profile?.role === 'dentist' && conversation.dentist_id !== profile.id) {
                      return null;
                    }

                    return (
                      <div
                        key={conversation.id}
                        className="p-3 border rounded-lg mb-2 cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => selectConversation(conversation)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">
                              {conversation.dentist_name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(conversation.last_message_at), 'dd/MM HH:mm')}
                            </div>
                          </div>
                          {unreadCount > 0 && (
                            <Badge variant="destructive" className="h-5 text-xs">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 p-3 min-h-0">
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
                          className={`max-w-[80%] rounded-lg p-3 text-sm ${
                            isOwnMessage
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="break-words">{message.message}</p>
                          <p className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'
                          }`}>
                            {message.sender_type === 'admin' ? 'Admin' : 'Dentista'} • {format(new Date(message.created_at), 'HH:mm')}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <Separator />
            
            <div className="p-3 border-t bg-background">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
};