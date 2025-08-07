import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank,
  CreditCard,
  BarChart3,
  Calendar,
  FileText,
  ArrowRightLeft
} from 'lucide-react';
import { useFinanceiro } from '@/hooks/useFinanceiro';
import LancamentosFinanceiros from './financeiro/LancamentosFinanceiros';
import ContasFinanceiras from './financeiro/ContasFinanceiras';
import CategoriasFinanceiras from './financeiro/CategoriasFinanceiras';
import RelatoriosFinanceiros from './financeiro/RelatoriosFinanceiros';
import TransferenciasFinanceiras from './financeiro/TransferenciasFinanceiras';
import GeradorRelatoriosPDF from './financeiro/GeradorRelatoriosPDF';

const FinanceiroManager = () => {
  const { estatisticas, loading } = useFinanceiro();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto mb-3 sm:mb-4"></div>
          <p className="text-mobile-sm text-muted-foreground">Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Cards de Estatísticas */}
      <div className="stats-grid-mobile">
        <Card className="card-mobile border-l-4 border-l-green-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-mobile-sm font-medium text-muted-foreground">Entradas do Mês</p>
                <p className="text-mobile-xl font-bold text-green-600">
                  {formatCurrency(estatisticas?.entradas_mes_atual || 0)}
                </p>
                {estatisticas && (
                  <Badge 
                    variant={estatisticas.crescimento_entradas >= 0 ? "default" : "destructive"}
                    className="mt-1 text-mobile-xs"
                  >
                    <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    {formatPercentage(estatisticas.crescimento_entradas)}
                  </Badge>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-green-50 rounded-full flex-shrink-0">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-mobile border-l-4 border-l-red-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-mobile-sm font-medium text-muted-foreground">Saídas do Mês</p>
                <p className="text-mobile-xl font-bold text-red-600">
                  {formatCurrency(estatisticas?.saidas_mes_atual || 0)}
                </p>
                {estatisticas && (
                  <Badge 
                    variant={estatisticas.crescimento_saidas <= 0 ? "default" : "destructive"}
                    className="mt-1 text-mobile-xs"
                  >
                    <TrendingDown className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    {formatPercentage(estatisticas.crescimento_saidas)}
                  </Badge>
                )}
              </div>
              <div className="p-2 sm:p-3 bg-red-50 rounded-full flex-shrink-0">
                <TrendingDown className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-mobile border-l-4 border-l-blue-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-mobile-sm font-medium text-muted-foreground">Saldo Atual</p>
                <p className={`text-mobile-xl font-bold ${
                  (estatisticas?.saldo_total || 0) >= 0 ? 'text-blue-600' : 'text-red-600'
                }`}>
                  {formatCurrency(estatisticas?.saldo_total || 0)}
                </p>
                <p className="text-mobile-xs text-muted-foreground">
                  {(estatisticas?.entradas_mes_atual || 0) - (estatisticas?.saidas_mes_atual || 0) >= 0 ? 'Superávit' : 'Déficit'} do mês
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-50 rounded-full flex-shrink-0">
                <PiggyBank className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-mobile border-l-4 border-l-amber-500">
          <CardContent className="p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-mobile-sm font-medium text-muted-foreground">Meta Mensal</p>
                <p className="text-mobile-xl font-bold text-amber-600">
                  {formatCurrency(50000)}
                </p>
                <p className="text-mobile-xs text-muted-foreground">
                  {((estatisticas?.entradas_mes_atual || 0) / 50000 * 100).toFixed(1)}% atingido
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-amber-50 rounded-full flex-shrink-0">
                <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Saldos das Contas */}
      {estatisticas?.contas_saldos && estatisticas.contas_saldos.length > 0 && (
        <Card className="card-mobile">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-mobile-lg">
              <CreditCard className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Saldos das Contas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {estatisticas.contas_saldos.map((conta, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-mobile-sm truncate">{conta.conta}</p>
                    <p className="text-mobile-xs text-muted-foreground capitalize">{conta.tipo}</p>
                  </div>
                  <p className={`font-bold text-mobile-sm ${
                    conta.saldo >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(conta.saldo)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categorias Mais Utilizadas */}
      {estatisticas?.categorias_mais_utilizadas && estatisticas.categorias_mais_utilizadas.length > 0 && (
        <Card className="card-mobile">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-mobile-lg">
              <BarChart3 className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Categorias Mais Utilizadas (Este Mês)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="space-y-2 sm:space-y-3">
              {estatisticas.categorias_mais_utilizadas.map((categoria, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                    <div 
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: categoria.cor }}
                    />
                    <span className="font-medium text-mobile-sm truncate">{categoria.categoria}</span>
                  </div>
                  <span className="font-bold text-mobile-sm">{formatCurrency(categoria.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs de Gestão */}
      <div className="tabs-mobile">
        <MobileTabs defaultValue="lancamentos" className="space-y-3 sm:space-y-4 md:space-y-6">
          <MobileTabsList maxTabsPerRow={3} className="grid-cols-2 sm:grid-cols-3 gap-1 p-1 bg-muted/30 rounded-xl">
            <MobileTabsTrigger value="lancamentos" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Lançamentos</span>
              <span className="sm:hidden text-[10px]">Lançamentos</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="contas" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Contas</span>
              <span className="sm:hidden text-[10px]">Contas</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="categorias" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Categorias</span>
              <span className="sm:hidden text-[10px]">Categorias</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="transferencias" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <ArrowRightLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Transferências</span>
              <span className="sm:hidden text-[10px]">Transferências</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="relatorios" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden text-[10px]">Relatórios</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="relatorios-pdf" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">PDF</span>
              <span className="sm:hidden text-[10px]">PDF</span>
            </MobileTabsTrigger>
          </MobileTabsList>

          <MobileTabsContent value="lancamentos">
            <LancamentosFinanceiros />
          </MobileTabsContent>

          <MobileTabsContent value="contas">
            <ContasFinanceiras />
          </MobileTabsContent>

          <MobileTabsContent value="categorias">
            <CategoriasFinanceiras />
          </MobileTabsContent>

          <MobileTabsContent value="transferencias">
            <TransferenciasFinanceiras />
          </MobileTabsContent>

          <MobileTabsContent value="relatorios">
            <RelatoriosFinanceiros />
          </MobileTabsContent>

          <MobileTabsContent value="relatorios-pdf">
            <GeradorRelatoriosPDF />
          </MobileTabsContent>
        </MobileTabs>
      </div>
    </div>
  );
};

export default FinanceiroManager;