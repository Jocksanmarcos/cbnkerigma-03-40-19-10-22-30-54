import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Target, TrendingUp, Users } from 'lucide-react';
import { useCampanhas } from '@/hooks/useCampanhas';
import { Skeleton } from '@/components/ui/skeleton';

interface CampanhasCarouselProps {
  onContribuir?: (campanhaId: string, titulo: string) => void;
}

const CampanhasCarousel = ({ onContribuir }: CampanhasCarouselProps) => {
  const { 
    campanhas, 
    isLoading, 
    calcularProgresso, 
    formatarValor, 
    isEncerrada, 
    diasRestantes 
  } = useCampanhas();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-playfair font-bold">Campanhas de Arrecadação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (campanhas.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Nenhuma campanha ativa</h3>
        <p className="text-muted-foreground">
          No momento não há campanhas de arrecadação ativas.
        </p>
      </div>
    );
  }

  const getTipoBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'obras': return 'default';
      case 'missoes': return 'secondary';
      case 'emergencia': return 'destructive';
      default: return 'outline';
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'obras': return 'Obras';
      case 'missoes': return 'Missões';
      case 'emergencia': return 'Emergência';
      default: return 'Geral';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-playfair font-bold mb-4">
          Campanhas de Arrecadação
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Participe de nossas campanhas especiais e ajude a fazer a diferença no Reino de Deus.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campanhas.map((campanha) => {
          const progresso = calcularProgresso(campanha.valor_atual, campanha.meta_valor);
          const encerrada = isEncerrada(campanha.data_fim);
          const dias = diasRestantes(campanha.data_fim);

          return (
            <Card key={campanha.id} className={encerrada ? 'opacity-75' : ''}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl font-playfair line-clamp-2">
                    {campanha.titulo}
                  </CardTitle>
                  <Badge variant={getTipoBadgeVariant(campanha.tipo)}>
                    {getTipoLabel(campanha.tipo)}
                  </Badge>
                </div>
                {campanha.descricao && (
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {campanha.descricao}
                  </p>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Progresso */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Arrecadado: {formatarValor(campanha.valor_atual)}</span>
                    <span>Meta: {formatarValor(campanha.meta_valor)}</span>
                  </div>
                  <Progress value={progresso} className="h-3" />
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {progresso.toFixed(1)}% da meta alcançada
                  </p>
                </div>

                {/* Informações */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {encerrada ? 'Encerrada' : `${dias} dias`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {progresso >= 100 ? 'Concluída' : 'Em andamento'}
                    </span>
                  </div>
                </div>

                {/* Botão de contribuição */}
                <Button
                  onClick={() => onContribuir?.(campanha.id, campanha.titulo)}
                  disabled={encerrada}
                  className="w-full"
                  variant={encerrada ? 'outline' : 'default'}
                >
                  {encerrada ? (
                    'Campanha Encerrada'
                  ) : (
                    <>
                      <Users className="w-4 h-4 mr-2" />
                      Contribuir
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default CampanhasCarousel;