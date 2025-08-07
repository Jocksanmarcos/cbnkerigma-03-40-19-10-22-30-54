import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinanceiroCompleto } from '@/hooks/useFinanceiroCompleto';
import { FileText, Download, Calendar, BarChart3, PieChart, TrendingUp } from 'lucide-react';

const RelatoriosFinanceiros = () => {
  const { categorias, estatisticas, exportarRelatorio } = useFinanceiroCompleto();
  const [tipoRelatorio, setTipoRelatorio] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const tiposRelatorios = [
    { value: 'resumo_mensal', label: 'Resumo Financeiro Mensal' },
    { value: 'entradas_saidas', label: 'Relatório de Entradas e Saídas' },
    { value: 'por_categoria', label: 'Relatório por Categoria' },
    { value: 'fluxo_caixa', label: 'Fluxo de Caixa' },
    { value: 'dizimos_ofertas', label: 'Relatório de Dízimos e Ofertas' },
    { value: 'comparativo', label: 'Comparativo Mensal' }
  ];

  const gerarRelatorio = async () => {
    const filtros = {
      tipo: tipoRelatorio,
      dataInicio,
      dataFim,
      categoria: categoriaFiltro
    };
    
    await exportarRelatorio('csv', filtros);
  };

  return (
    <div className="space-y-6">
      {/* Resumo Financeiro Atual */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Entradas do Mês</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(estatisticas?.entradas_mes_atual || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(estatisticas?.crescimento_entradas || 0)} vs mês anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-red-600 rotate-180" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saídas do Mês</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(estatisticas?.saidas_mes_atual || 0)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatPercentage(estatisticas?.crescimento_saidas || 0)} vs mês anterior
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo do Mês</p>
                <p className={`text-2xl font-bold ${
                  (estatisticas?.saldo_mes_atual || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatCurrency(estatisticas?.saldo_mes_atual || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <PieChart className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Saldo Total</p>
                <p className={`text-2xl font-bold ${
                  (estatisticas?.saldo_total || 0) >= 0 ? 'text-purple-600' : 'text-red-600'
                }`}>
                  {formatCurrency(estatisticas?.saldo_total || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gerador de Relatórios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Gerador de Relatórios
          </CardTitle>
          <CardDescription>
            Configure e gere relatórios financeiros personalizados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div>
              <Label htmlFor="tipo-relatorio">Tipo de Relatório</Label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {tiposRelatorios.map((tipo) => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="data-inicio">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="data-fim">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="categoria-filtro">Categoria (Opcional)</Label>
              <Select value={categoriaFiltro} onValueChange={setCategoriaFiltro}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={gerarRelatorio}
                disabled={!tipoRelatorio}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Gerar Relatório
              </Button>
            </div>
          </div>

          {/* Preview dos Dados */}
          {estatisticas && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <h3 className="font-medium mb-4">Preview dos Dados Atuais</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Resumo Financeiro</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total de Entradas:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(estatisticas.total_entradas)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total de Saídas:</span>
                      <span className="font-medium text-red-600">
                        {formatCurrency(estatisticas.total_saidas)}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="font-medium">Saldo Total:</span>
                      <span className={`font-bold ${
                        estatisticas.saldo_total >= 0 ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(estatisticas.saldo_total)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Categorias Mais Utilizadas</h4>
                  <div className="space-y-2 text-sm">
                    {estatisticas.categorias_mais_utilizadas.slice(0, 5).map((categoria, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: categoria.cor }}
                          />
                          <span>{categoria.categoria}</span>
                        </div>
                        <span className="font-medium">
                          {formatCurrency(categoria.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Relatórios Rápidos */}
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Rápidos</CardTitle>
          <CardDescription>
            Acesse relatórios pré-configurados com um clique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>Relatório Mensal</span>
              <span className="text-xs text-muted-foreground">Este mês</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Fluxo de Caixa</span>
              <span className="text-xs text-muted-foreground">Últimos 3 meses</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <PieChart className="h-6 w-6 mb-2" />
              <span>Por Categoria</span>
              <span className="text-xs text-muted-foreground">Este mês</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Dízimos e Ofertas</span>
              <span className="text-xs text-muted-foreground">Este ano</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Comparativo</span>
              <span className="text-xs text-muted-foreground">Ano anterior</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              <span>Exportar Tudo</span>
              <span className="text-xs text-muted-foreground">CSV/Excel</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RelatoriosFinanceiros;