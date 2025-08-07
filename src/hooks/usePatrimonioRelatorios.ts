import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF interface
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable;
  }
}

interface PatrimonioData {
  id: string;
  nome: string;
  codigo_patrimonio?: string;
  categoria_id: string;
  subcategoria_id?: string;
  descricao?: string;
  status: string;
  estado_conservacao: string;
  valor_unitario?: number;
  quantidade: number;
  valor_total?: number;
  data_aquisicao?: string;
  localizacao_atual?: string;
  responsavel_id?: string;
  ministerio_relacionado?: string;
  observacoes?: string;
  created_at: string;
  [key: string]: any; // Para compatibilidade com outros campos
}

interface UsePatrimonioRelatoriosProps {
  patrimonios: PatrimonioData[];
  categorias: any[];
  loading: boolean;
}

export const usePatrimonioRelatorios = ({ patrimonios, categorias, loading }: UsePatrimonioRelatoriosProps) => {
  const [exportando, setExportando] = useState(false);

  const formatCurrency = (value?: number) => {
    if (!value) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getCategoriaName = (categoriaId: string) => {
    const categoria = categorias.find(c => c.id === categoriaId);
    return categoria?.nome || 'N/A';
  };

  const exportarCSV = () => {
    setExportando(true);
    
    try {
      const headers = [
        'Código',
        'Nome',
        'Categoria',
        'Descrição',
        'Status',
        'Estado',
        'Quantidade',
        'Valor Unitário',
        'Valor Total',
        'Data Aquisição',
        'Localização',
        'Ministério',
        'Observações'
      ];

      const csvData = patrimonios.map(item => [
        item.codigo_patrimonio || '',
        item.nome,
        getCategoriaName(item.categoria_id),
        item.descricao || '',
        item.status,
        item.estado_conservacao,
        item.quantidade.toString(),
        item.valor_unitario?.toString() || '0',
        item.valor_total?.toString() || '0',
        formatDate(item.data_aquisicao),
        item.localizacao_atual || '',
        item.ministerio_relacionado || '',
        item.observacoes || ''
      ]);

      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `relatorio_patrimonio_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      return { success: true, message: 'Relatório CSV exportado com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
      return { success: false, message: 'Erro ao exportar relatório CSV' };
    } finally {
      setExportando(false);
    }
  };

  const exportarPDF = () => {
    setExportando(true);

    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Patrimônio', 20, 20);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 30);
      doc.text(`Total de itens: ${patrimonios.length}`, 20, 40);

      // Estatísticas resumidas
      const valorTotal = patrimonios.reduce((sum, item) => sum + (item.valor_total || 0), 0);
      doc.text(`Valor total do patrimônio: ${formatCurrency(valorTotal)}`, 20, 50);

      // Tabela de dados
      const tableData = patrimonios.map(item => [
        item.codigo_patrimonio || '-',
        item.nome.length > 25 ? item.nome.substring(0, 25) + '...' : item.nome,
        getCategoriaName(item.categoria_id),
        item.status,
        item.estado_conservacao,
        item.quantidade.toString(),
        formatCurrency(item.valor_total),
        item.localizacao_atual || '-'
      ]);

      autoTable(doc, {
        head: [['Código', 'Nome', 'Categoria', 'Status', 'Estado', 'Qtd', 'Valor', 'Localização']],
        body: tableData,
        startY: 60,
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: [74, 85, 162],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 20 }, // Código
          1: { cellWidth: 35 }, // Nome
          2: { cellWidth: 25 }, // Categoria
          3: { cellWidth: 20 }, // Status
          4: { cellWidth: 20 }, // Estado
          5: { cellWidth: 15 }, // Quantidade
          6: { cellWidth: 25 }, // Valor
          7: { cellWidth: 25 }  // Localização
        }
      });

      // Adicionar rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Página ${i} de ${pageCount} - CBN Kerigma - Sistema de Gestão Eclesiástica`,
          20,
          doc.internal.pageSize.height - 10
        );
      }

      // Download do PDF
      doc.save(`relatorio_patrimonio_${new Date().toISOString().split('T')[0]}.pdf`);
      
      return { success: true, message: 'Relatório PDF exportado com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { success: false, message: 'Erro ao exportar relatório PDF' };
    } finally {
      setExportando(false);
    }
  };

  const exportarRelatorioDetalhado = () => {
    setExportando(true);

    try {
      const doc = new jsPDF();
      
      // Cabeçalho
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório Detalhado de Patrimônio', 20, 20);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, 30);

      let yPosition = 45;

      // Estatísticas por categoria
      const estatisticasPorCategoria = categorias.map(categoria => {
        const itensCategoria = patrimonios.filter(p => p.categoria_id === categoria.id);
        const valorTotal = itensCategoria.reduce((sum, item) => sum + (item.valor_total || 0), 0);
        return {
          nome: categoria.nome,
          quantidade: itensCategoria.length,
          valor: valorTotal
        };
      }).filter(stat => stat.quantidade > 0);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo por Categoria', 20, yPosition);
      yPosition += 10;

      autoTable(doc, {
        head: [['Categoria', 'Quantidade', 'Valor Total']],
        body: estatisticasPorCategoria.map(stat => [
          stat.nome,
          stat.quantidade.toString(),
          formatCurrency(stat.valor)
        ]),
        startY: yPosition,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [74, 85, 162] }
      });

      yPosition = (doc as any).lastAutoTable.finalY + 20;

      // Patrimônios críticos
      const patrimoniosCriticos = patrimonios.filter(p => 
        p.estado_conservacao === 'danificado' || 
        p.estado_conservacao === 'inservivel' ||
        p.status === 'em_manutencao'
      );

      if (patrimoniosCriticos.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Patrimônios que Precisam de Atenção', 20, yPosition);
        yPosition += 10;

        autoTable(doc, {
          head: [['Código', 'Nome', 'Status', 'Estado', 'Localização']],
          body: patrimoniosCriticos.map(item => [
            item.codigo_patrimonio || '-',
            item.nome,
            item.status,
            item.estado_conservacao,
            item.localizacao_atual || '-'
          ]),
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [239, 68, 68] }
        });
      }

      doc.save(`relatorio_detalhado_patrimonio_${new Date().toISOString().split('T')[0]}.pdf`);
      
      return { success: true, message: 'Relatório detalhado exportado com sucesso!' };
    } catch (error) {
      console.error('Erro ao exportar relatório detalhado:', error);
      return { success: false, message: 'Erro ao exportar relatório detalhado' };
    } finally {
      setExportando(false);
    }
  };

  return {
    exportando,
    exportarCSV,
    exportarPDF,
    exportarRelatorioDetalhado
  };
};