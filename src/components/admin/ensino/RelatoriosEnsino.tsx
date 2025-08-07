import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  BookOpen, Users, GraduationCap, TrendingUp, Award, 
  Download, Calendar, UserCheck, Clock, FileSpreadsheet
} from 'lucide-react';
import { useEnsinoCompleto } from '@/hooks/useEnsinoCompleto';
import { GeradorRelatoriosEnsino } from './GeradorRelatoriosEnsino';

export const RelatoriosEnsino = () => {
  const { estatisticas, cursos, turmas, matriculas, loading } = useEnsinoCompleto();

  // Dados para os gráficos
  const dadosPorCategoria = cursos.reduce((acc, curso) => {
    const categoria = curso.categoria;
    acc[categoria] = (acc[categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosCategoria = Object.entries(dadosPorCategoria).map(([categoria, quantidade]) => ({
    categoria: categoria.charAt(0).toUpperCase() + categoria.slice(1),
    quantidade
  }));

  const dadosStatus = matriculas.reduce((acc, matricula) => {
    const status = matricula.status;
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dadosStatusChart = Object.entries(dadosStatus).map(([status, quantidade]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    quantidade
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const turmasRecentes = turmas
    .filter(t => t.status === 'ativa')
    .slice(0, 5);

  const matriculasRecentes = matriculas
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-mobile-sm text-muted-foreground">Carregando relatórios...</p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="resumo" className="space-y-3 sm:space-y-4 md:space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="resumo" className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Resumo Estatístico
        </TabsTrigger>
        <TabsTrigger value="gerador" className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Gerador de Relatórios
        </TabsTrigger>
      </TabsList>

      <TabsContent value="resumo" className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Resumo Geral */}
      {estatisticas && (
        <div className="stats-grid-mobile">
          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-mobile-sm font-medium">Cursos Ativos</CardTitle>
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="text-mobile-xl font-bold">{estatisticas.total_cursos}</div>
              <p className="text-mobile-xs text-muted-foreground">
                Disponíveis para matrícula
              </p>
            </CardContent>
          </Card>

          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-mobile-sm font-medium">Turmas em Andamento</CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="text-mobile-xl font-bold">{estatisticas.total_turmas_ativas}</div>
              <p className="text-mobile-xs text-muted-foreground">
                Com aulas acontecendo
              </p>
            </CardContent>
          </Card>

          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-mobile-sm font-medium">Alunos Ativos</CardTitle>
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="text-mobile-xl font-bold">{estatisticas.total_alunos_matriculados}</div>
              <p className="text-mobile-xs text-muted-foreground">
                Matriculados e cursando
              </p>
            </CardContent>
          </Card>

          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-mobile-sm font-medium">Taxa de Conclusão</CardTitle>
              <Award className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="text-mobile-xl font-bold">{estatisticas.taxa_conclusao.toFixed(1)}%</div>
              <Progress value={estatisticas.taxa_conclusao} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cursos por Categoria</CardTitle>
            <CardDescription>Distribuição dos cursos por área de ensino</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <BarChart data={dadosCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status das Matrículas</CardTitle>
            <CardDescription>Situação atual dos alunos matriculados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
              <PieChart>
                <Pie
                  data={dadosStatusChart}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="quantidade"
                >
                  {dadosStatusChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Listas Resumidas */}
      <div className="grid gap-3 sm:gap-4 md:gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Turmas Ativas</CardTitle>
            <CardDescription>Turmas com aulas em andamento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {turmasRecentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma turma ativa no momento
                </p>
              ) : (
                turmasRecentes.map((turma) => (
                  <div key={turma.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">{turma.nome_turma}</div>
                      <div className="text-sm text-muted-foreground">
                        {turma.curso?.nome}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{turma.status}</Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3 inline mr-1" />
                        {turma.horario_inicio} - {turma.horario_fim}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matrículas Recentes</CardTitle>
            <CardDescription>Últimas matrículas realizadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {matriculasRecentes.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma matrícula recente
                </p>
              ) : (
                matriculasRecentes.map((matricula) => (
                  <div key={matricula.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <div className="font-medium">
                        {matricula.pessoa?.nome_completo || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {matricula.turma?.curso?.nome}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        matricula.status === 'concluido' ? 'default' :
                        matricula.status === 'cursando' ? 'secondary' : 'outline'
                      }>
                        {matricula.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3 inline mr-1" />
                        {new Date(matricula.data_matricula).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações de Exportação */}
      <Card>
        <CardHeader>
          <CardTitle>Exportar Relatórios</CardTitle>
          <CardDescription>Gere relatórios detalhados para análise externa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Relatório de Cursos (PDF)
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Lista de Matrículas (Excel)
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Certificados Emitidos (PDF)
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Estatísticas Gerais (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
      </TabsContent>

      <TabsContent value="gerador">
        <GeradorRelatoriosEnsino />
      </TabsContent>
    </Tabs>
  );
};