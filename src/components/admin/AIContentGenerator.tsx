import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Copy, 
  Download, 
  FileText,
  MessageSquare,
  Calendar,
  BookOpen,
  Users,
  Mail,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedContent {
  id: string;
  type: 'post-blog' | 'evento' | 'estudo-biblico' | 'newsletter';
  title: string;
  content: any;
  tema: string;
  publicoAlvo: string;
  tomConteudo: string;
  createdAt: Date;
}

const contentTypes = [
  { value: 'post-blog', label: 'Post Blog', icon: FileText, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { value: 'evento', label: 'Evento', icon: Calendar, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { value: 'estudo-biblico', label: 'Estudo Bíblico', icon: BookOpen, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' },
  { value: 'newsletter', label: 'Newsletter', icon: Mail, color: 'bg-yellow-100 border-yellow-300 text-yellow-800' }
];

const publicoOptions = [
  'Jovens',
  'Famílias', 
  'Todos',
  'Idosos',
  'Casais',
  'Solteiros',
  'Crianças',
  'Adolescentes'
];

const tomOptions = [
  'Inspiracional',
  'Educativo',
  'Casual',
  'Formal',
  'Motivacional',
  'Reflexivo'
];


export const AIContentGenerator = () => {
  const [selectedType, setSelectedType] = useState<string>('');
  const [tema, setTema] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [tomConteudo, setTomConteudo] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState('generator');

  const generateContent = async () => {
    if (!selectedType || !tema || !publicoAlvo || !tomConteudo) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para gerar conteúdo",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      let result;
      
      if (selectedType === 'estudo-biblico') {
        // Usar a função específica para estudos bíblicos
        const { data, error } = await supabase.functions.invoke('generate-biblical-study', {
          body: {
            tema,
            publico_alvo: publicoAlvo,
            nivel_dificuldade: tomConteudo.toLowerCase(),
            duracao_minutos: 45,
            contexto: {
              igreja: 'CBN Kerigma',
              linha_teologica: 'evangélica reformada'
            }
          }
        });
        
        if (error) throw error;
        result = data;
      } else {
        // Usar a função geral para outros tipos
        const { data, error } = await supabase.functions.invoke('generate-ensino-content', {
          body: {
            type: selectedType.replace('-', '_'),
            tema,
            nivel: tomConteudo.toLowerCase(),
            duracao: 30,
            detalhes: `Público-alvo: ${publicoAlvo}. Tom: ${tomConteudo}.`
          }
        });
        
        if (error) throw error;
        result = data;
      }
      
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type: selectedType as GeneratedContent['type'],
        title: tema,
        content: result.content || result.estudo,
        tema,
        publicoAlvo,
        tomConteudo,
        createdAt: new Date()
      };
      
      setGeneratedContent(prev => [newContent, ...prev]);
      setActiveTab('history');
      
      toast({
        title: "Conteúdo Gerado!",
        description: "Seu conteúdo foi criado com sucesso pela IA"
      });
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      toast({
        title: "Erro ao gerar conteúdo",
        description: "Tente novamente em alguns instantes",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatContent = (content: any): string => {
    if (typeof content === 'string') return content;
    
    if (content?.titulo) {
      // Formato de estudo bíblico
      let formatted = `# ${content.titulo}\n\n`;
      
      if (content.versiculo_chave) {
        formatted += `**Versículo Chave:** ${content.versiculo_chave}\n\n`;
      }
      
      if (content.introducao) {
        formatted += `## Introdução\n${content.introducao}\n\n`;
      }
      
      if (content.desenvolvimento && Array.isArray(content.desenvolvimento)) {
        formatted += `## Desenvolvimento\n\n`;
        content.desenvolvimento.forEach((item: any, index: number) => {
          formatted += `### ${index + 1}. ${item.subtitulo}\n`;
          formatted += `${item.conteudo}\n\n`;
          if (item.versiculos && item.versiculos.length > 0) {
            formatted += `**Versículos:** ${item.versiculos.join(', ')}\n\n`;
          }
        });
      }
      
      if (content.aplicacao_pratica) {
        formatted += `## Aplicação Prática\n${content.aplicacao_pratica}\n\n`;
      }
      
      if (content.perguntas_reflexao && Array.isArray(content.perguntas_reflexao)) {
        formatted += `## Perguntas para Reflexão\n`;
        content.perguntas_reflexao.forEach((pergunta: string, index: number) => {
          formatted += `${index + 1}. ${pergunta}\n`;
        });
        formatted += '\n';
      }
      
      if (content.oracao_final) {
        formatted += `## Oração Final\n${content.oracao_final}\n\n`;
      }
      
      return formatted;
    }
    
    return JSON.stringify(content, null, 2);
  };

  const copyContent = (content: any) => {
    const formatted = formatContent(content);
    navigator.clipboard.writeText(formatted);
    toast({
      title: "Conteúdo Copiado!",
      description: "O conteúdo foi copiado para a área de transferência"
    });
  };

  const downloadContent = (content: GeneratedContent) => {
    const formatted = formatContent(content.content);
    const element = document.createElement('a');
    const file = new Blob([formatted], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `${content.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download Iniciado!",
      description: "O arquivo está sendo baixado"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <Sparkles className="w-6 h-6 mr-2 text-primary" />
            Gerador de Conteúdo IA
          </h2>
          <p className="text-muted-foreground">
            Crie sermões, estudos e conteúdo para redes sociais com inteligência artificial
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generator">
            <Sparkles className="w-4 h-4 mr-2" />
            Gerador
          </TabsTrigger>
          <TabsTrigger value="history">
            <FileText className="w-4 h-4 mr-2" />
            Histórico ({generatedContent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle>Gerador de Conteúdo IA</CardTitle>
              </div>
              <p className="text-sm text-muted-foreground">
                Crie conteúdo otimizado para o site automaticamente
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipos de Conteúdo */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {contentTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      onClick={() => setSelectedType(type.value)}
                      className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                        selectedType === type.value 
                          ? type.color + ' border-current'
                          : 'border-border hover:border-primary/20'
                      }`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2" />
                      <div className="text-sm font-medium">{type.label}</div>
                    </button>
                  );
                })}
              </div>

              {selectedType && (
                <>
                  {/* Tema ou Tópico */}
                  <div>
                    <Label htmlFor="tema">Tema ou Tópico</Label>
                    <Input
                      id="tema"
                      value={tema}
                      onChange={(e) => setTema(e.target.value)}
                      placeholder="Ex: A importância da gratidão"
                      className="mt-1"
                    />
                  </div>

                  {/* Público-alvo */}
                  <div>
                    <Label>Público-alvo</Label>
                    <Select value={publicoAlvo} onValueChange={setPublicoAlvo}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Ex: Jovens, Famílias, Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        {publicoOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Tom do conteúdo */}
                  <div>
                    <Label>Tom do conteúdo</Label>
                    <Select value={tomConteudo} onValueChange={setTomConteudo}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Ex: Inspiracional, Educativo, Casual" />
                      </SelectTrigger>
                      <SelectContent>
                        {tomOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Botão Gerar */}
                  <Button
                    onClick={generateContent}
                    disabled={!selectedType || !tema || !publicoAlvo || !tomConteudo || isGenerating}
                    className="w-full"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Gerando Conteúdo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Conteúdo com IA
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {generatedContent.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum conteúdo gerado ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Use o gerador para criar seu primeiro conteúdo com IA
                </p>
                <Button onClick={() => setActiveTab('generator')}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Começar a Gerar
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {generatedContent.map((content) => {
                const typeConfig = contentTypes.find(t => t.value === content.type);
                const Icon = typeConfig?.icon || FileText;
                
                return (
                  <Card key={content.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{content.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <Badge variant="secondary">{typeConfig?.label}</Badge>
                              <Badge variant="outline">👥 {content.publicoAlvo}</Badge>
                              <Badge variant="outline">🎯 {content.tomConteudo}</Badge>
                              <span className="text-sm text-muted-foreground">
                                {content.createdAt.toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyContent(content.content)}
                            title="Copiar conteúdo"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadContent(content)}
                            title="Baixar arquivo"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg max-h-96 overflow-y-auto">
                        <div className="text-sm whitespace-pre-wrap">
                          {formatContent(content.content)}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div><strong>Tema:</strong> {content.tema}</div>
                        <div><strong>Público:</strong> {content.publicoAlvo}</div>
                        <div><strong>Tom:</strong> {content.tomConteudo}</div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};