import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AlertTriangle, TrendingUp } from 'lucide-react';

interface PatrimonioChartsProps {
  estatisticas: any;
  patrimonios: any[];
}

export const PatrimonioCharts = ({ estatisticas, patrimonios }: PatrimonioChartsProps) => {
  // Cores para os gráficos
  const CATEGORIA_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];
  
  const ESTADO_COLORS = {
    novo: '#10b981',      // green-500
    bom: '#3b82f6',       // blue-500
    usado: '#f59e0b',     // yellow-500
    danificado: '#f97316', // orange-500
    inservivel: '#ef4444'  // red-500
  };

  // Preparar dados para gráfico de categorias
  const dadosCategoria = Object.entries(estatisticas.patrimonio_por_categoria || {}).map(([categoria, quantidade]) => ({
    name: categoria,
    value: quantidade,
    percentage: ((quantidade as number / estatisticas.total_patrimonios) * 100).toFixed(1)
  }));

  // Preparar dados para gráfico de estados
  const dadosEstado = Object.entries(estatisticas.patrimonio_por_estado || {}).map(([estado, quantidade]) => ({
    name: estado.replace('_', ' '),
    value: quantidade,
    fill: ESTADO_COLORS[estado as keyof typeof ESTADO_COLORS] || '#6b7280',
    percentage: ((quantidade as number / estatisticas.total_patrimonios) * 100).toFixed(1)
  }));

  // Identificar alertas críticos
  const patrimoniosCriticos = patrimonios.filter(p => 
    p.estado_conservacao === 'danificado' || 
    p.estado_conservacao === 'inservivel' ||
    p.status === 'em_manutencao'
  );

  const patrimoniosVencimento = patrimonios.filter(p => {
    if (!p.data_garantia) return false;
    const hoje = new Date();
    const garantia = new Date(p.data_garantia);
    const diasRestantes = Math.ceil((garantia.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes > 0;
  });

  // Custom tooltip para os gráficos
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-primary">
            Quantidade: {payload[0].value}
          </p>
          <p className="text-muted-foreground text-sm">
            {payload[0].payload.percentage}% do total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {(patrimoniosCriticos.length > 0 || patrimoniosVencimento.length > 0) && (
        <div className="space-y-3">
          {patrimoniosCriticos.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <strong>{patrimoniosCriticos.length} patrimônio(s)</strong> precisam de atenção urgente 
                (danificados, inservíveis ou em manutenção).
              </AlertDescription>
            </Alert>
          )}
          
          {patrimoniosVencimento.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>{patrimoniosVencimento.length} patrimônio(s)</strong> com garantia vencendo em até 30 dias.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Categorias */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Patrimônio por Categoria
              <Badge variant="secondary">{estatisticas.total_patrimonios} total</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosCategoria.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dadosCategoria}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dadosCategoria.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORIA_COLORS[index % CATEGORIA_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Estado de Conservação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Estado de Conservação
              <div className="flex gap-1">
                {patrimoniosCriticos.length > 0 && (
                  <Badge variant="destructive">{patrimoniosCriticos.length} críticos</Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosEstado.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosEstado} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {dadosEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resumo dos Estados Críticos */}
      {patrimoniosCriticos.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Patrimônios que Precisam de Atenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {patrimoniosCriticos.slice(0, 6).map((patrimonio) => (
                <div key={patrimonio.id} className="p-3 border rounded-lg bg-orange-50">
                  <div className="font-medium text-sm">{patrimonio.nome}</div>
                  <div className="text-xs text-muted-foreground">{patrimonio.codigo_patrimonio}</div>
                  <Badge 
                    variant={patrimonio.estado_conservacao === 'inservivel' ? 'destructive' : 'secondary'}
                    className="mt-1 text-xs"
                  >
                    {patrimonio.estado_conservacao || patrimonio.status}
                  </Badge>
                </div>
              ))}
              {patrimoniosCriticos.length > 6 && (
                <div className="p-3 border-2 border-dashed border-orange-300 rounded-lg bg-orange-50 flex items-center justify-center">
                  <span className="text-orange-700 font-medium">
                    +{patrimoniosCriticos.length - 6} outros
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};