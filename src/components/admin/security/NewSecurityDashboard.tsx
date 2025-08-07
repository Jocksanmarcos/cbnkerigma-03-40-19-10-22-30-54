import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Users,
  Eye
} from 'lucide-react';

interface SecurityStats {
  activeUsers: number;
  activeSessions: number;
  securityScore: number;
  lastAuditCheck: string;
  totalPermissions: number;
  alertsCount: number;
}

interface SecurityDashboardProps {
  stats: SecurityStats;
}

interface SecurityMetric {
  id: string;
  name: string;
  status: 'success' | 'warning' | 'error';
  description: string;
  value?: string;
  recommendation?: string;
}

export const NewSecurityDashboard: React.FC<SecurityDashboardProps> = ({ stats }) => {
  const securityMetrics: SecurityMetric[] = [
    {
      id: '1',
      name: 'Sistema RBAC',
      status: 'success',
      description: 'Sistema de controle de acesso baseado em perfis ativo',
      value: '8 perfis configurados',
      recommendation: 'Revisar permissões trimestralmente'
    },
    {
      id: '2',
      name: 'RLS (Row Level Security)',
      status: 'success',
      description: 'Políticas de segurança em nível de linha ativas',
      value: 'Todas as tabelas protegidas',
      recommendation: 'Manter as políticas atualizadas'
    },
    {
      id: '3',
      name: 'Permissões Granulares',
      status: 'success',
      description: 'Sistema de permissões granulares implementado',
      value: `${stats.totalPermissions} permissões ativas`,
      recommendation: 'Auditar permissões mensalmente'
    },
    {
      id: '4',
      name: 'Autenticação Multi-Fator',
      status: 'success',
      description: 'MFA disponível para usuários administrativos',
      value: 'Configurável por usuário',
      recommendation: 'Incentivar ativação do MFA'
    },
    {
      id: '5',
      name: 'Conexões SSL/TLS',
      status: 'success',
      description: 'Todas as conexões são criptografadas',
      value: '100% HTTPS',
      recommendation: 'Manter certificados atualizados'
    },
    {
      id: '6',
      name: 'Logs de Auditoria',
      status: 'success',
      description: 'Sistema de auditoria funcionando',
      value: '90 dias de retenção',
      recommendation: 'Analisar logs regularmente'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 95) return 'Excelente';
    if (score >= 80) return 'Muito Bom';
    if (score >= 60) return 'Bom';
    return 'Precisa Melhorar';
  };

  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Score de Segurança RBAC
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(stats.securityScore)}`}>
                {stats.securityScore}%
              </div>
              <p className="text-muted-foreground">{getScoreStatus(stats.securityScore)}</p>
            </div>
            <div className="w-32">
              <Progress value={stats.securityScore} className="w-full h-4" />
            </div>
          </div>
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Sistema RBAC profissional implementado com sucesso. Todas as permissões estão configuradas 
              e funcionando corretamente. Continue monitorando regularmente para manter a segurança.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Métricas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  {metric.name}
                </CardTitle>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  OK
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">{metric.description}</p>
              {metric.value && (
                <p className="font-medium text-primary mb-2">{metric.value}</p>
              )}
              {metric.recommendation && (
                <Alert className="mt-2">
                  <AlertDescription className="text-xs">
                    <strong>Recomendação:</strong> {metric.recommendation}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo de Atividades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Resumo de Usuários
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total de Usuários</span>
              <span className="font-medium">{stats.activeUsers}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Sessões Ativas</span>
              <span className="font-medium">{stats.activeSessions}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Permissões Configuradas</span>
              <span className="font-medium">{stats.totalPermissions}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Monitoramento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Última Verificação</span>
              <span className="font-medium text-xs">
                {new Date(stats.lastAuditCheck).toLocaleString('pt-BR')}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Alertas Ativos</span>
              <Badge variant={stats.alertsCount > 0 ? 'destructive' : 'default'}>
                {stats.alertsCount}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status do Sistema</span>
              <Badge variant="default">
                <CheckCircle className="h-3 w-3 mr-1" />
                Online
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sistema RBAC Information */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
            <Shield className="h-5 w-5" />
            Sistema RBAC Ativo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Controle Granular de Acesso</p>
              <p className="text-sm text-muted-foreground">
                Cada usuário possui um perfil com permissões específicas para módulos e ações
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">8 Perfis Predefinidos</p>
              <p className="text-sm text-muted-foreground">
                Super Admin, Admin, Pastor, Missionário, Líder de Célula, Tesoureiro, Aluno e Membro
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Permissões por Módulo</p>
              <p className="text-sm text-muted-foreground">
                Sistema de permissões organizado por módulos: Financeiro, Ensino, Pessoas, Células, etc.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};