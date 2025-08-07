import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Monitor, 
  Smartphone, 
  Globe, 
  LogOut, 
  Shield, 
  ShieldCheck,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Settings,
  Search,
  Filter
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ActiveSession {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  device_type: string;
  ip_address: string;
  user_agent: string;
  login_time: string;
  last_activity: string;
  location?: string;
}

interface LoginHistory {
  id: string;
  user_email: string;
  user_name: string;
  login_time: string;
  ip_address: string;
  device_type: string;
  success: boolean;
  failure_reason?: string;
}

interface SecuritySettings {
  mfa_required: boolean;
  session_timeout: number;
  max_login_attempts: number;
  password_expiry_days: number;
  require_strong_passwords: boolean;
}

export const AccessControl: React.FC = () => {
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    mfa_required: false,
    session_timeout: 30,
    max_login_attempts: 5,
    password_expiry_days: 90,
    require_strong_passwords: true
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFailedOnly, setShowFailedOnly] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadActiveSessions(),
        loadLoginHistory(),
        loadSecuritySettings()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de controle de acesso",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActiveSessions = async () => {
    // Simulação de dados - em produção viria da API
    const mockSessions: ActiveSession[] = [
      {
        id: '1',
        user_id: 'user1',
        user_email: 'admin@cbnkerigma.org',
        user_name: 'Administrador',
        device_type: 'Desktop',
        ip_address: '192.168.1.100',
        user_agent: 'Chrome 120.0.0.0',
        login_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        last_activity: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        location: 'São Paulo, SP'
      },
      {
        id: '2',
        user_id: 'user2',
        user_email: 'pastor@cbnkerigma.org',
        user_name: 'Pastor João',
        device_type: 'Mobile',
        ip_address: '192.168.1.101',
        user_agent: 'Safari Mobile 17.1',
        login_time: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        last_activity: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        location: 'Rio de Janeiro, RJ'
      },
      {
        id: '3',
        user_id: 'user3',
        user_email: 'lider@cbnkerigma.org',
        user_name: 'Líder Maria',
        device_type: 'Tablet',
        ip_address: '192.168.1.102',
        user_agent: 'Firefox 119.0',
        login_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        last_activity: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
        location: 'Belo Horizonte, MG'
      }
    ];
    setActiveSessions(mockSessions);
  };

  const loadLoginHistory = async () => {
    // Simulação de dados - em produção viria da API
    const mockHistory: LoginHistory[] = [
      {
        id: '1',
        user_email: 'admin@cbnkerigma.org',
        user_name: 'Administrador',
        login_time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        ip_address: '192.168.1.100',
        device_type: 'Desktop',
        success: true
      },
      {
        id: '2',
        user_email: 'pastor@cbnkerigma.org',
        user_name: 'Pastor João',
        login_time: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        ip_address: '192.168.1.101',
        device_type: 'Mobile',
        success: true
      },
      {
        id: '3',
        user_email: 'unknown@test.com',
        user_name: 'Usuário Desconhecido',
        login_time: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        ip_address: '203.0.113.1',
        device_type: 'Desktop',
        success: false,
        failure_reason: 'Credenciais inválidas'
      },
      {
        id: '4',
        user_email: 'lider@cbnkerigma.org',
        user_name: 'Líder Maria',
        login_time: new Date(Date.now() - 1000 * 60 * 75).toISOString(),
        ip_address: '192.168.1.102',
        device_type: 'Tablet',
        success: true
      },
      {
        id: '5',
        user_email: 'admin@cbnkerigma.org',
        user_name: 'Administrador',
        login_time: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
        ip_address: '203.0.113.50',
        device_type: 'Desktop',
        success: false,
        failure_reason: 'Tentativa de acesso de localização suspeita'
      }
    ];
    setLoginHistory(mockHistory);
  };

  const loadSecuritySettings = async () => {
    // Em produção, estes dados viriam do banco
    // Por enquanto, usamos valores padrão
  };

  const forceLogout = async (sessionId: string) => {
    if (!confirm('Tem certeza que deseja forçar o logout desta sessão?')) return;

    try {
      // Em produção, chamaria a API para invalidar a sessão
      setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
      
      toast({
        title: "Sucesso",
        description: "Sessão encerrada com sucesso"
      });
    } catch (error) {
      console.error('Erro ao forçar logout:', error);
      toast({
        title: "Erro",
        description: "Erro ao encerrar sessão",
        variant: "destructive"
      });
    }
  };

  const updateSecuritySetting = async (setting: keyof SecuritySettings, value: boolean | number) => {
    try {
      setSecuritySettings(prev => ({ ...prev, [setting]: value }));
      
      // Em produção, salvaria no banco
      toast({
        title: "Sucesso",
        description: "Configuração de segurança atualizada"
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração",
        variant: "destructive"
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const filteredHistory = loginHistory.filter(entry => {
    const matchesSearch = entry.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !showFailedOnly || !entry.success;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Controle de Acesso</h2>
        <p className="text-muted-foreground">Gerencie sessões ativas e configurações de autenticação</p>
      </div>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">MFA Obrigatório</Label>
                <p className="text-sm text-muted-foreground">Exigir autenticação de dois fatores</p>
              </div>
              <Switch
                checked={securitySettings.mfa_required}
                onCheckedChange={(checked) => updateSecuritySetting('mfa_required', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Senhas Fortes</Label>
                <p className="text-sm text-muted-foreground">Exigir senhas complexas</p>
              </div>
              <Switch
                checked={securitySettings.require_strong_passwords}
                onCheckedChange={(checked) => updateSecuritySetting('require_strong_passwords', checked)}
              />
            </div>
          </div>

          <Alert className="border-yellow-200 bg-yellow-50">
            <ShieldCheck className="h-4 w-4" />
            <AlertDescription>
              <strong>MFA em Desenvolvimento:</strong> A autenticação multi-fator será implementada na próxima versão.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sessões Ativas ({activeSessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeSessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getDeviceIcon(session.device_type)}
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <div>
                    <p className="font-medium">{session.user_name}</p>
                    <p className="text-sm text-muted-foreground">{session.user_email}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>IP: {session.ip_address}</span>
                      <span>{session.device_type}</span>
                      {session.location && <span>{session.location}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm">
                    <p className="text-muted-foreground">Última atividade</p>
                    <p>{new Date(session.last_activity).toLocaleString('pt-BR')}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => forceLogout(session.id)}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Login
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button
                variant={showFailedOnly ? "default" : "outline"}
                size="sm"
                onClick={() => setShowFailedOnly(!showFailedOnly)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Apenas Falhas
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{entry.user_name}</p>
                      <p className="text-sm text-muted-foreground">{entry.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {new Date(entry.login_time).toLocaleString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">{entry.ip_address}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(entry.device_type)}
                      {entry.device_type}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={entry.success ? 'default' : 'destructive'}>
                      {entry.success ? (
                        <>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Sucesso
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Falha
                        </>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {entry.failure_reason && (
                      <span className="text-sm text-red-600">{entry.failure_reason}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};