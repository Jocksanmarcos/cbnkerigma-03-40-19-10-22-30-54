import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAdvancedNotifications, PushNotificationData } from '@/hooks/useAdvancedNotifications';
import { useUserRole, UserRole } from '@/hooks/useUserRole';
import { 
  Bell, 
  BellRing, 
  Send, 
  Calendar,
  Users,
  BookOpen,
  DollarSign,
  AlertTriangle,
  Settings,
  Clock,
  Trash2
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { role } = useUserRole();
  const {
    isRegistered,
    preferences,
    sendCustomNotification,
    scheduleLocalNotification,
    savePreferences,
    clearAllNotifications
  } = useAdvancedNotifications();

  const [notification, setNotification] = useState<Partial<PushNotificationData>>({
    title: '',
    body: '',
    tipo: 'geral',
    priority: 'normal'
  });

  const [reminderData, setReminderData] = useState({
    title: '',
    body: '',
    datetime: ''
  });

  // Ícones por tipo de notificação
  const getTypeIcon = (tipo: string) => {
    switch (tipo) {
      case 'evento': return Calendar;
      case 'celula': return Users;
      case 'ensino': return BookOpen;
      case 'financeiro': return DollarSign;
      case 'emergencia': return AlertTriangle;
      default: return Bell;
    }
  };

  // Labels para tipos de notificação
  const typeLabels = {
    evento: 'Eventos',
    celula: 'Células',
    ensino: 'Ensino',
    financeiro: 'Financeiro',
    geral: 'Geral',
    emergencia: 'Emergência'
  };

  // Papéis disponíveis para envio
  const availableRoles: { value: UserRole; label: string }[] = [
    { value: 'membro_comum', label: 'Membros Comuns' },
    { value: 'lider_celula', label: 'Líderes de Célula' },
    { value: 'supervisor_regional', label: 'Supervisores' },
    { value: 'coordenador_ensino', label: 'Coordenadores de Ensino' },
    { value: 'tesoureiro', label: 'Tesoureiros' },
    { value: 'administrador_geral', label: 'Administradores' }
  ];

  const handleSendNotification = async () => {
    if (!notification.title || !notification.body) return;

    await sendCustomNotification(notification as PushNotificationData);
    
    // Limpar formulário
    setNotification({
      title: '',
      body: '',
      tipo: 'geral',
      priority: 'normal'
    });
  };

  const handleScheduleReminder = async () => {
    if (!reminderData.title || !reminderData.datetime) return;

    const scheduleDate = new Date(reminderData.datetime);
    await scheduleLocalNotification(
      reminderData.title,
      reminderData.body,
      scheduleDate
    );

    // Limpar formulário
    setReminderData({ title: '', body: '', datetime: '' });
  };

  const togglePreference = (index: number) => {
    const newPreferences = [...preferences];
    newPreferences[index] = {
      ...newPreferences[index],
      habilitado: !newPreferences[index].habilitado
    };
    savePreferences(newPreferences);
  };

  if (!isRegistered) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <BellRing className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold mb-2">Notificações não configuradas</h3>
          <p className="text-sm text-muted-foreground">
            As notificações push não estão disponíveis ou não foram configuradas.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status das Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BellRing className="w-5 h-5" />
            <span>Central de Notificações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notificações Push Ativas</p>
              <p className="text-sm text-muted-foreground">
                Sistema configurado para seu papel: <Badge variant="secondary">{role}</Badge>
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-green-500" />
              <span className="text-green-500 text-sm font-medium">Ativo</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enviar Notificação Personalizada */}
      {['administrador_geral', 'coordenador_ensino', 'supervisor_regional'].includes(role || '') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Enviar Notificação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="notification-title">Título</Label>
                <Input
                  id="notification-title"
                  value={notification.title}
                  onChange={(e) => setNotification(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título da notificação"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notification-type">Tipo</Label>
                <Select 
                  value={notification.tipo}
                  onValueChange={(value) => setNotification(prev => ({ ...prev, tipo: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(typeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center space-x-2">
                          {React.createElement(getTypeIcon(value), { className: "w-4 h-4" })}
                          <span>{label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notification-body">Mensagem</Label>
              <Textarea
                id="notification-body"
                value={notification.body}
                onChange={(e) => setNotification(prev => ({ ...prev, body: e.target.value }))}
                placeholder="Conteúdo da notificação"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Destinatários</Label>
              <Select 
                value={notification.role_target?.[0] || 'all'}
                onValueChange={(value) => setNotification(prev => ({ 
                  ...prev, 
                  role_target: value === 'all' ? undefined : [value as UserRole]
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione os destinatários" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  {availableRoles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleSendNotification}
              disabled={!notification.title || !notification.body}
              className="w-full"
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Notificação
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Agendar Lembrete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Agendar Lembrete</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reminder-title">Título do Lembrete</Label>
            <Input
              id="reminder-title"
              value={reminderData.title}
              onChange={(e) => setReminderData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Reunião de célula"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-body">Descrição (opcional)</Label>
            <Textarea
              id="reminder-body"
              value={reminderData.body}
              onChange={(e) => setReminderData(prev => ({ ...prev, body: e.target.value }))}
              placeholder="Detalhes do lembrete"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reminder-datetime">Data e Hora</Label>
            <Input
              id="reminder-datetime"
              type="datetime-local"
              value={reminderData.datetime}
              onChange={(e) => setReminderData(prev => ({ ...prev, datetime: e.target.value }))}
            />
          </div>

          <Button 
            onClick={handleScheduleReminder}
            disabled={!reminderData.title || !reminderData.datetime}
            className="w-full"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Agendar Lembrete
          </Button>
        </CardContent>
      </Card>

      {/* Preferências de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Preferências</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {preferences.map((pref, index) => (
            <div key={pref.tipo} className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">
                  {pref.tipo.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {pref.horario_inicio && pref.horario_fim && 
                    `Ativo das ${pref.horario_inicio} às ${pref.horario_fim}`
                  }
                </p>
              </div>
              <Switch
                checked={pref.habilitado}
                onCheckedChange={() => togglePreference(index)}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={clearAllNotifications}
            variant="outline"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todas as Notificações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};