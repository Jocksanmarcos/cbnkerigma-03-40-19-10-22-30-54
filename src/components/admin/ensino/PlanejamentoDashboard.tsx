import React, { useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileDown, Calendar, GraduationCap, Users, TrendingUp } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { useEnsinoCompleto } from '@/hooks/useEnsinoCompleto';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const PlanejamentoDashboard = () => {
  const { estatisticas, turmas, loading } = useEnsinoCompleto();
  const { toast } = useToast();
  const ganttChartRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Dados para o Gráfico de Gantt (Linha do Tempo dos Cursos - 2026)
  const dadosGantt = (() => {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const dados = meses.map(mes => ({ 
      mes, 
      discipulado: 0, 
      lideranca: 0, 
      teologia: 0, 
      total: 0 
    }));
    
    turmas.forEach(turma => {
      if (turma.data_inicio && turma.curso) {
        const mesIndex = new Date(turma.data_inicio).getMonth();
        const categoria = turma.curso.categoria?.toLowerCase() || '';
        
        if (categoria.includes('discipulado')) {
          dados[mesIndex].discipulado += 1;
        } else if (categoria.includes('lideranca')) {
          dados[mesIndex].lideranca += 1;
        } else if (categoria.includes('teologia')) {
          dados[mesIndex].teologia += 1;
        }
        dados[mesIndex].total += 1;
      }
    });
    
    return dados;
  })();

  // Dados para o heatmap de alocação de professores
  const alocacaoProfessores = (() => {
    const professoresMap = new Map();
    
    turmas.forEach(turma => {
      if (turma.professor_responsavel) {
        const professor = turma.professor_responsavel;
        if (!professoresMap.has(professor)) {
          professoresMap.set(professor, {
            professor,
            turmas: 0,
            horas: 0,
            status: 'disponivel'
          });
        }
        
        const data = professoresMap.get(professor);
        data.turmas += 1;
        data.horas += turma.curso?.carga_horaria || 20; // Default 20h por turma
        data.status = data.horas > 60 ? 'ocupado' : 'disponivel';
      }
    });
    
    return Array.from(professoresMap.values()).slice(0, 5);
  })();

  const handleExportGanttToPDF = async () => {
    if (!ganttChartRef.current) {
      toast({
        title: "Erro na exportação",
        description: "Não foi possível localizar o gráfico para exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      // Capturar o componente do gráfico como imagem
      const canvas = await html2canvas(ganttChartRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      // Criar novo documento PDF
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      // Calcular dimensões para manter a proporção
      const imgWidth = 280; // Largura máxima no PDF
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Adicionar cabeçalho
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 140, 0); // Cor laranja do tema
      pdf.text('Planejamento Anual de Cursos - 2026', 148, 20, { align: 'center' });
      
      pdf.setFontSize(12);
      pdf.setTextColor(100, 100, 100);
      pdf.text('Comunidade Batista Nacional Kerigma', 148, 30, { align: 'center' });
      
      // Linha separadora
      pdf.setDrawColor(255, 140, 0);
      pdf.setLineWidth(1);
      pdf.line(20, 35, 276, 35);
      
      // Adicionar a imagem do gráfico
      const yPosition = 45;
      if (yPosition + imgHeight > 190) {
        // Se a imagem for muito alta, reduzir proporcionalmente
        const maxHeight = 130;
        const adjustedWidth = (canvas.width * maxHeight) / canvas.height;
        pdf.addImage(imgData, 'PNG', (297 - adjustedWidth) / 2, yPosition, adjustedWidth, maxHeight);
      } else {
        pdf.addImage(imgData, 'PNG', (297 - imgWidth) / 2, yPosition, imgWidth, imgHeight);
      }
      
      // Adicionar rodapé
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      const dataAtual = new Date().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Gerado em: ${dataAtual}`, 148, 200, { align: 'center' });
      
      // Salvar o arquivo
      const nomeArquivo = `planejamento-anual-cursos-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(nomeArquivo);
      
      toast({
        title: "PDF exportado com sucesso!",
        description: `O arquivo ${nomeArquivo} foi baixado.`,
      });
      
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Não foi possível gerar o arquivo PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Dashboard Anual - 2026</h2>
        <p className="text-muted-foreground">
          Central de planejamento e análise estratégica dos cursos
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Cursos Planejados</p>
                <p className="text-2xl font-bold">{estatisticas?.total_cursos || 0}</p>
                <p className="text-xs text-muted-foreground">Para 2026</p>
              </div>
              <GraduationCap className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vagas Totais</p>
                <p className="text-2xl font-bold">
                  {turmas.reduce((acc, turma) => acc + turma.capacidade_maxima, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Capacidade máxima</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Turmas Ativas</p>
                <p className="text-2xl font-bold">{estatisticas?.total_turmas_ativas || 0}</p>
                <p className="text-xs text-muted-foreground">Em andamento</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eficiência</p>
                <p className="text-2xl font-bold">{estatisticas?.taxa_conclusao?.toFixed(1) || 0}%</p>
                <p className="text-xs text-muted-foreground">Taxa de conclusão</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Gantt - Linha do Tempo dos Cursos */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Linha do Tempo dos Cursos - 2026
              </CardTitle>
              <Button
                onClick={handleExportGanttToPDF}
                disabled={isExporting}
                variant="outline"
                size="sm"
              >
                <FileDown className="h-4 w-4 mr-2" />
                {isExporting ? 'Exportando...' : 'Exportar para PDF'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div ref={ganttChartRef}>
              <ChartContainer
                config={{
                  discipulado: {
                    label: "Discipulado",
                    color: "hsl(var(--chart-1))",
                  },
                  lideranca: {
                    label: "Liderança",
                    color: "hsl(var(--chart-2))",
                  },
                  teologia: {
                    label: "Teologia",
                    color: "hsl(var(--chart-3))",
                  },
                }}
                className="h-[300px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosGantt}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="discipulado" stackId="a" fill="var(--color-discipulado)" />
                    <Bar dataKey="lideranca" stackId="a" fill="var(--color-lideranca)" />
                    <Bar dataKey="teologia" stackId="a" fill="var(--color-teologia)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Alocação de Professores - Resource Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Alocação de Professores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alocacaoProfessores.length > 0 ? (
                alocacaoProfessores.map((professor) => (
                  <div key={professor.professor} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{professor.professor}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={professor.status === 'disponivel' ? 'default' : 'secondary'}
                        >
                          {professor.status === 'disponivel' ? 'Disponível' : 'Ocupado'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {professor.turmas} turma{professor.turmas !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    <Progress value={(professor.horas / 80) * 100} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{professor.horas}h de 80h</span>
                      <span>{Math.round((professor.horas / 80) * 100)}%</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum professor alocado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Turmas Planejadas */}
      <Card>
        <CardHeader>
          <CardTitle>Turmas Planejadas para 2026</CardTitle>
        </CardHeader>
        <CardContent>
          {turmas.length > 0 ? (
            <div className="space-y-4">
              {turmas.slice(0, 5).map((turma) => (
                <div key={turma.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{turma.nome_turma}</h4>
                    <p className="text-sm text-muted-foreground">
                      Curso: {turma.curso?.nome || 'N/A'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Professor: {turma.professor_responsavel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Início: {turma.data_inicio ? new Date(turma.data_inicio).toLocaleDateString('pt-BR') : 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        turma.status === 'em_andamento' ? 'default' :
                        turma.status === 'planejado' ? 'secondary' : 'outline'
                      }
                    >
                      {turma.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {turma.capacidade_maxima} vagas
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma turma planejada ainda</p>
              <p className="text-sm">Comece criando sua primeira turma para 2026</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};