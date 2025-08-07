import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Lock,
  Users,
  Activity,
  FileText,
  Eye,
  Clock,
  Globe,
  Server,
  Database
} from 'lucide-react';

export const SecurityAudit = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const securityScore = 87;
  
  const securityChecks = [
    { name: 'Autenticação 2FA', status: 'passed', severity: 'high', description: 'Autenticação de dois fatores ativa' },
    { name: 'Certificado SSL', status: 'passed', severity: 'critical', description: 'Certificado válido e atualizado' },
    { name: 'Firewall', status: 'passed', severity: 'high', description: 'Proteção ativa contra ataques' },
    { name: 'Backup de Segurança', status: 'warning', severity: 'medium', description: 'Último backup há 25 horas' },
    { name: 'Atualizações', status: 'failed', severity: 'low', description: '3 atualizações pendentes' },
    { name: 'Senhas Fracas', status: 'warning', severity: 'medium', description: '2 usuários com senhas fracas' },
  ];

  const accessLogs = [
    { user: 'admin@cbnkerigma.com', action: 'Login', ip: '192.168.1.100', time: '10:45', status: 'success' },
    { user: 'pastor@cbnkerigma.com', action: 'Acesso ao painel', ip: '192.168.1.101', time: '10:30', status: 'success' },
    { user: 'unknown', action: 'Tentativa de login', ip: '203.0.113.10', time: '09:15', status: 'failed' },
    { user: 'editor@cbnkerigma.com', action: 'Upload de arquivo', ip: '192.168.1.102', time: '08:45', status: 'success' },
    { user: 'unknown', action: 'Tentativa de acesso', ip: '203.0.113.15', time: '07:30', status: 'blocked' },
  ];

  const userPermissions = [
    { user: 'Pastor Carlos', role: 'Admin', permissions: ['Todas'], lastAccess: '2 horas atrás', status: 'active' },
    { user: 'Maria Santos', role: 'Editor', permissions: ['Conteúdo', 'Galeria'], lastAccess: '1 dia atrás', status: 'active' },
    { user: 'João Silva', role: 'Moderador', permissions: ['Eventos', 'Contatos'], lastAccess: '3 dias atrás', status: 'inactive' },
    { user: 'Ana Costa', role: 'Viewer', permissions: ['Visualizar'], lastAccess: '1 semana atrás', status: 'active' },
  ];

  const threats = [
    { type: 'Tentativa de Login', severity: 'medium', source: '203.0.113.10', time: '09:15', blocked: true },
    { type: 'Acesso Suspeito', severity: 'low', source: '198.51.100.5', time: '08:30', blocked: true },
    { type: 'Scan de Portas', severity: 'high', source: '203.0.113.15', time: '07:45', blocked: true },
  ];

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Auditoria de Segurança</h2>
          <p className="text-muted-foreground">
            Monitor de segurança e controle de acesso
          </p>
        </div>
        <Button 
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          {isScanning ? 'Escaneando...' : 'Executar Scan'}
        </Button>
      </div>

      {isScanning && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Executando auditoria de segurança... {scanProgress}%</p>
              <Progress value={scanProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score de Segurança</p>
                <p className="text-3xl font-bold text-green-600">{securityScore}/100</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tentativas Bloqueadas</p>
                <p className="text-2xl font-bold">23</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuários Ativos</p>
                <p className="text-2xl font-bold">12</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Sessões ativas</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Último Backup</p>
                <p className="text-2xl font-bold">25h</p>
              </div>
              <Database className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Backup seguro</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Verificações</TabsTrigger>
          <TabsTrigger value="access">Logs de Acesso</TabsTrigger>
          <TabsTrigger value="permissions">Permissões</TabsTrigger>
          <TabsTrigger value="threats">Ameaças</TabsTrigger>
        </TabsList>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Verificações de Segurança</CardTitle>
              <CardDescription>
                Status das principais verificações de segurança
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityChecks.map((check, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {check.status === 'passed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                      {check.status === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                      {check.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                      <div>
                        <p className="font-medium">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={getSeverityColor(check.severity)}
                      >
                        {check.severity}
                      </Badge>
                      <Badge className={getStatusColor(check.status)}>
                        {check.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Acesso</CardTitle>
              <CardDescription>
                Histórico de acessos e atividades do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{log.user}</p>
                        <p className="text-sm text-muted-foreground">{log.action}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{log.ip}</span>
                      <span>{log.time}</span>
                      <Badge className={
                        log.status === 'success' ? 'bg-green-100 text-green-800' :
                        log.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }>
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Permissões</CardTitle>
              <CardDescription>
                Gerenciamento de usuários e suas permissões
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userPermissions.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">{user.user}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.permissions.join(', ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-sm">
                        <p className="font-medium">{user.role}</p>
                        <p className="text-muted-foreground">{user.lastAccess}</p>
                      </div>
                      <Badge className={
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }>
                        {user.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats">
          <Card>
            <CardHeader>
              <CardTitle>Detecção de Ameaças</CardTitle>
              <CardDescription>
                Ameaças detectadas e bloqueadas automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {threats.map((threat, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium">{threat.type}</p>
                        <p className="text-sm text-muted-foreground">
                          Origem: {threat.source}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right text-sm">
                        <p className="font-medium">{threat.time}</p>
                        <Badge 
                          variant="outline" 
                          className={getSeverityColor(threat.severity)}
                        >
                          {threat.severity}
                        </Badge>
                      </div>
                      {threat.blocked && (
                        <Badge className="bg-green-100 text-green-800">
                          Bloqueado
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};