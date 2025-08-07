import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  Smartphone, 
  Settings, 
  Clock,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  X
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface NotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  reminderBefore: number; // minutos antes do evento
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

interface EventNotification {
  id: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  notificationType: 'reminder' | 'update' | 'new';
  sent: boolean;
  read: boolean;
  scheduledFor: string;
}

const EventNotificationManager = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    emailEnabled: true,
    reminderBefore: 30,
    soundEnabled: true,
    vibrationEnabled: true
  });

  const [notifications, setNotifications] = useState<EventNotification[]>([
    {
      id: '1',
      eventTitle: 'Culto de Domingo',
      eventDate: '15/12/2024 19:00',
      eventLocation: 'Igreja Principal',
      notificationType: 'reminder',
      sent: false,
      read: false,
      scheduledFor: '15/12/2024 18:30'
    },
    {
      id: '2',
      eventTitle: 'Célula Jovens',
      eventDate: '18/12/2024 20:00',
      eventLocation: 'Casa dos Silva',
      notificationType: 'new',
      sent: true,
      read: true,
      scheduledFor: '12/12/2024 10:00'
    }
  ]);

  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.permission;
      setHasPermission(permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setHasPermission(permission === 'granted');
      
      if (permission === 'granted') {
        toast({
          title: "Permissão concedida",
          description: "Você receberá notificações sobre eventos.",
        });
      } else {
        toast({
          title: "Permissão negada",
          description: "Não será possível enviar notificações push.",
          variant: "destructive",
        });
      }
    }
  };

  const sendTestNotification = () => {
    if (hasPermission && settings.pushEnabled) {
      new Notification('Teste de Notificação', {
        body: 'Esta é uma notificação de teste para eventos da igreja.',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification'
      });

      toast({
        title: "Notificação enviada",
        description: "Verifique se recebeu a notificação de teste.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Notificações não estão habilitadas.",
        variant: "destructive",
      });
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'reminder': return Clock;
      case 'update': return Bell;
      case 'new': return Calendar;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'reminder': return 'bg-yellow-500';
      case 'update': return 'bg-blue-500';
      case 'new': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status das Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Status das Notificações Mobile
          </CardTitle>
          <CardDescription>
            Configure as notificações para dispositivos móveis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${hasPermission ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium">
                  {hasPermission ? 'Permissões Concedidas' : 'Permissões Necessárias'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hasPermission ? 'Notificações push habilitadas' : 'Clique para habilitar notificações'}
                </p>
              </div>
            </div>
            
            {!hasPermission && (
              <Button onClick={requestNotificationPermission}>
                <Bell className="h-4 w-4 mr-2" />
                Habilitar
              </Button>
            )}
          </div>

          {hasPermission && (
            <div className="space-y-4">
              {/* Configurações */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-base font-medium">Tipos de Notificação</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-enabled" className="text-sm">
                      Notificações Push
                    </Label>
                    <Switch
                      id="push-enabled"
                      checked={settings.pushEnabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, pushEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-enabled" className="text-sm">
                      Notificações por Email
                    </Label>
                    <Switch
                      id="email-enabled"
                      checked={settings.emailEnabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, emailEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-enabled" className="text-sm">
                      Som da Notificação
                    </Label>
                    <Switch
                      id="sound-enabled"
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, soundEnabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="vibration-enabled" className="text-sm">
                      Vibração
                    </Label>
                    <Switch
                      id="vibration-enabled"
                      checked={settings.vibrationEnabled}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({ ...prev, vibrationEnabled: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-medium">Configurações de Tempo</Label>
                  
                  <div>
                    <Label htmlFor="reminder-time" className="text-sm">
                      Lembrete antes do evento (minutos)
                    </Label>
                    <select 
                      id="reminder-time"
                      className="w-full mt-1 p-2 border rounded-md"
                      value={settings.reminderBefore}
                      onChange={(e) => 
                        setSettings(prev => ({ ...prev, reminderBefore: parseInt(e.target.value) }))
                      }
                    >
                      <option value={5}>5 minutos</option>
                      <option value={15}>15 minutos</option>
                      <option value={30}>30 minutos</option>
                      <option value={60}>1 hora</option>
                      <option value={120}>2 horas</option>
                      <option value={1440}>1 dia</option>
                    </select>
                  </div>

                  <Button 
                    onClick={sendTestNotification}
                    disabled={!hasPermission || !settings.pushEnabled}
                    className="w-full"
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Testar Notificação
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações Recentes
          </CardTitle>
          <CardDescription>
            Histórico de notificações enviadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notification) => {
              const NotificationIcon = getNotificationIcon(notification.notificationType);
              return (
                <div 
                  key={notification.id} 
                  className={`flex items-start justify-between p-4 border rounded-lg ${
                    !notification.read ? 'bg-muted/30' : ''
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <NotificationIcon className="h-5 w-5 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{notification.eventTitle}</h4>
                        <Badge className={getNotificationColor(notification.notificationType)}>
                          {notification.notificationType === 'reminder' && 'Lembrete'}
                          {notification.notificationType === 'update' && 'Atualização'}
                          {notification.notificationType === 'new' && 'Novo'}
                        </Badge>
                        {notification.sent && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{notification.eventDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{notification.eventLocation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>Agendado para: {notification.scheduledFor}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsRead(notification.id)}
                      >
                        Marcar como lida
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeNotification(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {notifications.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma notificação recente</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estatísticas de Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Bell className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">87%</p>
              <p className="text-sm text-blue-600">Taxa de Entrega</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">92%</p>
              <p className="text-sm text-green-600">Taxa de Leitura</p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">12</p>
              <p className="text-sm text-orange-600">Agendadas</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">324</p>
              <p className="text-sm text-purple-600">Usuários Ativos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EventNotificationManager;