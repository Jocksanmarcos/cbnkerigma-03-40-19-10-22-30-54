import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  TrendingUp, 
  Trophy, 
  MessageSquare,
  Eye,
  BarChart3
} from 'lucide-react';
import { RoleBasedContent } from './RoleBasedContent';

interface Discipulando {
  id: string;
  nome: string;
  trilhaJornadaStatus: string;
  trilhaJornadaPercentual: number;
  aulasConcluidas: number;
  statusFormacao: string;
  ultimoAcesso: string;
}

interface PainelDiscipuladorProps {
  discipulandos: Discipulando[];
  estatisticas: {
    totalDiscipulandos: number;
    emFormacao: number;
    concluidos: number;
    mediaProgresso: number;
  };
  onVerDetalhes?: (discipulandoId: string) => void;
  onEnviarFeedback?: (discipulandoId: string) => void;
}

export const PainelDiscipulador: React.FC<PainelDiscipuladorProps> = ({
  discipulandos = [],
  estatisticas,
  onVerDetalhes,
  onEnviarFeedback
}) => {
  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'aluno': return 'secondary';
      case 'em formação': return 'default';
      case 'líder em treinamento': return 'outline';
      case 'concluído': return 'default';
      default: return 'secondary';
    }
  };

  const getProgressColor = (percentual: number) => {
    if (percentual >= 80) return 'text-green-600';
    if (percentual >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <RoleBasedContent allowedRoles={['discipulador', 'administrador_geral']}>
      <div className="space-y-6">
        {/* Estatísticas Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Total de Discípulos</p>
                  <p className="text-2xl font-bold">{estatisticas.totalDiscipulandos}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Em Formação</p>
                  <p className="text-2xl font-bold">{estatisticas.emFormacao}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Concluídos</p>
                  <p className="text-2xl font-bold">{estatisticas.concluidos}</p>
                </div>
                <Trophy className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Progresso Médio</p>
                  <p className="text-2xl font-bold">{estatisticas.mediaProgresso}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Discipulandos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Meus Discipulados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {discipulandos.length > 0 ? (
              <div className="space-y-4">
                {discipulandos.map((discipulando) => (
                  <div key={discipulando.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{discipulando.nome}</h4>
                        <Badge variant={getStatusBadgeVariant(discipulando.statusFormacao) as any}>
                          {discipulando.statusFormacao}
                        </Badge>
                        <Badge variant="outline">
                          {discipulando.trilhaJornadaStatus}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>
                          Progresso: 
                          <span className={`ml-1 font-medium ${getProgressColor(discipulando.trilhaJornadaPercentual)}`}>
                            {discipulando.trilhaJornadaPercentual}%
                          </span>
                        </span>
                        <span>Aulas concluídas: {discipulando.aulasConcluidas}</span>
                        <span>Último acesso: {new Date(discipulando.ultimoAcesso).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {onVerDetalhes && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onVerDetalhes(discipulando.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalhes
                        </Button>
                      )}
                      {onEnviarFeedback && (
                        <Button 
                          size="sm"
                          onClick={() => onEnviarFeedback(discipulando.id)}
                        >
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum discípulo sob sua responsabilidade ainda
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </RoleBasedContent>
  );
};