import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MessageCircle, Send, Bot, User, BookOpen, Sparkles } from "lucide-react";
import { useChatBot } from "@/hooks/useChatBot";

interface QuickResponse {
  text: string;
  response: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    messages, 
    inputValue, 
    setInputValue, 
    isGeneratingResponse, 
    sendMessage 
  } = useChatBot();

  const quickResponses: QuickResponse[] = [
    { 
      text: "🕐 Horários dos cultos", 
      response: "🕐 **HORÁRIOS DOS CULTOS**\n\n• **Domingo:** 19h00 - Culto da Família\n• **Quarta-feira:** 19h30 - Culto de Oração\n• **Sábado:** 19h30 - Culto de Ensino\n\n📍 **Local:** Bairro Aurora, São Luís - MA\n🅿️ Temos estacionamento disponível\n\nGostaria de saber como chegar?" 
    },
    { 
      text: "🏠 Como participar de uma célula", 
      response: "🏠 **PARTICIPAR DE UMA CÉLULA**\n\nAs células são o coração da nossa igreja! São grupos pequenos que se reúnem durante a semana para:\n\n✅ **Estudo bíblico profundo**\n✅ **Oração e intercessão**\n✅ **Comunhão e relacionamentos**\n✅ **Evangelismo prático**\n\n**Como participar:**\n📱 Entre em contato: (98) 98873-4670\n🗺️ Visite nossa [página de células](/celulas)\n🏢 Converse conosco após o culto\n\n**Em que bairro você mora?**" 
    },
    { 
      text: "📖 Estudo bíblico personalizado", 
      response: "🤖 **ESTUDOS BÍBLICOS COM INTELIGÊNCIA ARTIFICIAL**\n\nCrío estudos personalizados completos e fundamentados!\n\n**Como solicitar:**\nDigite: **'Estudo sobre [seu tema]'**\nExemplo: 'Estudo sobre perdão'\n\n✨ Estudos completos com versículos, reflexões e aplicações práticas!\n\n**Que tema você gostaria de estudar?**" 
    },
    { 
      text: "💝 Dízimos e ofertas", 
      response: "💝 **DÍZIMOS E OFERTAS**\n\nContribuir é um ato de adoração e obediência a Deus!\n\n**Formas de contribuir:**\n• 🏦 Durante os cultos (dinheiro/cartão)\n• 💳 Online através do [nosso site](/dizimos)\n• 📱 PIX da igreja\n• 🏧 Transferência bancária\n\n**Sobre dízimos:**\n• 📖 Base bíblica: Malaquias 3:10\n• 💯 10% da renda como referência\n• 🙏 Ato de fé e confiança\n\n**Gostaria de saber mais sobre a base bíblica do dízimo?**" 
    }
  ];

  const handleSendMessage = () => {
    if (inputValue.trim() === "") return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleQuickResponse = (responseText: string) => {
    sendMessage(responseText);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <div className="fixed bottom-20 right-4 z-40">
            <Button
              size="lg"
              className="w-16 h-16 rounded-full shadow-2xl bg-gradient-primary hover:bg-primary-dark text-white transition-all duration-300 hover:scale-110 glow-effect relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <div className="relative flex flex-col items-center">
                <MessageCircle className="w-6 h-6 mb-0.5" />
                <span className="text-xs font-bold">IA</span>
              </div>
            </Button>
            {/* Notification badge */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-accent rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </SheetTrigger>
        
        <SheetContent side="right" className="w-full sm:w-96 p-0 max-h-[90vh]">
          <SheetHeader className="p-4 bg-gradient-primary text-white">
            <SheetTitle className="text-white flex items-center gap-2 text-base">
              <Bot className="w-6 h-6" />
              Assistente CBN Kerigma
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex flex-col h-[calc(90vh-80px)]">
            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`flex items-start space-x-2 max-w-[85%] ${message.isBot ? '' : 'flex-row-reverse space-x-reverse'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.isBot ? 'bg-primary' : 'bg-secondary'}`}>
                        {message.isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`rounded-lg p-3 ${message.isBot ? 'bg-accent/10' : 'bg-primary text-white'}`}>
                        <p className="text-sm whitespace-pre-line leading-relaxed">{message.content}</p>
                        <p className={`text-xs mt-1 ${message.isBot ? 'text-muted-foreground' : 'text-white/70'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Quick Responses */}
            {messages.length <= 2 && (
              <div className="p-4 border-t max-h-40 overflow-y-auto">
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  O que posso ajudar:
                </p>
                <div className="space-y-2">
                  {quickResponses.slice(0, 4).map((qr, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-3 text-sm"
                      onClick={() => handleQuickResponse(qr.text)}
                    >
                      {qr.text}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t bg-background">
              <div className="flex space-x-2 items-end">
                <Input
                  placeholder="Digite sua mensagem..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 h-12 text-sm"
                />
                 <Button 
                  onClick={handleSendMessage} 
                  size="sm" 
                  className="h-12 w-12 p-0"
                  disabled={isGeneratingResponse}
                >
                  {isGeneratingResponse ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center flex items-center justify-center gap-1">
                <BookOpen className="w-3 h-3" />
                WhatsApp: (98) 98873-4670 | {isGeneratingResponse ? 'Gerando resposta...' : 'Estudos com IA disponíveis!'}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ChatBot;
