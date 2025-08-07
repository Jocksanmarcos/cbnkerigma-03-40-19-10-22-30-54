import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface UserContext {
  visitCount: number;
  interests: string[];
  lastInteraction: Date | null;
  hasShownInterest: {
    studies: boolean;
    donations: boolean;
    baptism: boolean;
    cell: boolean;
  };
}

export const useChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [userContext, setUserContext] = useState<UserContext>({
    visitCount: 1,
    interests: [],
    lastInteraction: null,
    hasShownInterest: {
      studies: false,
      donations: false,
      baptism: false,
      cell: false,
    }
  });

  const getPersonalizedWelcome = useCallback((visitCount: number): string => {
    if (visitCount === 1) {
      return "🙏 Olá! Seja muito bem-vindo(a) à CBN Kerigma! Sou seu assistente virtual e estou aqui para te ajudar em sua jornada de fé. É a primeira vez que você nos visita?";
    } else if (visitCount <= 3) {
      return "😊 Que alegria te ver novamente! Como posso te ajudar hoje? Gostaria de saber mais sobre nossos cultos, células ou estudos bíblicos?";
    } else {
      return "🤗 Olá, querido(a) irmão/irmã! Sempre um prazer conversar com você! Como está sua caminhada espiritual? Posso te ajudar com algo específico hoje?";
    }
  }, []);

  const generateAIResponse = useCallback(async (userMessage: string): Promise<string> => {
    try {
      setIsGeneratingResponse(true);
      
      const conversationHistory = messages.slice(-6).map(msg => ({
        role: msg.isBot ? 'assistant' : 'user',
        content: msg.content
      }));

      const { data, error } = await supabase.functions.invoke('ai-chat-response', {
        body: { 
          mensagem: userMessage,
          usuario_nome: 'Visitante do Site',
          usuario_email: null,
          userContext,
          conversationHistory
        }
      });

      if (error) {
        console.error('Erro ao gerar resposta IA:', error);
        return generateFallbackResponse(userMessage);
      }

      // Atualizar contexto do usuário com interesses detectados
      if (data.detectedInterests && data.detectedInterests.length > 0) {
        updateUserInterests(userMessage, data.resposta || data.response);
      }

      return data.resposta || data.response;
    } catch (error) {
      console.error('Erro na resposta IA:', error);
      return generateFallbackResponse(userMessage);
    } finally {
      setIsGeneratingResponse(false);
    }
  }, [messages, userContext]);

  const generateFallbackResponse = useCallback((userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes("horario") || message.includes("culto")) {
      return `🕐 **HORÁRIOS DOS CULTOS**

• **Domingo:** 19h00 - Culto da Família
• **Quarta-feira:** 19h30 - Culto de Oração
• **Sábado:** 19h30 - Culto de Ensino

📍 **Local:** Bairro Aurora, São Luís - MA
🅿️ Temos estacionamento disponível

Gostaria de saber como chegar?`;
    }

    if (message.includes("celula") || message.includes("grupo")) {
      return `🏠 **CÉLULAS CBN KERIGMA**

As células são o coração da nossa igreja! São grupos pequenos que se reúnem durante a semana para:

✅ **Estudo bíblico profundo**
✅ **Oração e intercessão**  
✅ **Comunhão e relacionamentos**
✅ **Evangelismo prático**

📱 **Para participar:** (98) 98873-4670
🗺️ Temos células em diversos bairros

**Em que região você mora?**`;
    }

    if (message.includes("contato") || message.includes("telefone")) {
      return `📮 **CONTATO CBN KERIGMA**

📱 **WhatsApp:** (98) 98873-4670
✉️ **Email:** contato@cbnkerigma.org.br
🏠 **Endereço:** Bairro Aurora, São Luís - MA

**Horários de atendimento:**
• Segunda a Sexta: 8h às 17h
• Sábado: 8h às 12h
• Domingo: Após os cultos

Como posso te ajudar?`;
    }

    return `😊 **Obrigado por sua mensagem!**

Posso te ajudar com:
• 📖 Estudos bíblicos personalizados
• 🕐 Horários dos cultos
• 🏠 Informações sobre células
• 💝 Dízimos e ofertas
• 🌊 Processo de batismo

📱 **Contato direto:** (98) 98873-4670

O que você gostaria de saber?`;
  }, []);

  const updateUserInterests = useCallback((message: string, response: string) => {
    const interests = [];
    const newInterests = { ...userContext.hasShownInterest };

    if (message.includes("estudo") || response.includes("estudo")) {
      interests.push("estudos");
      newInterests.studies = true;
    }
    if (message.includes("dízimo") || message.includes("oferta") || message.includes("contribui")) {
      interests.push("contribuições");
      newInterests.donations = true;
    }
    if (message.includes("batismo")) {
      interests.push("batismo");
      newInterests.baptism = true;
    }
    if (message.includes("célula") || message.includes("grupo")) {
      interests.push("células");
      newInterests.cell = true;
    }

    setUserContext(prev => ({
      ...prev,
      interests: [...new Set([...prev.interests, ...interests])],
      hasShownInterest: newInterests,
      lastInteraction: new Date()
    }));
  }, [userContext]);

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageContent,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simula delay do bot para melhor UX
    setTimeout(async () => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: await generateAIResponse(messageContent),
        isBot: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  }, [generateAIResponse]);

  const initializeChat = useCallback(() => {
    const isReturningUser = localStorage.getItem('cbn_chat_visits');
    const visitCount = isReturningUser ? parseInt(isReturningUser) + 1 : 1;
    localStorage.setItem('cbn_chat_visits', visitCount.toString());

    const welcomeMessage = getPersonalizedWelcome(visitCount);
    setMessages([{
      id: "1",
      content: welcomeMessage,
      isBot: true,
      timestamp: new Date()
    }]);

    setUserContext(prev => ({ ...prev, visitCount }));

    // Pergunta contextual após delay
    setTimeout(() => {
      const contextualMessages = [
        "Para te ajudar melhor, me conte: você gostaria de conhecer mais sobre nossos estudos bíblicos, horários de cultos, ou talvez participar de uma célula?",
        "Gostaria de participar de um estudo bíblico personalizado hoje? Posso criar um especialmente para você! 📖",
        "Como está sua vida de oração? Posso te ajudar com devocionais ou estudos sobre oração? 🙏"
      ];
      
      const selectedMessage = visitCount === 1 ? contextualMessages[0] : 
        contextualMessages[Math.floor(Math.random() * contextualMessages.length)];

      setMessages(prev => [...prev, {
        id: "context-" + Date.now(),
        content: selectedMessage,
        isBot: true,
        timestamp: new Date()
      }]);
    }, 2000);
  }, [getPersonalizedWelcome]);

  // Inicializar chat
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  return {
    messages,
    inputValue,
    setInputValue,
    isGeneratingResponse,
    userContext,
    sendMessage,
    generateAIResponse
  };
};