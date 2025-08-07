import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { 
  FileText, 
  Download, 
  Calendar, 
  Users, 
  DollarSign, 
  BookOpen,
  Settings,
  Eye,
  Printer
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
  title: string;
  data: any[];
  columns: string[];
  summary?: {
    total: number;
    count: number;
    average?: number;
  };
}

export const PDFGenerator: React.FC = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({
    inicio: '',
    fim: ''
  });
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeDetails, setIncludeDetails] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Fetch report data based on type
  const { data: reportData, loading } = useOptimizedQuery<ReportData>({
    queryKey: `report-${reportType}-${dateRange.inicio}-${dateRange.fim}`,
    queryFn: async () => {
      if (!reportType) return null;

      switch (reportType) {
        case 'pessoas':
          const { data: pessoas } = await supabase
            .from('pessoas')
            .select('nome_completo, email, telefone, tipo_pessoa, estado_espiritual, created_at')
            .gte('created_at', dateRange.inicio || '2024-01-01')
            .lte('created_at', dateRange.fim || '2024-12-31');

          return {
            title: 'Relatório de Pessoas',
            data: pessoas || [],
            columns: ['Nome', 'Email', 'Telefone', 'Tipo', 'Estado Espiritual', 'Cadastro'],
            summary: {
              total: pessoas?.length || 0,
              count: pessoas?.length || 0
            }
          };

        case 'eventos':
          const { data: eventos } = await supabase
            .from('eventos')
            .select('titulo, data_inicio, local, tipo, capacidade')
            .gte('data_inicio', dateRange.inicio || '2024-01-01')
            .lte('data_inicio', dateRange.fim || '2024-12-31');

          return {
            title: 'Relatório de Eventos',
            data: eventos || [],
            columns: ['Título', 'Data', 'Local', 'Tipo', 'Capacidade'],
            summary: {
              total: eventos?.length || 0,
              count: eventos?.length || 0
            }
          };

        case 'financeiro':
          const { data: financeiro } = await supabase
            .from('lancamentos_financeiros')
            .select('descricao, valor, tipo, data_lancamento')
            .gte('data_lancamento', dateRange.inicio || '2024-01-01')
            .lte('data_lancamento', dateRange.fim || '2024-12-31');

          const total = financeiro?.reduce((sum, item) => 
            sum + (Number(item.valor) || 0), 0) || 0;

          return {
            title: 'Relatório Financeiro',
            data: financeiro || [],
            columns: ['Descrição', 'Valor', 'Tipo', 'Data', 'Categoria'],
            summary: {
              total,
              count: financeiro?.length || 0,
              average: total / (financeiro?.length || 1)
            }
          };

        case 'ensino':
          const { data: ensino } = await supabase
            .from('matriculas_ensino')
            .select(`
              *, 
              curso:cursos_ensino(nome),
              pessoa:pessoas(nome_completo)
            `)
            .gte('data_matricula', dateRange.inicio || '2024-01-01')
            .lte('data_matricula', dateRange.fim || '2024-12-31');

          return {
            title: 'Relatório de Ensino',
            data: ensino || [],
            columns: ['Aluno', 'Curso', 'Status', 'Data Matrícula', 'Progresso'],
            summary: {
              total: ensino?.length || 0,
              count: ensino?.length || 0
            }
          };

        default:
          return null;
      }
    },
    enabled: !!reportType,
    staleTime: 60000, // 1 minute
  });

  const generatePDF = async () => {
    if (!reportData || !reportData.data.length) {
      toast({
        title: "Erro",
        description: "Não há dados disponíveis para gerar o relatório.",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);

    try {
      const doc = new jsPDF();

      // Header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text('CBN KERIGMA', 20, 25);
      
      doc.setFontSize(16);
      doc.text(reportData.title, 20, 35);

      // Date range
      if (dateRange.inicio && dateRange.fim) {
        doc.setFontSize(10);
        doc.text(`Período: ${new Date(dateRange.inicio).toLocaleDateString('pt-BR')} a ${new Date(dateRange.fim).toLocaleDateString('pt-BR')}`, 20, 45);
      }

      // Summary
      if (reportData.summary && includeDetails) {
        doc.setFontSize(12);
        doc.text('Resumo:', 20, 60);
        doc.setFontSize(10);
        doc.text(`Total de registros: ${reportData.summary.count}`, 20, 70);
        
        if (reportType === 'financeiro' && reportData.summary.total !== undefined) {
          doc.text(`Valor total: R$ ${reportData.summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 80);
          if (reportData.summary.average) {
            doc.text(`Valor médio: R$ ${reportData.summary.average.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, 90);
          }
        }
      }

      // Table data
      const tableData = reportData.data.map(item => {
        switch (reportType) {
          case 'pessoas':
            return [
              item.nome_completo || '',
              item.email || '',
              item.telefone || '',
              item.tipo_pessoa || '',
              item.estado_espiritual || '',
              new Date(item.created_at).toLocaleDateString('pt-BR')
            ];
          case 'eventos':
            return [
              item.titulo || '',
              new Date(item.data_inicio).toLocaleDateString('pt-BR'),
              item.local || '',
              item.tipo || '',
              item.capacidade?.toString() || ''
            ];
          case 'financeiro':
            return [
              item.descricao || '',
              `R$ ${item.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
              item.tipo || '',
              new Date(item.data_lancamento).toLocaleDateString('pt-BR'),
              item.categoria || ''
            ];
          case 'ensino':
            return [
              item.pessoa?.nome_completo || '',
              item.curso?.nome || '',
              item.status || '',
              new Date(item.data_matricula).toLocaleDateString('pt-BR'),
              `${item.progresso || 0}%`
            ];
          default:
            return [];
        }
      });

      // Generate table
      autoTable(doc, {
        head: [reportData.columns],
        body: tableData,
        startY: includeDetails ? 100 : 55,
        theme: 'grid',
        styles: {
          fontSize: 8,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [66, 139, 202],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 10, right: 10, bottom: 10, left: 10 },
      });

      // Footer
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(
          `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString('pt-BR')}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `${reportType}-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Relatório gerado",
        description: `O arquivo ${fileName} foi baixado com sucesso.`,
      });

    } catch (error: any) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório PDF.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const previewReport = () => {
    if (!reportData) {
      toast({
        title: "Selecione um tipo de relatório",
        description: "Escolha o tipo de relatório para visualizar os dados.",
        variant: "destructive",
      });
      return;
    }

    // For now, just show a toast. In a real app, you'd open a preview modal
    toast({
      title: "Prévia do relatório",
      description: `${reportData.data.length} registros encontrados para ${reportData.title}`,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerador de Relatórios PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="reportType">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pessoas">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Pessoas
                    </div>
                  </SelectItem>
                  <SelectItem value="eventos">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Eventos
                    </div>
                  </SelectItem>
                  <SelectItem value="financeiro">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Financeiro
                    </div>
                  </SelectItem>
                  <SelectItem value="ensino">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Ensino
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={dateRange.inicio}
                onChange={(e) => setDateRange(prev => ({ ...prev, inicio: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={dateRange.fim}
                onChange={(e) => setDateRange(prev => ({ ...prev, fim: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="includeCharts"
                  checked={includeCharts}
                  onCheckedChange={setIncludeCharts}
                />
                <Label htmlFor="includeCharts">Incluir gráficos</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includeDetails"
                  checked={includeDetails}
                  onCheckedChange={setIncludeDetails}
                />
                <Label htmlFor="includeDetails">Incluir resumo detalhado</Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={previewReport}
                disabled={!reportType || loading}
              >
                <Eye className="h-4 w-4 mr-2" />
                Prévia
              </Button>
              
              <Button 
                onClick={generatePDF}
                disabled={!reportType || loading || generating}
              >
                {generating ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Gerar PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {loading && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 animate-spin" />
                <span>Carregando dados do relatório...</span>
              </div>
            </div>
          )}

          {reportData && (
            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2">{reportData.title}</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Registros:</span>
                  <div className="font-medium">{reportData.data.length}</div>
                </div>
                {reportData.summary?.total !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Total:</span>
                    <div className="font-medium">
                      R$ {reportData.summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">Período:</span>
                  <div className="font-medium">
                    {dateRange.inicio && dateRange.fim 
                      ? `${new Date(dateRange.inicio).toLocaleDateString('pt-BR')} - ${new Date(dateRange.fim).toLocaleDateString('pt-BR')}`
                      : 'Todos os registros'
                    }
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Colunas:</span>
                  <div className="font-medium">{reportData.columns.length}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};