import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Download, 
  Send, 
  Sparkles, 
  FileText,
  Users,
  Clock,
  Target,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EstudoGerado {
  titulo: string;
  tema: string;
  versiculo_chave: string;
  introducao: string;
  desenvolvimento: Array<{
    subtitulo: string;
    conteudo: string;
    versiculos: string[];
  }>;
  aplicacao_pratica: string;
  perguntas_reflexao: string[];
  oracao_final: string;
  recursos_extras: string[];
  duracao_estimada: number;
  publico_alvo: string;
  nivel_dificuldade: 'iniciante' | 'intermediario' | 'avancado';
}

const GeradorEstudoBiblico = () => {
  const [tema, setTema] = useState('');
  const [versiculo, setVersiculo] = useState('');
  const [publicoAlvo, setPublicoAlvo] = useState('');
  const [duracao, setDuracao] = useState('45');
  const [nivel, setNivel] = useState<'iniciante' | 'intermediario' | 'avancado'>('intermediario');
  const [carregando, setCarregando] = useState(false);
  const [estudoGerado, setEstudoGerado] = useState<EstudoGerado | null>(null);
  const [activeTab, setActiveTab] = useState('gerador');
  const { toast } = useToast();

  const temasPopulares = [
    'Fé em tempos difíceis',
    'O poder da oração',
    'Propósito de vida',
    'Relacionamentos bíblicos',
    'Liderança cristã',
    'Perdão e restauração',
    'Crescimento espiritual',
    'Evangelismo eficaz',
    'Família cristã',
    'Gestão financeira bíblica'
  ];

  const gerarEstudo = async () => {
    if (!tema.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe o tema do estudo.",
        variant: "destructive"
      });
      return;
    }

    setCarregando(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-biblical-study', {
        body: {
          tema,
          versiculo_base: versiculo,
          publico_alvo: publicoAlvo,
          duracao_minutos: parseInt(duracao),
          nivel_dificuldade: nivel,
          contexto: {
            igreja: 'CBN Kerigma',
            denominacao: 'Batista',
            linha_teologica: 'evangélica'
          }
        }
      });

      if (error) throw error;

      setEstudoGerado(data.estudo);
      setActiveTab('resultado');

      toast({
        title: "Estudo gerado com sucesso!",
        description: "Seu estudo bíblico foi criado pela IA.",
      });

    } catch (error) {
      console.error('Erro ao gerar estudo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o estudo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setCarregando(false);
    }
  };

  const salvarEstudo = async () => {
    if (!estudoGerado) return;

    try {
      const { error } = await supabase
        .from('estudos_biblicos')
        .insert({
          titulo: estudoGerado.titulo,
          descricao: estudoGerado.introducao,
          versiculo_chave: estudoGerado.versiculo_chave,
          arquivo_url: null, // Será implementado geração de PDF
          semana_inicio: new Date().toISOString().split('T')[0],
          semana_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ativo: true
        });

      if (error) throw error;

      toast({
        title: "Estudo salvo!",
        description: "O estudo foi adicionado à biblioteca.",
      });

    } catch (error) {
      console.error('Erro ao salvar estudo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o estudo.",
        variant: "destructive"
      });
    }
  };

  const exportarPDF = () => {
    // Implementar geração de PDF
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "A exportação em PDF será implementada em breve.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerador de Estudos Bíblicos IA</h2>
          <p className="text-muted-foreground">Crie estudos bíblicos personalizados com inteligência artificial</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          IA Avançada
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="gerador">
            <Sparkles className="w-4 h-4 mr-2" />
            Gerador
          </TabsTrigger>
          <TabsTrigger value="resultado">
            <FileText className="w-4 h-4 mr-2" />
            Resultado
          </TabsTrigger>
          <TabsTrigger value="historico">
            <BookOpen className="w-4 h-4 mr-2" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="gerador" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Estudo</CardTitle>
                <CardDescription>
                  Configure os parâmetros para gerar seu estudo bíblico personalizado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tema">Tema Principal *</Label>
                  <Input
                    id="tema"
                    placeholder="Ex: A importância da oração na vida cristã"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="versiculo">Versículo Base (opcional)</Label>
                  <Input
                    id="versiculo"
                    placeholder="Ex: Mateus 6:9-13"
                    value={versiculo}
                    onChange={(e) => setVersiculo(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="publico">Público-Alvo</Label>
                  <Select value={publicoAlvo} onValueChange={setPublicoAlvo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o público" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jovens">Jovens (16-30 anos)</SelectItem>
                      <SelectItem value="adultos">Adultos (30-60 anos)</SelectItem>
                      <SelectItem value="idosos">Terceira idade (60+ anos)</SelectItem>
                      <SelectItem value="casais">Casais</SelectItem>
                      <SelectItem value="lideres">Líderes</SelectItem>
                      <SelectItem value="novos_convertidos">Novos convertidos</SelectItem>
                      <SelectItem value="geral">Público geral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duracao">Duração (minutos)</Label>
                    <Select value={duracao} onValueChange={setDuracao}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutos</SelectItem>
                        <SelectItem value="45">45 minutos</SelectItem>
                        <SelectItem value="60">60 minutos</SelectItem>
                        <SelectItem value="90">90 minutos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel">Nível</Label>
                    <Select value={nivel} onValueChange={(value: any) => setNivel(value)}>
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
                </div>

                <Button 
                  onClick={gerarEstudo} 
                  disabled={carregando}
                  className="w-full flex items-center gap-2"
                >
                  {carregando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Gerando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Gerar Estudo com IA
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Temas Populares</CardTitle>
                <CardDescription>
                  Clique em um dos temas abaixo para usar como base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {temasPopulares.map((temaPop) => (
                    <Badge
                      key={temaPop}
                      variant="outline"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => setTema(temaPop)}
                    >
                      {temaPop}
                    </Badge>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Adaptado para diferentes públicos</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Duração personalizada</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span>Perguntas para reflexão incluídas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resultado" className="space-y-6">
          {estudoGerado ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{estudoGerado.titulo}</h3>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={exportarPDF}>
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                  <Button onClick={salvarEstudo}>
                    <Send className="w-4 h-4 mr-2" />
                    Salvar
                  </Button>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Informações Gerais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <Label className="text-sm font-medium">Público-Alvo</Label>
                      <p className="text-sm text-muted-foreground">{estudoGerado.publico_alvo}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duração</Label>
                      <p className="text-sm text-muted-foreground">{estudoGerado.duracao_estimada} minutos</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Nível</Label>
                      <Badge variant="secondary">{estudoGerado.nivel_dificuldade}</Badge>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium">Versículo Chave</Label>
                    <p className="text-sm italic bg-muted p-3 rounded-lg mt-1">
                      "{estudoGerado.versiculo_chave}"
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo do Estudo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium mb-2">Introdução</h4>
                    <p className="text-sm text-muted-foreground">{estudoGerado.introducao}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Desenvolvimento</h4>
                    <div className="space-y-4">
                      {estudoGerado.desenvolvimento.map((secao, index) => (
                        <div key={index} className="border-l-4 border-primary pl-4">
                          <h5 className="font-medium text-sm">{secao.subtitulo}</h5>
                          <p className="text-sm text-muted-foreground mt-1">{secao.conteudo}</p>
                          {secao.versiculos.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs font-medium">Versículos: </span>
                              <span className="text-xs text-muted-foreground">
                                {secao.versiculos.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Aplicação Prática</h4>
                    <p className="text-sm text-muted-foreground">{estudoGerado.aplicacao_pratica}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Perguntas para Reflexão</h4>
                    <ul className="space-y-1">
                      {estudoGerado.perguntas_reflexao.map((pergunta, index) => (
                        <li key={index} className="text-sm text-muted-foreground">
                          {index + 1}. {pergunta}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Oração Final</h4>
                    <p className="text-sm text-muted-foreground italic">{estudoGerado.oracao_final}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Nenhum estudo gerado ainda. Use o gerador para criar seu primeiro estudo.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="historico" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Estudos Gerados Recentemente</CardTitle>
              <CardDescription>
                Histórico dos últimos estudos bíblicos gerados pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { titulo: "A Importância da Oração", data: "2024-01-15", publico: "Jovens" },
                  { titulo: "Fé em Tempos Difíceis", data: "2024-01-12", publico: "Adultos" },
                  { titulo: "O Propósito de Deus", data: "2024-01-10", publico: "Geral" }
                ].map((estudo, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{estudo.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {estudo.publico} • {estudo.data}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GeradorEstudoBiblico;