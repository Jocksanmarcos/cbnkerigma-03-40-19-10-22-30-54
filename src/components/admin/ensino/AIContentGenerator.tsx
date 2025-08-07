import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  Route, 
  FileText, 
  Loader2,
  Copy,
  Download,
  Save
} from 'lucide-react';

interface GeneratedContent {
  success: boolean;
  content: any;
  tipo: string;
}

export const AIContentGenerator = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('estudo_biblico');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  // Estados para cada tipo de conteúdo
  const [estudoForm, setEstudoForm] = useState({
    tema: '',
    nivel: 'iniciante',
    duracao: '45',
    detalhes: ''
  });

  const [questoesForm, setQuestoesForm] = useState({
    tema: '',
    nivel: 'iniciante',
    quantidade: '10',
    detalhes: ''
  });

  const [trilhaForm, setTrilhaForm] = useState({
    tema: '',
    nivel: 'iniciante',
    detalhes: ''
  });

  const [resumoForm, setResumoForm] = useState({
    tema: '',
    detalhes: ''
  });

  const generateContent = async (type: string, formData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ensino-content', {
        body: {
          type,
          tema: formData.tema,
          nivel: formData.nivel,
          duracao: formData.duracao || formData.quantidade,
          detalhes: formData.detalhes
        }
      });

      if (error) throw error;

      setGeneratedContent(data);
      toast({
        title: "Conteúdo Gerado!",
        description: "O conteúdo foi gerado com sucesso pela IA",
      });
    } catch (error: any) {
      console.error('Erro na geração:', error);
      toast({
        title: "Erro",
        description: "Falha ao gerar conteúdo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Conteúdo copiado para a área de transferência",
    });
  };

  const downloadAsJSON = (content: any, filename: string) => {
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const renderGeneratedContent = () => {
    if (!generatedContent?.content) return null;

    const content = generatedContent.content;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Conteúdo Gerado
            <Badge variant="secondary">{generatedContent.tipo}</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => copyToClipboard(JSON.stringify(content, null, 2))}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copiar
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => downloadAsJSON(content, `ensino_${generatedContent.tipo}_${Date.now()}`)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {generatedContent.tipo === 'estudo_biblico' && content.titulo && (
              <div>
                <h3 className="text-lg font-semibold">{content.titulo}</h3>
                {content.versiculo_chave && (
                  <p className="text-sm text-muted-foreground italic">{content.versiculo_chave}</p>
                )}
                {content.introducao && (
                  <div className="mt-4">
                    <h4 className="font-medium">Introdução:</h4>
                    <p className="text-sm">{content.introducao}</p>
                  </div>
                )}
                {content.desenvolvimento && (
                  <div className="mt-4">
                    <h4 className="font-medium">Desenvolvimento:</h4>
                    {content.desenvolvimento.map((item: any, index: number) => (
                      <div key={index} className="ml-4 mt-2">
                        <h5 className="font-medium text-sm">{item.subtitulo}</h5>
                        <p className="text-sm text-muted-foreground">{item.conteudo}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {generatedContent.tipo === 'questoes_avaliacao' && content.questoes && (
              <div>
                <h3 className="text-lg font-semibold">Questões de Avaliação</h3>
                {content.questoes.map((questao: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 mt-4">
                    <h4 className="font-medium">{index + 1}. {questao.pergunta}</h4>
                    <Badge variant="outline" className="mt-2">{questao.tipo}</Badge>
                    {questao.opcoes && (
                      <div className="mt-2">
                        {questao.opcoes.map((opcao: string, optIndex: number) => (
                          <p key={optIndex} className="text-sm ml-4">
                            {String.fromCharCode(97 + optIndex)}) {opcao}
                          </p>
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-green-600 mt-2">
                      <strong>Resposta:</strong> {questao.resposta_correta}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {generatedContent.tipo === 'trilha_formacao' && content.nome && (
              <div>
                <h3 className="text-lg font-semibold">{content.nome}</h3>
                <p className="text-sm text-muted-foreground">{content.descricao}</p>
                {content.etapas && (
                  <div className="mt-4">
                    <h4 className="font-medium">Etapas da Trilha:</h4>
                    {content.etapas.map((etapa: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4 mt-2">
                        <h5 className="font-medium">Etapa {etapa.ordem}: {etapa.titulo}</h5>
                        <p className="text-sm text-muted-foreground">{etapa.descricao}</p>
                        <Badge variant="secondary" className="mt-2">{etapa.duracao_estimada}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <pre className="bg-muted p-4 rounded-lg text-xs overflow-auto max-h-96">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Gerador de Conteúdo com IA</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="estudo_biblico" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Estudos
          </TabsTrigger>
          <TabsTrigger value="questoes_avaliacao" className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4" />
            Questões
          </TabsTrigger>
          <TabsTrigger value="trilha_formacao" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Trilhas
          </TabsTrigger>
          <TabsTrigger value="resumo_aula" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Resumos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="estudo_biblico">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Estudo Bíblico</CardTitle>
              <CardDescription>
                Crie estudos bíblicos completos com introdução, desenvolvimento e aplicação prática
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tema-estudo">Tema do Estudo</Label>
                <Input
                  id="tema-estudo"
                  placeholder="Ex: Fé, Amor, Perdão, Esperança..."
                  value={estudoForm.tema}
                  onChange={(e) => setEstudoForm(prev => ({ ...prev, tema: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nivel-estudo">Nível</Label>
                  <Select 
                    value={estudoForm.nivel} 
                    onValueChange={(value) => setEstudoForm(prev => ({ ...prev, nivel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="duracao-estudo">Duração (minutos)</Label>
                  <Input
                    id="duracao-estudo"
                    type="number"
                    value={estudoForm.duracao}
                    onChange={(e) => setEstudoForm(prev => ({ ...prev, duracao: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="detalhes-estudo">Detalhes Adicionais (opcional)</Label>
                <Textarea
                  id="detalhes-estudo"
                  placeholder="Contexto específico, público-alvo, ênfases especiais..."
                  value={estudoForm.detalhes}
                  onChange={(e) => setEstudoForm(prev => ({ ...prev, detalhes: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={() => generateContent('estudo_biblico', estudoForm)}
                disabled={loading || !estudoForm.tema}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                Gerar Estudo Bíblico
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questoes_avaliacao">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Questões de Avaliação</CardTitle>
              <CardDescription>
                Crie questões diversificadas para avaliar o aprendizado dos alunos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tema-questoes">Tema das Questões</Label>
                <Input
                  id="tema-questoes"
                  placeholder="Ex: Parábolas de Jesus, Frutos do Espírito..."
                  value={questoesForm.tema}
                  onChange={(e) => setQuestoesForm(prev => ({ ...prev, tema: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nivel-questoes">Nível</Label>
                  <Select 
                    value={questoesForm.nivel} 
                    onValueChange={(value) => setQuestoesForm(prev => ({ ...prev, nivel: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iniciante">Iniciante</SelectItem>
                      <SelectItem value="intermediario">Intermediário</SelectItem>
                      <SelectItem value="avancado">Avançado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="quantidade-questoes">Quantidade</Label>
                  <Input
                    id="quantidade-questoes"
                    type="number"
                    value={questoesForm.quantidade}
                    onChange={(e) => setQuestoesForm(prev => ({ ...prev, quantidade: e.target.value }))}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="detalhes-questoes">Foco Específico (opcional)</Label>
                <Textarea
                  id="detalhes-questoes"
                  placeholder="Aspectos específicos a serem avaliados..."
                  value={questoesForm.detalhes}
                  onChange={(e) => setQuestoesForm(prev => ({ ...prev, detalhes: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={() => generateContent('questoes_avaliacao', questoesForm)}
                disabled={loading || !questoesForm.tema}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <HelpCircle className="h-4 w-4 mr-2" />}
                Gerar Questões
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trilha_formacao">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Trilha de Formação</CardTitle>
              <CardDescription>
                Crie jornadas de aprendizado estruturadas com múltiplas etapas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tema-trilha">Tema da Trilha</Label>
                <Input
                  id="tema-trilha"
                  placeholder="Ex: Liderança Cristã, Evangelismo, Discipulado..."
                  value={trilhaForm.tema}
                  onChange={(e) => setTrilhaForm(prev => ({ ...prev, tema: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="nivel-trilha">Nível</Label>
                <Select 
                  value={trilhaForm.nivel} 
                  onValueChange={(value) => setTrilhaForm(prev => ({ ...prev, nivel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iniciante">Iniciante</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="detalhes-trilha">Considerações Especiais (opcional)</Label>
                <Textarea
                  id="detalhes-trilha"
                  placeholder="Objetivos específicos, duração desejada, recursos disponíveis..."
                  value={trilhaForm.detalhes}
                  onChange={(e) => setTrilhaForm(prev => ({ ...prev, detalhes: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={() => generateContent('trilha_formacao', trilhaForm)}
                disabled={loading || !trilhaForm.tema}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Route className="h-4 w-4 mr-2" />}
                Gerar Trilha
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resumo_aula">
          <Card>
            <CardHeader>
              <CardTitle>Gerar Resumo de Aula</CardTitle>
              <CardDescription>
                Crie resumos estruturados a partir do conteúdo da aula
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tema-resumo">Tema da Aula</Label>
                <Input
                  id="tema-resumo"
                  placeholder="Ex: A Parábola do Semeador, O Sermão do Monte..."
                  value={resumoForm.tema}
                  onChange={(e) => setResumoForm(prev => ({ ...prev, tema: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="detalhes-resumo">Conteúdo da Aula</Label>
                <Textarea
                  id="detalhes-resumo"
                  placeholder="Cole aqui o conteúdo da aula ou pontos principais abordados..."
                  className="min-h-[120px]"
                  value={resumoForm.detalhes}
                  onChange={(e) => setResumoForm(prev => ({ ...prev, detalhes: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={() => generateContent('resumo_aula', resumoForm)}
                disabled={loading || !resumoForm.tema}
                className="w-full"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                Gerar Resumo
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {renderGeneratedContent()}
    </div>
  );
};