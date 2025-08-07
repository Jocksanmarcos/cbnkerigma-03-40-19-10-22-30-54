import { BarChart3, GraduationCap, Users, TrendingUp, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useEnsinoCompleto } from '@/hooks/useEnsinoCompleto';
import { useBloqueiosAcademicos } from '@/hooks/useBloqueiosAcademicos';

export const DashboardEnsino = () => {
  const { estatisticas, turmas, loading } = useEnsinoCompleto();
  const { bloqueios } = useBloqueiosAcademicos();

  // Dados reais para o Gantt Chart baseados nas turmas
  const dadosGantt = (() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = meses.map(mes => ({ mes, discipulado: 0, lideranca: 0, teologia: 0, total: 0 }));
    
    turmas.forEach(turma => {
      if (turma.data_inicio && turma.curso) {
        const mesIndex = new Date(turma.data_inicio).getMonth();
        const categoria = turma.curso.categoria.toLowerCase();
        
        if (categoria.includes('discipulado')) {
          dados[mesIndex].discipulado += 1;
        } else if (categoria.includes('lideranca')) {
          dados[mesIndex].lideranca += 1;
        } else if (categoria.includes('teologia')) {
          dados[mesIndex].teologia += 1;
        }
        dados[mesIndex].total += 1;
      }
    });
    
    return dados;
  })();

  // Dados para o heatmap de professores
  const alocacaoProfessores = [
    { professor: 'João Silva', turmas: 3, horas: 45, status: 'disponivel' },
    { professor: 'Maria Santos', turmas: 5, horas: 75, status: 'ocupado' },
    { professor: 'Pedro Costa', turmas: 2, horas: 30, status: 'disponivel' },
    { professor: 'Ana Oliveira', turmas: 4, horas: 60, status: 'ocupado' },
    { professor: 'Carlos Lima', turmas: 1, horas: 15, status: 'disponivel' },
  ];

  // Dados para distribuição por categoria
  const distribuicaoCategorias = [
    { categoria: 'Discipulado', valor: 35, cor: '#3b82f6' },
    { categoria: 'Liderança', valor: 25, cor: '#10b981' },
    { categoria: 'Teologia', valor: 20, cor: '#f59e0b' },
    { categoria: 'Missões', valor: 15, cor: '#ef4444' },
    { categoria: 'Louvor', valor: 5, cor: '#8b5cf6' },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Anual - 2024</h2>
        <p className="text-muted-foreground">
          Visão estratégica e análise dos cursos de ensino
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Planejados</p>
                <p className="text-2xl font-bold">{estatisticas?.total_cursos || 0}</p>
                <p className="text-xs text-muted-foreground">+12% vs ano anterior</p>
              </div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Turmas Ativas</p>
                <p className="text-2xl font-bold">{estatisticas?.total_turmas_ativas || 0}</p>
                <p className="text-xs text-muted-foreground">8 planejadas</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vagas Totais</p>
                <p className="text-2xl font-bold">
                  {turmas.reduce((acc, turma) => acc + turma.capacidade_maxima, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Capacidade máxima</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{estatisticas?.taxa_conclusao?.toFixed(1) || 0}%</p>
                <p className="text-xs text-muted-foreground">Meta: 85%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bloqueios Acadêmicos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Bloqueios e Eventos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bloqueios.length > 0 ? (
                bloqueios.slice(0, 5).map((bloqueio) => (
                  <div key={bloqueio.id} className="flex items-center gap-3 p-2 border rounded">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: bloqueio.cor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{bloqueio.titulo}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bloqueio.data_inicio).toLocaleDateString('pt-BR')}
                        {bloqueio.data_fim !== bloqueio.data_inicio && 
                          ` - ${new Date(bloqueio.data_fim).toLocaleDateString('pt-BR')}`
                        }
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {bloqueio.tipo}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum bloqueio cadastrado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Linha do Tempo dos Cursos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição Mensal de Turmas - 2024
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                discipulado: {
                  label: "Discipulado",
                  color: "hsl(var(--chart-1))",
                },
                lideranca: {
                  label: "Liderança",
                  color: "hsl(var(--chart-2))",
                },
                teologia: {
                  label: "Teologia",
                  color: "hsl(var(--chart-3))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosGantt}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="discipulado" stackId="a" fill="var(--color-discipulado)" />
                  <Bar dataKey="lideranca" stackId="a" fill="var(--color-lideranca)" />
                  <Bar dataKey="teologia" stackId="a" fill="var(--color-teologia)" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Alocação de Professores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alocação de Professores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alocacaoProfessores.map((professor) => (
                <div key={professor.professor} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{professor.professor}</span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={professor.status === 'disponivel' ? 'default' : 'secondary'}
                      >
                        {professor.status === 'disponivel' ? 'Disponível' : 'Ocupado'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {professor.turmas} turmas
                      </span>
                    </div>
                  </div>
                  <Progress value={(professor.horas / 80) * 100} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{professor.horas}h de 80h</span>
                    <span>{Math.round((professor.horas / 80) * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Distribuição por Categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                valor: {
                  label: "Cursos",
                },
              }}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribuicaoCategorias}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="valor"
                  >
                    {distribuicaoCategorias.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {distribuicaoCategorias.map((categoria) => (
                <div key={categoria.categoria} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: categoria.cor }}
                  />
                  <span className="text-xs">{categoria.categoria}</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {categoria.valor}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Turmas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Turmas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {turmas.length > 0 ? (
            <div className="space-y-4">
              {turmas.slice(0, 5).map((turma) => (
                <div key={turma.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{turma.nome_turma}</h4>
                    <p className="text-sm text-muted-foreground">
                      Professor: {turma.professor_responsavel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {turma.data_inicio} - {turma.horario_inicio}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        turma.status === 'em_andamento' ? 'default' :
                        turma.status === 'planejado' ? 'secondary' : 'outline'
                      }
                    >
                      {turma.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {turma.capacidade_maxima} vagas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma turma cadastrada ainda</p>
              <p className="text-sm">Comece criando sua primeira turma</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};