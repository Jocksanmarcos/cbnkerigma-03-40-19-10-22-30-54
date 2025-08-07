import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Target,
  CheckCircle2, 
  Circle
} from 'lucide-react';
import { ProgressoTrilha } from '@/hooks/usePortalAluno';

interface EtapaJornada {
  id: string;
  nome: string;
  descricao: string;
  concluida: boolean;
  atual: boolean;
  percentual: number;
}

interface ProgressoJornadaProps {
  etapas?: EtapaJornada[];
  percentualGeral?: number;
  statusAtual?: string;
  trilhas?: ProgressoTrilha[];
  onContinuarTrilha?: (trilhaId: string) => void;
}

export const ProgressoJornada: React.FC<ProgressoJornadaProps> = ({
  etapas = [],
  percentualGeral = 0,
  statusAtual = '',
  trilhas = [],
  onContinuarTrilha
}) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluido': return 'bg-green-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'pausado': return 'bg-yellow-500';
      case 'nao_iniciado': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'concluido': return 'Concluído';
      case 'em_andamento': return 'Em Andamento';
      case 'pausado': return 'Pausado';
      case 'nao_iniciado': return 'Não Iniciado';
      default: return status;
    }
  };

  // Se temos trilhas, usamos o novo formato
  if (trilhas.length > 0) {
    return (
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Minha Jornada de Formação
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {trilhas.map((trilha) => (
            <div key={trilha.id} className="space-y-4">
              {/* Header da Trilha */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{trilha.trilha_nome}</h3>
                  <Badge 
                    variant="outline" 
                    className={`${getStatusColor(trilha.status)} text-white border-0`}
                  >
                    {getStatusText(trilha.status)}
                  </Badge>
                </div>
                {trilha.status === 'em_andamento' && onContinuarTrilha && (
                  <Button 
                    size="sm" 
                    onClick={() => onContinuarTrilha(trilha.trilha_id)}
                    className="flex items-center gap-2"
                  >
                    Continuar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Progresso Geral */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Etapa {trilha.etapa_atual} de {trilha.total_etapas}
                  </span>
                  <span className="font-semibold">
                    {trilha.percentual_conclusao}% concluído
                  </span>
                </div>
                <Progress value={trilha.percentual_conclusao} className="h-2" />
              </div>

              {/* Timeline de Etapas */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                {Array.from({ length: trilha.total_etapas }, (_, index) => {
                  const etapaNumero = index + 1;
                  const isCompleta = etapaNumero < trilha.etapa_atual;
                  const isAtual = etapaNumero === trilha.etapa_atual;
                  const isFutura = etapaNumero > trilha.etapa_atual;

                  return (
                    <div 
                      key={etapaNumero}
                      className={`
                        flex flex-col items-center p-3 rounded-lg border transition-all
                        ${isCompleta ? 'bg-green-50 border-green-200' : ''}
                        ${isAtual ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : ''}
                        ${isFutura ? 'bg-gray-50 border-gray-200' : ''}
                      `}
                    >
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold
                        ${isCompleta ? 'bg-green-500 text-white' : ''}
                        ${isAtual ? 'bg-blue-500 text-white' : ''}
                        ${isFutura ? 'bg-gray-300 text-gray-600' : ''}
                      `}>
                        {isCompleta ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : isAtual ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          etapaNumero
                        )}
                      </div>
                      <span className={`
                        text-xs mt-1 text-center
                        ${isCompleta ? 'text-green-700' : ''}
                        ${isAtual ? 'text-blue-700 font-semibold' : ''}
                        ${isFutura ? 'text-gray-500' : ''}
                      `}>
                        Etapa {etapaNumero}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Informações adicionais */}
              <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <div className="flex items-center gap-4">
                  <span>
                    Iniciada em: {new Date(trilha.data_inicio).toLocaleDateString('pt-BR')}
                  </span>
                  {trilha.data_conclusao && (
                    <span>
                      Concluída em: {new Date(trilha.data_conclusao).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
                {trilha.proxima_aula && (
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{trilha.proxima_aula}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Formato legado para compatibilidade
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Minha Jornada
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progresso Geral */}
        {statusAtual && (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Progresso Geral</span>
              <Badge variant="secondary">{statusAtual}</Badge>
            </div>
            <Progress value={percentualGeral} className="h-3" />
            <p className="text-sm text-muted-foreground text-right">
              {percentualGeral}% concluído
            </p>
          </div>
        )}

        {/* Checkpoints da Jornada */}
        {etapas.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Etapas da Jornada</h4>
            <div className="space-y-3">
              {etapas.map((etapa, index) => (
                <div key={etapa.id} className="flex items-start gap-3">
                  <div className="mt-1">
                    {etapa.concluida ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : etapa.atual ? (
                      <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className={`font-medium text-sm ${
                        etapa.atual ? 'text-primary' : 
                        etapa.concluida ? 'text-foreground' : 'text-muted-foreground'
                      }`}>
                        {etapa.nome}
                      </h5>
                      {etapa.atual && (
                        <Badge variant="outline" className="text-xs">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {etapa.descricao}
                    </p>
                    {(etapa.atual || etapa.concluida) && (
                      <Progress value={etapa.percentual} className="h-1.5 mt-2" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma jornada iniciada ainda
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};