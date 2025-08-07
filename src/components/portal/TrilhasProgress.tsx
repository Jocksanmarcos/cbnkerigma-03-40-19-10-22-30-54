import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  PlayCircle,
  MapPin,
  Target
} from 'lucide-react';
import { ProgressoTrilha } from '@/hooks/usePortalAluno';

interface TrilhasProgressProps {
  trilhas: ProgressoTrilha[];
}

export const TrilhasProgress: React.FC<TrilhasProgressProps> = ({ trilhas }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'pausado': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'em_andamento': return 'Em Andamento';
      case 'pausado': return 'Pausado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="h-4 w-4" />;
      case 'em_andamento': return <PlayCircle className="h-4 w-4" />;
      case 'pausado': return <Clock className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (trilhas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Minha Jornada DNA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma trilha iniciada</h3>
            <p className="text-muted-foreground mb-4">
              Comece sua jornada de discipulado iniciando uma trilha DNA
            </p>
            <Button>
              <Target className="h-4 w-4 mr-2" />
              Iniciar Trilha
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Minha Jornada DNA
          <Badge variant="secondary" className="ml-auto">
            {trilhas.length} trilha{trilhas.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trilhas.map((trilha) => (
          <div 
            key={trilha.id} 
            className="p-4 bg-gradient-to-r from-white to-accent/5 rounded-lg border hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full">
                  {getStatusIcon(trilha.status)}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{trilha.trilha_nome}</h3>
                  <p className="text-sm text-muted-foreground">
                    Etapa {trilha.etapa_atual} de {trilha.total_etapas}
                  </p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(trilha.status)} text-white`}
              >
                {getStatusText(trilha.status)}
              </Badge>
            </div>

            <div className="space-y-3">
              {/* Barra de progresso */}
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-semibold">{trilha.percentual_conclusao}%</span>
                </div>
                <Progress 
                  value={trilha.percentual_conclusao} 
                  className="h-2"
                />
              </div>

              {/* Informações adicionais */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    Iniciado em: {new Date(trilha.data_inicio).toLocaleDateString()}
                  </span>
                  {trilha.data_conclusao && (
                    <span className="text-green-600 font-medium">
                      Concluído em: {new Date(trilha.data_conclusao).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Próxima aula/etapa */}
              {trilha.status === 'em_andamento' && trilha.proxima_aula && (
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2">
                    <PlayCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Próxima etapa: {trilha.proxima_aula}
                    </span>
                  </div>
                  <Button size="sm" variant="outline">
                    Continuar
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};