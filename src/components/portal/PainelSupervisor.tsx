import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  BarChart3,
  Bell
} from 'lucide-react';
import { RoleBasedContent } from './RoleBasedContent';
import { AlertSystem } from './AlertSystem';
import { GoalTracker } from './GoalTracker';

interface DiscipuladoRegiao {
  id: string;
  nome: string;
  discipulador: string;
  celulaAtual: string;
  trilhaJornadaStatus: string;
  trilhaJornadaPercentual: number;
  statusFormacao: string;
  ultimoAcesso: string;
}

interface EstatisticasSupervisor {
  totalDiscipulados: number;
  porEtapa: Record<string, number>;
  discipuladoresAtivos: number;
  mediaProgressoGeral: number;
}

interface PainelSupervisorProps {
  discipuladosRegiao: DiscipuladoRegiao[];
  estatisticas: EstatisticasSupervisor;
  alertas: any[];
  metas: any[];
  onAcaoAlerta?: (alertaId: string, acao: string) => void;
  onResolverAlerta?: (alertaId: string) => void;
}

export const PainelSupervisor: React.FC<PainelSupervisorProps> = ({
  discipuladosRegiao = [],
  estatisticas,
  alertas = [],
  metas = [],
  onAcaoAlerta,
  onResolverAlerta
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aluno': return 'secondary';
      case 'em formação': return 'default';
      case 'líder em treinamento': return 'outline';
      default: return 'secondary';
    }
  };

  const getProgressColor = (percentual: number) => {
    if (percentual >= 80) return 'bg-green-500';
    if (percentual >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <RoleBasedContent allowedRoles={['supervisor_regional', 'administrador_geral']}>
      <div className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total de Discipulados</p>
                  <p className="text-2xl font-bold">{estatisticas.totalDiscipulados}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Discipuladores Ativos</p>
                  <p className="text-2xl font-bold">{estatisticas.discipuladoresAtivos}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Alertas Ativos</p>
                  <p className="text-2xl font-bold">{alertas.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Progresso Médio</p>
                  <p className="text-2xl font-bold">{estatisticas.mediaProgressoGeral}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição por Etapa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Distribuição por Etapa de Jornada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(estatisticas.porEtapa).map(([etapa, quantidade]) => {
                const percentual = (quantidade / estatisticas.totalDiscipulados) * 100;
                return (
                  <div key={etapa} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{etapa}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{quantidade} pessoas</span>
                        <span className="text-sm font-medium">{percentual.toFixed(1)}%</span>
                      </div>
                    </div>
                    <Progress value={percentual} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sistema de Alertas */}
          <AlertSystem
            scope="supervisor"
          />

          {/* Tracker de Metas */}
          <GoalTracker metas={metas} groupBy="missao" />
        </div>

        {/* Tabela de Todos os Discipulados */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Todos os Discipulados da Região
            </CardTitle>
          </CardHeader>
          <CardContent>
            {discipuladosRegiao.length > 0 ? (
              <div className="space-y-3">
                {discipuladosRegiao.map((discipulado) => (
                  <div key={discipulado.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{discipulado.nome}</h4>
                        <Badge variant={getStatusBadgeVariant(discipulado.statusFormacao) as any}>
                          {discipulado.statusFormacao}
                        </Badge>
                        <Badge variant="outline">
                          {discipulado.trilhaJornadaStatus}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <span>Discipulador: {discipulado.discipulador}</span>
                        <span>Célula: {discipulado.celulaAtual}</span>
                        <span>Último acesso: {new Date(discipulado.ultimoAcesso).toLocaleDateString('pt-BR')}</span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Progresso da Trilha</span>
                          <span className="font-medium">{discipulado.trilhaJornadaPercentual}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getProgressColor(discipulado.trilhaJornadaPercentual)}`}
                            style={{ width: `${discipulado.trilhaJornadaPercentual}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum discipulado na região
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedContent>
  );
};