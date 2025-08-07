import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  ShieldCheck, 
  Users, 
  Activity, 
  Settings,
  Lock,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Monitor,
  Database,
  RefreshCw,
  Bell,
  FileText,
  Fingerprint
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ProfileManagement } from './ProfileManagement';
import { AccessControl } from './AccessControl';
import { AuditTrail } from './AuditTrail';
import { SecurityDashboard } from './SecurityDashboard';
import { MFAManager } from './MFAManager';
import { RBACManager } from './RBACManager';
import { SecurityNotificationsPanel } from '@/components/security/SecurityNotificationsPanel';
import { PrivacyPortal } from '@/components/security/PrivacyPortal';
import { PasskeyManager } from '@/components/security/PasskeyManager';

interface SecurityStats {
  activeUsers: number;
  activeSessions: number;
  securityScore: number;
  lastAuditCheck: string;
  totalPermissions: number;
  alertsCount: number;
  recentEvents: number;
  suspiciousActivity: number;
  passkeysEnabled: number;
  mfaEnabled: number;
  dataRequests: number;
  complianceScore: number;
}

export const SecurityModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<SecurityStats>({
    activeUsers: 0,
    activeSessions: 0,
    securityScore: 0,
    lastAuditCheck: '',
    totalPermissions: 0,
    alertsCount: 0,
    recentEvents: 0,
    suspiciousActivity: 0,
    passkeysEnabled: 0,
    mfaEnabled: 0,
    dataRequests: 0,
    complianceScore: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityStats();
  }, []);

  const loadSecurityStats = async () => {
    try {
      setLoading(true);
      
      // Carregar dados reais do Supabase
      const { data, error } = await supabase.functions.invoke('security-stats');
      
      if (error) {
        throw error;
      }
      
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar estatísticas de segurança",
        variant: "destructive"
      });
      
      // Fallback para dados básicos em caso de erro
      setStats({
        activeUsers: 0,
        activeSessions: 0,
        securityScore: 0,
        lastAuditCheck: new Date().toISOString(),
        totalPermissions: 0,
        alertsCount: 0,
        recentEvents: 0,
        suspiciousActivity: 0,
        passkeysEnabled: 0,
        mfaEnabled: 0,
        dataRequests: 0,
        complianceScore: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    return 'Precisa Melhorar';
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Módulo de Segurança</h1>
            <p className="text-muted-foreground">Central de controle de segurança e permissões</p>
          </div>
        </div>
        <Button onClick={loadSecurityStats} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score de Segurança</CardTitle>
            <Shield className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.securityScore)}`}>
              {stats.securityScore}%
            </div>
            <p className="text-xs text-muted-foreground">
              {getScoreStatus(stats.securityScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              Total de usuários no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Usuários conectados agora
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.alertsCount}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Status Alert */}
      {stats.alertsCount > 0 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> {stats.alertsCount} alerta(s) de segurança requer(em) sua atenção. 
            Verifique a aba "Trilha de Auditoria" para mais detalhes.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="rbac" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            <span className="hidden sm:inline">RBAC</span>
          </TabsTrigger>
          <TabsTrigger value="profiles" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Perfis</span>
          </TabsTrigger>
          <TabsTrigger value="access" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">Acesso</span>
          </TabsTrigger>
          <TabsTrigger value="mfa" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">2FA</span>
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span className="hidden sm:inline">Auditoria</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Privacidade</span>
          </TabsTrigger>
          <TabsTrigger value="passkeys" className="flex items-center gap-2">
            <Fingerprint className="h-4 w-4" />
            <span className="hidden sm:inline">Passkeys</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <SecurityDashboard stats={stats} />
        </TabsContent>

        <TabsContent value="rbac" className="space-y-4">
          <RBACManager />
        </TabsContent>

        <TabsContent value="profiles" className="space-y-4">
          <ProfileManagement />
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <AccessControl />
        </TabsContent>

        <TabsContent value="mfa" className="space-y-4">
          <MFAManager />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditTrail />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <SecurityNotificationsPanel />
        </TabsContent>

        <TabsContent value="privacy" className="space-y-4">
          <PrivacyPortal />
        </TabsContent>

        <TabsContent value="passkeys" className="space-y-4">
          <PasskeyManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};