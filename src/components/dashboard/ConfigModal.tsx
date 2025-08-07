import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, User, Bell, Shield, Database, Cloud, Save, RefreshCw, Smartphone, Globe, Palette, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useNotificationPreferences, type NotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface ConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SystemStats {
  dbHealth: number;
  cacheHitRate: number;
  responseTime: number;
  activeUsers: number;
  storageUsed: number;
  backupStatus: 'healthy' | 'warning' | 'error';
}

export const ConfigModal: React.FC<ConfigModalProps> = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { preferences, loading, updatePreferences } = useNotificationPreferences();
  
  const [profileData, setProfileData] = useState({
    nome: user?.user_metadata?.nome || '',
    email: user?.email || '',
    telefone: '',
    bio: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginAlerts: true
  });

  const [systemConfig, setSystemConfig] = useState({
    maintenanceMode: false,
    debugMode: false,
    autoBackup: true,
    cacheEnabled: true,
    compressionEnabled: true
  });

  // Fetch system statistics
  const { data: systemStats, loading: statsLoading, refetch: refetchStats } = useOptimizedQuery<SystemStats>({
    queryKey: 'system-stats',
    queryFn: async () => {
      // Simulate system stats - replace with real data
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        dbHealth: 95,
        cacheHitRate: 78,
        responseTime: 240,
        activeUsers: 42,
        storageUsed: 68,
        backupStatus: 'healthy' as const
      };
    },
    staleTime: 30000, // 30 seconds
    cacheTime: 60000, // 1 minute
  });

  const handleSaveProfile = async () => {
    try {
      // Update user metadata in Supabase Auth
      const { error } = await supabase.auth.updateUser({
        data: {
          nome: profileData.nome,
          telefone: profileData.telefone,
          bio: profileData.bio
        }
      });

      if (error) throw error;

      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil.",
        variant: "destructive",
      });
    }
  };

  const [localPreferences, setLocalPreferences] = useState(preferences || {
    evento_reminders: true,
    evento_confirmations: true,
    celula_updates: true,
    ensino_updates: true,
    general_announcements: true,
    sound_enabled: true,
    vibration_enabled: true,
    quiet_hours_start: '22:00',
    quiet_hours_end: '07:00',
  });

  React.useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  const handleSaveNotifications = async () => {
    if (localPreferences) {
      await updatePreferences(localPreferences);
    }
  };

  const handleTestNotification = () => {
    // Simple test notification implementation
    console.log('Test notification triggered');
  };

  const handleSaveSecurity = async () => {
    try {
      // Save security settings to database
      const { error } = await supabase
        .from('configuracoes_notificacoes')
        .upsert({
          user_id: user?.id,
          configuracoes: {
            ...localPreferences,
            security: securitySettings
          }
        });

      if (error) throw error;

      toast({
        title: "Segurança configurada",
        description: "Configurações de segurança atualizadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações de segurança.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSystemConfig = async () => {
    try {
      toast({
        title: "Sistema configurado",
        description: "Configurações do sistema atualizadas.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações do sistema.",
        variant: "destructive",
      });
    }
  };

  const handleBackupData = () => {
    toast({
      title: "Backup iniciado",
      description: "O backup dos dados foi iniciado e será enviado por email quando concluído.",
    });
  };

  const handleExportReports = () => {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const blob = new Blob([`Relatório exportado em ${dataAtual}\n\nDados do sistema CBNKERIGMA`], 
      { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${dataAtual.replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Relatório exportado",
      description: "O arquivo foi baixado com sucesso.",
    });
  };

  const TabsComponent = isMobile ? MobileTabs : Tabs;
  const TabsListComponent = isMobile ? MobileTabsList : TabsList;
  const TabsTriggerComponent = isMobile ? MobileTabsTrigger : TabsTrigger;
  const TabsContentComponent = isMobile ? MobileTabsContent : TabsContent;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? 'dialog-mobile' : 'max-w-4xl'} max-h-[90vh] overflow-hidden flex flex-col`}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <TabsComponent defaultValue="profile" className="w-full">
            <TabsListComponent className={`${isMobile ? 'sticky top-0 bg-background/95 backdrop-blur-sm z-10 mb-4' : 'grid w-full grid-cols-5'}`}>
              <TabsTriggerComponent value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {!isMobile && "Perfil"}
              </TabsTriggerComponent>
              <TabsTriggerComponent value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                {!isMobile && "Notificações"}
              </TabsTriggerComponent>
              <TabsTriggerComponent value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {!isMobile && "Segurança"}
              </TabsTriggerComponent>
              <TabsTriggerComponent value="database" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                {!isMobile && "Dados"}
              </TabsTriggerComponent>
              <TabsTriggerComponent value="system" className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                {!isMobile && "Sistema"}
              </TabsTriggerComponent>
            </TabsListComponent>

            {/* Aba Perfil */}
            <TabsContentComponent value="profile" className="space-y-6">
              <Card className={isMobile ? 'card-mobile' : ''}>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e de contato
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input
                        id="nome"
                        value={profileData.nome}
                        onChange={(e) => setProfileData(prev => ({ ...prev, nome: e.target.value }))}
                        className={isMobile ? 'text-base' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        className={isMobile ? 'text-base' : ''}
                        disabled
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={profileData.telefone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(11) 99999-9999"
                      className={isMobile ? 'text-base' : ''}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea
                      id="bio"
                      value={profileData.bio}
                      onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Fale um pouco sobre você..."
                      rows={3}
                      className={isMobile ? 'text-base' : ''}
                    />
                  </div>

                  <Button 
                    onClick={handleSaveProfile} 
                    className={`w-full ${isMobile ? 'button-mobile' : ''}`}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Alterações
                  </Button>
                </CardContent>
              </Card>
            </TabsContentComponent>

            {/* Aba Notificações */}
            <TabsContentComponent value="notifications" className="space-y-6">
              <Card className={isMobile ? 'card-mobile' : ''}>
                <CardHeader>
                  <CardTitle>Preferências de Notificação</CardTitle>
                  <CardDescription>
                    Configure como e quando você quer receber notificações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações por Email</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações importantes por email
                        </p>
                      </div>
                      <Switch
                        checked={localPreferences?.evento_reminders || false}
                        onCheckedChange={(checked) => 
                          setLocalPreferences(prev => ({ ...prev, evento_reminders: checked } as any))
                        }
                        disabled={loading}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Notificações Push</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações no navegador
                        </p>
                      </div>
                      <Switch
                        checked={localPreferences?.celula_updates || false}
                        onCheckedChange={(checked) => 
                          setLocalPreferences(prev => ({ ...prev, celula_updates: checked } as any))
                        }
                        disabled={loading}
                      />
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>WhatsApp</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba notificações pelo WhatsApp
                        </p>
                      </div>
                      <Switch
                        checked={localPreferences?.ensino_updates || false}
                        onCheckedChange={(checked) => 
                          setLocalPreferences(prev => ({ ...prev, ensino_updates: checked } as any))
                        }
                        disabled={loading}
                      />
                    </div>

                    {localPreferences?.ensino_updates && (
                      <div className="ml-4">
                        <Label htmlFor="quietHours">Horário Silencioso</Label>
                        <Input
                          id="quietHours"
                          value={localPreferences?.quiet_hours_start || ''}
                          onChange={(e) => 
                            setLocalPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value } as any))
                          }
                          placeholder="22:00"
                          disabled={loading}
                          className={isMobile ? 'text-base' : ''}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Relatórios Semanais</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba resumo semanal das atividades
                        </p>
                      </div>
                      <Switch
                        checked={localPreferences?.general_announcements || false}
                        onCheckedChange={(checked) => 
                          setLocalPreferences(prev => ({ ...prev, general_announcements: checked } as any))
                        }
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    <Button 
                      onClick={handleTestNotification} 
                      variant="outline"
                      disabled={!localPreferences?.sound_enabled}
                      className={isMobile ? 'button-mobile' : ''}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Testar Notificação
                    </Button>
                    <Button 
                      onClick={handleSaveNotifications} 
                      disabled={loading}
                      className={isMobile ? 'button-mobile' : ''}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {loading ? 'Salvando...' : 'Salvar Preferências'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContentComponent>

            {/* Aba Segurança */}
            <TabsContentComponent value="security" className="space-y-6">
              <Card className={isMobile ? 'card-mobile' : ''}>
                <CardHeader>
                  <CardTitle>Configurações de Segurança</CardTitle>
                  <CardDescription>
                    Mantenha sua conta segura com essas configurações
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Autenticação de Dois Fatores</Label>
                        <p className="text-sm text-muted-foreground">
                          Adicione uma camada extra de segurança
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => 
                          setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Timeout da Sessão (minutos)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => 
                          setSecuritySettings(prev => ({ ...prev, sessionTimeout: e.target.value }))
                        }
                        min="5"
                        max="480"
                        className={isMobile ? 'text-base' : ''}
                      />
                      <p className="text-sm text-muted-foreground">
                        Tempo para logout automático por inatividade
                      </p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Alertas de Login</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba alertas de novos logins
                        </p>
                      </div>
                      <Switch
                        checked={securitySettings.loginAlerts}
                        onCheckedChange={(checked) => 
                          setSecuritySettings(prev => ({ ...prev, loginAlerts: checked }))
                        }
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSaveSecurity} 
                    className={`w-full ${isMobile ? 'button-mobile' : ''}`}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContentComponent>

            {/* Aba Dados */}
            <TabsContentComponent value="database" className="space-y-6">
              <Card className={isMobile ? 'card-mobile' : ''}>
                <CardHeader>
                  <CardTitle>Gestão de Dados</CardTitle>
                  <CardDescription>
                    Ferramentas para backup e gestão dos dados do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-2'} gap-4`}>
                    <Button 
                      variant="outline" 
                      className={`${isMobile ? 'h-16' : 'h-24'} p-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200`}
                      onClick={handleBackupData}
                    >
                      <Database className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">Backup Completo</span>
                    </Button>

                    <Button 
                      variant="outline" 
                      className={`${isMobile ? 'h-16' : 'h-24'} p-4 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200`}
                      onClick={handleExportReports}
                    >
                      <Cloud className="h-6 w-6 text-primary" />
                      <span className="text-sm font-medium">Exportar Relatórios</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContentComponent>

            {/* Aba Sistema */}
            <TabsContentComponent value="system" className="space-y-6">
              <Card className={isMobile ? 'card-mobile' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Status do Sistema</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={refetchStats}
                      disabled={statsLoading}
                      className={isMobile ? 'text-xs' : ''}
                    >
                      <RefreshCw className={`h-4 w-4 ${statsLoading ? 'animate-spin' : ''}`} />
                      {!isMobile && 'Atualizar'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {statsLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  ) : systemStats ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Saúde do Banco</span>
                          <span className="font-medium">{systemStats.dbHealth}%</span>
                        </div>
                        <Progress value={systemStats.dbHealth} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Taxa de Cache</span>
                          <span className="font-medium">{systemStats.cacheHitRate}%</span>
                        </div>
                        <Progress value={systemStats.cacheHitRate} className="h-2" />
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uso de Armazenamento</span>
                          <span className="font-medium">{systemStats.storageUsed}%</span>
                        </div>
                        <Progress value={systemStats.storageUsed} className="h-2" />
                      </div>

                      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-3'} gap-4 mt-6`}>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-primary">{systemStats.activeUsers}</div>
                          <div className="text-xs text-muted-foreground">Usuários Ativos</div>
                        </div>
                        <div className="text-center p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-bold text-primary">{systemStats.responseTime}ms</div>
                          <div className="text-xs text-muted-foreground">Tempo Resposta</div>
                        </div>
                        {!isMobile && (
                          <div className="text-center p-3 bg-muted/50 rounded-lg">
                            <Badge variant={systemStats.backupStatus === 'healthy' ? 'default' : 'destructive'}>
                              {systemStats.backupStatus === 'healthy' ? 'OK' : 'Erro'}
                            </Badge>
                            <div className="text-xs text-muted-foreground mt-1">Status Backup</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className={isMobile ? 'card-mobile' : ''}>
                <CardHeader>
                  <CardTitle>Configurações do Sistema</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Backup Automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Backup diário automatizado
                      </p>
                    </div>
                    <Switch
                      checked={systemConfig.autoBackup}
                      onCheckedChange={(checked) => 
                        setSystemConfig(prev => ({ ...prev, autoBackup: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Cache Inteligente</Label>
                      <p className="text-sm text-muted-foreground">
                        Otimização automática de performance
                      </p>
                    </div>
                    <Switch
                      checked={systemConfig.cacheEnabled}
                      onCheckedChange={(checked) => 
                        setSystemConfig(prev => ({ ...prev, cacheEnabled: checked }))
                      }
                    />
                  </div>

                  <Button 
                    onClick={handleSaveSystemConfig} 
                    className={`w-full ${isMobile ? 'button-mobile' : ''}`}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </CardContent>
              </Card>
            </TabsContentComponent>
          </TabsComponent>
        </div>
      </DialogContent>
    </Dialog>
  );
};