import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Smartphone, 
  Bell, 
  Eye, 
  Send, 
  Save,
  Clock,
  Calendar,
  MapPin,
  Users
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NotificationTemplate {
  id: string;
  name: string;
  type: 'email' | 'push' | 'toast';
  subject?: string;
  title: string;
  message: string;
  variables: string[];
  active: boolean;
}

const NotificationTemplates = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Novo Evento Criado',
      type: 'email',
      subject: 'Novo evento: {{titulo}}',
      title: 'Novo Evento Adicionado',
      message: 'Um novo evento foi adicionado à agenda: {{titulo}} em {{data_inicio}} no {{local}}.',
      variables: ['titulo', 'data_inicio', 'local'],
      active: true
    },
    {
      id: '2',
      name: 'Lembrete de Evento',
      type: 'push',
      title: 'Lembrete: {{titulo}}',
      message: 'O evento {{titulo}} começará em {{tempo_restante}}.',
      variables: ['titulo', 'tempo_restante'],
      active: true
    },
    {
      id: '3',
      name: 'Evento Atualizado',
      type: 'toast',
      title: 'Evento Atualizado',
      message: 'O evento {{titulo}} foi atualizado. Verifique os novos detalhes.',
      variables: ['titulo'],
      active: true
    }
  ]);

  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [previewData, setPreviewData] = useState({
    titulo: 'Culto de Domingo',
    data_inicio: '15/12/2024 às 19:00',
    local: 'Igreja Principal',
    tempo_restante: '30 minutos'
  });

  const handleSaveTemplate = () => {
    if (!selectedTemplate) return;

    setTemplates(prev => 
      prev.map(t => t.id === selectedTemplate.id ? selectedTemplate : t)
    );

    toast({
      title: "Template salvo",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleTestTemplate = () => {
    if (!selectedTemplate) return;

    const processedMessage = processTemplate(selectedTemplate.message, previewData);
    
    toast({
      title: selectedTemplate.title,
      description: processedMessage,
    });
  };

  const processTemplate = (template: string, data: Record<string, string>) => {
    let processed = template;
    Object.entries(data).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return processed;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'push': return Smartphone;
      case 'toast': return Bell;
      default: return Bell;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'email': return 'bg-blue-500';
      case 'push': return 'bg-green-500';
      case 'toast': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Templates de Notificação
          </CardTitle>
          <CardDescription>
            Configure os templates para notificações automáticas de eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Lista de Templates */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Templates Disponíveis</Label>
              <div className="space-y-3">
                {templates.map((template) => {
                  const TypeIcon = getTypeIcon(template.type);
                  return (
                    <Card 
                      key={template.id}
                      className={`cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <TypeIcon className="h-5 w-5" />
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {template.message.substring(0, 50)}...
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              className={`${getTypeColor(template.type)} text-white`}
                            >
                              {template.type}
                            </Badge>
                            {template.active && (
                              <Badge variant="secondary">Ativo</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Editor de Template */}
            {selectedTemplate && (
              <div className="space-y-4">
                <Label className="text-base font-medium">Editar Template</Label>
                <Tabs defaultValue="edit" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="edit">Editar</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="edit" className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="template-name">Nome do Template</Label>
                        <Input
                          id="template-name"
                          value={selectedTemplate.name}
                          onChange={(e) => 
                            setSelectedTemplate({ ...selectedTemplate, name: e.target.value })
                          }
                        />
                      </div>

                      {selectedTemplate.type === 'email' && (
                        <div>
                          <Label htmlFor="template-subject">Assunto do Email</Label>
                          <Input
                            id="template-subject"
                            value={selectedTemplate.subject || ''}
                            onChange={(e) => 
                              setSelectedTemplate({ ...selectedTemplate, subject: e.target.value })
                            }
                            placeholder="Assunto do email"
                          />
                        </div>
                      )}

                      <div>
                        <Label htmlFor="template-title">Título</Label>
                        <Input
                          id="template-title"
                          value={selectedTemplate.title}
                          onChange={(e) => 
                            setSelectedTemplate({ ...selectedTemplate, title: e.target.value })
                          }
                        />
                      </div>

                      <div>
                        <Label htmlFor="template-message">Mensagem</Label>
                        <Textarea
                          id="template-message"
                          value={selectedTemplate.message}
                          onChange={(e) => 
                            setSelectedTemplate({ ...selectedTemplate, message: e.target.value })
                          }
                          rows={4}
                          placeholder="Use {{variavel}} para inserir dados dinâmicos"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Variáveis Disponíveis</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {['titulo', 'data_inicio', 'data_fim', 'local', 'descricao', 'tempo_restante'].map((variable) => (
                            <Badge key={variable} variant="outline" className="text-xs">
                              {`{{${variable}}}`}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleSaveTemplate}>
                        <Save className="h-4 w-4 mr-2" />
                        Salvar
                      </Button>
                      <Button variant="outline" onClick={handleTestTemplate}>
                        <Send className="h-4 w-4 mr-2" />
                        Testar
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="space-y-3">
                      <Label className="text-sm">Dados de Teste</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="preview-titulo" className="text-xs">Título</Label>
                          <Input
                            id="preview-titulo"
                            className="text-sm"
                            value={previewData.titulo}
                            onChange={(e) => 
                              setPreviewData({ ...previewData, titulo: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="preview-data" className="text-xs">Data</Label>
                          <Input
                            id="preview-data"
                            className="text-sm"
                            value={previewData.data_inicio}
                            onChange={(e) => 
                              setPreviewData({ ...previewData, data_inicio: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="preview-local" className="text-xs">Local</Label>
                          <Input
                            id="preview-local"
                            className="text-sm"
                            value={previewData.local}
                            onChange={(e) => 
                              setPreviewData({ ...previewData, local: e.target.value })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="preview-tempo" className="text-xs">Tempo Restante</Label>
                          <Input
                            id="preview-tempo"
                            className="text-sm"
                            value={previewData.tempo_restante}
                            onChange={(e) => 
                              setPreviewData({ ...previewData, tempo_restante: e.target.value })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border rounded-lg p-4 bg-muted/30">
                      <div className="flex items-center gap-2 mb-3">
                        <Eye className="h-4 w-4" />
                        <span className="text-sm font-medium">Preview da Notificação</span>
                        <Badge className={getTypeColor(selectedTemplate.type)}>
                          {selectedTemplate.type}
                        </Badge>
                      </div>

                      {selectedTemplate.type === 'email' && (
                        <div className="mb-3 pb-3 border-b">
                          <p className="text-sm text-muted-foreground">Assunto:</p>
                          <p className="font-medium">
                            {processTemplate(selectedTemplate.subject || '', previewData)}
                          </p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="font-medium">
                          {processTemplate(selectedTemplate.title, previewData)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {processTemplate(selectedTemplate.message, previewData)}
                        </p>
                      </div>

                      {selectedTemplate.type === 'toast' && (
                        <div className="mt-3 pt-3 border-t">
                          <Button size="sm" onClick={handleTestTemplate}>
                            <Bell className="h-4 w-4 mr-2" />
                            Exibir Toast
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estatísticas de Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Mail className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">142</p>
              <p className="text-sm text-blue-600">Emails Enviados</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Smartphone className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">89</p>
              <p className="text-sm text-green-600">Push Notifications</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Bell className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">267</p>
              <p className="text-sm text-orange-600">Toast Messages</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">15</p>
              <p className="text-sm text-purple-600">Agendadas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationTemplates;