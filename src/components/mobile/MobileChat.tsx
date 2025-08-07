import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Users, 
  Settings,
  MessageSquare,
  UserPlus,
  Bell,
  BellOff
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'image' | 'audio' | 'file';
  read: boolean;
}

interface ChatGroup {
  id: string;
  name: string;
  type: 'individual' | 'cell' | 'leadership' | 'support';
  participants: number;
  lastMessage: Message;
  unreadCount: number;
  isOnline?: boolean;
  avatar?: string;
}

export const MobileChat: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<ChatGroup | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [chats, setChats] = useState<ChatGroup[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Carregar chats do usuário
    loadUserChats();
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserChats = async () => {
    // Simular dados de chat por enquanto
    const mockChats: ChatGroup[] = [
      {
        id: 'leadership',
        name: 'Liderança da Igreja',
        type: 'leadership',
        participants: 5,
        unreadCount: 2,
        lastMessage: {
          id: '1',
          senderId: 'pastor-1',
          senderName: 'Pastor João',
          content: 'Reunião de liderança amanhã às 19h',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          type: 'text',
          read: false
        }
      },
      {
        id: 'cell-group',
        name: 'Célula - Bairro Centro',
        type: 'cell',
        participants: 12,
        unreadCount: 0,
        lastMessage: {
          id: '2',
          senderId: 'member-1',
          senderName: 'Maria Silva',
          content: 'Obrigada pela oração! Deus é fiel 🙏',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          type: 'text',
          read: true
        }
      },
      {
        id: 'support',
        name: 'Suporte Técnico',
        type: 'support',
        participants: 3,
        unreadCount: 0,
        isOnline: true,
        lastMessage: {
          id: '3',
          senderId: 'support-1',
          senderName: 'Equipe Suporte',
          content: 'Como posso ajudá-lo hoje?',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          type: 'text',
          read: true
        }
      }
    ];

    setChats(mockChats);
  };

  const loadChatMessages = async (chatId: string) => {
    // Simular carregamento de mensagens
    const mockMessages: Message[] = [
      {
        id: '1',
        senderId: 'pastor-1',
        senderName: 'Pastor João',
        content: 'Paz do Senhor, pessoal! Como estão?',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        type: 'text',
        read: true
      },
      {
        id: '2',
        senderId: user?.id || 'current-user',
        senderName: user?.email?.split('@')[0] || 'Você',
        content: 'Paz! Estamos bem, pastor. Obrigado por perguntar.',
        timestamp: new Date(Date.now() - 23 * 60 * 60 * 1000),
        type: 'text',
        read: true
      },
      {
        id: '3',
        senderId: 'pastor-1',
        senderName: 'Pastor João',
        content: 'Reunião de liderança amanhã às 19h. Confirmem presença, por favor.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text',
        read: false
      }
    ];

    setMessages(mockMessages);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChat) return;

    const message: Message = {
      id: Date.now().toString(),
      senderId: user?.id || 'current-user',
      senderName: user?.email?.split('@')[0] || 'Você',
      content: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      read: true
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Aqui integraria com o backend para enviar a mensagem
    toast({
      title: "Mensagem enviada",
      description: "Sua mensagem foi enviada com sucesso.",
    });
  };

  const selectChat = (chat: ChatGroup) => {
    setActiveChat(chat);
    loadChatMessages(chat.id);
    
    // Marcar mensagens como lidas
    setChats(prev => 
      prev.map(c => 
        c.id === chat.id 
          ? { ...c, unreadCount: 0 }
          : c
      )
    );
  };

  const formatMessageTime = (timestamp: Date) => {
    const now = new Date();
    const diffHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return timestamp.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return timestamp.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    }
  };

  const getChatTypeColor = (type: ChatGroup['type']) => {
    switch (type) {
      case 'leadership': return 'bg-purple-500';
      case 'cell': return 'bg-blue-500';
      case 'support': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getChatTypeIcon = (type: ChatGroup['type']) => {
    switch (type) {
      case 'leadership': return '👑';
      case 'cell': return '🏠';
      case 'support': return '🛠️';
      default: return '💬';
    }
  };

  if (!activeChat) {
    return (
      <div className="h-full bg-background">
        {/* Header */}
        <div className="bg-primary text-primary-foreground p-4">
          <h1 className="text-xl font-bold flex items-center">
            <MessageSquare className="w-6 h-6 mr-2" />
            Conversas
          </h1>
        </div>

        {/* Lista de Chats */}
        <div className="p-4 space-y-3">
          {chats.map(chat => (
            <Card 
              key={chat.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => selectChat(chat)}
            >
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className={`w-12 h-12 ${getChatTypeColor(chat.type)} rounded-full flex items-center justify-center text-white text-xl`}>
                      {getChatTypeIcon(chat.type)}
                    </div>
                    {chat.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{chat.name}</h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(chat.lastMessage.timestamp)}
                        </span>
                        {chat.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {chat.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground truncate">
                        {chat.lastMessage.senderName}: {chat.lastMessage.content}
                      </p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Users className="w-3 h-3 mr-1" />
                        {chat.participants}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header do Chat */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary-foreground hover:bg-primary-foreground/20"
            onClick={() => setActiveChat(null)}
          >
            ←
          </Button>
          
          <div className={`w-10 h-10 ${getChatTypeColor(activeChat.type)} rounded-full flex items-center justify-center text-white`}>
            {getChatTypeIcon(activeChat.type)}
          </div>
          
          <div>
            <h2 className="font-semibold">{activeChat.name}</h2>
            <p className="text-sm opacity-90">
              {activeChat.participants} participantes
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/20">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mensagens */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.senderId === user?.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted'
              } rounded-lg p-3`}>
                {message.senderId !== user?.id && (
                  <p className="text-xs font-medium mb-1 opacity-70">
                    {message.senderName}
                  </p>
                )}
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.senderId === user?.id 
                    ? 'text-primary-foreground/70' 
                    : 'text-muted-foreground'
                }`}>
                  {formatMessageTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input de Mensagem */}
      <div className="p-4 border-t bg-background">
        <div className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            className="flex-1"
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <Button 
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};