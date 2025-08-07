import { useState } from 'react';
import { Download, FileText, Table, Calendar, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePickerWithRange } from '@/components/ui/date-picker-with-range';
import { Checkbox } from '@/components/ui/checkbox';
import { useEnsinoCompleto } from '@/hooks/useEnsinoCompleto';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const GeradorRelatoriosEnsino = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState<string>('');
  const [formato, setFormato] = useState<'pdf' | 'excel' | 'csv'>('pdf');
  const [periodo, setPeriodo] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined
  });
  const [incluirDetalhes, setIncluirDetalhes] = useState(true);
  const [incluirGraficos, setIncluirGraficos] = useState(false);
  const [generating, setGenerating] = useState(false);

  const { turmas, matriculas, cursos, estatisticas } = useEnsinoCompleto();
  const { toast } = useToast();

  const tiposRelatorio = [
    { value: 'cronograma_geral', label: 'Cronograma Geral de Cursos', icon: Calendar },
    { value: 'lista_matriculas', label: 'Lista de Matrículas', icon: Users },
    { value: 'certificados_emitidos', label: 'Certificados Emitidos', icon: Award },
    { value: 'estatisticas_gerais', label: 'Estatísticas Gerais', icon: Table },
    { value: 'grade_aulas', label: 'Grade de Aulas (Por Curso)', icon: FileText },
    { value: 'planejamento_anual', label: 'Planejamento Anual', icon: Calendar }
  ];

  const gerarRelatorioPDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    
    // Cabeçalho
    pdf.setFontSize(20);
    pdf.text('Relatório de Ensino - Igreja CBN Kerigma', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45);
    
    let yPosition = 60;

    switch (tipoRelatorio) {
      case 'cronograma_geral':
        pdf.setFontSize(16);
        pdf.text('Cronograma Geral de Cursos', 20, yPosition);
        yPosition += 20;
        
        const turmasData = turmas.map(turma => [
          turma.nome_turma,
          turma.curso?.nome || 'N/A',
          turma.professor_responsavel,
          new Date(turma.data_inicio).toLocaleDateString('pt-BR'),
          `${turma.horario_inicio} - ${turma.horario_fim}`,
          turma.status
        ]);
        
        (pdf as any).autoTable({
          head: [['Turma', 'Curso', 'Professor', 'Data Início', 'Horário', 'Status']],
          body: turmasData,
          startY: yPosition,
          styles: { fontSize: 10 },
          headStyles: { fillColor: [59, 130, 246] }
        });
        break;

      case 'lista_matriculas':
        pdf.setFontSize(16);
        pdf.text('Lista de Matrículas', 20, yPosition);
        yPosition += 20;
        
        const matriculasData = matriculas.slice(0, 50).map(matricula => [
          matricula.pessoa?.nome_completo || 'N/A',
          matricula.turma?.nome_turma || 'N/A',
          new Date(matricula.data_matricula).toLocaleDateString('pt-BR'),
          matricula.status,
          matricula.nota_final?.toString() || '-',
          `${matricula.frequencia_percentual}%`
        ]);
        
        (pdf as any).autoTable({
          head: [['Aluno', 'Turma', 'Data Matrícula', 'Status', 'Nota', 'Frequência']],
          body: matriculasData,
          startY: yPosition,
          styles: { fontSize: 8 },
          headStyles: { fillColor: [16, 185, 129] }
        });
        break;

      case 'estatisticas_gerais':
        if (estatisticas) {
          pdf.setFontSize(16);
          pdf.text('Estatísticas Gerais do Ensino', 20, yPosition);
          yPosition += 30;
          
          const statsData = [
            ['Total de Cursos', estatisticas.total_cursos.toString()],
            ['Turmas Ativas', estatisticas.total_turmas_ativas.toString()],
            ['Alunos Matriculados', estatisticas.total_alunos_matriculados.toString()],
            ['Alunos Concluídos', estatisticas.total_alunos_concluidos.toString()],
            ['Taxa de Conclusão', `${estatisticas.taxa_conclusao.toFixed(1)}%`]
          ];
          
          (pdf as any).autoTable({
            body: statsData,
            startY: yPosition,
            styles: { fontSize: 12 },
            columnStyles: {
              0: { fontStyle: 'bold', fillColor: [243, 244, 246] },
              1: { halign: 'center' }
            }
          });
        }
        break;

      default:
        pdf.text('Relatório em desenvolvimento...', 20, yPosition);
    }
    
    return pdf;
  };

  const gerarRelatorioExcel = async () => {
    // Simulação de geração Excel - em produção usaria biblioteca como xlsx
    const data = turmas.map(turma => ({
      'Nome da Turma': turma.nome_turma,
      'Curso': turma.curso?.nome || 'N/A',
      'Professor': turma.professor_responsavel,
      'Data Início': new Date(turma.data_inicio).toLocaleDateString('pt-BR'),
      'Horário': `${turma.horario_inicio} - ${turma.horario_fim}`,
      'Status': turma.status,
      'Capacidade': turma.capacidade_maxima
    }));
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const gerarRelatorioCSV = async () => {
    const data = matriculas.map(matricula => ({
      'Aluno': matricula.pessoa?.nome_completo || 'N/A',
      'Turma': matricula.turma?.nome_turma || 'N/A',
      'Curso': matricula.turma?.curso?.nome || 'N/A',
      'Data Matrícula': new Date(matricula.data_matricula).toLocaleDateString('pt-BR'),
      'Status': matricula.status,
      'Nota Final': matricula.nota_final?.toString() || '',
      'Frequência': `${matricula.frequencia_percentual}%`,
      'Certificado Emitido': matricula.certificado_emitido ? 'Sim' : 'Não'
    }));
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  const handleGerar = async () => {
    if (!tipoRelatorio) {
      toast({
        title: "Erro",
        description: "Selecione um tipo de relatório",
        variant: "destructive",
      });
      return;
    }

    setGenerating(true);
    
    try {
      let content: any;
      let filename: string;
      let mimeType: string;
      
      if (formato === 'pdf') {
        content = await gerarRelatorioPDF();
        filename = `relatorio-ensino-${tipoRelatorio}-${new Date().getTime()}.pdf`;
        content.save(filename);
        
        toast({
          title: "Sucesso",
          description: "Relatório PDF gerado com sucesso!",
        });
        return;
      } else if (formato === 'excel' || formato === 'csv') {
        content = formato === 'excel' ? await gerarRelatorioExcel() : await gerarRelatorioCSV();
        filename = `relatorio-ensino-${tipoRelatorio}-${new Date().getTime()}.${formato === 'excel' ? 'csv' : 'csv'}`;
        mimeType = 'text/csv';
        
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      
      toast({
        title: "Sucesso",
        description: `Relatório ${formato.toUpperCase()} gerado com sucesso!`,
      });
      
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const relatorioSelecionado = tiposRelatorio.find(r => r.value === tipoRelatorio);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerador de Relatórios</h2>
        <p className="text-muted-foreground">
          Gere relatórios detalhados sobre o ensino da igreja
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações do Relatório</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Relatório</Label>
                <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de relatório" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposRelatorio.map((tipo) => {
                      const Icon = tipo.icon;
                      return (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {tipo.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Formato de Saída</Label>
                <Select value={formato} onValueChange={(value: 'pdf' | 'excel' | 'csv') => setFormato(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="excel">Excel (CSV)</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Período (Opcional)</Label>
                <DatePickerWithRange
                  date={periodo}
                  onDateChange={setPeriodo}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="detalhes"
                    checked={incluirDetalhes}
                    onCheckedChange={(checked) => setIncluirDetalhes(checked as boolean)}
                  />
                  <Label htmlFor="detalhes">Incluir detalhes expandidos</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="graficos"
                    checked={incluirGraficos}
                    onCheckedChange={(checked) => setIncluirGraficos(checked as boolean)}
                  />
                  <Label htmlFor="graficos">Incluir gráficos e estatísticas</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              {relatorioSelecionado ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <relatorioSelecionado.icon className="h-5 w-5 text-primary" />
                    <span className="font-medium">{relatorioSelecionado.label}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Formato: {formato.toUpperCase()}<br />
                    {periodo.from && periodo.to && (
                      <>Período: {periodo.from.toLocaleDateString()} - {periodo.to.toLocaleDateString()}<br /></>
                    )}
                    Detalhes: {incluirDetalhes ? 'Sim' : 'Não'}<br />
                    Gráficos: {incluirGraficos ? 'Sim' : 'Não'}
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Selecione um tipo de relatório</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Button
            onClick={handleGerar}
            disabled={!tipoRelatorio || generating}
            className="w-full"
            size="lg"
          >
            {generating ? (
              <>Gerando...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Gerar Relatório
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};