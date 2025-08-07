import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useComunicacao } from '@/hooks/useComunicacao';
import { MessageSquareMore, Users, Megaphone, Plus, Hash, Bell, Clock, Eye } from 'lucide-react';

export const ComunicacaoManager = () => {
  const { 
    channels, 
    announcements, 
    isLoading, 
    createChannel, 
    createAnnouncement 
  } = useComunicacao();
  
  const [newChannel, setNewChannel] = useState({
    name: '',
    type: 'ministry' as const,
    description: '',
    is_public: false,
    icon: '💬',
    color: '#6366f1'
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    priority: 'normal' as const,
    target_audience: ['all'],
    expires_at: ''
  });

  const [showChannelDialog, setShowChannelDialog] = useState(false);
  const [showAnnouncementDialog, setShowAnnouncementDialog] = useState(false);

  const handleCreateChannel = async () => {
    try {
      await createChannel(newChannel);
      setNewChannel({
        name: '',
        type: 'ministry' as const,
        description: '',
        is_public: false,
        icon: '💬',
        color: '#6366f1'
      });
      setShowChannelDialog(false);
    } catch (error) {
      console.error('Erro ao criar canal:', error);
    }
  };

  const handleCreateAnnouncement = async () => {
    try {
      await createAnnouncement(newAnnouncement);
      setNewAnnouncement({
        title: '',
        content: '',
        priority: 'normal' as const,
        target_audience: ['all'],
        expires_at: ''
      });
      setShowAnnouncementDialog(false);
    } catch (error) {
      console.error('Erro ao criar aviso:', error);
    }
  };

  const getChannelTypeLabel = (type: string) => {
    const types = {
      ministry: 'Ministério',
      cell_group: 'Célula',
      class_group: 'Turma',
      direct_message: 'Mensagem Direta',
      announcement: 'Avisos'
    };
    return types[type as keyof typeof types] || type;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-700',
      normal: 'bg-blue-100 text-blue-700',
      high: 'bg-orange-100 text-orange-700',
      urgent: 'bg-red-100 text-red-700'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hub de Comunicação</h1>
          <p className="text-muted-foreground">
            Gerencie canais de comunicação e avisos da igreja
          </p>
        </div>
      </div>

      <Tabs defaultValue="channels" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <MessageSquareMore className="h-4 w-4" />
            Canais
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="h-4 w-4" />
            Avisos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Canais de Comunicação</h2>
            <Dialog open={showChannelDialog} onOpenChange={setShowChannelDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Canal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Canal</DialogTitle>
                  <DialogDescription>
                    Configure um novo canal de comunicação para a igreja
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="channel-name">Nome do Canal</Label>
                    <Input
                      id="channel-name"
                      value={newChannel.name}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Ministério de Louvor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="channel-type">Tipo</Label>
                    <Select value={newChannel.type} onValueChange={(value) => setNewChannel(prev => ({ ...prev, type: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ministry">Ministério</SelectItem>
                        <SelectItem value="cell_group">Célula</SelectItem>
                        <SelectItem value="class_group">Turma</SelectItem>
                        <SelectItem value="announcement">Avisos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="channel-description">Descrição</Label>
                    <Textarea
                      id="channel-description"
                      value={newChannel.description}
                      onChange={(e) => setNewChannel(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descrição do canal..."
                    />
                  </div>
                  <div className="flex items-center gap-4">
                    <div>
                      <Label htmlFor="channel-icon">Ícone</Label>
                      <Input
                        id="channel-icon"
                        value={newChannel.icon}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, icon: e.target.value }))}
                        className="w-20"
                      />
                    </div>
                    <div>
                      <Label htmlFor="channel-color">Cor</Label>
                      <Input
                        id="channel-color"
                        type="color"
                        value={newChannel.color}
                        onChange={(e) => setNewChannel(prev => ({ ...prev, color: e.target.value }))}
                        className="w-20"
                      />
                    </div>
                  </div>
                  <Button onClick={handleCreateChannel} className="w-full">
                    Criar Canal
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {channels.map((channel) => (
              <Card key={channel.id} className="platform-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: channel.color + '20', color: channel.color }}
                    >
                      {channel.icon}
                    </div>
                    <div>
                      <CardTitle className="text-base">{channel.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {getChannelTypeLabel(channel.type)}
                        </Badge>
                        {channel.is_public && (
                          <Badge variant="secondary">Público</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">{channel.member_count || 0}</span>
                  </div>
                </CardHeader>
                {channel.description && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{channel.description}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Avisos e Comunicados</h2>
            <Dialog open={showAnnouncementDialog} onOpenChange={setShowAnnouncementDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Aviso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Aviso</DialogTitle>
                  <DialogDescription>
                    Publique um aviso para a congregação
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="announcement-title">Título</Label>
                    <Input
                      id="announcement-title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Título do aviso"
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcement-content">Conteúdo</Label>
                    <Textarea
                      id="announcement-content"
                      value={newAnnouncement.content}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Conteúdo do aviso..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="announcement-priority">Prioridade</Label>
                    <Select value={newAnnouncement.priority} onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, priority: value as any }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="announcement-expires">Data de Expiração</Label>
                    <Input
                      id="announcement-expires"
                      type="datetime-local"
                      value={newAnnouncement.expires_at}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expires_at: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleCreateAnnouncement} className="w-full">
                    Publicar Aviso
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="platform-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={getPriorityColor(announcement.priority)}>
                          {announcement.priority.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Eye className="h-3 w-3" />
                          {announcement.views_count}
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                          <Clock className="h-3 w-3" />
                          {new Date(announcement.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Bell className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{announcement.content}</p>
                  {announcement.expires_at && (
                    <div className="mt-3 text-sm text-orange-600">
                      Expira em: {new Date(announcement.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};