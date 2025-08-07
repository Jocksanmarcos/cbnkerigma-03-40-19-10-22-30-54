import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Globe, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Clock,
  Eye,
  RefreshCw
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PerformanceData {
  time: string;
  speed: number;
  uptime: number;
}

interface Metric {
  label: string;
  value: string;
  status: string;
  icon: string;
  color: string;
}

interface SEOIssue {
  type: string;
  page: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pendente' | 'resolvido';
}

interface SystemAlert {
  type: 'success' | 'warning' | 'error';
  title: string;
  description: string;
  action: string | null;
}

export const PerformanceMonitor = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [seoIssues, setSeoIssues] = useState<SEOIssue[]>([]);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);

  const iconMap: { [key: string]: any } = {
    Zap,
    Activity,
    TrendingUp,
    AlertTriangle
  };

  const fetchPerformanceData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('performance-monitoring', {
        body: { site: window.location.origin }
      });

      if (error) throw error;

      setPerformanceData(data.performanceData);
      setMetrics(data.metrics);
      setSeoIssues(data.seoIssues);
      setSystemAlerts(data.systemAlerts);
      setLastUpdate(new Date(data.lastUpdate));
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Erro ao carregar dados de performance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const handleRefresh = async () => {
    setIsChecking(true);
    await fetchPerformanceData();
    setIsChecking(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Performance</h2>
          <p className="text-muted-foreground">
            Última atualização: {lastUpdate.toLocaleString()}
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isChecking}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isChecking ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                </div>
                {React.createElement(iconMap[metric.icon], { className: `h-8 w-8 ${metric.color}` })}
              </div>
              <Badge className={getStatusColor(metric.status)} variant="outline">
                {metric.status}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Performance</TabsTrigger>
          <TabsTrigger value="seo-audit">Auditoria SEO</TabsTrigger>
          <TabsTrigger value="seo">Issues SEO</TabsTrigger>
          <TabsTrigger value="errors">Alertas</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Performance em Tempo Real</CardTitle>
              <CardDescription>
                Monitoramento de velocidade e uptime nas últimas 24 horas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="speed" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    name="Velocidade (%)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uptime" 
                    stroke="hsl(var(--success))" 
                    strokeWidth={2}
                    name="Uptime (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo-audit">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auditoria SEO Completa</CardTitle>
                <CardDescription>
                  Análise detalhada dos fatores de SEO da sua aplicação
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Meta Tags</span>
                      <Badge className="bg-green-100 text-green-800">Bom</Badge>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">85% das páginas com meta description</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Títulos</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Médio</Badge>
                    </div>
                    <Progress value={72} className="h-2" />
                    <p className="text-xs text-muted-foreground">72% dos títulos otimizados</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Alt Text</span>
                      <Badge className="bg-red-100 text-red-800">Baixo</Badge>
                    </div>
                    <Progress value={45} className="h-2" />
                    <p className="text-xs text-muted-foreground">45% das imagens com alt text</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estrutura H1-H6</span>
                      <Badge className="bg-green-100 text-green-800">Bom</Badge>
                    </div>
                    <Progress value={90} className="h-2" />
                    <p className="text-xs text-muted-foreground">Estrutura hierárquica correta</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Open Graph</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Médio</Badge>
                    </div>
                    <Progress value={67} className="h-2" />
                    <p className="text-xs text-muted-foreground">67% das tags OG implementadas</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Schema Markup</span>
                      <Badge className="bg-red-100 text-red-800">Baixo</Badge>
                    </div>
                    <Progress value={30} className="h-2" />
                    <p className="text-xs text-muted-foreground">Schema básico implementado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Core Web Vitals</CardTitle>
                  <CardDescription>Métricas de experiência do usuário</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Largest Contentful Paint (LCP)</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">2.1s</div>
                      <Badge className="bg-green-100 text-green-800">Bom</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>First Input Delay (FID)</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">45ms</div>
                      <Badge className="bg-green-100 text-green-800">Bom</Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Cumulative Layout Shift (CLS)</span>
                    <div className="text-right">
                      <div className="text-sm font-medium">0.15</div>
                      <Badge className="bg-yellow-100 text-yellow-800">Precisa melhorar</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recomendações Prioritárias</CardTitle>
                  <CardDescription>Ações para melhorar o SEO</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Adicionar alt text às imagens</p>
                      <p className="text-xs text-muted-foreground">45% das imagens sem descrição</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Implementar Schema Markup</p>
                      <p className="text-xs text-muted-foreground">Melhorar rich snippets</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Otimizar CLS</p>
                      <p className="text-xs text-muted-foreground">Reduzir mudanças de layout</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium">Completar Open Graph tags</p>
                      <p className="text-xs text-muted-foreground">Melhorar compartilhamento social</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Monitor de SEO</CardTitle>
              <CardDescription>
                Problemas de SEO detectados automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {seoIssues.map((issue, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        issue.priority === 'high' ? 'bg-red-500' :
                        issue.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                      <div>
                        <p className="font-medium">{issue.type}</p>
                        <p className="text-sm text-muted-foreground">{issue.page}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={issue.status === 'resolvido' ? 'default' : 'secondary'}>
                        {issue.status}
                      </Badge>
                      {issue.status === 'resolvido' && 
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      }
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Alertas do Sistema</CardTitle>
              <CardDescription>
                Problemas detectados que requerem atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemAlerts.map((alert, index) => (
                  <div key={index} className={`flex items-center gap-3 p-4 rounded-lg ${
                    alert.type === 'success' ? 'bg-green-50 border border-green-200' :
                    alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    {alert.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
                    {alert.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                    <div className="flex-1">
                      <p className="font-medium">{alert.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                    </div>
                    {alert.action && (
                      <Button variant="outline" size="sm">
                        {alert.action}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios de Performance</CardTitle>
              <CardDescription>
                Relatórios detalhados e análises históricas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">Relatório Semanal</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Performance da última semana
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Gerar Relatório
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4" />
                      <span className="font-medium">Análise de Tráfego</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Comportamento dos visitantes
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Ver Análise
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Globe className="h-4 w-4" />
                      <span className="font-medium">Auditoria SEO</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Relatório completo de SEO
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      Iniciar Auditoria
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};