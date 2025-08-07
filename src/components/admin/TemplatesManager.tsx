import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Wand2, 
  Layout, 
  Palette, 
  Code, 
  Download, 
  Eye, 
  Sparkles,
  Calendar,
  Users,
  Heart,
  Camera,
  FileText,
  Share2,
  Copy
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'evento' | 'galeria' | 'landing' | 'componente';
  preview: string;
  code: string;
  tags: string[];
  aiGenerated?: boolean;
}

const sampleTemplates: Template[] = [
  {
    id: '1',
    name: 'Card de Evento Moderno',
    description: 'Card responsivo para eventos com gradiente e animações',
    category: 'evento',
    preview: 'bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl shadow-lg',
    code: `<div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-all duration-300">
  <div className="flex items-center mb-4">
    <Calendar className="w-6 h-6 mr-3" />
    <span className="text-sm opacity-90">15 de Agosto, 2024</span>
  </div>
  <h3 className="text-2xl font-bold mb-2">Culto de Avivamento</h3>
  <p className="text-white/80 mb-4">Uma noite especial de louvor e adoração com a presença do Espírito Santo.</p>
  <div className="flex items-center justify-between">
    <span className="text-sm">19:30 - 21:30</span>
    <Button className="bg-white text-primary hover:bg-gray-100">
      Participar
    </Button>
  </div>
</div>`,
    tags: ['evento', 'moderno', 'gradiente'],
    aiGenerated: false
  },
  {
    id: '2',
    name: 'Galeria Grid Dinâmica',
    description: 'Layout em grade responsiva para fotos com hover effects',
    category: 'galeria',
    preview: 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4',
    code: `<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
  {images.map((image, index) => (
    <div key={index} className="group relative overflow-hidden rounded-lg aspect-square">
      <img 
        src={image.url} 
        alt={image.alt}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
        <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  ))}
</div>`,
    tags: ['galeria', 'grid', 'hover', 'responsivo'],
    aiGenerated: false
  },
  {
    id: '3',
    name: 'Landing Page Hero',
    description: 'Seção hero para campanhas especiais com CTA destacado',
    category: 'landing',
    preview: 'bg-gradient-hero text-white text-center py-24',
    code: `<section className="relative bg-gradient-hero text-white overflow-hidden py-24">
  <div className="absolute inset-0 bg-black/20"></div>
  <div className="relative max-w-4xl mx-auto px-4 text-center">
    <h1 className="text-5xl lg:text-7xl font-playfair font-bold mb-6 animate-fade-in">
      Campanha de Natal
    </h1>
    <p className="text-xl lg:text-2xl mb-8 opacity-90">
      Junte-se a nós nesta temporada especial de gratidão e celebração
    </p>
    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <Button size="lg" className="bg-white text-primary hover:bg-gray-100 font-semibold px-8 py-4">
        Participar Agora
      </Button>
      <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4">
        Saiba Mais
      </Button>
    </div>
  </div>
  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent"></div>
</section>`,
    tags: ['landing', 'hero', 'campanha', 'cta'],
    aiGenerated: false
  }
];

export const TemplatesManager = () => {
  const [templates, setTemplates] = useState<Template[]>(sampleTemplates);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  const categories = [
    { value: 'all', label: 'Todos', icon: Layout },
    { value: 'evento', label: 'Eventos', icon: Calendar },
    { value: 'galeria', label: 'Galeria', icon: Camera },
    { value: 'landing', label: 'Landing Pages', icon: Share2 },
    { value: 'componente', label: 'Componentes', icon: Code }
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const generateAITemplate = async () => {
    if (!aiPrompt.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, descreva o que você gostaria de criar",
        variant: "destructive"
      });
      return;
    }

    setGeneratingAI(true);
    
    // Simular geração de template via IA (integração com 21st.dev)
    setTimeout(() => {
      const newTemplate: Template = {
        id: Date.now().toString(),
        name: `Template IA: ${aiPrompt.slice(0, 30)}...`,
        description: `Template gerado por IA baseado em: "${aiPrompt}"`,
        category: 'componente',
        preview: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg',
        code: `// Template gerado por IA para: ${aiPrompt}
<div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg p-6 shadow-xl">
  <div className="flex items-center mb-4">
    <Sparkles className="w-8 h-8 mr-3" />
    <h3 className="text-2xl font-bold">Template Personalizado</h3>
  </div>
  <p className="text-white/90 mb-6">
    ${aiPrompt}
  </p>
  <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
    Ação Principal
  </Button>
</div>`,
        tags: ['ai-generated', 'personalizado', 'moderno'],
        aiGenerated: true
      };

      setTemplates(prev => [newTemplate, ...prev]);
      setAiPrompt('');
      setGeneratingAI(false);
      
      toast({
        title: "Template Criado!",
        description: "Seu template foi gerado com sucesso pela IA",
      });
    }, 2000);
  };

  const copyTemplateCode = (template: Template) => {
    navigator.clipboard.writeText(template.code);
    toast({
      title: "Código Copiado!",
      description: "O código do template foi copiado para a área de transferência",
    });
  };

  const downloadTemplate = (template: Template) => {
    const element = document.createElement('a');
    const file = new Blob([template.code], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${template.name.toLowerCase().replace(/\s+/g, '-')}.tsx`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Download Iniciado!",
      description: "O arquivo do template está sendo baixado",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Templates 21st.dev</h2>
          <p className="text-muted-foreground">
            Componentes modernos e templates para sua igreja
          </p>
        </div>
      </div>

      {/* AI Generator Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="w-6 h-6 mr-2 text-primary" />
            Gerador de Templates IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">Descreva o que você quer criar</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Ex: Um card para mostrar versículos do dia com fundo gradiente e animação suave..."
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <Button 
              onClick={generateAITemplate} 
              disabled={generatingAI}
              className="w-full sm:w-auto"
            >
              {generatingAI ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Template com IA
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger 
                key={category.value} 
                value={category.value}
                className="flex items-center gap-2 p-3"
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{category.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center text-lg">
                        {template.name}
                        {template.aiGenerated && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            <Sparkles className="w-3 h-3 mr-1" />
                            IA
                          </Badge>
                        )}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Preview */}
                  <div className={`h-32 rounded-lg ${template.preview} flex items-center justify-center text-sm font-medium`}>
                    Preview
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-4 h-4 mr-2" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{template.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="bg-muted p-4 rounded-lg">
                            <pre className="text-sm overflow-x-auto">
                              <code>{template.code}</code>
                            </pre>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => copyTemplateCode(template)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copiar Código
                            </Button>
                            <Button variant="outline" onClick={() => downloadTemplate(template)}>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      size="sm" 
                      onClick={() => copyTemplateCode(template)}
                      className="flex-1"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTemplates.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Layout className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente selecionar uma categoria diferente ou gere um novo template com IA
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};