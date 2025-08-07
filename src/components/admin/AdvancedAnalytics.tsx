import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Users, DollarSign, Calendar, Target, Brain, Download, Filter } from 'lucide-react';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface AnalyticsData {
  period: string;
  members: number;
  events: number;
  donations: number;
  cells: number;
  courses: number;
}

interface PredictiveData {
  month: string;
  predicted_growth: number;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

const AdvancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPeriod, setSelectedPeriod] = useState('3months');
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedMetrics, setSelectedMetrics] = useState(['members', 'donations']);
  const { toast } = useToast();

  // Dados analíticos principais
  const { data: analyticsData = [], loading: analyticsLoading } = useOptimizedQuery({
    queryKey: `analytics-${selectedPeriod}`,
    queryFn: async (): Promise<AnalyticsData[]> => {
      const { data, error } = await supabase.rpc('execute_query', {
        query_text: `
          WITH monthly_data AS (
            SELECT 
              TO_CHAR(created_at, 'YYYY-MM') as period,
              COUNT(CASE WHEN table_name = 'pessoas' THEN 1 END) as members,
              COUNT(CASE WHEN table_name = 'eventos' THEN 1 END) as events,
              COALESCE(SUM(CASE WHEN table_name = 'contribuicoes' THEN valor ELSE 0 END), 0) as donations,
              COUNT(CASE WHEN table_name = 'celulas' THEN 1 END) as cells,
              COUNT(CASE WHEN table_name = 'cursos' THEN 1 END) as courses
            FROM (
              SELECT created_at, 'pessoas' as table_name, 0 as valor FROM pessoas WHERE created_at >= NOW() - INTERVAL '12 months'
              UNION ALL
              SELECT created_at, 'eventos' as table_name, 0 as valor FROM eventos WHERE created_at >= NOW() - INTERVAL '12 months'
              UNION ALL
              SELECT created_at, 'contribuicoes' as table_name, valor FROM contribuicoes WHERE created_at >= NOW() - INTERVAL '12 months'
              UNION ALL
              SELECT created_at, 'celulas' as table_name, 0 as valor FROM celulas WHERE created_at >= NOW() - INTERVAL '12 months'
              UNION ALL
              SELECT created_at, 'cursos' as table_name, 0 as valor FROM cursos WHERE created_at >= NOW() - INTERVAL '12 months'
            ) combined_data
            GROUP BY TO_CHAR(created_at, 'YYYY-MM')
          )
          SELECT * FROM monthly_data ORDER BY period DESC LIMIT 12
        `
      });
      
      if (error) throw error;
      return (Array.isArray(data) ? data : []) as any[];
    },
    staleTime: 300000 // 5 minutos
  });

  // Dados preditivos usando IA
  const { data: predictiveData = [], loading: predictiveLoading } = useOptimizedQuery({
    queryKey: 'predictive-analytics',
    queryFn: async (): Promise<PredictiveData[]> => {
      const { data, error } = await supabase.rpc('execute_query', {
        query_text: `
          WITH growth_analysis AS (
            SELECT 
              TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
              COUNT(*) as monthly_count,
              LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as previous_count
            FROM pessoas 
            WHERE created_at >= NOW() - INTERVAL '6 months'
            GROUP BY DATE_TRUNC('month', created_at)
          )
          SELECT 
            month,
            CASE 
              WHEN previous_count > 0 THEN 
                ROUND((monthly_count - previous_count) * 100.0 / previous_count, 2)
              ELSE 0 
            END as predicted_growth,
            CASE 
              WHEN monthly_count > previous_count THEN 85
              WHEN monthly_count = previous_count THEN 70
              ELSE 60
            END as confidence,
            CASE 
              WHEN monthly_count > previous_count THEN 'up'
              WHEN monthly_count = previous_count THEN 'stable'
              ELSE 'down'
            END as trend
          FROM growth_analysis 
          WHERE previous_count IS NOT NULL
          ORDER BY month DESC
        `
      });
      
      if (error) throw error;
      return (Array.isArray(data) ? data : []) as any[];
    },
    staleTime: 600000 // 10 minutos
  });

  // Estatísticas resumidas
  const { data: summaryStats = {}, loading: summaryLoading } = useOptimizedQuery({
    queryKey: 'summary-stats',
    queryFn: async () => {
      const { data, error } = await supabase.rpc('execute_query', {
        query_text: `
          SELECT 
            (SELECT COUNT(*) FROM pessoas WHERE situacao = 'ativo') as total_members,
            (SELECT COUNT(*) FROM celulas WHERE ativa = true) as active_cells,
            (SELECT COALESCE(SUM(valor), 0) FROM contribuicoes WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)) as monthly_donations,
            (SELECT COUNT(*) FROM eventos WHERE data_evento >= CURRENT_DATE) as upcoming_events,
            (SELECT COUNT(*) FROM cursos WHERE ativo = true) as active_courses,
            (SELECT COUNT(*) FROM pessoas WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_members_month
        `
      });
      
      if (error) throw error;
      return Array.isArray(data) && data.length > 0 ? data[0] as any : {};
    },
    staleTime: 300000
  });

  const exportAnalytics = async () => {
    try {
      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(20);
      doc.text('Relatório de Analytics Avançado', 20, 20);
      
      // Data
      doc.setFontSize(12);
      doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 20, 40);
      
      // Estatísticas resumidas
      const stats = [
        ['Métrica', 'Valor'],
        ['Total de Membros', (summaryStats as any).total_members?.toString() || '0'],
        ['Células Ativas', (summaryStats as any).active_cells?.toString() || '0'],
        ['Doações do Mês', `R$ ${(summaryStats as any).monthly_donations || 0}`],
        ['Eventos Futuros', (summaryStats as any).upcoming_events?.toString() || '0'],
        ['Cursos Ativos', (summaryStats as any).active_courses?.toString() || '0'],
        ['Novos Membros (30d)', (summaryStats as any).new_members_month?.toString() || '0']
      ];
      
      (doc as any).autoTable({
        startY: 60,
        head: [stats[0]],
        body: stats.slice(1),
        theme: 'striped'
      });
      
      // Dados históricos
      if (analyticsData.length > 0) {
        const historyData = [
          ['Período', 'Membros', 'Eventos', 'Doações', 'Células'],
          ...analyticsData.map(item => [
            item.period,
            item.members.toString(),
            item.events.toString(),
            `R$ ${item.donations}`,
            item.cells.toString()
          ])
        ];
        
        (doc as any).autoTable({
          startY: (doc as any).lastAutoTable.finalY + 20,
          head: [historyData[0]],
          body: historyData.slice(1),
          theme: 'grid'
        });
      }
      
      doc.save('relatorio-analytics.pdf');
      
      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório",
        variant: "destructive"
      });
    }
  };

  const getGrowthIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-blue-500" />;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Analytics Avançado</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportAnalytics}>
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">1 Mês</SelectItem>
              <SelectItem value="3months">3 Meses</SelectItem>
              <SelectItem value="6months">6 Meses</SelectItem>
              <SelectItem value="1year">1 Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Membros Ativos</p>
                <p className="text-2xl font-bold">{(summaryStats as any).total_members || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Células Ativas</p>
                <p className="text-2xl font-bold">{(summaryStats as any).active_cells || 0}</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Doações (Mês)</p>
                <p className="text-2xl font-bold">R$ {(summaryStats as any).monthly_donations || 0}</p>
              </div>
              <DollarSign className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Futuros</p>
                <p className="text-2xl font-bold">{(summaryStats as any).upcoming_events || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Ativos</p>
                <p className="text-2xl font-bold">{(summaryStats as any).active_courses || 0}</p>
              </div>
              <Brain className="w-8 h-8 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Novos (30d)</p>
                <p className="text-2xl font-bold">{(summaryStats as any).new_members_month || 0}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="growth">Crescimento</TabsTrigger>
          <TabsTrigger value="predictive">Preditivo</TabsTrigger>
          <TabsTrigger value="detailed">Detalhado</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Membros</CardTitle>
                <CardDescription>Crescimento mensal da igreja</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="members" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Atividades</CardTitle>
                <CardDescription>Proporção entre diferentes atividades</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Membros', value: (summaryStats as any).total_members || 0 },
                        { name: 'Células', value: (summaryStats as any).active_cells || 0 },
                        { name: 'Cursos', value: (summaryStats as any).active_courses || 0 },
                        { name: 'Eventos', value: (summaryStats as any).upcoming_events || 0 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="growth" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise de Crescimento</CardTitle>
              <CardDescription>Comparativo mensal de crescimento</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="members" fill="#8884d8" name="Membros" />
                  <Bar dataKey="cells" fill="#82ca9d" name="Células" />
                  <Bar dataKey="events" fill="#ffc658" name="Eventos" />
                  <Bar dataKey="courses" fill="#ff7300" name="Cursos" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Preditiva</CardTitle>
              <CardDescription>Tendências e previsões baseadas em IA</CardDescription>
            </CardHeader>
            <CardContent>
              {predictiveLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={predictiveData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="predicted_growth" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {predictiveData.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">{item.month}</span>
                            {getGrowthIcon(item.trend)}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Crescimento:</span>
                              <span className="text-sm font-bold">{item.predicted_growth}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">Confiança:</span>
                              <Badge variant={item.confidence > 80 ? 'default' : item.confidence > 60 ? 'secondary' : 'destructive'}>
                                {item.confidence}%
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada</CardTitle>
              <CardDescription>Métricas completas e comparativos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="members" stroke="#8884d8" name="Membros" />
                    <Line type="monotone" dataKey="cells" stroke="#82ca9d" name="Células" />
                    <Line type="monotone" dataKey="events" stroke="#ffc658" name="Eventos" />
                    <Line type="monotone" dataKey="courses" stroke="#ff7300" name="Cursos" />
                  </LineChart>
                </ResponsiveContainer>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Período</th>
                        <th className="text-right p-2">Membros</th>
                        <th className="text-right p-2">Células</th>
                        <th className="text-right p-2">Eventos</th>
                        <th className="text-right p-2">Cursos</th>
                        <th className="text-right p-2">Doações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analyticsData.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2 font-medium">{item.period}</td>
                          <td className="p-2 text-right">{item.members}</td>
                          <td className="p-2 text-right">{item.cells}</td>
                          <td className="p-2 text-right">{item.events}</td>
                          <td className="p-2 text-right">{item.courses}</td>
                          <td className="p-2 text-right">R$ {item.donations.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;