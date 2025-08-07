import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Church, MapPin, Eye, ExternalLink } from 'lucide-react';

interface Igreja {
  id: string;
  nome: string;
  tipo: string;
  cidade: string;
  estado: string;
  pastor_responsavel: string;
  ativa: boolean;
}

interface EstatisticasMissao {
  igreja_id: string;
  igreja_nome: string;
  total_membros: number;
  total_visitantes: number;
  total_celulas: number;
  total_receitas: number;
  total_despesas: number;
  saldo_atual: number;
  ultima_atualizacao: string;
}

interface MissoesResumoProps {
  missoesAtivas: Igreja[];
  estatisticas: EstatisticasMissao[];
  formatarValor: (valor: number) => string;
  onVerDetalhes: (igrejId: string) => void;
}

export const MissoesResumo = ({ 
  missoesAtivas, 
  estatisticas, 
  formatarValor,
  onVerDetalhes 
}: MissoesResumoProps) => {
  return (
    <div className="space-y-4">
      {missoesAtivas.map((igreja) => {
        const stats = estatisticas.find(e => e.igreja_id === igreja.id);
        if (!stats) return null;

        return (
          <Card key={igreja.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Church className="h-5 w-5 text-primary" />
                    {igreja.nome}
                  </CardTitle>
                  <CardDescription className="flex items-start sm:items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 mt-0.5 sm:mt-0 flex-shrink-0" />
                    <span>
                      {igreja.cidade}, {igreja.estado} • Pastor: {igreja.pastor_responsavel}
                    </span>
                  </CardDescription>
                </div>
                <Badge variant="outline" className="w-fit">
                  Ativa
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.total_membros}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Membros
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-orange-600">
                    {stats.total_visitantes}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Visitantes
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600">
                    {stats.total_celulas}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Células
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-xl font-bold text-green-600">
                    {formatarValor(stats.total_receitas)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Receitas
                  </div>
                </div>
                <div className="text-center">
                  <div className={`text-lg sm:text-xl font-bold ${
                    stats.saldo_atual >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatarValor(stats.saldo_atual)}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Saldo
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onVerDetalhes(igreja.id)}
                  className="w-full sm:w-auto"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                  <ExternalLink className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};