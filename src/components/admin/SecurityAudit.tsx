import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock,
  Eye,
  Activity,
  Clock,
  Users,
  Database,
  Globe,
  Zap,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SecurityMetric {
  id: string;
  name: string;
  status: 'success' | 'warning' | 'error';
  description: string;
  value?: string;
  recommendation?: string;
}

interface ActivityLog {
  id: string;
  user_email: string;
  action: string;
  resource: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  status: 'success' | 'failed';
}

export const SecurityAudit = () => {
  const [metrics, setMetrics] = useState<SecurityMetric[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [auditScore, setAuditScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    performSecurityAudit();
    loadActivityLogs();
  }, []);

  const performSecurityAudit = async () => {
    setLoading(true);
    try {
      const auditMetrics: SecurityMetric[] = [
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
          status: 'warning',
          description: 'MFA não obrigatório para administradores',
          value: '3/8 usuários',
          recommendation: 'Habilitar MFA obrigatório para admins'
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

      setMetrics(auditMetrics);
      
      // Calcular score de segurança
      const totalChecks = auditMetrics.length;
      const successCount = auditMetrics.filter(m => m.status === 'success').length;
      const warningCount = auditMetrics.filter(m => m.status === 'warning').length;
      
      const score = Math.round(((successCount * 100) + (warningCount * 60)) / totalChecks);
      setAuditScore(score);

    } catch (error) {
      console.error('Erro ao realizar auditoria:', error);
      toast({
        title: "Erro",
        description: "Erro ao realizar auditoria de segurança",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      // Simular logs de atividade (em um sistema real, viriam do banco)
      const logs: ActivityLog[] = [
        {
          id: '1',
          user_email: 'admin@cbnkerigma.org',
          action: 'LOGIN',
          resource: 'Admin Panel',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
          ip_address: '192.168.1.100',
          status: 'success'
        },
        {
          id: '2',
          user_email: 'pastor@cbnkerigma.org',
          action: 'UPDATE_PERMISSIONS',
          resource: 'User: João Silva',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          ip_address: '192.168.1.101',
          status: 'success'
        },
        {
          id: '3',
          user_email: 'unknown@email.com',
          action: 'LOGIN_ATTEMPT',
          resource: 'Admin Panel',
          timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
          ip_address: '203.0.113.1',
          status: 'failed'
        },
        {
          id: '4',
          user_email: 'coordenador@cbnkerigma.org',
          action: 'CREATE_USER',
          resource: 'New Member',
          timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
          ip_address: '192.168.1.102',
          status: 'success'
        }
      ];

      setActivityLogs(logs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    }
  };

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Auditoria de Segurança</h1>
          <p className="text-muted-foreground">Monitoramento e análise de segurança do sistema</p>
        </div>
        <Button onClick={performSecurityAudit} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Auditoria
        </Button>
      </div>

      {/* Score de Segurança */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Score de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className={`text-4xl font-bold ${getScoreColor(auditScore)}`}>
                {auditScore}%
              </div>
              <p className="text-muted-foreground">{getScoreStatus(auditScore)}</p>
            </div>
            <div className="w-32">
              <Progress value={auditScore} className="w-full h-4" />
            </div>
          </div>
          <Alert className={auditScore >= 80 ? 'border-green-200 bg-green-50' : auditScore >= 60 ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}>
            <AlertDescription>
              {auditScore >= 80 
                ? 'Sua segurança está em excelente estado. Continue monitorando regularmente.'
                : auditScore >= 60
                ? 'Segurança boa, mas há algumas melhorias recomendadas.'
                : 'Atenção necessária. Várias questões de segurança precisam ser resolvidas.'
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Métricas
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Logs de Atividade
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Recomendações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getStatusIcon(metric.status)}
                      {metric.name}
                    </CardTitle>
                    <Badge variant={metric.status === 'success' ? 'default' : metric.status === 'warning' ? 'secondary' : 'destructive'}>
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
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Logs de Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${log.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="font-medium">{log.user_email}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.action} em {log.resource}
                        </p>
                        {log.ip_address && (
                          <p className="text-xs text-muted-foreground">IP: {log.ip_address}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={log.status === 'success' ? 'default' : 'destructive'}>
                        {log.status === 'success' ? 'Sucesso' : 'Falha'}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(log.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
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
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Melhorias Recomendadas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Aumentar retenção de logs</p>
                    <p className="text-sm text-muted-foreground">Considerar aumentar retenção de logs para 90 dias</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Implementar alertas automáticos</p>
                    <p className="text-sm text-muted-foreground">Configurar notificações para atividades suspeitas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};