import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download,
  Calendar,
  PieChart,
  Receipt
} from 'lucide-react';

import Footer from '@/components/layout/Footer';
import { useRelatoriosFinanceiros } from '@/hooks/useRelatoriosFinanceiros';
import { Skeleton } from '@/components/ui/skeleton';

const RelatoriosFinanceiros = () => {
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());
  const { estatisticas, isLoading, fetchRelatorios, exportarRelatorio } = useRelatoriosFinanceiros();

  const handleAnoChange = (ano: string) => {
    const anoNum = parseInt(ano);
    setAnoSelecionado(anoNum);
    fetchRelatorios(anoNum);
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const formatarPercentual = (valor: number) => {
    return `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
  };

  const anos = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-background">
      

      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Relatórios Financeiros
          </h1>
          <p className="text-xl opacity-90">
            Transparência e prestação de contas dos recursos recebidos
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Controles */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-playfair font-bold">Relatório Anual</h2>
            <p className="text-muted-foreground">
              Acompanhe o uso transparente dos recursos da igreja
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Select value={anoSelecionado.toString()} onValueChange={handleAnoChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {anos.map(ano => (
                  <SelectItem key={ano} value={ano.toString()}>
                    {ano}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportarRelatorio('pdf')}
              >
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => exportarRelatorio('excel')}
              >
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-8 w-full mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : estatisticas ? (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Total Arrecadado
                      </p>
                      <p className="text-2xl font-bold">
                        {formatarValor(estatisticas.totalArrecadado)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Contribuições
                      </p>
                      <p className="text-2xl font-bold">
                        {estatisticas.totalContribuicoes}
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Média Mensal
                      </p>
                      <p className="text-2xl font-bold">
                        {formatarValor(estatisticas.mediaMensal)}
                      </p>
                    </div>
                    <BarChart className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Crescimento
                      </p>
                      <p className="text-2xl font-bold flex items-center">
                        {estatisticas.crescimentoMensal >= 0 ? (
                          <TrendingUp className="w-5 h-5 text-green-600 mr-1" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-600 mr-1" />
                        )}
                        {formatarPercentual(estatisticas.crescimentoMensal)}
                      </p>
                    </div>
                    <Calendar className="w-8 h-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Distribuição por Tipo */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Distribuição por Tipo</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {estatisticas.distribuicaoPorTipo.map((item) => (
                    <div key={item.tipo} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{item.tipo}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            {formatarValor(item.total)}
                          </span>
                          <Badge variant="outline">
                            {item.percentual.toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <Progress value={item.percentual} className="h-2" />
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Resumo Mensal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart className="w-5 h-5" />
                    <span>Resumo Mensal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {estatisticas.relatóriosMensais.map((relatorio) => (
                      <div key={`${relatorio.ano}-${relatorio.mes}`} 
                           className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold capitalize">
                            {relatorio.mes} {relatorio.ano}
                          </h4>
                          <Badge>
                            {formatarValor(relatorio.total_geral)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                          <div>Dízimos: {formatarValor(relatorio.total_dizimos)}</div>
                          <div>Ofertas: {formatarValor(relatorio.total_ofertas)}</div>
                          <div>Missões: {formatarValor(relatorio.total_missoes)}</div>
                          <div>Obras: {formatarValor(relatorio.total_obras)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Informações de Transparência */}
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-playfair font-bold mb-4 text-primary">
                    Compromisso com a Transparência
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                    <div>
                      <h4 className="font-semibold mb-2">Prestação de Contas</h4>
                      <p className="text-muted-foreground">
                        Relatórios financeiros atualizados mensalmente e disponíveis para toda a congregação.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Auditoria Independente</h4>
                      <p className="text-muted-foreground">
                        Nossas contas são auditadas anualmente por empresa contábil independente.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Aplicação dos Recursos</h4>
                      <p className="text-muted-foreground">
                        100% dos recursos são aplicados na obra de Deus: evangelização, ação social e manutenção.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12">
            <BarChart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dado encontrado</h3>
            <p className="text-muted-foreground">
              Não há dados financeiros para o ano selecionado.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default RelatoriosFinanceiros;