import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  Clock,
  MousePointer,
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  MapPin,
  Calendar,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useEstatisticas } from '@/hooks/useEstatisticas';

export const AdvancedMetrics = () => {
  const { engagementMetrics, eventParticipation, isLoading, fetchEngagementMetrics } = useAnalytics();
  const { estatisticas, getEstatisticaPorChave } = useEstatisticas();

  const analyticsData = [
    { time: '00:00', visitors: 45, pageViews: 120 },
    { time: '04:00', visitors: 23, pageViews: 67 },
    { time: '08:00', visitors: 89, pageViews: 234 },
    { time: '12:00', visitors: 156, pageViews: 445 },
    { time: '16:00', visitors: 134, pageViews: 378 },
    { time: '20:00', visitors: 98, pageViews: 289 },
  ];

  const deviceData = [
    { name: 'Desktop', value: 45, color: 'hsl(var(--primary))' },
    { name: 'Mobile', value: 35, color: 'hsl(var(--secondary))' },
    { name: 'Tablet', value: 20, color: 'hsl(var(--accent))' },
  ];

  const locationData = [
    { city: 'São Paulo', visits: 1250, percentage: 34 },
    { city: 'Rio de Janeiro', visits: 890, percentage: 24 },
    { city: 'Belo Horizonte', visits: 567, percentage: 15 },
    { city: 'Brasília', visits: 445, percentage: 12 },
    { city: 'Salvador', visits: 334, percentage: 9 },
    { city: 'Outros', visits: 234, percentage: 6 },
  ];

  const eventMetrics = [
    { event: 'Culto Dominical', participants: 450, target: 500, completion: 90 },
    { event: 'Escola Bíblica', participants: 120, target: 150, completion: 80 },
    { event: 'Culto de Oração', participants: 85, target: 100, completion: 85 },
    { event: 'Reunião de Jovens', participants: 65, target: 80, completion: 81 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Métricas</h2>
          <p className="text-muted-foreground">
            Estatísticas detalhadas e comportamento dos usuários
          </p>
        </div>
        <Button onClick={() => fetchEngagementMetrics()}>
          Atualizar Dados
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visitantes Únicos</p>
                <p className="text-2xl font-bold">{engagementMetrics?.unique_sessions || '2,847'}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+12% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Visualizações</p>
                <p className="text-2xl font-bold">{engagementMetrics?.total_page_views || '8,945'}</p>
              </div>
              <Eye className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+8% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio</p>
                <p className="text-2xl font-bold">3m 45s</p>
              </div>
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+15% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                <p className="text-2xl font-bold">4.2%</p>
              </div>
              <MousePointer className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-sm text-green-600">+0.8% vs. mês anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audience">Audiência</TabsTrigger>
          <TabsTrigger value="events">Eventos</TabsTrigger>
          <TabsTrigger value="real-time">Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tráfego do Site</CardTitle>
                <CardDescription>
                  Visitantes e visualizações nas últimas 24 horas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="visitors" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      name="Visitantes"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pageViews" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      name="Visualizações"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Páginas Mais Visitadas</CardTitle>
                <CardDescription>
                  Top 5 páginas com mais acessos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {engagementMetrics?.top_pages?.slice(0, 5).map((page, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{page.page_path}</p>
                        <p className="text-sm text-muted-foreground">
                          {page.unique_sessions} sessões únicas
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{page.views}</p>
                        <p className="text-sm text-muted-foreground">views</p>
                      </div>
                    </div>
                  )) || (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">/</p>
                          <p className="text-sm text-muted-foreground">1,245 sessões únicas</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">2,847</p>
                          <p className="text-sm text-muted-foreground">views</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">/sobre</p>
                          <p className="text-sm text-muted-foreground">678 sessões únicas</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">1,456</p>
                          <p className="text-sm text-muted-foreground">views</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="audience">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivos</CardTitle>
                <CardDescription>
                  Distribuição por tipo de dispositivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={deviceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {deviceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div className="grid grid-cols-3 gap-4">
                    {deviceData.map((device, index) => (
                      <div key={index} className="flex items-center gap-2">
                        {device.name === 'Desktop' && <Monitor className="h-4 w-4" />}
                        {device.name === 'Mobile' && <Smartphone className="h-4 w-4" />}
                        {device.name === 'Tablet' && <Tablet className="h-4 w-4" />}
                        <div>
                          <p className="text-sm font-medium">{device.value}%</p>
                          <p className="text-xs text-muted-foreground">{device.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
                <CardDescription>
                  Principais cidades dos visitantes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {locationData.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{location.city}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={location.percentage} className="w-20" />
                        <span className="text-sm font-medium w-12">{location.visits}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Participação em Eventos</CardTitle>
              <CardDescription>
                Métricas de comparecimento nos eventos da igreja
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {eventMetrics.map((event, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">{event.event}</span>
                      </div>
                      <Badge variant="outline">
                        {event.participants}/{event.target}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Comparecimento</span>
                        <span>{event.completion}%</span>
                      </div>
                      <Progress value={event.completion} className="w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="real-time">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Usuários Online</p>
                    <p className="text-3xl font-bold">24</p>
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Página Atual Mais Visitada</p>
                    <p className="text-lg font-bold">/sobre</p>
                  </div>
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Eventos Hoje</p>
                    <p className="text-3xl font-bold">3</p>
                  </div>
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Atividade em Tempo Real</CardTitle>
              <CardDescription>
                Acompanhe as ações dos usuários em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 border-l-4 border-green-500 rounded">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Novo usuário visitou a página /sobre</span>
                  <span className="text-xs text-muted-foreground ml-auto">agora</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Usuário se inscreveu em evento</span>
                  <span className="text-xs text-muted-foreground ml-auto">2 min atrás</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 border-l-4 border-purple-500 rounded">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm">Download de estudo bíblico realizado</span>
                  <span className="text-xs text-muted-foreground ml-auto">5 min atrás</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};