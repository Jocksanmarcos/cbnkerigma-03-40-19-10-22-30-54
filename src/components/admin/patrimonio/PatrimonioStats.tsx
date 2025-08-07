import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Package, DollarSign, AlertTriangle } from 'lucide-react';

interface PatrimonioStatsProps {
  estatisticas: {
    total_patrimonios: number;
    valor_total: number;
    em_uso: number;
    em_manutencao: number;
    emprestados: number;
    patrimonio_por_categoria: Record<string, number>;
    patrimonio_por_estado: Record<string, number>;
  };
}

export const PatrimonioStats = ({ estatisticas }: PatrimonioStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Patrimônios</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{estatisticas.total_patrimonios}</div>
          <p className="text-xs text-muted-foreground">
            Valor total: R$ {estatisticas.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{estatisticas.em_uso}</div>
          <p className="text-xs text-muted-foreground">
            {((estatisticas.em_uso / estatisticas.total_patrimonios) * 100 || 0).toFixed(1)}% do total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Emprestados</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{estatisticas.emprestados}</div>
          <p className="text-xs text-muted-foreground">
            Patrimônios em empréstimo
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
          <AlertTriangle className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{estatisticas.em_manutencao}</div>
          <p className="text-xs text-muted-foreground">
            Necessitam atenção
          </p>
        </CardContent>
      </Card>
    </div>
  );
};