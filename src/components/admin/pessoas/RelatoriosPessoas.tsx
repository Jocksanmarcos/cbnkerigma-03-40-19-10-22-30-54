import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar,
  ChartPie,
  Download,
  RefreshCw
} from 'lucide-react';
import { useRelatoriosPessoas } from '@/hooks/useRelatoriosPessoas';
import { ExportarDados } from './ExportarDados';
import { usePessoas } from '@/hooks/usePessoas';
import { Skeleton } from '@/components/ui/skeleton';

export const RelatoriosPessoas = () => {
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const { dados, loading, gerarRelatorios } = useRelatoriosPessoas(dataInicio, dataFim);
  const { pessoas } = usePessoas();

  const estatisticasCards = [
    {
      titulo: 'Total de Membros',
      valor: dados?.totalPorCategoria.membro || 0,
      icone: Users,
      cor: 'text-blue-600',
      fundo: 'bg-blue-50'
    },
    {
      titulo: 'Visitantes',
      valor: dados?.totalPorCategoria.visitante || 0,
      icone: UserCheck,
      cor: 'text-green-600',
      fundo: 'bg-green-50'
    },
    {
      titulo: 'Batizados no Período',
      valor: dados?.batizadosNoPeriodo || 0,
      icone: Calendar,
      cor: 'text-purple-600',
      fundo: 'bg-purple-50'
    },
    {
      titulo: 'Discipulado Concluído',
      valor: dados?.discipuladoConcluido || 0,
      icone: UserCheck,
      cor: 'text-emerald-600',
      fundo: 'bg-emerald-50'
    },
    {
      titulo: 'Sem Célula',
      valor: dados?.pessoasSemCelula || 0,
      icone: UserX,
      cor: 'text-orange-600',
      fundo: 'bg-orange-50'
    },
    {
      titulo: 'Sem Discipulado',
      valor: dados?.pessoasSemDiscipulado || 0,
      icone: UserX,
      cor: 'text-red-600',
      fundo: 'bg-red-50'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6 px-4 md:px-0 max-w-full overflow-hidden">
      {/* Filtros de Data */}
      <Card className="w-full">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            <span>Filtros do Relatório</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Defina um período específico para os relatórios (opcional)
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="w-full">
                <Label htmlFor="dataInicio" className="text-sm">Data Início</Label>
                <Input
                  id="dataInicio"
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="w-full">
                <Label htmlFor="dataFim" className="text-sm">Data Fim</Label>
                <Input
                  id="dataFim"
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-start">
              <Button 
                onClick={gerarRelatorios} 
                variant="outline" 
                size="sm"
                className="w-full sm:w-auto text-xs md:text-sm px-3 py-2 h-9 flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-3 w-3 md:h-4 md:w-4" />
                <span>Atualizar</span>
              </Button>
              <div className="w-full sm:w-auto">
                <ExportarDados 
                  pessoas={pessoas} 
                  filtroAtivo={dataInicio || dataFim ? `${dataInicio}_${dataFim}` : undefined}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 w-full">
        {estatisticasCards.map((card, index) => {
          const Icon = card.icone;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow w-full">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs md:text-sm font-medium text-muted-foreground mb-1 truncate">
                      {card.titulo}
                    </p>
                    <p className="text-xl md:text-3xl font-bold truncate">
                      {card.valor.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className={`p-2 md:p-3 rounded-xl ${card.fundo} flex-shrink-0 ml-2`}>
                    <Icon className={`h-4 w-4 md:h-6 md:w-6 ${card.cor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Crescimento Mensal */}
      <Card className="w-full">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
            <span>Crescimento Mensal</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Evolução do número de pessoas nos últimos 12 meses
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4 w-full">
            {dados?.crescimentoMensal.map((mes, index) => (
              <div key={index} className="text-center p-2 md:p-3 bg-muted/50 rounded-lg w-full">
                <p className="text-xs md:text-sm font-medium text-muted-foreground truncate">{mes.mes}</p>
                <p className="text-lg md:text-2xl font-bold">{mes.total}</p>
                <Badge variant={mes.crescimento > 0 ? "default" : "secondary"} className="text-xs">
                  +{mes.crescimento}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Distribuição por Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 w-full">
        <Card className="w-full">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <ChartPie className="h-4 w-4 md:h-5 md:w-5" />
              <span>Por Categoria</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-3 w-full">
              {Object.entries(dados?.totalPorCategoria || {}).map(([categoria, total]) => (
                <div key={categoria} className="flex items-center justify-between w-full">
                  <span className="capitalize text-xs md:text-sm font-medium truncate min-w-0 flex-1">{categoria}</span>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <div className="w-16 md:w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ 
                          width: `${(total / Math.max(...Object.values(dados?.totalPorCategoria || {}))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs md:text-sm font-bold w-6 md:w-8 text-right">{total}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="w-full">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              <span>Por Faixa Etária</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 md:px-6">
            <div className="space-y-3 w-full">
              {Object.entries(dados?.distribuicaoIdade || {}).map(([faixa, total]) => (
                <div key={faixa} className="flex items-center justify-between w-full">
                  <span className="text-xs md:text-sm font-medium truncate min-w-0 flex-1">{faixa}</span>
                  <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                    <div className="w-16 md:w-24 bg-muted rounded-full h-2">
                      <div 
                        className="bg-secondary h-2 rounded-full" 
                        style={{ 
                          width: `${(total / Math.max(...Object.values(dados?.distribuicaoIdade || {}))) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs md:text-sm font-bold w-6 md:w-8 text-right">{total}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estado Espiritual */}
      <Card className="w-full">
        <CardHeader className="px-4 md:px-6">
          <CardTitle className="flex items-center space-x-2 text-lg md:text-xl">
            <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
            <span>Estado Espiritual</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Distribuição das pessoas por estado espiritual
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 w-full">
            {Object.entries(dados?.estatusEspiritual || {}).map(([status, total]) => (
              <div key={status} className="text-center p-3 md:p-4 bg-muted/50 rounded-lg w-full">
                <p className="text-xs md:text-sm font-medium text-muted-foreground capitalize truncate">
                  {status.replace(/_/g, ' ')}
                </p>
                <p className="text-xl md:text-2xl font-bold">{total}</p>
                <p className="text-xs text-muted-foreground">
                  {((total / (pessoas?.length || 1)) * 100).toFixed(1)}%
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};