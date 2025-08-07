import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Share2, 
  Copy,
  ExternalLink,
  Calendar,
  Heart,
  Gift,
  Users,
  Church,
  Star,
  Palette,
  Layout
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface LandingPage {
  id: string;
  title: string;
  slug: string;
  description: string;
  template: string;
  theme: 'christmas' | 'easter' | 'campaign' | 'event' | 'custom';
  status: 'draft' | 'published';
  createdAt: Date;
  views: number;
  conversions: number;
  customizations: {
    primaryColor: string;
    backgroundImage?: string;
    ctaText: string;
    ctaLink: string;
  };
}

const templateOptions = [
  { 
    id: 'christmas-campaign', 
    name: 'Campanha de Natal', 
    description: 'Template festivo para campanhas natalinas',
    preview: 'bg-gradient-to-br from-red-600 to-green-600',
    icon: Gift
  },
  { 
    id: 'easter-celebration', 
    name: 'Celebração de Páscoa', 
    description: 'Layout especial para a Páscoa',
    preview: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    icon: Star
  },
  { 
    id: 'tithing-campaign', 
    name: 'Campanha de Dízimos', 
    description: 'Página para campanhas de contribuição',
    preview: 'bg-gradient-to-br from-blue-600 to-purple-600',
    icon: Heart
  },
  { 
    id: 'special-event', 
    name: 'Evento Especial', 
    description: 'Template para eventos únicos',
    preview: 'bg-gradient-to-br from-purple-600 to-pink-600',
    icon: Calendar
  },
  { 
    id: 'cell-recruitment', 
    name: 'Recrutamento de Células', 
    description: 'Página para captação de novos membros',
    preview: 'bg-gradient-to-br from-green-600 to-teal-600',
    icon: Users
  },
  { 
    id: 'ministry-showcase', 
    name: 'Showcase de Ministério', 
    description: 'Apresentação de ministérios específicos',
    preview: 'bg-gradient-to-br from-indigo-600 to-blue-600',
    icon: Church
  }
];

const samplePages: LandingPage[] = [
  {
    id: '1',
    title: 'Campanha de Natal 2024',
    slug: 'natal-2024',
    description: 'Uma campanha especial para celebrar o nascimento de Jesus',
    template: 'christmas-campaign',
    theme: 'christmas',
    status: 'published',
    createdAt: new Date('2024-11-01'),
    views: 1243,
    conversions: 89,
    customizations: {
      primaryColor: '#dc2626',
      ctaText: 'Participar da Campanha',
      ctaLink: '/natal-2024'
    }
  },
  {
    id: '2',
    title: 'Encontre sua Célula',
    slug: 'encontre-celula',
    description: 'Conecte-se com uma comunidade perto de você',
    template: 'cell-recruitment',
    theme: 'campaign',
    status: 'published',
    createdAt: new Date('2024-10-15'),
    views: 856,
    conversions: 124,
    customizations: {
      primaryColor: '#059669',
      ctaText: 'Encontrar Minha Célula',
      ctaLink: '/celulas'
    }
  }
];

