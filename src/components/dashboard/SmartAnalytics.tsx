import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  BookOpen,
  DollarSign,
  Target,
  AlertTriangle,
  Brain,
  Sparkles
} from 'lucide-react';

interface AnalyticsData {
  trends: {
    membros: { value: number; trend: number; prediction: number };
    eventos: { value: number; trend: number; prediction: number };
    financeiro: { value: number; trend: number; prediction: number };
    ensino: { value: number; trend: number; prediction: number };
  };
  insights: {
    tipo: 'success' | 'warning' | 'info' | 'error';
    titulo: string;
    descricao: string;
    acao?: string;
    prioridade: number;
  }[];
  predictions: {
    crescimento_30_dias: number;
    eventos_proximos: number;
    metas_alcancadas: number;
    areas_atencao: string[];
  };
  comparative: {
    mes_anterior: { membros: number; eventos: number; receita: number };
    mes_atual: { membros: number; eventos: number; receita: number };
  };
}

export const SmartAnalytics: React.FC = () => {
  // Fetch analytics data with caching
  const { data: analyticsData, loading } = useOptimizedQuery<AnalyticsData>({
    queryKey: 'smart-analytics',
    queryFn: async () => {
      // In a real application, this would fetch actual data
      // For now, we'll simulate intelligent analytics
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        trends: {
          membros: { value: 247, trend: 12.5, prediction: 275 },
          eventos: { value: 18, trend: -5.2, prediction: 20 },
          financeiro: { value: 15420.50, trend: 8.7, prediction: 16800 },
          ensino: { value: 156, trend: 23.1, prediction: 190 }
        },
        insights: [
          {
            tipo: 'success' as const,
            titulo: 'Crescimento Acelerado em Ensino',
            descricao: 'O módulo de ensino apresentou crescimento de 23% no último mês. Continue investindo em conteúdo de qualidade.',
            acao: 'Ver Relatório Completo',
            prioridade: 1
          },
          {
            tipo: 'warning' as const,
            titulo: 'Queda na Participação em Eventos',
            descricao: 'Houve uma redução de 5.2% na participação em eventos. Considere revisar estratégias de engajamento.',
            acao: 'Analisar Eventos',
            prioridade: 2
          },
          {
            tipo: 'info' as const,
            titulo: 'Oportunidade de Crescimento',
            descricao: 'Baseado nos dados atuais, há potencial para alcançar 275 membros nos próximos 30 dias.',
            acao: 'Ver Estratégias',
            prioridade: 3
          }
        ],
        predictions: {
          crescimento_30_dias: 11.3,
          eventos_proximos: 6,
          metas_alcancadas: 78,
          areas_atencao: ['Eventos', 'Células Zona Norte']
        },
        comparative: {
          mes_anterior: { membros: 220, eventos: 19, receita: 14180 },
          mes_atual: { membros: 247, eventos: 18, receita: 15420.50 }
        }
      };
    },
    staleTime: 300000, // 5 minutes
    cacheTime: 600000, // 10 minutes
  });

  const chartData = useMemo(() => {
    if (!analyticsData) return [];
    
    return [
      {
        name: 'Jan',
        membros: 195,
        eventos: 15,
        receita: 12500,
      },
      {
        name: 'Fev',
        membros: 210,
        eventos: 17,
        receita: 13200,
      },
      {
        name: 'Mar',
        membros: 220,
        eventos: 19,
        receita: 14180,
      },
      {
        name: 'Abr',
        membros: 247,
        eventos: 18,
        receita: 15420,
      },
      {
        name: 'Mai (Prev)',
        membros: analyticsData.trends.membros.prediction,
        eventos: analyticsData.trends.eventos.prediction,
        receita: analyticsData.trends.financeiro.prediction,
      }
    ];
  }, [analyticsData]);

  const pieData = useMemo(() => [
    { name: 'Membros Ativos', value: 85, color: '#8884d8' },
    { name: 'Visitantes', value: 15, color: '#82ca9d' },
  ], []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-24 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analyticsData) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Analytics Inteligente</h2>
          <Badge variant="secondary" className="ml-2">
            <Sparkles className="h-3 w-3 mr-1" />
            IA
          </Badge>
        </div>
      </div>

      {/* Insights Prioritários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Insights Prioritários
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analyticsData.insights.map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                insight.tipo === 'success' ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' :
                insight.tipo === 'warning' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                insight.tipo === 'error' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/20' :
                'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold flex items-center gap-2">
                    {insight.tipo === 'success' && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {insight.tipo === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-600" />}
                    {insight.tipo === 'error' && <TrendingDown className="h-4 w-4 text-red-600" />}
                    {insight.tipo === 'info' && <Target className="h-4 w-4 text-blue-600" />}
                    {insight.titulo}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {insight.descricao}
                  </p>
                </div>
                {insight.acao && (
                  <Button variant="outline" size="sm">
                    {insight.acao}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Membros</p>
                <p className="text-2xl font-bold">{analyticsData.trends.membros.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData.trends.membros.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    analyticsData.trends.membros.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(analyticsData.trends.membros.trend)}%
                  </span>
                </div>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress 
              value={(analyticsData.trends.membros.value / analyticsData.trends.membros.prediction) * 100} 
              className="mt-3" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: {analyticsData.trends.membros.prediction}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos</p>
                <p className="text-2xl font-bold">{analyticsData.trends.eventos.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData.trends.eventos.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    analyticsData.trends.eventos.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(analyticsData.trends.eventos.trend)}%
                  </span>
                </div>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress 
              value={(analyticsData.trends.eventos.value / analyticsData.trends.eventos.prediction) * 100} 
              className="mt-3" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: {analyticsData.trends.eventos.prediction}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receita</p>
                <p className="text-2xl font-bold">
                  R$ {analyticsData.trends.financeiro.value.toLocaleString('pt-BR')}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData.trends.financeiro.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    analyticsData.trends.financeiro.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(analyticsData.trends.financeiro.trend)}%
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress 
              value={(analyticsData.trends.financeiro.value / analyticsData.trends.financeiro.prediction) * 100} 
              className="mt-3" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: R$ {analyticsData.trends.financeiro.prediction.toLocaleString('pt-BR')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ensino</p>
                <p className="text-2xl font-bold">{analyticsData.trends.ensino.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  {analyticsData.trends.ensino.trend > 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${
                    analyticsData.trends.ensino.trend > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(analyticsData.trends.ensino.trend)}%
                  </span>
                </div>
              </div>
              <BookOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress 
              value={(analyticsData.trends.ensino.value / analyticsData.trends.ensino.prediction) * 100} 
              className="mt-3" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              Meta: {analyticsData.trends.ensino.prediction}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tendências e Previsões</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="membros" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="eventos" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Membros</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Previsões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Previsões Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg">
              <h4 className="font-semibold text-lg">
                +{analyticsData.predictions.crescimento_30_dias}%
              </h4>
              <p className="text-sm text-muted-foreground">
                Crescimento previsto em 30 dias
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-500/10 to-green-500/5 rounded-lg">
              <h4 className="font-semibold text-lg">
                {analyticsData.predictions.eventos_proximos}
              </h4>
              <p className="text-sm text-muted-foreground">
                Eventos programados
              </p>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-lg">
              <h4 className="font-semibold text-lg">
                {analyticsData.predictions.metas_alcancadas}%
              </h4>
              <p className="text-sm text-muted-foreground">
                Das metas alcançadas
              </p>
            </div>
          </div>
          
          {analyticsData.predictions.areas_atencao.length > 0 && (
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-l-yellow-500">
              <h5 className="font-medium mb-2">Áreas que Precisam de Atenção:</h5>
              <div className="flex flex-wrap gap-2">
                {analyticsData.predictions.areas_atencao.map((area, index) => (
                  <Badge key={index} variant="outline" className="border-yellow-500">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};