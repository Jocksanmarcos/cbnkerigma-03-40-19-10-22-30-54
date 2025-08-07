import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, 
  Search, 
  FileText, 
  MessageCircle, 
  Wand2,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  Eye,
  Target,
  Sparkles
} from 'lucide-react';

export const AIMaintenanceTools = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [seoAnalysis, setSeoAnalysis] = useState('');
  const [metaUrl, setMetaUrl] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [optimizationResult, setOptimizationResult] = useState<any>(null);
  const { toast } = useToast();

  const seoSuggestions = [
    {
      page: '/sobre',
      issue: 'Meta description muito curta',
      suggestion: 'Adicionar descrição mais detalhada com palavras-chave principais',
      priority: 'alta',
      automated: true
    },
    {
      page: '/eventos',
      issue: 'Título H1 não otimizado',
      suggestion: 'Incluir palavras-chave "eventos CBN Kerigma" no título',
      priority: 'média',
      automated: true
    },
    {
      page: '/galeria',
      issue: 'Imagens sem alt text',
      suggestion: 'Gerar automaticamente alt text descritivo para 15 imagens',
      priority: 'baixa',
      automated: true
    },
  ];

  const contentSuggestions = [
    {
      type: 'Blog Post',
      title: 'O Poder da Oração em Tempos Difíceis',
      description: 'Artigo inspiracional sobre como a oração pode transformar vidas',
      keywords: ['oração', 'fé', 'esperança', 'transformação'],
      status: 'sugerido'
    },
    {
      type: 'Evento',
      title: 'Noite de Louvor e Adoração',
      description: 'Evento especial de música e adoração para jovens',
      keywords: ['louvor', 'adoração', 'jovens', 'música'],
      status: 'em_andamento'
    },
  ];

  const chatbotSettings = {
    active: true,
    responseTime: '< 2 segundos',
    accuracy: '94%',
    conversations: 247,
    satisfaction: '4.8/5'
  };

  const handleGenerateContent = async (type: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    const interval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          return prev; // Para em 90% e espera a conclusão real
        }
        return prev + 10;
      });
    }, 200);

    // Para o progresso após 3 segundos
    setTimeout(() => {
      clearInterval(interval);
      setGenerationProgress(100);
      setIsGenerating(false);
    }, 3000);
  };

  const handleSEOOptimization = async (page: string) => {
    setIsGenerating(true);
    setGenerationProgress(0);
    
    try {
      console.log('Iniciando otimização SEO para:', page);
      
      const optimizationType = page === '/sobre' ? 'meta-description' : 
                             page === '/eventos' ? 'title-optimization' : 'alt-text';
      
      const payload = {
        page,
        type: optimizationType,
        keywords: page === '/eventos' ? 'eventos CBN Kerigma, programação igreja' : 
                 page === '/sobre' ? 'igreja evangélica, CBN Kerigma, história' : 
                 'galeria fotos, igreja, eventos'
      };
      
      console.log('Payload enviado:', payload);
                             
      const { data, error } = await supabase.functions.invoke('seo-optimization', {
        body: payload
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro detalhado:', error);
        throw error;
      }

      setOptimizationResult(data);
      toast({
        title: "Otimização SEO Concluída",
        description: `SEO da página ${page} foi otimizado com sucesso!`,
      });
      
    } catch (error) {
      console.error('Erro na otimização:', error);
      toast({
        title: "Erro na Otimização",
        description: "Não foi possível otimizar o SEO. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  const handleGenerateMetaTags = async () => {
    if (!metaUrl.trim()) {
      toast({
        title: "URL Obrigatória",
        description: "Por favor, insira uma URL válida.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('seo-optimization', {
        body: {
          page: metaUrl,
          type: 'meta-tags',
          keywords: metaKeywords
        }
      });

      if (error) throw error;

      setOptimizationResult(data);
      toast({
        title: "Meta-tags Geradas",
        description: "Meta-tags foram geradas com sucesso!",
      });

    } catch (error) {
      console.error('Erro na geração:', error);
      toast({
        title: "Erro na Geração",
        description: "Não foi possível gerar as meta-tags. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  const handleContentAnalysis = async () => {
    if (!seoAnalysis.trim()) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      const { data, error } = await supabase.functions.invoke('seo-optimization', {
        body: {
          page: 'análise',
          type: 'content-analysis',
          content: seoAnalysis
        }
      });

      if (error) throw error;

      setOptimizationResult(data);
      toast({
        title: "Análise Concluída",
        description: "Conteúdo analisado com sucesso!",
      });

    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na Análise",
        description: "Não foi possível analisar o conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setGenerationProgress(100);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800';
      case 'média': return 'bg-yellow-100 text-yellow-800';
      case 'baixa': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IA para Manutenção</h2>
          <p className="text-muted-foreground">
            Ferramentas inteligentes para otimização e manutenção automatizada
          </p>
        </div>
      </div>

      <Tabs defaultValue="seo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="seo">Otimização SEO</TabsTrigger>
          <TabsTrigger value="content">Gerador de Conteúdo</TabsTrigger>
          <TabsTrigger value="analysis">Análise de Conteúdo</TabsTrigger>
          <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
        </TabsList>

        <TabsContent value="seo">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Otimização Automática de SEO
                </CardTitle>
                <CardDescription>
                  IA analisa e otimiza automaticamente o SEO das páginas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {seoSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{suggestion.page}</span>
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.issue}
                      </p>
                      <p className="text-sm">{suggestion.suggestion}</p>
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleSEOOptimization(suggestion.page)}
                        >
                          <Wand2 className="h-4 w-4 mr-2" />
                          Otimizar Automaticamente
                        </Button>
                        {suggestion.automated && (
                          <Badge variant="outline">
                            <Sparkles className="h-3 w-3 mr-1" />
                            IA Disponível
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Gerador de Meta-tags</CardTitle>
                <CardDescription>
                  Crie meta-tags otimizadas automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">URL da Página</label>
                    <Input 
                      placeholder="https://site.com/pagina" 
                      value={metaUrl}
                      onChange={(e) => setMetaUrl(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Palavras-chave (opcional)</label>
                    <Input 
                      placeholder="palavra1, palavra2, palavra3" 
                      value={metaKeywords}
                      onChange={(e) => setMetaKeywords(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={handleGenerateMetaTags}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    <Brain className="h-4 w-4 mr-2" />
                    Gerar Meta-tags com IA
                  </Button>
                  
                  {isGenerating && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">Analisando conteúdo...</span>
                      </div>
                      <Progress value={generationProgress} />
                    </div>
                  )}

                  {optimizationResult && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-800 mb-2">Resultado da Otimização</h4>
                      <div className="text-sm text-green-700">
                        <p><strong>Página:</strong> {optimizationResult.page}</p>
                        <p><strong>Tipo:</strong> {optimizationResult.type}</p>
                        <p><strong>Confiança:</strong> {optimizationResult.confidence}%</p>
                        <div className="mt-2">
                          <strong>Sugestão:</strong>
                          <p className="whitespace-pre-wrap">{optimizationResult.suggestion}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Gerador de Conteúdo IA
                </CardTitle>
                <CardDescription>
                  Crie conteúdo otimizado para o site automaticamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => handleGenerateContent('blog')}
                      disabled={isGenerating}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Post Blog
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleGenerateContent('evento')}
                      disabled={isGenerating}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Evento
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleGenerateContent('estudo')}
                      disabled={isGenerating}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Estudo Bíblico
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => handleGenerateContent('newsletter')}
                      disabled={isGenerating}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Newsletter
                    </Button>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tema ou Tópico</label>
                    <Input placeholder="Ex: A importância da gratidão" />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Público-alvo</label>
                    <Input placeholder="Ex: Jovens, Famílias, Todos" />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Tom do conteúdo</label>
                    <Input placeholder="Ex: Inspiracional, Educativo, Casual" />
                  </div>

                  <Button 
                    onClick={() => handleGenerateContent('custom')}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Gerar Conteúdo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sugestões de Conteúdo</CardTitle>
                <CardDescription>
                  Ideias geradas pela IA baseadas no comportamento dos usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {contentSuggestions.map((suggestion, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{suggestion.type}</Badge>
                        <Badge className={suggestion.status === 'sugerido' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                          {suggestion.status === 'sugerido' ? 'Sugerido' : 'Em Andamento'}
                        </Badge>
                      </div>
                      <h4 className="font-medium">{suggestion.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.keywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                      <Button size="sm" variant="outline" className="w-full">
                        <Wand2 className="h-4 w-4 mr-2" />
                        Gerar Conteúdo
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Análise de Conteúdo
              </CardTitle>
              <CardDescription>
                IA analisa o conteúdo existente e sugere melhorias
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Cole o texto para análise</label>
                  <Textarea 
                    placeholder="Cole aqui o conteúdo que deseja analisar..."
                    value={seoAnalysis}
                    onChange={(e) => setSeoAnalysis(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <Button 
                  onClick={handleContentAnalysis}
                  disabled={isGenerating || !seoAnalysis.trim()}
                  className="w-full"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Analisar com IA
                </Button>

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4 animate-pulse" />
                      <span className="text-sm">Analisando conteúdo...</span>
                    </div>
                    <Progress value={generationProgress} />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="font-medium">Score SEO</p>
                      <p className="text-2xl font-bold">87/100</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Eye className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-medium">Legibilidade</p>
                      <p className="text-2xl font-bold">Boa</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="font-medium">Palavras-chave</p>
                      <p className="text-2xl font-bold">12</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatbot">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Chatbot Inteligente
                </CardTitle>
                <CardDescription>
                  IA conversacional para atendimento aos visitantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <p className="font-medium">Status</p>
                      <p className="text-sm text-green-600">Ativo</p>
                    </div>
                    
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <p className="font-medium">Tempo Resposta</p>
                      <p className="text-sm text-blue-600">{chatbotSettings.responseTime}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <p className="font-medium">Precisão</p>
                      <p className="text-sm text-purple-600">{chatbotSettings.accuracy}</p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <Star className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                      <p className="font-medium">Satisfação</p>
                      <p className="text-sm text-orange-600">{chatbotSettings.satisfaction}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button variant="outline" className="w-full">
                      Treinar IA com Novo Conteúdo
                    </Button>
                    <Button variant="outline" className="w-full">
                      Ver Conversas Recentes
                    </Button>
                    <Button variant="outline" className="w-full">
                      Configurar Respostas Automáticas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Chatbot</CardTitle>
                <CardDescription>
                  Performance e métricas de uso do chatbot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Conversas este mês</span>
                    <span className="font-medium">{chatbotSettings.conversations}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Respostas automáticas</span>
                    <span className="font-medium">89%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Transferências para humano</span>
                    <span className="font-medium">11%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm">Tempo médio de conversa</span>
                    <span className="font-medium">3m 42s</span>
                  </div>

                  <Button className="w-full">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Ver Relatório Completo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};