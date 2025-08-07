import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Users, CheckCircle2, XCircle, Clock, Download, TrendingUp } from 'lucide-react';
import { useAgendaEventos } from '@/hooks/useAgendaEventos';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ParticipacaoRelatorio {
  evento_id: string;
  evento_titulo: string;
  data_evento: string;
  total_confirmados: number;
  total_presentes: number;
  total_ausentes: number;
  taxa_presenca: number;
  participantes: {
    id: string;
    nome: string;
    status: 'confirmado' | 'presente' | 'ausente' | 'cancelado';
    data_confirmacao: string;
  }[];
}

const RelatoriosParticipacao = () => {
  const { eventos } = useAgendaEventos();
  const [relatorios, setRelatorios] = useState<ParticipacaoRelatorio[]>([]);
  const [loading, setLoading] = useState(false);
  const [periodoSelecionado, setPeriodoSelecionado] = useState<'7dias' | '30dias' | '3meses'>('30dias');

  useEffect(() => {
    carregarRelatorios();
  }, [periodoSelecionado]);

  const carregarRelatorios = async () => {
    setLoading(true);
    try {
      // Simular dados de relatório
      const mockRelatorios: ParticipacaoRelatorio[] = eventos.slice(0, 5).map((evento, index) => ({
        evento_id: evento.id,
        evento_titulo: evento.titulo,
        data_evento: evento.data_inicio,
        total_confirmados: 45 + index * 10,
        total_presentes: 40 + index * 8,
        total_ausentes: 5 + index * 2,
        taxa_presenca: ((40 + index * 8) / (45 + index * 10)) * 100,
        participantes: Array.from({ length: 45 + index * 10 }, (_, i) => ({
          id: `pessoa-${i}`,
          nome: `Participante ${i + 1}`,
          status: i < 40 + index * 8 ? 'presente' : 'ausente' as any,
          data_confirmacao: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        }))
      }));
      setRelatorios(mockRelatorios);
    } catch (error) {
      console.error('Erro ao carregar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const dadosGraficoBarras = relatorios.map(rel => ({
    evento: rel.evento_titulo.substring(0, 20),
    confirmados: rel.total_confirmados,
    presentes: rel.total_presentes,
    ausentes: rel.total_ausentes,
  }));

  const dadosGraficoPizza = [
    { name: 'Presentes', value: relatorios.reduce((acc, rel) => acc + rel.total_presentes, 0), color: '#22C55E' },
    { name: 'Ausentes', value: relatorios.reduce((acc, rel) => acc + rel.total_ausentes, 0), color: '#EF4444' },
  ];

  const estatisticasGerais = {
    totalEventos: relatorios.length,
    totalParticipantes: relatorios.reduce((acc, rel) => acc + rel.total_confirmados, 0),
    totalPresentes: relatorios.reduce((acc, rel) => acc + rel.total_presentes, 0),
    taxaPresencaGeral: relatorios.length > 0 
      ? (relatorios.reduce((acc, rel) => acc + rel.taxa_presenca, 0) / relatorios.length).toFixed(1)
      : '0'
  };

  const exportarRelatorio = () => {
    const csvContent = [
      ['Evento', 'Data', 'Confirmados', 'Presentes', 'Ausentes', 'Taxa de Presença'],
      ...relatorios.map(rel => [
        rel.evento_titulo,
        format(new Date(rel.data_evento), 'dd/MM/yyyy', { locale: ptBR }),
        rel.total_confirmados.toString(),
        rel.total_presentes.toString(),
        rel.total_ausentes.toString(),
        `${rel.taxa_presenca.toFixed(1)}%`
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-participacao-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Clock className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Carregando relatórios...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Relatórios de Participação
              </CardTitle>
              <CardDescription>
                Acompanhe a participação nos eventos da agenda
              </CardDescription>
            </div>
            
            <div className="flex gap-2">
              <select
                value={periodoSelecionado}
                onChange={(e) => setPeriodoSelecionado(e.target.value as any)}
                className="px-3 py-2 border rounded-md"
              >
                <option value="7dias">Últimos 7 dias</option>
                <option value="30dias">Últimos 30 dias</option>
                <option value="3meses">Últimos 3 meses</option>
              </select>
              
              <Button onClick={exportarRelatorio} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Eventos</p>
                <p className="text-2xl font-bold">{estatisticasGerais.totalEventos}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Participantes</p>
                <p className="text-2xl font-bold">{estatisticasGerais.totalParticipantes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Presentes</p>
                <p className="text-2xl font-bold">{estatisticasGerais.totalPresentes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taxa de Presença</p>
                <p className="text-2xl font-bold">{estatisticasGerais.taxaPresencaGeral}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <Tabs defaultValue="barras" className="w-full">
        <TabsList>
          <TabsTrigger value="barras">Gráfico de Barras</TabsTrigger>
          <TabsTrigger value="pizza">Gráfico de Pizza</TabsTrigger>
          <TabsTrigger value="detalhes">Detalhes por Evento</TabsTrigger>
        </TabsList>

        <TabsContent value="barras">
          <Card>
            <CardHeader>
              <CardTitle>Participação por Evento</CardTitle>
              <CardDescription>
                Comparativo de confirmados, presentes e ausentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGraficoBarras}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="evento" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="confirmados" fill="#8884d8" name="Confirmados" />
                    <Bar dataKey="presentes" fill="#22C55E" name="Presentes" />
                    <Bar dataKey="ausentes" fill="#EF4444" name="Ausentes" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pizza">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Geral de Presença</CardTitle>
              <CardDescription>
                Visão geral de todos os eventos no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosGraficoPizza}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {dadosGraficoPizza.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detalhes">
          <div className="space-y-4">
            {relatorios.map((relatorio) => (
              <Card key={relatorio.evento_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{relatorio.evento_titulo}</CardTitle>
                      <CardDescription>
                        {format(new Date(relatorio.data_evento), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={relatorio.taxa_presenca >= 80 ? 'default' : 
                               relatorio.taxa_presenca >= 60 ? 'secondary' : 'destructive'}
                    >
                      {relatorio.taxa_presenca.toFixed(1)}% de presença
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{relatorio.total_confirmados}</p>
                      <p className="text-sm text-blue-800">Confirmados</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{relatorio.total_presentes}</p>
                      <p className="text-sm text-green-800">Presentes</p>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{relatorio.total_ausentes}</p>
                      <p className="text-sm text-red-800">Ausentes</p>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">Lista de Participantes</h4>
                    <div className="max-h-48 overflow-y-auto">
                      <div className="space-y-2">
                        {relatorio.participantes.slice(0, 10).map((participante) => (
                          <div key={participante.id} className="flex items-center justify-between py-2 border-b">
                            <span className="text-sm">{participante.nome}</span>
                            <Badge 
                              variant={participante.status === 'presente' ? 'default' : 'destructive'}
                              className="text-xs"
                            >
                              {participante.status === 'presente' ? (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {participante.status === 'presente' ? 'Presente' : 'Ausente'}
                            </Badge>
                          </div>
                        ))}
                        {relatorio.participantes.length > 10 && (
                          <p className="text-sm text-muted-foreground text-center pt-2">
                            E mais {relatorio.participantes.length - 10} participantes...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelatoriosParticipacao;