import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Target
} from "lucide-react";

interface Celula {
  id: string;
  nome: string;
  lider: string;
  endereco: string;
  bairro: string;
  dia_semana: string;
  horario: string;
  descricao: string;
  telefone: string;
  latitude: number;
  longitude: number;
  membros_atual: number;
  membros_maximo: number;
  ativa: boolean;
  rede_ministerio?: string;
  coordenador?: string;
  supervisor?: string;
  lider_em_treinamento?: string;
  anfitriao?: string;
  data_inicio?: string;
  status_celula?: string;
  observacoes?: string;
}

interface CelulasDashboardProps {
  celulas: Celula[];
}

export const CelulasDashboard = ({ celulas }: CelulasDashboardProps) => {
  const celulasAtivas = celulas.filter(c => c.ativa && c.status_celula === 'ativa');
  const totalMembros = celulas.reduce((acc, c) => acc + (c.membros_atual || 0), 0);
  const totalLideres = celulas.filter(c => c.lider).length;
  const lideresEmTreinamento = celulas.filter(c => c.lider_em_treinamento).length;
  const mediaPresenca = celulas.length > 0 ? 
    (celulas.reduce((acc, c) => acc + ((c.membros_atual || 0) / (c.membros_maximo || 1)), 0) / celulas.length * 100) : 0;

  // Células por rede/ministério
  const celulasPorRede = celulas.reduce((acc, c) => {
    const rede = c.rede_ministerio || 'Sem Rede';
    acc[rede] = (acc[rede] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Células por status
  const celulasPorStatus = celulas.reduce((acc, c) => {
    const status = c.status_celula || 'ativa';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Células que precisam de multiplicação (próximas da capacidade máxima)
  const celulasParaMultiplicar = celulas.filter(c => 
    c.membros_atual && c.membros_maximo && 
    (c.membros_atual / c.membros_maximo) >= 0.8
  );

  return (
    <div className="space-y-6">
      {/* Indicadores Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Células Ativas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{celulasAtivas.length}</div>
            <p className="text-xs text-muted-foreground">
              de {celulas.length} cadastradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Membros</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembros}</div>
            <p className="text-xs text-muted-foreground">
              em células ativas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Líderes</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLideres}</div>
            <p className="text-xs text-muted-foreground">
              {lideresEmTreinamento} em treinamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Ocupação</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mediaPresenca.toFixed(1)}%</div>
            <Progress value={mediaPresenca} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Análises Detalhadas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Células por Rede/Ministério */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Células por Rede/Ministério
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(celulasPorRede).map(([rede, quantidade]) => (
                <div key={rede} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{rede}</span>
                  <Badge variant="secondary">{quantidade}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Status das Células */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Status das Células
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(celulasPorStatus).map(([status, quantidade]) => {
                const statusColors = {
                  'ativa': 'bg-green-100 text-green-800',
                  'em_pausa': 'bg-yellow-100 text-yellow-800',
                  'multiplicada': 'bg-blue-100 text-blue-800',
                  'encerrada': 'bg-red-100 text-red-800'
                };
                
                const statusLabels = {
                  'ativa': 'Ativa',
                  'em_pausa': 'Em Pausa',
                  'multiplicada': 'Multiplicada',
                  'encerrada': 'Encerrada'
                };

                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      {statusLabels[status as keyof typeof statusLabels] || status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded ${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
                      {quantidade}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Ações Necessárias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Células para Multiplicação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Células Próximas da Capacidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            {celulasParaMultiplicar.length > 0 ? (
              <div className="space-y-3">
                {celulasParaMultiplicar.map((celula) => (
                  <div key={celula.id} className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{celula.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Líder: {celula.lider}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">
                        {celula.membros_atual}/{celula.membros_maximo}
                      </p>
                      <p className="text-xs text-yellow-700">
                        {((celula.membros_atual / celula.membros_maximo) * 100).toFixed(0)}% ocupação
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma célula próxima da capacidade máxima
              </p>
            )}
          </CardContent>
        </Card>

        {/* Crescimento Recente */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Indicadores de Crescimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Células com maior frequência</span>
                <Badge variant="outline">
                  {celulas.filter(c => c.membros_atual && c.membros_atual > 0).length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Líderes em treinamento</span>
                <Badge variant="outline">
                  {lideresEmTreinamento}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm">Células por multiplicar</span>
                <Badge variant="outline">
                  {celulasParaMultiplicar.length}
                </Badge>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  Média de ocupação geral: {mediaPresenca.toFixed(1)}%
                </p>
                <Progress value={mediaPresenca} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Células Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Células Cadastradas Recentemente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {celulas
              .filter(c => c.data_inicio)
              .sort((a, b) => new Date(b.data_inicio!).getTime() - new Date(a.data_inicio!).getTime())
              .slice(0, 5)
              .map((celula) => (
                <div key={celula.id} className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{celula.nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {celula.rede_ministerio} • {celula.lider}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {new Date(celula.data_inicio!).toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-blue-700">
                      {celula.bairro}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};