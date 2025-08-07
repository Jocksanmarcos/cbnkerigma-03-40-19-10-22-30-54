import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Download, 
  Calendar, 
  BarChart3, 
  Users, 
  Church,
  FileText,
  Loader2
} from 'lucide-react';

interface Igreja {
  id: string;
  nome: string;
  tipo: string;
  cidade: string;
  estado: string;
}

interface MissoesRelatoriosProps {
  missoesAtivas: Igreja[];
}

export const MissoesRelatorios = ({ missoesAtivas }: MissoesRelatoriosProps) => {
  const [selectedMissao, setSelectedMissao] = useState<string>('todas');
  const [loadingReport, setLoadingReport] = useState<string>('');
  const { toast } = useToast();

  const handleGenerateReport = async (tipo: string) => {
    setLoadingReport(tipo);
    
    try {
      // Simular geração de relatório
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const missaoNome = selectedMissao === 'todas' 
        ? 'Todas as Missões' 
        : missoesAtivas.find(m => m.id === selectedMissao)?.nome || 'Missão';
      
      toast({
        title: "Relatório Gerado",
        description: `Relatório ${getTipoRelatorioName(tipo)} para ${missaoNome} foi gerado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o relatório. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoadingReport('');
    }
  };

  const getTipoRelatorioName = (tipo: string) => {
    const tipos: Record<string, string> = {
      mensal: 'Mensal',
      financeiro: 'Financeiro',
      membros: 'de Membros',
      celulas: 'de Células',
      consolidado: 'Consolidado',
      comparativo: 'Comparativo'
    };
    return tipos[tipo] || tipo;
  };

  const relatorios = [
    {
      id: 'mensal',
      title: 'Relatório Mensal',
      description: 'Resumo geral do mês atual',
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'financeiro',
      title: 'Relatório Financeiro',
      description: 'Receitas, despesas e saldos',
      icon: BarChart3,
      color: 'text-green-600'
    },
    {
      id: 'membros',
      title: 'Relatório de Membros',
      description: 'Estatísticas de membros e visitantes',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      id: 'celulas',
      title: 'Relatório de Células',
      description: 'Atividades e crescimento das células',
      icon: Church,
      color: 'text-orange-600'
    },
    {
      id: 'consolidado',
      title: 'Relatório Consolidado',
      description: 'Visão geral de todas as atividades',
      icon: FileText,
      color: 'text-indigo-600'
    },
    {
      id: 'comparativo',
      title: 'Relatório Comparativo',
      description: 'Comparação entre missões',
      icon: BarChart3,
      color: 'text-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configurações de Relatório</CardTitle>
          <CardDescription>
            Selecione a missão para gerar relatórios específicos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">
                Missão
              </label>
              <Select value={selectedMissao} onValueChange={setSelectedMissao}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma missão" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Missões</SelectItem>
                  {missoesAtivas.map((missao) => (
                    <SelectItem key={missao.id} value={missao.id}>
                      {missao.nome} - {missao.cidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relatórios Disponíveis */}
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-700 mb-4">
          📊 Relatórios Disponíveis
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Gere relatórios detalhados por missão ou consolidados
        </p>

        <div className="grid gap-3 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
          {[
            { id: "mensal", title: "Relatório Mensal", icon: "📅", desc: "Resumo geral do mês atual" },
            { id: "financeiro", title: "Relatório Financeiro", icon: "💰", desc: "Receitas, despesas e saldo" },
            { id: "membros", title: "Relatório de Membros", icon: "🧑‍🤝‍🧑", desc: "Estatísticas de membros e visitantes" },
            { id: "celulas", title: "Relatório de Células", icon: "🪴", desc: "Atividades e crescimento das células" },
            { id: "consolidado", title: "Relatório Consolidado", icon: "📈", desc: "Visão geral de todas as missões" },
            { id: "comparativo", title: "Relatório Comparativo", icon: "⚖️", desc: "Comparativo entre missões" },
          ].map((relatorio) => {
            const isLoading = loadingReport === relatorio.id;
            
            return (
              <button
                key={relatorio.id}
                className="w-full bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-yellow-600 transition duration-200 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => handleGenerateReport(relatorio.id)}
                disabled={isLoading || !selectedMissao}
              >
                <div className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
                    ) : (
                      relatorio.icon
                    )}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{relatorio.title}</p>
                    <p className="text-sm text-gray-300">
                      {isLoading ? "Gerando relatório..." : relatorio.desc}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        {!selectedMissao && (
          <div className="text-center mt-4 p-4 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Selecione uma missão para habilitar a geração de relatórios
            </p>
          </div>
        )}
      </div>
    </div>
  );
};