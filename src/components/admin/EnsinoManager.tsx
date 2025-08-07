import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Users, GraduationCap, TrendingUp, Award, UserCheck, Brain, CalendarCheck, BarChart3, FileText } from 'lucide-react';
import { CursosManager } from './ensino/CursosManager';
import { TurmasManager } from './ensino/TurmasManager';
import { MatriculasManager } from './ensino/MatriculasManager';
import { TrilhasManager } from './ensino/TrilhasManager';
import { TrilhasDNAManager } from './ensino/TrilhasDNAManager';
import { RelatoriosEnsino } from './ensino/RelatoriosEnsino';
import { CalendarioPlanejamento } from './ensino/CalendarioPlanejamento';
import { AgendarTurma } from './ensino/AgendarTurma';
import { DashboardEnsino } from './ensino/DashboardEnsino';
import { PlanejamentoDashboard } from './ensino/PlanejamentoDashboard';
import GeradorEstudosBiblicos from './GeradorEstudosBiblicos';
import { useEnsinoCompleto } from '@/hooks/useEnsinoCompleto';

const EnsinoManager = () => {
  const { estatisticas, loading } = useEnsinoCompleto();
  const [activeTab, setActiveTab] = useState('cursos');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-mobile-sm text-muted-foreground">Carregando dados do ensino...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-mobile-2xl font-bold tracking-tight gradient-text">Gestão de Ensino</h1>
          <p className="text-mobile-sm text-muted-foreground">
            Gerencie cursos, turmas, matrículas e trilhas de formação
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      {estatisticas && (
        <div className="stats-grid-mobile">
          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-mobile-sm font-medium">Total de Cursos</CardTitle>
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="text-mobile-xl font-bold">{estatisticas.total_cursos}</div>
              <p className="text-mobile-xs text-muted-foreground">
                Cursos disponíveis
              </p>
            </CardContent>
          </Card>

          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-mobile-sm font-medium">Turmas Ativas</CardTitle>
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="text-mobile-xl font-bold">{estatisticas.total_turmas_ativas}</div>
              <p className="text-mobile-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>

          <Card className="card-mobile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-mobile-sm font-medium">Alunos Matriculados</CardTitle>
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <div className="text-mobile-xl font-bold">{estatisticas.total_alunos_matriculados}</div>
              <p className="text-mobile-xs text-muted-foreground">
                Estudando atualmente
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
              <p className="text-mobile-xs text-muted-foreground">
                Alunos formados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabs de Gestão */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4">
        <div className="tabs-mobile">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-1 p-1 h-auto bg-muted/30 rounded-xl overflow-x-auto">
            <TabsTrigger 
              value="cursos" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Cursos</span>
              <span className="sm:hidden text-[10px]">Cursos</span>
            </TabsTrigger>
            <TabsTrigger 
              value="turmas" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Turmas</span>
              <span className="sm:hidden text-[10px]">Turmas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="matriculas" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Matrículas</span>
              <span className="sm:hidden text-[10px]">Matrículas</span>
            </TabsTrigger>
            <TabsTrigger 
              value="planejamento" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CalendarCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Planejamento</span>
              <span className="sm:hidden text-[10px]">Plan.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="agendar" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <CalendarCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Agendar</span>
              <span className="sm:hidden text-[10px]">Agendar</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden text-[10px]">Dash.</span>
            </TabsTrigger>
            <TabsTrigger 
              value="dashboard-anual" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Anual</span>
              <span className="sm:hidden text-[10px]">Anual</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trilhas-dna" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">DNA</span>
              <span className="sm:hidden text-[10px]">DNA</span>
            </TabsTrigger>
            <TabsTrigger 
              value="relatorios" 
              className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 sm:p-3 text-xs sm:text-sm rounded-lg data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden text-[10px]">Rel.</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="cursos" className="space-y-3 sm:space-y-4">
          <CursosManager />
        </TabsContent>

        <TabsContent value="turmas" className="space-y-3 sm:space-y-4">
          <TurmasManager />
        </TabsContent>

        <TabsContent value="matriculas" className="space-y-3 sm:space-y-4">
          <MatriculasManager />
        </TabsContent>

        <TabsContent value="planejamento" className="space-y-3 sm:space-y-4">
          <CalendarioPlanejamento />
        </TabsContent>

        <TabsContent value="agendar" className="space-y-3 sm:space-y-4">
          <AgendarTurma />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-3 sm:space-y-4">
          <DashboardEnsino />
        </TabsContent>

        <TabsContent value="dashboard-anual" className="space-y-3 sm:space-y-4">
          <PlanejamentoDashboard />
        </TabsContent>

        <TabsContent value="trilhas-dna" className="space-y-3 sm:space-y-4">
          <TrilhasDNAManager />
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-3 sm:space-y-4">
          <RelatoriosEnsino />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnsinoManager;