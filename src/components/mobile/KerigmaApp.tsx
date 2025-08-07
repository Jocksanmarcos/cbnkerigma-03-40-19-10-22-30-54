import React, { useEffect, useState } from 'react';
import { 
  PushNotifications, 
  PushNotificationSchema, 
  ActionPerformed 
} from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAuth } from '@/hooks/useAuth';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useToast } from '@/hooks/use-toast';
import { BiometricLogin } from './BiometricLogin';
import { NotificationCenter } from './NotificationCenter';
import { AgendaMobile } from './AgendaMobile';
import { EscalasMinisterio } from './EscalasMinisterio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Users, 
  Calendar, 
  BookOpen, 
  Heart,
  Trophy,
  MessageCircle,
  Church,
  Gift,
  Settings,
  User,
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';

interface AppState {
  isOnline: boolean;
  notificationsEnabled: boolean;
  gamificationScore: number;
  offlineDataSync: boolean;
}

export const KerigmaApp: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { isAvailable: biometricAvailable, isEnabled: biometricEnabled, authenticateWithBiometry } = useBiometricAuth();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'home' | 'notifications' | 'settings' | 'agenda' | 'escalas'>('home');
  const [appState, setAppState] = useState<AppState>({
    isOnline: navigator.onLine,
    notificationsEnabled: false,
    gamificationScore: 0,
    offlineDataSync: false
  });

  // Inicialização do app mobile
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeNativeFeatures();
      
      // Tentar autenticação biométrica automática se habilitada
      if (biometricAvailable && biometricEnabled && !isAuthenticated) {
        setTimeout(() => {
          authenticateWithBiometry();
        }, 1000); // Pequeno delay para UX
      }
    }

    // Listeners para conexão
    const handleOnline = () => setAppState(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setAppState(prev => ({ ...prev, isOnline: false }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [biometricAvailable, biometricEnabled, isAuthenticated]);

  const initializeNativeFeatures = async () => {
    try {
      // Configurar status bar
      await StatusBar.setStyle({ style: Style.Default });
      
      // Solicitar permissões para notificações
      await requestNotificationPermissions();
      
      // Configurar listeners de notificações
      setupNotificationListeners();
      
    } catch (error) {
      console.error('Erro ao inicializar recursos nativos:', error);
    }
  };

  const requestNotificationPermissions = async () => {
    try {
      const permStatus = await PushNotifications.requestPermissions();
      
      if (permStatus.receive === 'granted') {
        await PushNotifications.register();
        setAppState(prev => ({ ...prev, notificationsEnabled: true }));
        
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá atualizações importantes do KerigmaApp.",
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões:', error);
    }
  };

  const setupNotificationListeners = () => {
    // Listener para registro bem-sucedido
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
    });

    // Listener para erros
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Registration error: ', error.error);
    });

    // Listener para notificações recebidas
    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      toast({
        title: notification.title || "Nova notificação",
        description: notification.body,
      });
    });

    // Listener para ações em notificações
    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push notification action performed', notification);
    });
  };

  const hapticFeedback = async (impact: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: impact });
    }
  };

  const scheduleLocalNotification = async (title: string, body: string, delay: number = 0) => {
    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Math.floor(Math.random() * 10000),
          schedule: { at: new Date(Date.now() + delay) },
          sound: 'beep.wav',
          smallIcon: 'ic_stat_icon_config_sample'
        }]
      });
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  };

  const quickActions = [
    {
      icon: Users,
      label: 'Minha Célula',
      color: 'bg-primary',
      action: () => {
        hapticFeedback();
        // Navegar para célula
      }
    },
    {
      icon: Calendar,
      label: 'Agenda',
      color: 'bg-blue-500',
      action: () => {
        hapticFeedback();
        setCurrentView('agenda');
      }
    },
    {
      icon: Users,
      label: 'Escalas',
      color: 'bg-purple-500',
      action: () => {
        hapticFeedback();
        setCurrentView('escalas');
      }
    },
    {
      icon: BookOpen,
      label: 'Cursos',
      color: 'bg-green-500',
      action: () => {
        hapticFeedback();
        // Navegar para cursos
      }
    },
    {
      icon: Heart,
      label: 'Oração',
      color: 'bg-pink-500',
      action: () => {
        hapticFeedback();
        // Navegar para pedidos de oração
      }
    },
    {
      icon: Gift,
      label: 'Ofertas',
      color: 'bg-yellow-500',
      action: () => {
        hapticFeedback();
        // Navegar para contribuições
      }
    },
    {
      icon: MessageCircle,
      label: 'Chat',
      color: 'bg-purple-500',
      action: () => {
        hapticFeedback();
        // Abrir chat
      }
    },
    {
      icon: Bell,
      label: 'Notificações',
      color: 'bg-red-500',
      action: () => {
        hapticFeedback();
        // Abrir central de notificações
        setCurrentView('notifications');
      }
    }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-6">
          <Card className="text-center">
            <CardHeader>
              <Church className="w-16 h-16 text-primary mx-auto mb-4" />
              <CardTitle className="text-2xl font-bold gradient-text">KerigmaApp</CardTitle>
              <p className="text-muted-foreground">
                Sua vida espiritual na palma da mão
              </p>
            </CardHeader>
          </Card>
          
          <BiometricLogin />
        </div>
      </div>
    );
  }

  // Renderizar view atual
  const renderCurrentView = () => {
    switch (currentView) {
      case 'notifications':
        return <NotificationCenter />;
      case 'settings':
        return <div>Configurações em desenvolvimento</div>;
      case 'agenda':
        return <AgendaMobile userRole="member" />;
      case 'escalas':
        return <EscalasMinisterio userRole="member" />;
      default:
        return renderHomeView();
    }
  };

  const renderHomeView = () => (
    <>
      {/* Header com status */}
      <div className="bg-primary text-primary-foreground p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Church className="w-8 h-8" />
          <div>
            <h1 className="font-bold text-lg">KerigmaApp</h1>
            <p className="text-sm opacity-90">Olá, {user?.email?.split('@')[0]}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {currentView !== 'home' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentView('home')}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              Voltar
            </Button>
          )}
          {appState.isOnline ? (
            <Wifi className="w-5 h-5 text-green-400" />
          ) : (
            <WifiOff className="w-5 h-5 text-red-400" />
          )}
          
          {appState.notificationsEnabled && (
            <Bell className="w-5 h-5 text-yellow-400" />
          )}
          
          {!appState.isOnline && appState.offlineDataSync && (
            <Download className="w-5 h-5 text-blue-400 animate-pulse" />
          )}
        </div>
      </div>

      {/* Status offline banner */}
      {!appState.isOnline && (
        <div className="bg-orange-500 text-white p-3 text-center text-sm">
          <WifiOff className="w-4 h-4 inline-block mr-2" />
          Modo offline - Dados serão sincronizados quando conectar
        </div>
      )}

      {/* Gamificação */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Sua Jornada</h3>
                  <p className="text-sm text-muted-foreground">
                    {appState.gamificationScore} pontos
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-gradient-to-r from-primary to-purple-600 text-white">
                Nível 3
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Acesso Rápido</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={action.action}
              >
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm font-medium">{action.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recursos do App */}
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Recursos</h2>
        <div className="space-y-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-primary" />
                  <span>Notificações Push</span>
                </div>
                <Badge variant={appState.notificationsEnabled ? "default" : "secondary"}>
                  {appState.notificationsEnabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Download className="w-5 h-5 text-primary" />
                  <span>Modo Offline</span>
                </div>
                <Badge variant="default">Disponível</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span>Gamificação</span>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botões de teste para desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="p-4 border-t">
          <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Testes de Desenvolvimento</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => scheduleLocalNotification("Teste", "Notificação de teste!", 3000)}
            >
              Testar Notificação (3s)
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => hapticFeedback(ImpactStyle.Heavy)}
            >
              Testar Vibração
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {renderCurrentView()}
    </div>
  );
};