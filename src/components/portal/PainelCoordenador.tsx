import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  BarChart3, 
  Activity,
  MapPin,
  Target
} from 'lucide-react';
import { RoleBasedContent } from './RoleBasedContent';

interface IndicadorMissao {
  missao: string;
  lideresEmFormacao: number;
  progressoMedio: number;
  celulasAtivas: number;
  engajamentoSemanal: number;
}

interface MetricasGerais {
  totalMissoes: number;
  totalLideresFormacao: number;
  mediaProgressoGlobal: number;
  celulasComMaiorEngajamento: string[];
}

interface PainelCoordenadorProps {
  indicadoresPorMissao: IndicadorMissao[];
  metricas: MetricasGerais;
  heatmapData: any[];
  radarData: any[];
}

export const PainelCoordenador: React.FC<PainelCoordenadorProps> = ({
  indicadoresPorMissao = [],
  metricas,
  heatmapData = [],
  radarData = []
}) => {
  const getProgressColor = (percentual: number) => {
    if (percentual >= 80) return 'bg-green-500';
    if (percentual >= 60) return 'bg-blue-500';
    if (percentual >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEngajamentoColor = (nivel: number) => {
    if (nivel >= 8) return 'bg-green-500';
    if (nivel >= 6) return 'bg-blue-500';
    if (nivel >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <RoleBasedContent allowedRoles={['coordenador_ensino', 'administrador_geral']}>
      <div className="space-y-6">
        {/* Métricas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total de Missões</p>
                  <p className="text-2xl font-bold">{metricas.totalMissoes}</p>
                </div>
                <MapPin className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Líderes em Formação</p>
                  <p className="text-2xl font-bold">{metricas.totalLideresFormacao}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Progresso Global</p>
                  <p className="text-2xl font-bold">{metricas.mediaProgressoGlobal}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Células Engajadas</p>
                  <p className="text-2xl font-bold">{metricas.celulasComMaiorEngajamento.length}</p>
                </div>
                <Activity className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Indicadores por Missão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Indicadores por Missão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {indicadoresPorMissao.map((indicador) => (
                <div key={indicador.missao} className="p-4 border rounded-lg space-y-4">
                  <h4 className="font-medium text-lg">{indicador.missao}</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Líderes em Formação */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Líderes em Formação</span>
                        <span className="text-sm font-bold">{indicador.lideresEmFormacao}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Total de pessoas sendo formadas
                        </span>
                      </div>
                    </div>
                    
                    {/* Progresso Médio */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progresso Médio</span>
                        <span className="text-sm font-bold">{indicador.progressoMedio}%</span>
                      </div>
                      <div className="space-y-1">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(indicador.progressoMedio)}`}
                            style={{ width: `${indicador.progressoMedio}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Células Ativas */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Células Ativas</span>
                        <span className="text-sm font-bold">{indicador.celulasAtivas}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Engajamento: {indicador.engajamentoSemanal}/10
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Barra de Engajamento Semanal */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Engajamento Semanal</span>
                      <span className="text-sm text-muted-foreground">
                        {indicador.engajamentoSemanal}/10
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getEngajamentoColor(indicador.engajamentoSemanal)}`}
                        style={{ width: `${(indicador.engajamentoSemanal / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Heatmap de Engajamento */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Heatmap de Engajamento por Célula
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {/* Headers dos dias da semana */}
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                <div key={dia} className="text-center text-xs font-medium p-2">
                  {dia}
                </div>
              ))}
              
              {/* Simulação de dados do heatmap */}
              {Array.from({ length: 35 }, (_, i) => {
                const intensity = Math.floor(Math.random() * 5);
                const colors = [
                  'bg-muted',
                  'bg-green-200',
                  'bg-green-300',
                  'bg-green-400',
                  'bg-green-500'
                ];
                
                return (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded ${colors[intensity]} border`}
                    title={`Dia ${i + 1}: ${intensity * 2} acessos`}
                  />
                );
              })}
            </div>
            
            <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
              <span>Menos</span>
              <div className="flex gap-1">
                {['bg-muted', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500'].map((color, i) => (
                  <div key={i} className={`w-3 h-3 rounded ${color} border`} />
                ))}
              </div>
              <span>Mais</span>
            </div>
          </CardContent>
        </Card>

        {/* Radar Chart - Pontos Fortes vs Fracos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Análise de Pontos Fortes vs. Fracos da Jornada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pontos Fortes */}
              <div className="space-y-4">
                <h4 className="font-medium text-green-600">Pontos Fortes</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Ensino Concluído</span>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="w-20 h-2" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Participação em Células</span>
                    <div className="flex items-center gap-2">
                      <Progress value={78} className="w-20 h-2" />
                      <span className="text-sm font-medium">78%</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Pontos de Melhoria */}
              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Pontos de Melhoria</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Feedbacks Recebidos</span>
                    <div className="flex items-center gap-2">
                      <Progress value={45} className="w-20 h-2" />
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tempo Médio de Conclusão</span>
                    <div className="flex items-center gap-2">
                      <Progress value={32} className="w-20 h-2" />
                      <span className="text-sm font-medium">32%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedContent>
  );
};