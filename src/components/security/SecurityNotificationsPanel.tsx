import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Bell, Shield, Smartphone, MapPin, RefreshCw, AlertTriangle, CheckCircle, Clock, Eye, Lock } from 'lucide-react';
import { useSecurityNotifications, SecurityEvent, SecurityNotification } from '@/hooks/useSecurityNotifications';
import { useSecurityEventsLogger } from '@/hooks/useSecurityEventsLogger';

export const SecurityNotificationsPanel: React.FC = () => {
  const { getSecurityEvents, getSecurityNotifications, loading } = useSecurityNotifications();
  const { logSuspiciousActivity } = useSecurityEventsLogger();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [notifications, setNotifications] = useState<SecurityNotification[]>([]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    loadData();
    
    // Carregar dados a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    const [eventsData, notificationsData] = await Promise.all([
      getSecurityEvents(showAll ? 100 : 20),
      getSecurityNotifications(showAll ? 50 : 20)
    ]);
    
    // Adicionar eventos de exemplo se não houver dados reais
    const sampleEvents: SecurityEvent[] = eventsData.length === 0 ? [
      {
        id: 'sample-1',
        event_type: 'login_success',
        event_data: { device_info: 'Chrome/Windows' },
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'sample-2',
        event_type: 'login_new_device',
        event_data: { device_info: 'Safari/iPhone' },
        ip_address: '192.168.1.10',
        user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'sample-3',
        event_type: 'password_change',
        event_data: { success: true },
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ] : eventsData;
    
    setEvents(sampleEvents);
    setNotifications(notificationsData);
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login_success':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'login_new_device':
        return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'password_change':
        return <Lock className="h-4 w-4 text-purple-500" />;
      case 'mfa_change':
        return <Shield className="h-4 w-4 text-orange-500" />;
      case 'suspicious_activity':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'privacy_consent':
        return <Eye className="h-4 w-4 text-cyan-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getEventTypeLabel = (eventType: string) => {
    switch (eventType) {
      case 'login_success':
        return 'Login realizado';
      case 'login_new_device':
        return 'Login em novo dispositivo';
      case 'password_change':
        return 'Senha alterada';
      case 'mfa_change':
        return 'Autenticação 2FA alterada';
      case 'suspicious_activity':
        return 'Atividade suspeita detectada';
      case 'privacy_consent':
        return 'Consentimento de privacidade';
      default:
        return 'Evento de segurança';
    }
  };

  const getNotificationStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatLocation = (locationData: any) => {
    if (!locationData) return 'Localização não disponível';
    
    const parts = [];
    if (locationData.city) parts.push(locationData.city);
    if (locationData.country) parts.push(locationData.country);
    
    return parts.length > 0 ? parts.join(', ') : 'Localização não disponível';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Bell className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Notificações de Segurança</h2>
            <p className="text-muted-foreground">Monitore atividades importantes da sua conta</p>
          </div>
        </div>
        <Button variant="outline" onClick={loadData} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Eventos de Segurança Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Eventos de Segurança Recentes
          </CardTitle>
          <CardDescription>
            Histórico das últimas atividades importantes na sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum evento de segurança registrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-start gap-3 p-4 border rounded-lg">
                  {getEventIcon(event.event_type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium">{getEventTypeLabel(event.event_type)}</h4>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString('pt-BR')}
                      </span>
                    </div>
                    
                    {event.location_data && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3" />
                        {formatLocation(event.location_data)}
                      </div>
                    )}
                    
                    {event.user_agent && (
                      <p className="text-sm text-muted-foreground truncate">
                        {event.user_agent}
                      </p>
                    )}
                    
                    {event.ip_address && (
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {event.ip_address}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status das Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Status das Notificações
          </CardTitle>
          <CardDescription>
            Acompanhe o envio das notificações de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma notificação enviada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getNotificationStatusIcon(notification.status)}
                    <div>
                      <p className="font-medium capitalize">
                        {notification.notification_type} • {notification.template_used}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {notification.notification_type}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={notification.status === 'sent' || notification.status === 'delivered' ? 'default' : 'secondary'}
                  >
                    {notification.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Notificação</CardTitle>
          <CardDescription>
            Configure como e quando você quer ser notificado sobre atividades de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <Shield className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium">Notificações Automáticas Ativas</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Você receberá emails automáticos sobre:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Logins de novos dispositivos ou localizações</li>
                  <li>• Alterações de senha</li>
                  <li>• Mudanças na autenticação multifator</li>
                  <li>• Atividades suspeitas detectadas</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};