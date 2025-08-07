import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Bot, 
  MessageCircle, 
  Send, 
  Phone, 
  Users, 
  Heart,
  TrendingUp,
  Calendar,
  BookOpen
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Mensagem {
  id: string;
  tipo: 'usuario' | 'assistente';
  conteudo: string;
  timestamp: Date;
  categoria?: 'doutrina' | 'oracao' | 'evento' | 'geral';
}

interface AnalyticsIA {
  totalConversas: number;
  tempoResposta: number;
  categoriasMaisConsultadas: Array<{
    categoria: string;
    total: number;
  }>;
  satisfacaoMedia: number;
}

const AssistentePastoral = () => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [novaMensagem, setNovaMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsIA>({
    totalConversas: 0,
    tempoResposta: 0,
    categoriasMaisConsultadas: [],
    satisfacaoMedia: 0
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    carregarAnalytics();
    carregarHistoricoRecente();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mensagens]);

  const carregarAnalytics = async () => {
    try {
      const { data: conversas, error } = await supabase
        .from('chat_pastoral')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(100);

      if (error) throw error;

      if (conversas) {
        // Calcular analytics
        const totalConversas = conversas.length;
        const categoriaCount = conversas.reduce((acc, conv) => {
          const contexto = conv.contexto as any;
          const categoria = contexto?.categoria || 'geral';
          acc[categoria] = (acc[categoria] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const categoriasMaisConsultadas = Object.entries(categoriaCount)
          .map(([categoria, total]) => ({ categoria, total }))
          .sort((a, b) => b.total - a.total);

        setAnalytics({
          totalConversas,
          tempoResposta: 1.2, // Mock por enquanto
          categoriasMaisConsultadas,
          satisfacaoMedia: 4.3 // Mock por enquanto
        });
      }
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    }
  };

  const carregarHistoricoRecente = async () => {
    try {
      const { data: conversas, error } = await supabase
        .from('chat_pastoral')
        .select('*')
        .order('criado_em', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (conversas) {
        const mensagensCarregadas: Mensagem[] = [];
        conversas.forEach((conv) => {
          const contexto = conv.contexto as any;
          mensagensCarregadas.push({
            id: `${conv.id}-user`,
            tipo: 'usuario',
            conteudo: conv.mensagem_usuario,
            timestamp: new Date(conv.criado_em),
            categoria: contexto?.categoria
          });
          mensagensCarregadas.push({
            id: `${conv.id}-bot`,
            tipo: 'assistente',
            conteudo: conv.resposta_ia,
            timestamp: new Date(conv.criado_em),
            categoria: contexto?.categoria
          });
        });
        setMensagens(mensagensCarregadas.reverse());
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const enviarMensagem = async () => {
    if (!novaMensagem.trim()) return;

    const mensagemUsuario: Mensagem = {
      id: Date.now().toString(),
      tipo: 'usuario',
      conteudo: novaMensagem,
      timestamp: new Date()
    };

    setMensagens(prev => [...prev, mensagemUsuario]);
    setCarregando(true);
    
    const conteudoOriginal = novaMensagem;
    setNovaMensagem('');

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-response', {
        body: { 
          message: conteudoOriginal,
          context: {
            tipo: 'assistente_pastoral',
            igreja: 'CBN Kerigma'
          }
        }
      });

      if (error) throw error;

      const mensagemAssistente: Mensagem = {
        id: (Date.now() + 1).toString(),
        tipo: 'assistente',
        conteudo: data.response,
        timestamp: new Date(),
        categoria: data.categoria
      };

      setMensagens(prev => [...prev, mensagemAssistente]);
      carregarAnalytics(); // Atualizar analytics

      toast({
        title: "Resposta gerada",
        description: "O assistente pastoral respondeu sua pergunta."
      });

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Conversas</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalConversas}</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Resposta</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.tempoResposta}s</div>
            <p className="text-xs text-muted-foreground">
              Média de resposta
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.satisfacaoMedia}/5</div>
            <p className="text-xs text-muted-foreground">
              Avaliação dos usuários
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atendimentos</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/7</div>
            <p className="text-xs text-muted-foreground">
              Disponibilidade
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">
            <Bot className="w-4 h-4 mr-2" />
            Chat Pastoral
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="configuracoes">
            <BookOpen className="w-4 h-4 mr-2" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Assistente Pastoral Inteligente
              </CardTitle>
              <CardDescription>
                Chat com IA especializada em questões pastorais, doutrina e aconselhamento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[600px]">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {mensagens.length === 0 && (
                      <div className="text-center text-muted-foreground py-8">
                        <Bot className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Olá! Sou o assistente pastoral da CBN Kerigma.</p>
                        <p>Como posso ajudá-lo hoje?</p>
                      </div>
                    )}
                    
                    {mensagens.map((mensagem) => (
                      <div
                        key={mensagem.id}
                        className={`flex ${mensagem.tipo === 'usuario' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            mensagem.tipo === 'usuario'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{mensagem.conteudo}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs opacity-70">
                              {mensagem.timestamp.toLocaleTimeString()}
                            </span>
                            {mensagem.categoria && (
                              <Badge variant="outline" className="text-xs">
                                {mensagem.categoria}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {carregando && (
                      <div className="flex justify-start">
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            <span className="text-sm">Assistente está digitando...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>
                
                <div className="flex gap-2 pt-4 border-t">
                  <Input
                    placeholder="Digite sua pergunta pastoral..."
                    value={novaMensagem}
                    onChange={(e) => setNovaMensagem(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={carregando}
                  />
                  <Button 
                    onClick={enviarMensagem} 
                    disabled={carregando || !novaMensagem.trim()}
                    size="icon"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Categorias Mais Consultadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.categoriasMaisConsultadas.slice(0, 5).map((item, index) => (
                    <div key={item.categoria} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-primary' :
                          index === 1 ? 'bg-secondary' :
                          index === 2 ? 'bg-accent' : 'bg-muted'
                        }`} />
                        <span className="capitalize">{item.categoria}</span>
                      </div>
                      <Badge variant="outline">{item.total}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horários de Maior Uso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { periodo: '06:00 - 12:00', uso: 45, label: 'Manhã' },
                    { periodo: '12:00 - 18:00', uso: 65, label: 'Tarde' },
                    { periodo: '18:00 - 00:00', uso: 80, label: 'Noite' },
                    { periodo: '00:00 - 06:00', uso: 15, label: 'Madrugada' }
                  ].map((item) => (
                    <div key={item.periodo} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{item.label}</span>
                        <span>{item.uso}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${item.uso}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Assistente</CardTitle>
              <CardDescription>
                Personalize o comportamento e conhecimento do assistente pastoral.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Personalidade do Assistente</label>
                <p className="text-sm text-muted-foreground">
                  Compassivo, sábio, baseado nas Escrituras, acolhedor e respeitoso.
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Áreas de Conhecimento</label>
                <div className="flex flex-wrap gap-2">
                  {['Doutrina', 'Aconselhamento', 'Eventos', 'Procedimentos', 'Oração'].map((area) => (
                    <Badge key={area} variant="secondary">{area}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Integração WhatsApp</label>
                <p className="text-sm text-muted-foreground">
                  Status: Configurado ✅ | Webhook ativo para atendimento 24/7
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssistentePastoral;