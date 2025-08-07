import { useState } from 'react';
import jsPDF from 'jspdf';
import { useFinanceiroCompleto } from './useFinanceiroCompleto';
import { toast } from '@/hooks/use-toast';

export interface FiltrosRelatorio {
  dataInicio: string;
  dataFim: string;
  categoria: string;
  tipo: string;
  conta: string;
}

export interface DadosRelatorio {
  titulo: string;
  periodo: string;
  totalEntradas: number;
  totalSaidas: number;
  saldo: number;
  lancamentos: any[];
  categorias: any[];
  contas: any[];
}

export const useRelatoriosPDF = () => {
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const { 
    lancamentos, 
    categorias, 
    contas,
    estatisticas 
  } = useFinanceiroCompleto();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const addLogoToPDF = (pdf: jsPDF, x: number, y: number, width: number, height: number) => {
    // Logo da CBN Kerigma
    pdf.setFillColor(255, 165, 0); // Cor laranja do logo
    pdf.circle(x + width/2, y + height/2, Math.min(width, height)/2, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CBN', x + width/2, y + height/2, { align: 'center' });
    pdf.setTextColor(0, 0, 0);
  };

  const adicionarCabecalho = (pdf: jsPDF, titulo: string, periodo: string) => {
    // Logo
    addLogoToPDF(pdf, 20, 10, 20, 20);
    
    // Título principal
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 140, 0);
    pdf.text(titulo, 105, 20, { align: 'center' });
    
    // Subtítulo
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Comunidade Batista Nacional Kerigma', 105, 28, { align: 'center' });
    pdf.text('Relatório Financeiro', 105, 35, { align: 'center' });
    
    // Período
    if (periodo) {
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Período: ${periodo}`, 105, 42, { align: 'center' });
    }
    
    // Linha separadora
    pdf.setDrawColor(255, 140, 0);
    pdf.setLineWidth(1);
    pdf.line(20, 48, 190, 48);
    pdf.setDrawColor(0, 0, 0);
    
    return 55; // Retorna a posição Y onde o conteúdo deve começar
  };

  const adicionarResumo = (pdf: jsPDF, yPos: number, dados: DadosRelatorio) => {
    // Cabeçalho do resumo
    pdf.setFillColor(255, 140, 0);
    pdf.rect(20, yPos, 170, 8, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('RESUMO FINANCEIRO', 22, yPos + 6);
    pdf.setTextColor(0, 0, 0);
    
    yPos += 15;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    // Dados do resumo
    pdf.text(`Total de Entradas: ${formatCurrency(dados.totalEntradas)}`, 20, yPos);
    yPos += 7;
    pdf.text(`Total de Saídas: ${formatCurrency(dados.totalSaidas)}`, 20, yPos);
    yPos += 7;
    
    // Saldo com cor
    const saldo = dados.totalEntradas - dados.totalSaidas;
    pdf.setTextColor(saldo >= 0 ? 0 : 255, saldo >= 0 ? 150 : 0, 0);
    pdf.setFont('helvetica', 'bold');
    pdf.text(`Saldo do Período: ${formatCurrency(saldo)}`, 20, yPos);
    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');
    
    return yPos + 15;
  };

  const adicionarTabelaLancamentos = (pdf: jsPDF, yPos: number, lancamentos: any[]) => {
    if (lancamentos.length === 0) {
      pdf.text('Nenhum lançamento encontrado no período.', 20, yPos);
      return yPos + 10;
    }

    // Cabeçalho da tabela
    pdf.setFillColor(255, 140, 0);
    pdf.rect(20, yPos, 170, 8, 'F');
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(255, 255, 255);
    pdf.text('LANÇAMENTOS', 22, yPos + 6);
    pdf.setTextColor(0, 0, 0);
    
    yPos += 15;
    
    // Cabeçalho das colunas
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Data', 20, yPos);
    pdf.text('Descrição', 40, yPos);
    pdf.text('Categoria', 100, yPos);
    pdf.text('Tipo', 140, yPos);
    pdf.text('Valor', 165, yPos);
    
    yPos += 5;
    pdf.line(20, yPos, 190, yPos);
    yPos += 5;
    
    // Dados da tabela
    pdf.setFont('helvetica', 'normal');
    lancamentos.forEach((lancamento) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      
      pdf.text(formatDate(lancamento.data_lancamento), 20, yPos);
      
      // Truncar descrição se muito longa
      const descricao = lancamento.descricao.length > 25 
        ? lancamento.descricao.substring(0, 25) + '...' 
        : lancamento.descricao;
      pdf.text(descricao, 40, yPos);
      
      // Categoria
      const categoria = categorias.find(c => c.id === lancamento.categoria_id);
      pdf.text(categoria?.nome || 'N/A', 100, yPos);
      
      // Tipo
      pdf.text(lancamento.tipo === 'entrada' ? 'Entrada' : 'Saída', 140, yPos);
      
      // Valor com cor
      pdf.setTextColor(lancamento.tipo === 'entrada' ? 0 : 255, 
                      lancamento.tipo === 'entrada' ? 150 : 0, 0);
      pdf.text(formatCurrency(Number(lancamento.valor)), 165, yPos);
      pdf.setTextColor(0, 0, 0);
      
      yPos += 7;
    });
    
    return yPos + 10;
  };

  const gerarRelatorioCompleto = async (filtros: FiltrosRelatorio) => {
    setGerandoPDF(true);
    
    try {
      // Filtrar lançamentos baseado nos filtros
      let lancamentosFiltrados = [...lancamentos];
      
      if (filtros.dataInicio) {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          l => new Date(l.data_lancamento) >= new Date(filtros.dataInicio)
        );
      }
      
      if (filtros.dataFim) {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          l => new Date(l.data_lancamento) <= new Date(filtros.dataFim)
        );
      }
      
      if (filtros.categoria && filtros.categoria !== 'todas') {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          l => l.categoria_id === filtros.categoria
        );
      }
      
      if (filtros.tipo && filtros.tipo !== 'todos') {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          l => l.tipo === filtros.tipo
        );
      }
      
      if (filtros.conta && filtros.conta !== 'todas') {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          l => l.conta_id === filtros.conta
        );
      }
      
      // Calcular totais
      const totalEntradas = lancamentosFiltrados
        .filter(l => l.tipo === 'entrada')
        .reduce((sum, l) => sum + Number(l.valor), 0);
      
      const totalSaidas = lancamentosFiltrados
        .filter(l => l.tipo === 'saida')
        .reduce((sum, l) => sum + Number(l.valor), 0);
      
      const periodo = filtros.dataInicio && filtros.dataFim
        ? `${formatDate(filtros.dataInicio)} a ${formatDate(filtros.dataFim)}`
        : 'Todos os períodos';
      
      const dados: DadosRelatorio = {
        titulo: 'RELATÓRIO FINANCEIRO COMPLETO',
        periodo,
        totalEntradas,
        totalSaidas,
        saldo: totalEntradas - totalSaidas,
        lancamentos: lancamentosFiltrados,
        categorias,
        contas
      };
      
      // Gerar PDF
      const pdf = new jsPDF();
      let yPos = adicionarCabecalho(pdf, dados.titulo, dados.periodo);
      yPos = adicionarResumo(pdf, yPos, dados);
      adicionarTabelaLancamentos(pdf, yPos, dados.lancamentos);
      
      // Salvar PDF
      const nomeArquivo = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nomeArquivo);
      
      toast({
        title: "Relatório gerado com sucesso!",
        description: `O arquivo ${nomeArquivo} foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar relatório PDF:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setGerandoPDF(false);
    }
  };

  const gerarRelatorioCategorias = async (filtros: FiltrosRelatorio) => {
    setGerandoPDF(true);
    
    try {
      // Filtrar e agrupar por categoria
      let lancamentosFiltrados = [...lancamentos];
      
      if (filtros.dataInicio) {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          l => new Date(l.data_lancamento) >= new Date(filtros.dataInicio)
        );
      }
      
      if (filtros.dataFim) {
        lancamentosFiltrados = lancamentosFiltrados.filter(
          l => new Date(l.data_lancamento) <= new Date(filtros.dataFim)
        );
      }
      
      // Agrupar por categoria
      const porCategoria = categorias.map(categoria => {
        const lancamentosCategoria = lancamentosFiltrados.filter(
          l => l.categoria_id === categoria.id
        );
        
        const entradas = lancamentosCategoria
          .filter(l => l.tipo === 'entrada')
          .reduce((sum, l) => sum + Number(l.valor), 0);
        
        const saidas = lancamentosCategoria
          .filter(l => l.tipo === 'saida')
          .reduce((sum, l) => sum + Number(l.valor), 0);
        
        return {
          nome: categoria.nome,
          tipo: categoria.tipo,
          entradas,
          saidas,
          total: entradas - saidas,
          quantidade: lancamentosCategoria.length
        };
      }).filter(c => c.quantidade > 0);
      
      const periodo = filtros.dataInicio && filtros.dataFim
        ? `${formatDate(filtros.dataInicio)} a ${formatDate(filtros.dataFim)}`
        : 'Todos os períodos';
      
      // Gerar PDF
      const pdf = new jsPDF();
      let yPos = adicionarCabecalho(pdf, 'RELATÓRIO POR CATEGORIAS', periodo);
      
      // Tabela de categorias
      pdf.setFillColor(255, 140, 0);
      pdf.rect(20, yPos, 170, 8, 'F');
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('ANÁLISE POR CATEGORIAS', 22, yPos + 6);
      pdf.setTextColor(0, 0, 0);
      
      yPos += 15;
      
      // Cabeçalho da tabela
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Categoria', 20, yPos);
      pdf.text('Tipo', 80, yPos);
      pdf.text('Entradas', 110, yPos);
      pdf.text('Saídas', 140, yPos);
      pdf.text('Saldo', 170, yPos);
      
      yPos += 5;
      pdf.line(20, yPos, 190, yPos);
      yPos += 5;
      
      // Dados da tabela
      pdf.setFont('helvetica', 'normal');
      porCategoria.forEach((categoria) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        
        pdf.text(categoria.nome, 20, yPos);
        pdf.text(categoria.tipo === 'entrada' ? 'Entrada' : 'Saída', 80, yPos);
        pdf.text(formatCurrency(categoria.entradas), 110, yPos);
        pdf.text(formatCurrency(categoria.saidas), 140, yPos);
        
        // Saldo com cor
        pdf.setTextColor(categoria.total >= 0 ? 0 : 255, categoria.total >= 0 ? 150 : 0, 0);
        pdf.text(formatCurrency(categoria.total), 170, yPos);
        pdf.setTextColor(0, 0, 0);
        
        yPos += 7;
      });
      
      // Salvar PDF
      const nomeArquivo = `relatorio-categorias-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nomeArquivo);
      
      toast({
        title: "Relatório de categorias gerado!",
        description: `O arquivo ${nomeArquivo} foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar relatório de categorias:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Não foi possível gerar o relatório de categorias.",
        variant: "destructive",
      });
    } finally {
      setGerandoPDF(false);
    }
  };

  return {
    gerandoPDF,
    gerarRelatorioCompleto,
    gerarRelatorioCategorias,
    formatCurrency,
    formatDate
  };
};