export const LandingPagesManager = () => {
  const [pages, setPages] = useState<LandingPage[]>(samplePages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<LandingPage | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    template: '',
    theme: 'custom' as LandingPage['theme'],
    primaryColor: '#6366f1',
    backgroundImage: '',
    ctaText: 'Clique Aqui',
    ctaLink: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug || !formData.template) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive"
      });
      return;
    }

    // Check if slug already exists
    const slugExists = pages.some(p => p.slug === formData.slug && p.id !== editingPage?.id);
    if (slugExists) {
      toast({
        title: "Erro",
        description: "Este slug já está em uso. Escolha outro.",
        variant: "destructive"
      });
      return;
    }

    const pageData: LandingPage = {
      id: editingPage?.id || Date.now().toString(),
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      template: formData.template,
      theme: formData.theme,
      status: 'draft',
      createdAt: editingPage?.createdAt || new Date(),
      views: editingPage?.views || 0,
      conversions: editingPage?.conversions || 0,
      customizations: {
        primaryColor: formData.primaryColor,
        backgroundImage: formData.backgroundImage,
        ctaText: formData.ctaText,
        ctaLink: formData.ctaLink
      }
    };

    if (editingPage) {
      setPages(prev => prev.map(p => p.id === editingPage.id ? pageData : p));
      toast({
        title: "Sucesso!",
        description: "Landing page atualizada com sucesso"
      });
    } else {
      setPages(prev => [pageData, ...prev]);
      toast({
        title: "Sucesso!",
        description: "Landing page criada com sucesso"
      });
    }

    resetForm();
    setDialogOpen(false);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      description: '',
      template: '',
      theme: 'custom',
      primaryColor: '#6366f1',
      backgroundImage: '',
      ctaText: 'Clique Aqui',
      ctaLink: ''
    });
    setEditingPage(null);
  };

  const handleEdit = (page: LandingPage) => {
    setFormData({
      title: page.title,
      slug: page.slug,
      description: page.description,
      template: page.template,
      theme: page.theme,
      primaryColor: page.customizations.primaryColor,
      backgroundImage: page.customizations.backgroundImage || '',
      ctaText: page.customizations.ctaText,
      ctaLink: page.customizations.ctaLink
    });
    setEditingPage(page);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    toast({
      title: "Sucesso!",
      description: "Landing page removida com sucesso"
    });
  };

  const toggleStatus = (id: string) => {
    setPages(prev => prev.map(p => 
      p.id === id 
        ? { ...p, status: p.status === 'published' ? 'draft' : 'published' }
        : p
    ));
    
    const page = pages.find(p => p.id === id);
    toast({
      title: "Status Atualizado!",
      description: `Landing page ${page?.status === 'published' ? 'despublicada' : 'publicada'} com sucesso`
    });
  };

  const copyPageUrl = (slug: string) => {
    const url = `${window.location.origin}/landing/${slug}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copiada!",
      description: "Link da landing page copiado para a área de transferência"
    });
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    setFormData(prev => ({ ...prev, slug }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Landing Pages</h2>
          <p className="text-muted-foreground">
            Crie páginas personalizadas para campanhas e eventos especiais
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Landing Page
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPage ? 'Editar Landing Page' : 'Nova Landing Page'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, title: e.target.value }));
                      if (!editingPage) {
                        generateSlug(e.target.value);
                      }
                    }}
                    placeholder="Ex: Campanha de Natal 2024"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="natal-2024"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: /landing/{formData.slug}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Breve descrição da campanha ou evento"
                />
              </div>

              <div className="space-y-2">
                <Label>Template *</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {templateOptions.map((template) => {
                    const Icon = template.icon;
                    return (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-all ${
                          formData.template === template.id 
                            ? 'ring-2 ring-primary' 
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setFormData(prev => ({ ...prev, template: template.id }))}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className={`w-12 h-12 rounded-lg ${template.preview} flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium text-sm">{template.name}</h4>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor Principal</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primaryColor"
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-16 h-10"
                    />
                    <Input
                      value={formData.primaryColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      placeholder="#6366f1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundImage">Imagem de Fundo (URL)</Label>
                  <Input
                    id="backgroundImage"
                    value={formData.backgroundImage}
                    onChange={(e) => setFormData(prev => ({ ...prev, backgroundImage: e.target.value }))}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">Texto do Botão CTA</Label>
                  <Input
                    id="ctaText"
                    value={formData.ctaText}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaText: e.target.value }))}
                    placeholder="Participar Agora"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ctaLink">Link do CTA</Label>
                  <Input
                    id="ctaLink"
                    value={formData.ctaLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, ctaLink: e.target.value }))}
                    placeholder="/contato"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPage ? 'Atualizar' : 'Criar'} Landing Page
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Pages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {pages.map((page) => {
          const template = templateOptions.find(t => t.id === page.template);
          const Icon = template?.icon || Layout;
          
          return (
            <Card key={page.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-lg ${template?.preview || 'bg-gray-400'} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{page.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">/{page.slug}</p>
                    </div>
                  </div>
                  <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                    {page.status === 'published' ? 'Publicada' : 'Rascunho'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {page.description || 'Sem descrição'}
                </p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Visualizações:</span>
                    <span className="ml-2 font-medium">{page.views}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conversões:</span>
                    <span className="ml-2 font-medium">{page.conversions}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-1">
                    <Switch
                      checked={page.status === 'published'}
                      onCheckedChange={() => toggleStatus(page.id)}
                    />
                    <span className="text-sm text-muted-foreground">
                      {page.status === 'published' ? 'Publicada' : 'Rascunho'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyPageUrl(page.slug)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    
                    {page.status === 'published' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`/landing/${page.slug}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(page)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(page.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pages.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Share2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma landing page criada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira landing page para campanhas e eventos especiais
            </p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeira Landing Page
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};