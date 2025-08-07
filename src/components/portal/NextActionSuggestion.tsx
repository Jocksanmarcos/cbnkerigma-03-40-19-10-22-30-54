import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Target, Clock, AlertCircle } from 'lucide-react';

interface ProximaAcao {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: 'alta' | 'media' | 'baixa';
  tipo: 'aula' | 'trilha' | 'avaliacao' | 'certificado' | 'reuniao';
  url?: string;
  prazo?: string;
}

interface NextActionSuggestionProps {
  proximasAcoes: ProximaAcao[];
  onAcaoClick?: (acao: ProximaAcao) => void;
}

export const NextActionSuggestion: React.FC<NextActionSuggestionProps> = ({
  proximasAcoes = [],
  onAcaoClick
}) => {
  const getPrioridadeIcon = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'media': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'baixa': return <Target className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getPrioridadeBadgeVariant = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baixa': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTipoLabel = (tipo: string) => {
    const labels = {
      'aula': 'Aula',
      'trilha': 'Trilha',
      'avaliacao': 'Avaliação',
      'certificado': 'Certificado',
      'reuniao': 'Reunião'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  // Ordenar por prioridade (alta -> média -> baixa)
  const acaoesOrdenadas = [...proximasAcoes].sort((a, b) => {
    const prioridadeOrder = { alta: 3, media: 2, baixa: 1 };
    return prioridadeOrder[b.prioridade] - prioridadeOrder[a.prioridade];
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Próximos Passos Recomendados
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {acaoesOrdenadas.length > 0 ? (
          acaoesOrdenadas.map((acao) => (
            <div key={acao.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getPrioridadeIcon(acao.prioridade)}
                  <h4 className="font-medium text-sm">{acao.titulo}</h4>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getTipoLabel(acao.tipo)}
                  </Badge>
                  <Badge 
                    variant={getPrioridadeBadgeVariant(acao.prioridade) as any} 
                    className="text-xs"
                  >
                    {acao.prioridade.charAt(0).toUpperCase() + acao.prioridade.slice(1)}
                  </Badge>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground">{acao.descricao}</p>
              
              {acao.prazo && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>Prazo: {new Date(acao.prazo).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
              
              <Button 
                size="sm" 
                onClick={() => onAcaoClick?.(acao)}
                className="w-full"
              >
                <span>Iniciar</span>
                <ArrowRight className="h-3 w-3 ml-2" />
              </Button>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Parabéns! Você está em dia com todas as atividades
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Continue acompanhando seu progresso
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};