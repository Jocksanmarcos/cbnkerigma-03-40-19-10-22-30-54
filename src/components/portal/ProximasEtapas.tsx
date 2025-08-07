import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  BookOpen, 
  Target, 
  GraduationCap, 
  CheckCircle,
  PlayCircle,
  Calendar
} from 'lucide-react';
import { ProximaEtapa } from '@/hooks/usePortalAluno';

interface ProximasEtapasProps {
  etapas: ProximaEtapa[];
}

export const ProximasEtapas: React.FC<ProximasEtapasProps> = ({ etapas }) => {
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'aula': return <BookOpen className="h-5 w-5" />;
      case 'trilha': return <Target className="h-5 w-5" />;
      case 'avaliacao': return <CheckCircle className="h-5 w-5" />;
      case 'certificado': return <GraduationCap className="h-5 w-5" />;
      default: return <PlayCircle className="h-5 w-5" />;
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baixa': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getPrioridadeBorder = (prioridade: string) => {
    switch (prioridade) {
      case 'alta': return 'border-red-200 bg-red-50';
      case 'media': return 'border-yellow-200 bg-yellow-50';
      case 'baixa': return 'border-green-200 bg-green-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  if (etapas.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Parabéns!</h3>
            <p className="text-muted-foreground">
              Você está em dia com todas as suas atividades
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Próximos Passos
          <Badge variant="secondary" className="ml-auto">
            {etapas.length} sugestõe{etapas.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {etapas.map((etapa, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border-l-4 ${getPrioridadeBorder(etapa.prioridade)} transition-all duration-200 hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border">
                  {getTipoIcon(etapa.tipo)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{etapa.titulo}</h3>
                    <Badge 
                      variant="secondary" 
                      className={`${getPrioridadeColor(etapa.prioridade)} text-white text-xs`}
                    >
                      {etapa.prioridade}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-3">
                    {etapa.descricao}
                  </p>
                  {etapa.data_sugerida && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="h-4 w-4" />
                      <span>Sugerido para: {new Date(etapa.data_sugerida).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                className="shrink-0"
                onClick={() => {
                  if (etapa.acao_url) {
                    window.location.href = etapa.acao_url;
                  }
                }}
              >
                {etapa.acao_url ? 'Ir para' : 'Continuar'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};