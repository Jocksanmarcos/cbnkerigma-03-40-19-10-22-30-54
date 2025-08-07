import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus, Edit, Trash2, Eye, EyeOff, Bell, BarChart, Link, AlertCircle, Upload, Image } from 'lucide-react';
import NotificacoesEventos from './agenda/NotificacoesEventos';
import RelatoriosParticipacao from './agenda/RelatoriosParticipacao';
import IntegracaoGoogleCalendar from './agenda/IntegracaoGoogleCalendar';
import NotificationTemplates from './agenda/NotificationTemplates';
import LembretesAutomaticos from './agenda/LembretesAutomaticos';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgendaEventos, type AgendaEvento } from '@/hooks/useAgendaEventos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AgendaManager = () => {
  const { eventos, loading, createEvento, updateEvento, deleteEvento, getEventosPublicos, getEventosPorTipo } = useAgendaEventos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<AgendaEvento | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: 'publico' as AgendaEvento['tipo'],
    publico: true,
    data_inicio: '',
    data_fim: '',
    local: '',
    status: 'agendado' as AgendaEvento['status'],
    enviar_notificacao: false,
    grupo: 'geral',
    link_google_calendar: '',
    imagem_url: '',
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: 'publico',
      publico: true,
      data_inicio: '',
      data_fim: '',
      local: '',
      status: 'agendado',
      enviar_notificacao: false,
      grupo: 'geral',
      link_google_calendar: '',
      imagem_url: '',
    });
    setEditingEvento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const eventoData = {
        ...formData,
        visivel_para: ['todos'],
      };

      if (editingEvento) {
        await updateEvento(editingEvento.id, eventoData);
      } else {
        await createEvento(eventoData);
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleEdit = (evento: AgendaEvento) => {
    setEditingEvento(evento);
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      tipo: evento.tipo,
      publico: evento.publico,
      data_inicio: evento.data_inicio.slice(0, 16),
      data_fim: evento.data_fim?.slice(0, 16) || '',
      local: evento.local || '',
      status: evento.status,
      enviar_notificacao: evento.enviar_notificacao,
      grupo: evento.grupo,
      link_google_calendar: evento.link_google_calendar || '',
      imagem_url: evento.imagem_url || '',
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('eventos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('eventos')
        .getPublicUrl(fileName);

      setFormData({ ...formData, imagem_url: publicUrl });
      toast.success('Imagem enviada com sucesso!');
    } catch (error) {
      console.error('Erro ao enviar imagem:', error);
      toast.error('Erro ao enviar imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      await deleteEvento(id);
    }
  };

  const getEventoIcon = (tipo: AgendaEvento['tipo']) => {
    switch (tipo) {
      case 'publico': return <Users className="h-4 w-4" />;
      case 'celula': return <MapPin className="h-4 w-4" />;
      case 'ensino': return <Calendar className="h-4 w-4" />;
      case 'reuniao_interna': return <Clock className="h-4 w-4" />;
      case 'pastoral': return <Eye className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: AgendaEvento['status']) => {
    switch (status) {
      case 'agendado': return 'bg-blue-500';
      case 'confirmado': return 'bg-green-500';
      case 'concluido': return 'bg-gray-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const tiposEvento = [
    { value: 'publico', label: 'Público' },
    { value: 'celula', label: 'Célula' },
    { value: 'ensino', label: 'Ensino' },
    { value: 'reuniao_interna', label: 'Reunião Interna' },
    { value: 'pastoral', label: 'Pastoral' },
  ];

  const statusOptions = [
    { value: 'agendado', label: 'Agendado' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
  ];

  if (loading) {
    return <div className="p-6">Carregando eventos...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Agenda da Igreja</h1>
          <p className="text-muted-foreground">Gerencie todos os eventos e atividades da igreja</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingEvento ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
              <DialogDescription>
                {editingEvento ? 'Edite as informações do evento' : 'Crie um novo evento para a agenda da igreja'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select value={formData.tipo} onValueChange={(value) => setFormData({ ...formData, tipo: value as AgendaEvento['tipo'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEvento.map((tipo) => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          {tipo.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagem">Imagem do Evento</Label>
                <div className="space-y-3">
                  {formData.imagem_url && (
                    <div className="relative">
                      <img 
                        src={formData.imagem_url} 
                        alt="Preview da imagem" 
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setFormData({ ...formData, imagem_url: '' })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Input
                      id="imagem"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      disabled={uploadingImage}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {uploadingImage && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Upload className="h-4 w-4 animate-spin" />
                        Enviando...
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Esta imagem será exibida no site junto com o evento. Recomendado: 800x400px
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data/Hora Início *</Label>
                  <Input
                    id="data_inicio"
                    type="datetime-local"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data/Hora Fim</Label>
                  <Input
                    id="data_fim"
                    type="datetime-local"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="local">Local</Label>
                  <Input
                    id="local"
                    value={formData.local}
                    onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                    placeholder="Endereço ou link virtual"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grupo">Grupo</Label>
                  <Input
                    id="grupo"
                    value={formData.grupo}
                    onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                    placeholder="Ex: jovens, louvor, geral"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as AgendaEvento['status'] })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link_google_calendar">Link Google Calendar</Label>
                  <Input
                    id="link_google_calendar"
                    value={formData.link_google_calendar}
                    onChange={(e) => setFormData({ ...formData, link_google_calendar: e.target.value })}
                    placeholder="URL do Google Calendar"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publico"
                    checked={formData.publico}
                    onCheckedChange={(checked) => setFormData({ ...formData, publico: checked })}
                  />
                  <Label htmlFor="publico">Evento Público</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="enviar_notificacao"
                    checked={formData.enviar_notificacao}
                    onCheckedChange={(checked) => setFormData({ ...formData, enviar_notificacao: checked })}
                  />
                  <Label htmlFor="enviar_notificacao">Enviar Notificação</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEvento ? 'Atualizar' : 'Criar'} Evento
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="publicos">Públicos</TabsTrigger>
          <TabsTrigger value="celula">Células</TabsTrigger>
          <TabsTrigger value="ensino">Ensino</TabsTrigger>
          <TabsTrigger value="reuniao_interna">Reuniões</TabsTrigger>
          <TabsTrigger value="pastoral">Pastoral</TabsTrigger>
          <TabsTrigger value="notificacoes">
            <Bell className="h-4 w-4 mr-1" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="relatorios">
            <BarChart className="h-4 w-4 mr-1" />
            Relatórios
          </TabsTrigger>
          <TabsTrigger value="google-calendar">
            <Link className="h-4 w-4 mr-1" />
            Google Calendar
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-1" />
            Notificações
          </TabsTrigger>
          <TabsTrigger value="lembretes">
            <AlertCircle className="h-4 w-4 mr-1" />
            Lembretes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <div className="grid gap-4">
            {eventos.map((evento) => (
              <Card key={evento.id}>
                {evento.imagem_url && (
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img 
                      src={evento.imagem_url} 
                      alt={evento.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getEventoIcon(evento.tipo)}
                        <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          {tiposEvento.find(t => t.value === evento.tipo)?.label}
                        </Badge>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(evento.status)}`} />
                        {evento.publico ? (
                          <Eye className="h-4 w-4 text-green-600" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(evento)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(evento.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {evento.descricao && (
                    <CardDescription>{evento.descricao}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(evento.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    </div>
                    {evento.local && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{evento.local}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Grupo: {evento.grupo}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="publicos" className="space-y-4">
          <div className="grid gap-4">
            {getEventosPublicos().map((evento) => (
              <Card key={evento.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getEventoIcon(evento.tipo)}
                        <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {tiposEvento.find(t => t.value === evento.tipo)?.label}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(evento)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(evento.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {evento.descricao && (
                    <CardDescription>{evento.descricao}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{format(new Date(evento.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                    </div>
                    {evento.local && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{evento.local}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Grupo: {evento.grupo}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {['celula', 'ensino', 'reuniao_interna', 'pastoral'].map((tipo) => (
          <TabsContent key={tipo} value={tipo} className="space-y-4">
            <div className="grid gap-4">
              {getEventosPorTipo(tipo as AgendaEvento['tipo']).map((evento) => (
                <Card key={evento.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getEventoIcon(evento.tipo)}
                          <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            {tiposEvento.find(t => t.value === evento.tipo)?.label}
                          </Badge>
                          {evento.publico ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(evento)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(evento.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {evento.descricao && (
                      <CardDescription>{evento.descricao}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{format(new Date(evento.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</span>
                      </div>
                      {evento.local && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{evento.local}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Grupo: {evento.grupo}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}

        {/* Novas abas para funcionalidades avançadas */}
        <TabsContent value="notificacoes">
          <NotificacoesEventos />
        </TabsContent>

        <TabsContent value="relatorios">
          <RelatoriosParticipacao />
        </TabsContent>

        <TabsContent value="google-calendar">
          <IntegracaoGoogleCalendar />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationTemplates />
        </TabsContent>

        <TabsContent value="lembretes">
          <LembretesAutomaticos />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AgendaManager;