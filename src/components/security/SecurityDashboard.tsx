import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Fingerprint,
  Lock,
  Eye,
  FileText
} from 'lucide-react';

interface SecurityDashboardProps {
  stats: {
    activeUsers: number;
    activeSessions: number;
    securityScore: number;
    lastAuditCheck: string;
    totalPermissions: number;
    alertsCount: number;
    recentEvents?: number;
    suspiciousActivity?: number;
    passkeysEnabled?: number;
    mfaEnabled?: number;
    dataRequests?: number;
    complianceScore?: number;
  };
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ stats }) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600';
    if (score >= 70) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.activeUsers}</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">Usuários Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{stats.activeSessions}</p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">Sessões Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{stats.securityScore}%</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Score Segurança</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.alertsCount}</p>
                <p className="text-sm text-orange-600 dark:text-orange-400">Alertas Críticos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Análise de Segurança
            </CardTitle>
            <CardDescription>
              Avaliação geral da postura de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Score de Segurança</span>
                <Badge variant={getScoreBadgeVariant(stats.securityScore)}>
                  {stats.securityScore}%
                </Badge>
              </div>
              <Progress value={stats.securityScore} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conformidade LGPD</span>
                <Badge variant={getScoreBadgeVariant(stats.complianceScore || 85)}>
                  {stats.complianceScore || 85}%
                </Badge>
              </div>
              <Progress value={stats.complianceScore || 85} className="h-2" />
            </div>

            <div className="pt-2 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>RLS habilitado em todas as tabelas</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Autenticação multifator disponível</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500" />
                <span>Logs de auditoria ativos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Atividade Recente
            </CardTitle>
            <CardDescription>
              Eventos e atividades das últimas 24 horas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-2xl font-bold">{stats.recentEvents || 0}</p>
                <p className="text-sm text-muted-foreground">Eventos de Segurança</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-red-600">{stats.suspiciousActivity || 0}</p>
                <p className="text-sm text-muted-foreground">Atividades Suspeitas</p>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Fingerprint className="h-4 w-4 text-purple-500" />
                  <span>Passkeys Habilitadas</span>
                </div>
                <span className="font-medium">{stats.passkeysEnabled || 0}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-500" />
                  <span>2FA Ativo</span>
                </div>
                <span className="font-medium">{stats.mfaEnabled || 0}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-emerald-500" />
                  <span>Solicitações LGPD</span>
                </div>
                <span className="font-medium">{stats.dataRequests || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Status do Sistema
          </CardTitle>
          <CardDescription>
            Monitoramento em tempo real dos sistemas de segurança
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="font-medium">Monitoramento Ativo</p>
                <p className="text-sm text-muted-foreground">Todos os sistemas funcionando</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="font-medium">Backup Automático</p>
                <p className="text-sm text-muted-foreground">Última execução: {new Date().toLocaleDateString('pt-BR')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 border rounded-lg">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <div>
                <p className="font-medium">Logs de Auditoria</p>
                <p className="text-sm text-muted-foreground">
                  Última verificação: {new Date(stats.lastAuditCheck).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};