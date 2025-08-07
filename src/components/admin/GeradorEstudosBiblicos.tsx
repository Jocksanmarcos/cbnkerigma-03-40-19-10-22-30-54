import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen, 
  Sparkles, 
  Download, 
  Share2, 
  Save, 
  RefreshCw,
  Target,
  Clock,
  Users,
  Brain
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface EstudoGerado {
  titulo: string;
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
  versiculos_adicionais: string[];
}

const GeradorEstudosBiblicos = () => {
  const [tema, setTema] = useState('');
  const [nivel, setNivel] = useState('intermediario');
  const [duracao, setDuracao] = useState('45');
  const [publicoAlvo, setPublicoAlvo] = useState('adultos');
  const [detalhesAdicionais, setDetalhesAdicionais] = useState('');
  const [estudoGerado, setEstudoGerado] = useState<EstudoGerado | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState<EstudoGerado[]>([]);
  const { toast } = useToast();

  const gerarEstudoBiblico = async () => {
    if (!tema.trim()) {
      toast({
        title: "Tema necessário",
        description: "Por favor, insira um tema para o estudo bíblico.",
        variant: "destructive"
      });
      return;
    }

    setCarregando(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-biblical-study', {
        body: { 
          topic: tema,
          level: nivel,
          duration: parseInt(duracao),
          audience: publicoAlvo,
          details: detalhesAdicionais
        }
      });

      if (error) {
        console.error('Erro da função Supabase:', error);
        // Se houver erro, usar o fallback
        if (data?.fallback) {
          const estudoEstruturado = parseMarkdownToEstudo(data.fallback);
          setEstudoGerado(estudoEstruturado);
          toast({
            title: "Estudo gerado (modo offline)",
            description: "Geramos um estudo básico para você. Tente novamente em alguns minutos para a versão IA.",
            variant: "default"
          });
          return;
        }
        throw error;
      }

      if (data?.study) {
        // Tentar parsear como JSON estruturado
        try {
          const estudoParsed = typeof data.study === 'string' 
            ? JSON.parse(data.study) 
            : data.study;
          
          setEstudoGerado(estudoParsed);
        } catch (parseError) {
          // Se não for JSON, criar estrutura a partir do markdown
          const estudoEstruturado = parseMarkdownToEstudo(data.study);
          setEstudoGerado(estudoEstruturado);
        }

        toast({
          title: "Estudo gerado com sucesso!",
          description: "Seu estudo bíblico personalizado está pronto."
        });
      } else if (data?.fallback) {
        // Usar fallback se disponível
        const estudoEstruturado = parseMarkdownToEstudo(data.fallback);
        setEstudoGerado(estudoEstruturado);
        toast({
          title: "Estudo gerado (modo básico)",
          description: "Geramos um estudo básico. A IA pode estar temporariamente indisponível.",
          variant: "default"
        });
      }

    } catch (error) {
      console.error('Erro ao gerar estudo:', error);
      
      // Usar o fallback em caso de erro
      const estudoFallback = {
        titulo: `Estudo Bíblico: ${tema}`,
        versiculo_chave: '"Lâmpada para os meus pés é tua palavra e luz, para o meu caminho." - Salmos 119:105',
        introducao: `Este é um estudo básico sobre ${tema}. A Palavra de Deus é nossa base sólida e quando a estudamos com coração aberto, somos transformados e capacitados para viver segundo a vontade divina.`,
        desenvolvimento: [
          {
            subtitulo: "Fundamento Bíblico",
            conteudo: `Vamos explorar o que a Bíblia ensina sobre ${tema} através das Escrituras.`,
            versiculos: ["Salmos 119:105", "2 Timóteo 3:16-17"]
          },
          {
            subtitulo: "Aplicação Prática",
            conteudo: "Como podemos aplicar estes ensinamentos em nossa vida diária.",
            versiculos: ["Tiago 1:22", "Josué 1:8"]
          }
        ],
        aplicacao_pratica: `Reflita sobre como ${tema} pode transformar sua vida espiritual. Busque momentos de oração e meditação na Palavra.`,
        perguntas_reflexao: [
          `Como ${tema} se manifesta em minha vida?`,
          "Que mudanças posso fazer para crescer espiritualmente?",
          "Como posso compartilhar estes ensinamentos com outros?"
        ],
        oracao_final: `Pai celestial, obrigado pela Sua Palavra que nos ensina sobre ${tema}. Ajude-nos a aplicar estes ensinamentos em nossa vida diária. Amém.`,
        versiculos_adicionais: ["Salmos 1:2-3", "Provérbios 3:5-6", "Filipenses 4:13"]
      };
      
      setEstudoGerado(estudoFallback);
      
      toast({
        title: "Estudo básico gerado",
        description: "API IA temporariamente indisponível. Gerado estudo básico para você.",
        variant: "default"
      });
    } finally {
      setCarregando(false);
    }
  };

  const parseMarkdownToEstudo = (markdown: string): EstudoGerado => {
    const lines = markdown.split('\n');
    let currentSection = '';
    const estudo: EstudoGerado = {
      titulo: '',
      versiculo_chave: '',
      introducao: '',
      desenvolvimento: [],
      aplicacao_pratica: '',
      perguntas_reflexao: [],
      oracao_final: '',
      versiculos_adicionais: []
    };

    let currentDev: any = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.startsWith('# ')) {
        estudo.titulo = trimmed.replace('# ', '').replace(/📖|🔥/g, '').trim();
      } else if (trimmed.includes('Versículo Chave') || trimmed.includes('🔥')) {
        currentSection = 'versiculo';
      } else if (trimmed.includes('Introdução') || trimmed.includes('📚')) {
        currentSection = 'introducao';
      } else if (trimmed.includes('Pontos') || trimmed.includes('Desenvolvimento')) {
        currentSection = 'desenvolvimento';
      } else if (trimmed.includes('Aplicação')) {
        currentSection = 'aplicacao';
      } else if (trimmed.includes('Reflexão') || trimmed.includes('🤔')) {
        currentSection = 'perguntas';
      } else if (trimmed.includes('Oração')) {
        currentSection = 'oracao';
      } else if (trimmed.includes('Aprofundar') || trimmed.includes('💡')) {
        currentSection = 'versiculos_extras';
      } else if (trimmed && !trimmed.startsWith('#')) {
        switch (currentSection) {
          case 'versiculo':
            if (trimmed.includes('*') && trimmed.includes('-')) {
              estudo.versiculo_chave = trimmed.replace(/\*/g, '');
            }
            break;
          case 'introducao':
            estudo.introducao += trimmed + ' ';
            break;
          case 'desenvolvimento':
            if (trimmed.startsWith('**') || trimmed.match(/^\d+\./)) {
              if (currentDev) {
                estudo.desenvolvimento.push(currentDev);
              }
              currentDev = {
                subtitulo: trimmed.replace(/\*\*/g, '').replace(/^\d+\.\s*/, ''),
                conteudo: '',
                versiculos: []
              };
            } else if (currentDev && trimmed) {
              currentDev.conteudo += trimmed + ' ';
              // Extrair versículos
              const verseMatches = trimmed.match(/\b\d?\s?[A-Za-z]+\s+\d+:\d+(-\d+)?\b/g);
              if (verseMatches) {
                currentDev.versiculos.push(...verseMatches);
              }
            }
            break;
          case 'aplicacao':
            estudo.aplicacao_pratica += trimmed + ' ';
            break;
          case 'perguntas':
            if (trimmed.includes('?')) {
              estudo.perguntas_reflexao.push(trimmed.replace(/•|-|\d+\./, '').trim());
            }
            break;
          case 'oracao':
            estudo.oracao_final += trimmed + ' ';
            break;
          case 'versiculos_extras':
            if (trimmed.includes('•') || trimmed.match(/\b[A-Za-z]+\s+\d+/)) {
              estudo.versiculos_adicionais.push(trimmed.replace(/•|-/, '').trim());
            }
            break;
        }
      }
    });

    // Adicionar último desenvolvimento se existir
    if (currentDev) {
      estudo.desenvolvimento.push(currentDev);
    }

    return estudo;
  };

  const salvarEstudo = async () => {
    if (!estudoGerado) return;

    try {
      const { error } = await supabase
        .from('estudos_biblicos')
        .insert({
          titulo: estudoGerado.titulo,
          versiculo_chave: estudoGerado.versiculo_chave,
          descricao: estudoGerado.introducao.substring(0, 500),
          semana_inicio: new Date().toISOString().split('T')[0],
          semana_fim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          ativo: true
        });

      if (error) throw error;

      toast({
        title: "Estudo salvo!",
        description: "O estudo foi salvo na biblioteca de estudos bíblicos."
      });

    } catch (error) {
      console.error('Erro ao salvar estudo:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o estudo.",
        variant: "destructive"
      });
    }
  };

  const exportarPDF = () => {
    // Implementação de exportação PDF seria adicionada aqui
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Exportação em PDF será implementada em breve."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" />
            Gerador de Estudos Bíblicos IA
          </h2>
          <p className="text-muted-foreground">Crie estudos bíblicos personalizados com inteligência artificial</p>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          IA Powered
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Formulário de Configuração */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Configurações do Estudo
              </CardTitle>
              <CardDescription>
                Personalize seu estudo bíblico com IA
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tema">Tema do Estudo *</Label>
                <Input
                  id="tema"
                  placeholder="Ex: Fé, Amor, Perdão..."
                  value={tema}
                  onChange={(e) => setTema(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nivel">Nível de Profundidade</Label>
                <Select value={nivel} onValueChange={setNivel}>
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
                <Label htmlFor="publico">Público Alvo</Label>
                <Select value={publicoAlvo} onValueChange={setPublicoAlvo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="criancas">Crianças</SelectItem>
                    <SelectItem value="adolescentes">Adolescentes</SelectItem>
                    <SelectItem value="jovens">Jovens</SelectItem>
                    <SelectItem value="adultos">Adultos</SelectItem>
                    <SelectItem value="idosos">Idosos</SelectItem>
                    <SelectItem value="geral">Público Geral</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="detalhes">Detalhes Adicionais</Label>
                <Textarea
                  id="detalhes"
                  placeholder="Contexto específico, ocasião especial, enfoque desejado..."
                  value={detalhesAdicionais}
                  onChange={(e) => setDetalhesAdicionais(e.target.value)}
                  rows={3}
                />
              </div>

              <Button 
                onClick={gerarEstudoBiblico} 
                disabled={carregando || !tema.trim()}
                className="w-full"
              >
                {carregando ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Gerando Estudo...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Gerar Estudo IA
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resultado */}
        <div className="lg:col-span-2">
          {estudoGerado ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {estudoGerado.titulo}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={salvarEstudo}>
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm" onClick={exportarPDF}>
                      <Download className="w-4 h-4 mr-2" />
                      PDF
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-6">
                    {/* Versículo Chave */}
                    <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                      <h3 className="font-semibold mb-2">Versículo Chave</h3>
                      <p className="italic">{estudoGerado.versiculo_chave}</p>
                    </div>

                    {/* Introdução */}
                    <div>
                      <h3 className="font-semibold mb-2">Introdução</h3>
                      <p className="text-sm leading-relaxed">{estudoGerado.introducao}</p>
                    </div>

                    {/* Desenvolvimento */}
                    <div>
                      <h3 className="font-semibold mb-4">Desenvolvimento</h3>
                      <div className="space-y-4">
                        {estudoGerado.desenvolvimento.map((ponto, index) => (
                          <div key={index} className="border rounded-lg p-4">
                            <h4 className="font-medium mb-2 text-primary">
                              {index + 1}. {ponto.subtitulo}
                            </h4>
                            <p className="text-sm mb-3 leading-relaxed">{ponto.conteudo}</p>
                            {ponto.versiculos.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {ponto.versiculos.map((verso, vIndex) => (
                                  <Badge key={vIndex} variant="outline" className="text-xs">
                                    {verso}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Aplicação Prática */}
                    <div>
                      <h3 className="font-semibold mb-2">Aplicação Prática</h3>
                      <p className="text-sm leading-relaxed">{estudoGerado.aplicacao_pratica}</p>
                    </div>

                    {/* Perguntas para Reflexão */}
                    <div>
                      <h3 className="font-semibold mb-2">Perguntas para Reflexão</h3>
                      <ul className="space-y-2">
                        {estudoGerado.perguntas_reflexao.map((pergunta, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <span className="font-medium text-primary">{index + 1}.</span>
                            {pergunta}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Oração Final */}
                    <div className="bg-muted/50 p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Oração de Encerramento</h3>
                      <p className="text-sm italic leading-relaxed">{estudoGerado.oracao_final}</p>
                    </div>

                    {/* Versículos Adicionais */}
                    {estudoGerado.versiculos_adicionais.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-2">Para Aprofundamento</h3>
                        <div className="flex flex-wrap gap-2">
                          {estudoGerado.versiculos_adicionais.map((verso, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {verso}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-[400px] text-center space-y-4">
                <BookOpen className="w-16 h-16 text-muted-foreground opacity-50" />
                <div>
                  <h3 className="font-semibold text-lg mb-2">Nenhum estudo gerado ainda</h3>
                  <p className="text-muted-foreground max-w-md">
                    Configure o tema e detalhes do seu estudo bíblico e clique em "Gerar Estudo IA" 
                    para criar um conteúdo personalizado.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeradorEstudosBiblicos;