import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalytics, type EngagementMetrics, type EventParticipation } from '@/hooks/useAnalytics';
import { useEstatisticas } from '@/hooks/useEstatisticas';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, FunnelChart, Funnel, LabelList } from 'recharts';
import { TrendingUp, TrendingDown, Users, Heart, BookOpen, MapPin, Calendar, Target, Brain, Activity } from 'lucide-react';

interface FunnelData {
  name: string;
  value: number;
  fill: string;
}

interface KPIData {
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

export const DashboardEstrategico = () => {
  const { engagementMetrics, eventParticipation, fetchEngagementMetrics, fetchEventParticipation, isLoading } = useAnalytics();
  const { estatisticas, loading: estatisticasLoading, getEstatisticaPorChave } = useEstatisticas();

  const [funnelData, setFunnelData] = useState<FunnelData[]>([]);
  const [healthKPIs, setHealthKPIs] = useState<KPIData[]>([]);
  const [growthData, setGrowthData] = useState<any[]>([]);

  useEffect(() => {
    // Simular dados do funil de discipulado
    const simulatedFunnelData: FunnelData[] = [
      { name: 'Visitantes', value: parseInt(getEstatisticaPorChave('visitantes_unicos') || '150'), fill: '#ef4444' },
      { name: 'Novos Convertidos', value: parseInt(getEstatisticaPorChave('novos_convertidos') || '85'), fill: '#f97316' },
      { name: 'Alunos Matriculados', value: parseInt(getEstatisticaPorChave('alunos_matriculados') || '45'), fill: '#eab308' },
      { name: 'Líderes Formados', value: parseInt(getEstatisticaPorChave('lideres_formados') || '12'), fill: '#22c55e' }
    ];
    setFunnelData(simulatedFunnelData);

    // KPIs de saúde da igreja
    const kpis: KPIData[] = [
      {
        label: 'Membros Ativos',
        value: getEstatisticaPorChave('membros_ativos') || '324',
        change: 12,
        trend: 'up',
        icon: <Users className="h-5 w-5" />
      },
      {
        label: 'Taxa de Conversão',
        value: '56.7%',
        change: 8.2,
        trend: 'up',
        icon: <Heart className="h-5 w-5" />
      },
      {
        label: 'Engajamento em Células',
        value: '78%',
        change: -2.1,
        trend: 'down',
        icon: <MapPin className="h-5 w-5" />
      },
      {
        label: 'Contribuição Média',
        value: 'R$ 186',
        change: 15.3,
        trend: 'up',
        icon: <Target className="h-5 w-5" />
      }
    ];
    setHealthKPIs(kpis);

    // Dados de crescimento das células (simulado)
    const cells = [
      { nome: 'Célula Esperança', membros: 18, latitude: -22.9068, longitude: -43.1729, crescimento: 12 },
      { nome: 'Célula Vida Nova', membros: 22, latitude: -22.9035, longitude: -43.2096, crescimento: 18 },
      { nome: 'Célula Restauração', membros: 15, latitude: -22.8968, longitude: -43.1851, crescimento: 7 },
      { nome: 'Célula Comunhão', membros: 28, latitude: -22.9158, longitude: -43.1751, crescimento: 25 },
      { nome: 'Célula Família', membros: 19, latitude: -22.9012, longitude: -43.1943, crescimento: 14 }
    ];
    setGrowthData(cells);
  }, [estatisticas, getEstatisticaPorChave]);

  const renderTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading || estatisticasLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-40 bg-muted rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Estratégico da Liderança</h1>
          <p className="text-muted-foreground">
            Insights e métricas para tomada de decisão estratégica
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            BI Inteligente
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="health" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Saúde da Igreja
          </TabsTrigger>
          <TabsTrigger value="funnel" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Funil de Discipulado
          </TabsTrigger>
          <TabsTrigger value="growth" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Crescimento das Células
          </TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-6">
          {/* KPIs de Saúde */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {healthKPIs.map((kpi, index) => (
              <Card key={index} className="platform-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.label}</CardTitle>
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    {kpi.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold gradient-text">{kpi.value}</div>
                  <div className="flex items-center gap-1 text-sm">
                    {renderTrendIcon(kpi.trend)}
                    <span className={getTrendColor(kpi.trend)}>
                      {kpi.change > 0 ? '+' : ''}{kpi.change}%
                    </span>
                    <span className="text-muted-foreground">vs mês anterior</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráficos de Engajamento */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="platform-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Páginas Mais Visitadas
                </CardTitle>
                <CardDescription>
                  Engajamento digital da congregação
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {engagementMetrics?.top_pages && (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementMetrics.top_pages.slice(0, 6)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="page_path" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="views" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card className="platform-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Participação em Eventos
                </CardTitle>
                <CardDescription>
                  Taxa de comparecimento nos últimos eventos
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                {eventParticipation && eventParticipation.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={eventParticipation.slice(0, 5)}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="evento_titulo" 
                        tick={{ fontSize: 12 }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis />
                      <Tooltip formatter={(value) => [`${value}%`, 'Taxa de Comparecimento']} />
                      <Line 
                        type="monotone" 
                        dataKey="taxa_comparecimento" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <Card className="platform-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Funil de Discipulado (Últimos 12 Meses)
              </CardTitle>
              <CardDescription>
                Jornada de crescimento espiritual da congregação
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={funnelData}
                  layout="horizontal"
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={4}>
                    <LabelList dataKey="value" position="right" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Insights do Funil */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="platform-card">
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">56.7%</div>
                <p className="text-sm text-muted-foreground">
                  Visitantes que se tornam novos convertidos
                </p>
              </CardContent>
            </Card>

            <Card className="platform-card">
              <CardHeader>
                <CardTitle className="text-lg">Engajamento no Ensino</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">52.9%</div>
                <p className="text-sm text-muted-foreground">
                  Novos convertidos que se matriculam
                </p>
              </CardContent>
            </Card>

            <Card className="platform-card">
              <CardHeader>
                <CardTitle className="text-lg">Formação de Líderes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">26.7%</div>
                <p className="text-sm text-muted-foreground">
                  Alunos que se tornam líderes
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card className="platform-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Mapa de Crescimento das Células
              </CardTitle>
              <CardDescription>
                Distribuição e crescimento das células na região
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {growthData.map((cell, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <div>
                        <h4 className="font-medium">{cell.nome}</h4>
                        <p className="text-sm text-muted-foreground">
                          {cell.membros} membros
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          +{cell.crescimento}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">este trimestre</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Resumo do Crescimento */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="platform-card">
              <CardHeader>
                <CardTitle>Células Mais Ativas</CardTitle>
                <CardDescription>Top 3 em crescimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {growthData
                  .sort((a, b) => b.crescimento - a.crescimento)
                  .slice(0, 3)
                  .map((cell, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="w-6 h-6 p-0 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{cell.nome}</span>
                      </div>
                      <span className="text-green-600 font-medium">+{cell.crescimento}%</span>
                    </div>
                  ))}
              </CardContent>
            </Card>

            <Card className="platform-card">
              <CardHeader>
                <CardTitle>Métricas Regionais</CardTitle>
                <CardDescription>Resumo do crescimento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total de Células</span>
                  <span className="font-semibold">{growthData.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Membros em Células</span>
                  <span className="font-semibold">
                    {growthData.reduce((acc, cell) => acc + cell.membros, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Crescimento Médio</span>
                  <span className="font-semibold text-green-600">
                    +{Math.round(growthData.reduce((acc, cell) => acc + cell.crescimento, 0) / growthData.length)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};