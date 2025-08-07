import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Download, 
  Calendar,
  BarChart3,
  Filter,
  Loader2
} from 'lucide-react';
import { useRelatoriosPDF, FiltrosRelatorio } from '@/hooks/useRelatoriosPDF';
import { useFinanceiroCompleto } from '@/hooks/useFinanceiroCompleto';

const GeradorRelatoriosPDF = () => {
  const { 
    gerandoPDF, 
    gerarRelatorioCompleto, 
    gerarRelatorioCategorias 
  } = useRelatoriosPDF();
  
  const { categorias, contas } = useFinanceiroCompleto();
  
  const [filtros, setFiltros] = useState<FiltrosRelatorio>({
    dataInicio: '',
    dataFim: '',
    categoria: 'todas',
    tipo: 'todos',
    conta: 'todas'
  });

  const handleGerarRelatorioCompleto = () => {
    gerarRelatorioCompleto(filtros);
  };

  const handleGerarRelatorioCategorias = () => {
    gerarRelatorioCategorias(filtros);
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      categoria: 'todas',
      tipo: 'todos',
      conta: 'todas'
    });
  };

  const hoje = new Date().toISOString().split('T')[0];
  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    .toISOString().split('T')[0];

  const definirPeriodoMesAtual = () => {
    setFiltros(prev => ({
      ...prev,
      dataInicio: inicioMes,
      dataFim: hoje
    }));
  };

  const definirPeriodoUltimos30Dias = () => {
    const inicio = new Date();
    inicio.setDate(inicio.getDate() - 30);
    setFiltros(prev => ({
      ...prev,
      dataInicio: inicio.toISOString().split('T')[0],
      dataFim: hoje
    }));
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-mobile-lg">
            <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Gerador de Relatórios PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          {/* Filtros */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
              <Filter className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Filtros do Relatório
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <Label htmlFor="data-inicio">Data Início</Label>
                <Input
                  id="data-inicio"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="data-fim">Data Fim</Label>
                <Input
                  id="data-fim"
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                />
              </div>
              
              <div>
                <Label>Tipo de Lançamento</Label>
                <Select 
                  value={filtros.tipo} 
                  onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os tipos</SelectItem>
                    <SelectItem value="entrada">Entradas</SelectItem>
                    <SelectItem value="saida">Saídas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Categoria</Label>
                <Select 
                  value={filtros.categoria} 
                  onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}
                >
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
              
              <div>
                <Label>Conta</Label>
                <Select 
                  value={filtros.conta} 
                  onValueChange={(value) => setFiltros(prev => ({ ...prev, conta: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as contas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas as contas</SelectItem>
                    {contas.map((conta) => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Botões de período rápido */}
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={definirPeriodoMesAtual}
                className="flex items-center button-mobile"
              >
                <Calendar className="mr-1 h-3 w-3" />
                Mês Atual
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={definirPeriodoUltimos30Dias}
                className="flex items-center button-mobile"
              >
                <Calendar className="mr-1 h-3 w-3" />
                Últimos 30 dias
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={limparFiltros}
                className="button-mobile"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Tipos de Relatório */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              Tipos de Relatório Disponíveis
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Relatório Completo */}
              <Card className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg self-start">
                    <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Relatório Financeiro Completo</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Relatório detalhado com todos os lançamentos, resumo financeiro e 
                      análise completa do período selecionado.
                    </p>
                    <Button 
                      onClick={handleGerarRelatorioCompleto}
                      disabled={gerandoPDF}
                      className="w-full text-xs sm:text-sm"
                      size="sm"
                    >
                      {gerandoPDF ? (
                        <>
                          <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          <span className="hidden sm:inline">Gerando...</span>
                          <span className="sm:hidden">Gerando</span>
                        </>
                      ) : (
                        <>
                          <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Gerar Relatório Completo</span>
                          <span className="sm:hidden">Gerar Completo</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
              
              {/* Relatório por Categorias */}
              <Card className="p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="p-2 bg-secondary/10 rounded-lg self-start">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-2 text-sm sm:text-base">Relatório por Categorias</h4>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      Análise agrupada por categorias financeiras, mostrando entradas, 
                      saídas e saldo de cada categoria.
                    </p>
                    <Button 
                      onClick={handleGerarRelatorioCategorias}
                      disabled={gerandoPDF}
                      variant="secondary"
                      className="w-full text-xs sm:text-sm"
                      size="sm"
                    >
                      {gerandoPDF ? (
                        <>
                          <Loader2 className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                          <span className="hidden sm:inline">Gerando...</span>
                          <span className="sm:hidden">Gerando</span>
                        </>
                      ) : (
                        <>
                          <Download className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Gerar por Categorias</span>
                          <span className="sm:hidden">Gerar Categorias</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Informações adicionais */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📋 Informações dos Relatórios</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Os relatórios são gerados em formato PDF para fácil compartilhamento</li>
              <li>• Incluem logotipo e identidade visual da CBN Kerigma</li>
              <li>• Dados filtrados conforme os critérios selecionados</li>
              <li>• Formatação profissional com resumos e totalizações</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeradorRelatoriosPDF;