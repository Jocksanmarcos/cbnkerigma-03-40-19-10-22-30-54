import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Bell, 
  BellRing, 
  Clock, 
  Users, 
  GraduationCap, 
  Award,
  MessageCircle,
  Send,
  Settings,
  Filter,
  Trash2
} from 'lucide-react';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  icon: string;
  lida: boolean;
  created_at: string;
  usuario_id?: string;
  pessoa_id?: string;
}

interface NotificationSettings {
  novas_matriculas: boolean;
  lembretes_aula: boolean;
  conclusoes_curso: boolean;
  certificados: boolean;
  avaliacoes: boolean;
  badges: boolean;
}

export const NotificationCenter = () => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [settings, setSettings] = useState<NotificationSettings>({
    novas_matriculas: true,
    lembretes_aula: true,
    conclusoes_curso: true,
    certificados: true,
    avaliacoes: true,
    badges: true
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos');

  useEffect(() => {
    loadNotifications();
    loadSettings();
    
    // Configurar listener de tempo real
    const channel = supabase
      .channel('ensino-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes_ensino'
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          
          // Mostrar toast para notificação em tempo real
          toast({
            title: newNotification.titulo,
            description: newNotification.mensagem,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      // Temporariamente usando dados mock até as tabelas serem sincronizadas
      console.log('Carregando notificações...');
      
      // Mock data para desenvolvimento
      setNotifications([]);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    try {
      // Temporariamente usando configurações mock
      console.log('Carregando configurações...');
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      console.log('Marcando notificação como lida:', notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, lida: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      console.log('Marcando todas como lidas');
      setNotifications(prev => prev.map(n => ({ ...n, lida: true })));
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      console.log('Excluindo notificação:', notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
    }
  };

  const updateSettings = async (newSettings: NotificationSettings) => {
    try {
      console.log('Salvando configurações:', newSettings);
      setSettings(newSettings);
      toast({
        title: "Configurações Salvas",
        description: "Suas preferências de notificação foram atualizadas",
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const sendTestNotification = async () => {
    try {
      const { error } = await supabase.functions.invoke('ensino-notifications', {
        body: {
          type: 'teste',
          data: {
            titulo: 'Notificação de Teste',
            mensagem: 'Esta é uma notificação de teste do sistema'
          },
          recipients: [{ usuario_id: (await supabase.auth.getUser()).data.user?.id }]
        }
      });

      if (error) throw error;

      toast({
        title: "Notificação Enviada",
        description: "Notificação de teste enviada com sucesso",
      });
    } catch (error) {
      console.error('Erro ao enviar notificação de teste:', error);
    }
  };

  const getNotificationIcon = (tipo: string) => {
    const iconMap: { [key: string]: any } = {
      matricula: GraduationCap,
      lembrete: Clock,
      progresso: Award,
      certificado: Award,
      avaliacao: MessageCircle,
      badge: Award
    };
    const IconComponent = iconMap[tipo] || Bell;
    return <IconComponent className="h-4 w-4" />;
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'todos') return true;
    if (filter === 'nao_lidas') return !notification.lida;
    return notification.tipo === filter;
  });

  const unreadCount = notifications.filter(n => !n.lida).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Central de Notificações</h2>
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount}</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={sendTestNotification} variant="outline" size="sm">
            <Send className="h-4 w-4 mr-2" />
            Teste
          </Button>
          <Button onClick={markAllAsRead} variant="outline" size="sm">
            <BellRing className="h-4 w-4 mr-2" />
            Marcar Todas como Lidas
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notificacoes">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Filtros</CardTitle>
                <Filter className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'todos', label: 'Todas' },
                  { value: 'nao_lidas', label: 'Não Lidas' },
                  { value: 'matricula', label: 'Matrículas' },
                  { value: 'lembrete', label: 'Lembretes' },
                  { value: 'progresso', label: 'Progresso' },
                  { value: 'certificado', label: 'Certificados' }
                ].map((filterOption) => (
                  <Button
                    key={filterOption.value}
                    variant={filter === filterOption.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(filterOption.value)}
                  >
                    {filterOption.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <Card key={notification.id} className={`transition-colors ${!notification.lida ? 'bg-blue-50 border-blue-200' : ''}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-full ${!notification.lida ? 'bg-blue-100' : 'bg-muted'}`}>
                        {getNotificationIcon(notification.tipo)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{notification.titulo}</h4>
                          {!notification.lida && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.mensagem}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {!notification.lida && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Marcar como Lida
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredNotifications.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Nenhuma notificação encontrada</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure quais tipos de notificação você deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'novas_matriculas', label: 'Novas Matrículas', description: 'Quando alguém se matricular em um curso' },
                { key: 'lembretes_aula', label: 'Lembretes de Aula', description: 'Antes das aulas começarem' },
                { key: 'conclusoes_curso', label: 'Conclusões de Curso', description: 'Quando um aluno concluir um curso' },
                { key: 'certificados', label: 'Certificados Disponíveis', description: 'Quando certificados ficarem prontos' },
                { key: 'avaliacoes', label: 'Novas Avaliações', description: 'Quando avaliações forem criadas' },
                { key: 'badges', label: 'Conquistas de Badges', description: 'Quando alunos ganharem badges' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <label className="text-sm font-medium">{setting.label}</label>
                    <p className="text-xs text-muted-foreground">{setting.description}</p>
                  </div>
                  <Switch
                    checked={settings[setting.key as keyof NotificationSettings]}
                    onCheckedChange={(checked) => {
                      const newSettings = { ...settings, [setting.key]: checked };
                      updateSettings(newSettings);
                    }}
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{notifications.length}</div>
                  <p className="text-sm text-muted-foreground">Total de Notificações</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{unreadCount}</div>
                  <p className="text-sm text-muted-foreground">Não Lidas</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {notifications.filter(n => new Date(n.created_at) > new Date(Date.now() - 24*60*60*1000)).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Últimas 24h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};