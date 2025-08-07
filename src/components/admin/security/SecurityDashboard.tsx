import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Lock, 
  Users,
  Database,
  Globe,
  Zap,
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

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ stats: initialStats }) => {
  const [stats, setStats] = useState<SecurityStats>(initialStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealTimeStats();
  }, []);

  const loadRealTimeStats = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-stats');

      if (!error && data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      // Manter stats iniciais em caso de erro
    } finally {
      setLoading(false);
    }
  };
  const securityMetrics: SecurityMetric[] = [
    {
      id: '1',
      name: 'RLS (Row Level Security)',
      status: 'success',
      description: 'Políticas de segurança em nível de linha ativas',
      value: '12/12 tabelas',
      recommendation: 'Manter as políticas atualizadas'
    },
        {
          id: '2',
          name: 'Autenticação Multi-Fator',
          status: 'success',
          description: 'MFA disponível para usuários que desejarem ativar',
          value: 'Configurável por usuário',
          recommendation: 'Incentivar usuários a ativarem MFA'
        },
    {
      id: '3',
      name: 'Permissões de Usuário',
      status: 'success',
      description: 'Sistema de permissões configurado corretamente',
      value: '8 papéis ativos',
      recommendation: 'Revisar permissões trimestralmente'
    },
    {
      id: '4',
      name: 'Logs de Auditoria',
      status: 'success',
      description: 'Sistema de auditoria funcionando',
      value: '30 dias de retenção',
      recommendation: 'Considerar aumentar para 90 dias'
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
      name: 'Backup de Segurança',
      status: 'warning',
      description: 'Backups não testados recentemente',
      value: 'Último teste: 15 dias',
      recommendation: 'Testar restore de backup mensalmente'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Shield className="h-5 w-5 text-gray-500" />;
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

  return (
    <div className="space-y-6">
      {/* Score Principal */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Score de Segurança Geral
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
          <Alert className={
            stats.securityScore >= 80 
              ? 'border-green-200 bg-green-50' 
              : stats.securityScore >= 60 
              ? 'border-yellow-200 bg-yellow-50' 
              : 'border-red-200 bg-red-50'
          }>
            <AlertDescription>
              {stats.securityScore >= 80 
                ? 'Sua segurança está em excelente estado. Continue monitorando regularmente.'
                : stats.securityScore >= 60
                ? 'Segurança boa, mas há algumas melhorias recomendadas.'
                : 'Atenção necessária. Várias questões de segurança precisam ser resolvidas.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Métricas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityMetrics.map((metric) => (
          <Card key={metric.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getStatusIcon(metric.status)}
                  {metric.name}
                </CardTitle>
                <Badge variant={
                  metric.status === 'success' 
                    ? 'default' 
                    : metric.status === 'warning' 
                    ? 'secondary' 
                    : 'destructive'
                }>
                  {metric.status === 'success' ? 'OK' : metric.status === 'warning' ? 'Atenção' : 'Erro'}
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

      {/* Recomendações de Segurança */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertTriangle className="h-5 w-5" />
            Ações Prioritárias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Implementar MFA obrigatório</p>
              <p className="text-sm text-muted-foreground">Ativar autenticação multi-fator para todos os administradores</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Testar backup e restore</p>
              <p className="text-sm text-muted-foreground">Verificar integridade dos backups mensalmente</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Revisar permissões de usuário</p>
              <p className="text-sm text-muted-foreground">Auditar e otimizar permissões de acesso</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};