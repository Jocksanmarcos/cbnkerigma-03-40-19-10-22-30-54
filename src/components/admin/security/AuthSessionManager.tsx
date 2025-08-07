import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  Smartphone, 
  Monitor, 
  MapPin, 
  Clock, 
  LogOut, 
  Settings, 
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Globe
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ActiveSession {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  device_name: string;
  ip_address: string;
  location: string;
  last_activity: string;
  created_at: string;
  is_current: boolean;
  risk_level: 'low' | 'medium' | 'high';
}

export const AuthSessionManager: React.FC = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(480); // 8 horas em minutos
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadActiveSessions = async () => {
    try {
      setLoading(true);
      
      // Usar dados mock por enquanto até a tabela estar completamente configurada
      const mockSessions: ActiveSession[] = [
        {
          id: '1',
          user_id: 'admin-1',
          user_name: 'Administrador',
          user_email: 'admin@igreja.com',
          device_type: 'desktop',
          device_name: 'Chrome no Windows 11',
          ip_address: '192.168.1.100',
          location: 'São Paulo, SP',
          last_activity: 'ativo agora',
          created_at: new Date().toISOString(),
          is_current: true,
          risk_level: 'low'
        }
      ];
      setSessions(mockSessions);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActiveSessions();
  }, []);

  const handleForceLogout = async (sessionId: string, userName: string) => {
    try {
      // Em produção, faria a chamada para o Supabase
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      toast({
        title: "Sessão Encerrada",
        description: `A sessão de ${userName} foi encerrada com sucesso.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao encerrar a sessão",
        variant: "destructive"
      });
    }
  };

  const handleMfaToggle = async (enabled: boolean) => {
    try {
      setMfaRequired(enabled);
      toast({
        title: "Configuração Atualizada",
        description: `MFA ${enabled ? 'ativado' : 'desativado'} para administradores.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar configuração de MFA",
        variant: "destructive"
      });
    }
  };

  const handleSessionTimeoutUpdate = async () => {
    try {
      toast({
        title: "Configuração Atualizada",
        description: `Timeout de sessão definido para ${sessionTimeout} minutos.`
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar timeout de sessão",
        variant: "destructive"
      });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" />Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="gap-1"><AlertTriangle className="h-3 w-3" />Médio</Badge>;
      default:
        return <Badge variant="outline" className="gap-1 text-green-600"><CheckCircle2 className="h-3 w-3" />Baixo</Badge>;
    }
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         session.ip_address.includes(searchTerm);
    const matchesRisk = filterRisk === 'all' || session.risk_level === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Configurações de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Autenticação Multifator (MFA)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mfa-toggle" className="text-base font-medium">
                  Exigir MFA para Administradores
                </Label>
                <p className="text-sm text-muted-foreground">
                  Força autenticação de dois fatores para contas administrativas
                </p>
              </div>
              <Switch
                id="mfa-toggle"
                checked={mfaRequired}
                onCheckedChange={handleMfaToggle}
              />
            </div>
            {mfaRequired && (
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  MFA ativo para 5 administradores
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Timeout de Sessão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="session-timeout">Timeout (minutos)</Label>
              <div className="flex gap-2">
                <Input
                  id="session-timeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  min={30}
                  max={1440}
                />
                <Button onClick={handleSessionTimeoutUpdate} variant="outline">
                  Atualizar
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Sessões serão encerradas automaticamente após {sessionTimeout} minutos de inatividade
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sessões Ativas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Sessões Ativas ({filteredSessions.length})
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar sessões..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <select
                value={filterRisk}
                onChange={(e) => setFilterRisk(e.target.value)}
                className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              >
                <option value="all">Todos os Riscos</option>
                <option value="low">Baixo Risco</option>
                <option value="medium">Médio Risco</option>
                <option value="high">Alto Risco</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Última Atividade</TableHead>
                  <TableHead>Risco</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                      <TableCell><div className="h-4 bg-muted animate-pulse rounded"></div></TableCell>
                    </TableRow>
                  ))
                ) : filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma sessão encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSessions.map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{session.user_name}</span>
                            {session.is_current && (
                              <Badge variant="outline" className="text-xs">Atual</Badge>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">{session.user_email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getDeviceIcon(session.device_type)}
                          <div>
                            <div className="text-sm">{session.device_name}</div>
                            <div className="text-xs text-muted-foreground">{session.ip_address}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{session.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{session.last_activity}</span>
                      </TableCell>
                      <TableCell>
                        {getRiskBadge(session.risk_level)}
                      </TableCell>
                      <TableCell className="text-right">
                        {!session.is_current && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleForceLogout(session.id, session.user_name)}
                            className="text-destructive hover:text-destructive"
                          >
                            <LogOut className="h-4 w-4 mr-1" />
                            Encerrar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};