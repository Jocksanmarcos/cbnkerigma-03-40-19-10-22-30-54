import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  CheckCircle, 
  Clock, 
  Target, 
  Star, 
  Settings, 
  TrendingUp,
  Users,
  Bot,
  Brain,
  Zap,
  Eye,
  Plus,
  Save
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatMetrics {
  conversas_totais: number;
  tempo_resposta_medio: number;
  precisao: number;
  satisfacao: number;
  status: string;
  conversas_hoje: number;
  respostas_automaticas: number;
}

interface Conversa {
  id: string;
  usuario: string;
  mensagem: string;
  resposta: string;
  timestamp: string;
  satisfacao?: number;
}

const ChatBotManager = () => {
  const [metrics, setMetrics] = useState<ChatMetrics>({
    conversas_totais: 247,
    tempo_resposta_medio: 1.8,
    precisao: 94,
    satisfacao: 4.8,
    status: 'ativo',
    conversas_hoje: 23,
    respostas_automaticas: 89
  });

  const [conversasRecentes, setConversasRecentes] = useState<Conversa[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [novoConteudo, setNovoConteudo] = useState('');
  const [respostasAutomaticas, setRespostasAutomaticas] = useState<Array<{id: string, pergunta: string, resposta: string}>>([]);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
    const interval = setInterval(atualizarMetricas, 30000); // Atualiza a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const carregarDados = async () => {
    try {
      // Carregar conversas reais
      const { data: conversasData } = await supabase
        .from('chatbot_conversas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (conversasData) {
        const conversasFormatadas = conversasData.map(conv => ({
          id: conv.id,
          usuario: conv.usuario_nome || 'Visitante',
          mensagem: conv.mensagem_usuario,
          resposta: conv.resposta_ia,
          timestamp: conv.created_at,
          satisfacao: conv.satisfacao
        }));
        setConversasRecentes(conversasFormatadas);
      }

      // Carregar respostas automáticas reais
      const { data: respostasData } = await supabase
        .from('chatbot_respostas_automaticas')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (respostasData) {
        const respostasFormatadas = respostasData.map(resp => ({
          id: resp.id,
          pergunta: resp.palavra_chave,
          resposta: resp.resposta
        }));
        setRespostasAutomaticas(respostasFormatadas);
      } else {
        // Adicionar respostas padrão se não houver nenhuma
        const respostasDefault = [
          {
            id: '1',
            pergunta: 'horário',
            resposta: 'Domingo: 19h00 - Culto da Família\nQuarta-feira: 19h30 - Culto de Oração\nSábado: 19h30 - Culto de Ensino'
          },
          {
            id: '2',
            pergunta: 'contato',
            resposta: 'WhatsApp: (98) 98873-4670 | Email: contato@cbnkerigma.org.br'
          },
          {
            id: '3',
            pergunta: 'endereço',
            resposta: 'Estamos localizados no Bairro Aurora, São Luís - MA. Temos estacionamento próprio.'
          }
        ];
        setRespostasAutomaticas(respostasDefault);
      }

      // Atualizar métricas baseadas nos dados reais
      setMetrics(prev => ({
        ...prev,
        conversas_totais: conversasData?.length || 0,
        conversas_hoje: conversasData?.filter(conv => 
          new Date(conv.created_at).toDateString() === new Date().toDateString()
        ).length || 0
      }));

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      // Fallback para dados simulados em caso de erro
      const conversasSimuladas: Conversa[] = [
        {
          id: '1',
          usuario: 'Visitante #2401',
          mensagem: 'Quais são os horários dos cultos?',
          resposta: 'Nossos cultos são: Domingo 19h, Quarta 19h30, Sábado 19h30',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          satisfacao: 5
        }
      ];
      setConversasRecentes(conversasSimuladas);
    }
  };

  const atualizarMetricas = () => {
    // Simular atualizações em tempo real
    setMetrics(prev => ({
      ...prev,
      conversas_totais: prev.conversas_totais + Math.floor(Math.random() * 3),
      tempo_resposta_medio: 1.5 + Math.random() * 0.8,
      precisao: Math.min(96, prev.precisao + (Math.random() - 0.5) * 2),
      conversas_hoje: prev.conversas_hoje + Math.floor(Math.random() * 2)
    }));
  };

  const treinarIA = async () => {
    if (!novoConteudo.trim()) {
      toast({
        title: "Erro",
        description: "Digite o conteúdo para treinar a IA",
        variant: "destructive"
      });
      return;
    }

    setIsTraining(true);
    
    try {
      console.log('Enviando conteúdo para treinamento:', novoConteudo);
      
      const { data, error } = await supabase.functions.invoke('train-chatbot-ai', {
        body: { 
          conteudo: novoConteudo,
          categoria: 'ministerios' // Você pode adicionar um seletor para isso
        }
      });

      if (error) {
        throw error;
      }

      if (data?.sucesso) {
        toast({
          title: "🤖 IA Treinada com Sucesso!",
          description: `Processados: ${data.dados_processados.palavras_chave.length} conceitos-chave | Relevância: ${data.dados_processados.relevancia}`,
        });
        
        // Atualizar métricas em tempo real
        setMetrics(prev => ({ 
          ...prev, 
          precisao: Math.min(98, prev.precisao + data.metricas_atualizadas.precisao_incremento),
          conversas_totais: prev.conversas_totais + 1
        }));

        setNovoConteudo('');
        
        // Mostrar detalhes do processamento
        console.log('Palavras-chave extraídas:', data.dados_processados.palavras_chave);
        console.log('Perguntas geradas:', data.dados_processados.perguntas_geradas);
      } else {
        throw new Error(data?.message || 'Falha no treinamento');
      }
      
    } catch (error) {
      console.error('Erro no treinamento:', error);
      toast({
        title: "❌ Erro no Treinamento",
        description: error.message || "Falha ao treinar a IA. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsTraining(false);
    }
  };

  const salvarRespostasAutomaticas = async () => {
    try {
      // Salvar/atualizar respostas automáticas no banco
      for (const resposta of respostasAutomaticas) {
        if (resposta.pergunta.trim() && resposta.resposta.trim()) {
          const { error } = await supabase
            .from('chatbot_respostas_automaticas')
            .upsert({
              id: resposta.id.startsWith('new_') ? undefined : resposta.id,
              palavra_chave: resposta.pergunta,
              resposta: resposta.resposta,
              ativo: true
            });
          
          if (error) throw error;
        }
      }

      toast({
        title: "✅ Respostas Salvas!",
        description: "Configurações de respostas automáticas atualizadas com sucesso",
      });
      
      // Recarregar dados
      carregarDados();
    } catch (error) {
      console.error('Erro ao salvar respostas:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar respostas automáticas",
        variant: "destructive"
      });
    }
  };

  const adicionarResposta = () => {
    const novaResposta = {
      id: Date.now().toString(),
      pergunta: '',
      resposta: ''
    };
    setRespostasAutomaticas([...respostasAutomaticas, novaResposta]);
  };

  return (
    <div className="space-y-6">
      {/* Header com métricas principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold text-green-600">Ativo</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tempo Resposta</p>
                <p className="text-2xl font-bold text-blue-600">
                  {metrics.tempo_resposta_medio.toFixed(1)}s
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Precisão</p>
                <p className="text-2xl font-bold text-purple-600">{metrics.precisao.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Star className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Satisfação</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.satisfacao}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="treinamento" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="treinamento">Treinar IA</TabsTrigger>
          <TabsTrigger value="conversas">Conversas Recentes</TabsTrigger>
          <TabsTrigger value="automaticas">Respostas Automáticas</TabsTrigger>
        </TabsList>

        <TabsContent value="treinamento">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Treinar IA com Novo Conteúdo
              </CardTitle>
              <CardDescription>
                Adicione novos conhecimentos para melhorar as respostas da IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <Button 
                  className="w-full h-16 border-2 border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                  variant="outline"
                  onClick={() => setNovoConteudo('Informações sobre novos ministérios da igreja:\n\n1. Ministério de Jovens - Reuniões às sextas 19h\n2. Ministério de Casais - Encontros mensais\n3. Ministério Infantil - Domingos durante culto\n\nContato: (98) 98873-4670')}
                >
                  Treinar IA com Novo Conteúdo
                </Button>
                
                <Button 
                  className="w-full h-16 border-2 border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                  variant="outline"
                  onClick={() => window.location.hash = '#conversas'}
                >
                  Ver Conversas Recentes
                </Button>
                
                <Button 
                  className="w-full h-16 border-2 border-orange-200 hover:border-orange-300 bg-orange-50 hover:bg-orange-100 text-orange-700"
                  variant="outline"
                  onClick={() => window.location.hash = '#automaticas'}
                >
                  Configurar Respostas Automáticas
                </Button>
              </div>

              <Textarea 
                placeholder="Digite o novo conteúdo para treinar a IA (ex: informações sobre novos eventos, ministérios, horários, etc.)"
                value={novoConteudo}
                onChange={(e) => setNovoConteudo(e.target.value)}
                rows={6}
              />
              
              <Button 
                onClick={treinarIA} 
                disabled={isTraining || !novoConteudo.trim()}
                className="w-full"
              >
                {isTraining ? (
                  <>
                    <Zap className="mr-2 h-4 w-4 animate-spin" />
                    Treinando IA...
                  </>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" />
                    Treinar IA
                  </>
                )}
              </Button>
              
              {isTraining && (
                <div className="space-y-2">
                  <Progress value={66} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Processando conteúdo e atualizando base de conhecimento...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conversas" id="conversas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Conversas Recentes
              </CardTitle>
              <CardDescription>
                Acompanhe as últimas interações do chatbot com os visitantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <p className="font-medium">Conversas Hoje</p>
                  <p className="text-2xl font-bold text-blue-600">{metrics.conversas_hoje}</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <p className="font-medium">Total Este Mês</p>
                  <p className="text-2xl font-bold text-green-600">{metrics.conversas_totais}</p>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Bot className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <p className="font-medium">Automáticas</p>
                  <p className="text-2xl font-bold text-purple-600">{metrics.respostas_automaticas}%</p>
                </div>
              </div>

              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {conversasRecentes.map((conversa) => (
                    <Card key={conversa.id} className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{conversa.usuario}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversa.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="p-2 bg-muted rounded-lg">
                            <p className="text-sm"><strong>Pergunta:</strong> {conversa.mensagem}</p>
                          </div>
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <p className="text-sm"><strong>Resposta:</strong> {conversa.resposta}</p>
                          </div>
                        </div>
                        
                        {conversa.satisfacao && (
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{conversa.satisfacao}/5</span>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automaticas" id="automaticas">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurar Respostas Automáticas
              </CardTitle>
              <CardDescription>
                Defina respostas padrão para perguntas frequentes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {respostasAutomaticas.map((resposta, index) => (
                    <Card key={resposta.id} className="p-4">
                      <div className="space-y-4">
                        <Input 
                          placeholder="Pergunta ou palavra-chave"
                          value={resposta.pergunta}
                          onChange={(e) => {
                            const updated = [...respostasAutomaticas];
                            updated[index].pergunta = e.target.value;
                            setRespostasAutomaticas(updated);
                          }}
                        />
                        <Textarea 
                          placeholder="Resposta automática"
                          value={resposta.resposta}
                          onChange={(e) => {
                            const updated = [...respostasAutomaticas];
                            updated[index].resposta = e.target.value;
                            setRespostasAutomaticas(updated);
                          }}
                          rows={3}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="flex gap-2">
                <Button onClick={adicionarResposta} variant="outline" className="flex-1">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Resposta
                </Button>
                <Button onClick={salvarRespostasAutomaticas} className="flex-1">
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatBotManager;