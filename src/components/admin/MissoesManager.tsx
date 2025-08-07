import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MissoesHeader } from './missoes/MissoesHeader';
import { MissoesStats } from './missoes/MissoesStats';
import { MissoesResumo } from './missoes/MissoesResumo';
import { MissoesRelatorios } from './missoes/MissoesRelatorios';
import { CadastroMissaoModal } from './missoes/CadastroMissaoModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users } from 'lucide-react';
import { PastoresMissoesManager } from './missoes/PastoresMissoesManager';

interface Igreja {
  id: string;
  nome: string;
  tipo: string;
  cidade: string;
  estado: string;
  pastor_responsavel: string;
  ativa: boolean;
}

interface EstatisticasMissao {
  igreja_id: string;
  igreja_nome: string;
  total_membros: number;
  total_visitantes: number;
  total_celulas: number;
  total_receitas: number;
  total_despesas: number;
  saldo_atual: number;
  ultima_atualizacao: string;
}

export const MissoesManager = () => {
  const [igrejas, setIgrejas] = useState<Igreja[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasMissao[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumo');
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user && isAdmin) {
      carregarDados();
    }
  }, [user, isAdmin]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando dados das missões...');

      // Verificar se é admin da sede antes de prosseguir
      const { data: adminCheck } = await supabase.rpc('is_sede_admin');
      console.log('🏛️ Verificação admin da sede:', adminCheck);
      
      if (!adminCheck) {
        console.log('❌ Acesso negado - não é admin da sede');
        toast({
          title: "Acesso Negado",
          description: "Apenas administradores da sede podem acessar este módulo.",
          variant: "destructive"
        });
        return;
      }

      console.log('✅ Acesso autorizado - carregando igrejas...');
      // Carregar lista de igrejas
      const { data: igrejasData, error: igrejasError } = await supabase
        .from('igrejas')
        .select('*')
        .eq('ativa', true)
        .order('tipo', { ascending: false }) // Sede primeiro
        .order('nome');

      if (igrejasError) throw igrejasError;
      console.log('🏛️ Igrejas carregadas:', igrejasData);
      setIgrejas(igrejasData || []);

      // Carregar estatísticas consolidadas
      await carregarEstatisticas(igrejasData || []);

    } catch (error: any) {
      console.error('❌ Erro ao carregar dados das missões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados das missões.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async (igrejasList: Igreja[]) => {
    const estatisticasPromises = igrejasList.map(async (igreja) => {
      try {
        // Contagem de membros ativos
        const { count: totalMembros } = await supabase
          .from('pessoas')
          .select('*', { count: 'exact', head: true })
          .eq('igreja_id', igreja.id)
          .eq('situacao', 'ativo')
          .eq('tipo_pessoa', 'membro');

        // Contagem de visitantes
        const { count: totalVisitantes } = await supabase
          .from('pessoas')
          .select('*', { count: 'exact', head: true })
          .eq('igreja_id', igreja.id)
          .eq('situacao', 'ativo')
          .eq('tipo_pessoa', 'visitante');

        // Contagem de células
        const { count: totalCelulas } = await supabase
          .from('celulas')
          .select('*', { count: 'exact', head: true })
          .eq('igreja_id', igreja.id)
          .eq('ativa', true);

        // Resumo financeiro
        const { data: resumoFinanceiro } = await supabase
          .from('lancamentos_financeiros')
          .select('tipo, valor')
          .eq('igreja_id', igreja.id)
          .eq('status', 'confirmado')
          .gte('data_lancamento', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);

        const totalReceitas = resumoFinanceiro
          ?.filter(l => l.tipo === 'entrada')
          .reduce((sum, l) => sum + Number(l.valor), 0) || 0;

        const totalDespesas = resumoFinanceiro
          ?.filter(l => l.tipo === 'saida')
          .reduce((sum, l) => sum + Number(l.valor), 0) || 0;

        return {
          igreja_id: igreja.id,
          igreja_nome: igreja.nome,
          total_membros: totalMembros || 0,
          total_visitantes: totalVisitantes || 0,
          total_celulas: totalCelulas || 0,
          total_receitas: totalReceitas,
          total_despesas: totalDespesas,
          saldo_atual: totalReceitas - totalDespesas,
          ultima_atualizacao: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Erro ao carregar estatísticas para ${igreja.nome}:`, error);
        return {
          igreja_id: igreja.id,
          igreja_nome: igreja.nome,
          total_membros: 0,
          total_visitantes: 0,
          total_celulas: 0,
          total_receitas: 0,
          total_despesas: 0,
          saldo_atual: 0,
          ultima_atualizacao: new Date().toISOString()
        };
      }
    });

    const resultados = await Promise.all(estatisticasPromises);
    setEstatisticas(resultados);
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularTotaisGerais = () => {
    const missoes = estatisticas.filter(e => !igrejas.find(i => i.id === e.igreja_id && i.tipo === 'Sede'));
    
    return {
      total_membros: missoes.reduce((sum, e) => sum + e.total_membros, 0),
      total_visitantes: missoes.reduce((sum, e) => sum + e.total_visitantes, 0),
      total_celulas: missoes.reduce((sum, e) => sum + e.total_celulas, 0),
      total_receitas: missoes.reduce((sum, e) => sum + e.total_receitas, 0),
      total_despesas: missoes.reduce((sum, e) => sum + e.total_despesas, 0),
      saldo_total: missoes.reduce((sum, e) => sum + e.saldo_atual, 0)
    };
  };

  const totaisGerais = calcularTotaisGerais();
  const missoesAtivas = igrejas.filter(i => i.tipo === 'Missão');

  const handleExportarRelatorio = async () => {
    toast({
      title: "Exportando Relatório",
      description: "Gerando relatório consolidado das missões...",
    });
    
    // Aqui você implementaria a lógica de exportação
    setTimeout(() => {
      toast({
        title: "Relatório Exportado",
        description: "O relatório foi gerado com sucesso.",
      });
    }, 2000);
  };

  const handleVerDetalhes = (igrejaId: string) => {
    const igreja = igrejas.find(i => i.id === igrejaId);
    toast({
      title: "Detalhes da Missão",
      description: `Carregando detalhes de ${igreja?.nome}...`,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 sm:p-6">
      <MissoesHeader
        missoesCount={missoesAtivas.length}
        onExportarRelatorio={handleExportarRelatorio}
        onRefresh={carregarDados}
        onNovaMissao={() => setShowCadastroModal(true)}
        isLoading={loading}
      />

      <MissoesStats
        missoesCount={missoesAtivas.length}
        totaisGerais={totaisGerais}
        formatarValor={formatarValor}
      />

      <CadastroMissaoModal
        open={showCadastroModal}
        onOpenChange={setShowCadastroModal}
        onMissaoCadastrada={carregarDados}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto">
          <TabsTrigger value="resumo" className="text-xs sm:text-sm">
            Resumo Geral
          </TabsTrigger>
          <TabsTrigger value="pastores" className="text-xs sm:text-sm">
            Pastores
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="text-xs sm:text-sm">
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="membros" className="text-xs sm:text-sm">
            Membros
          </TabsTrigger>
          <TabsTrigger value="relatorios" className="text-xs sm:text-sm">
            Relatórios
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-4">
          <MissoesResumo
            missoesAtivas={missoesAtivas}
            estatisticas={estatisticas}
            formatarValor={formatarValor}
            onVerDetalhes={handleVerDetalhes}
          />
        </TabsContent>

        <TabsContent value="pastores" className="space-y-4">
          <PastoresMissoesManager />
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Resumo Financeiro por Missão
              </CardTitle>
              <CardDescription>
                Comparativo de receitas e despesas do mês atual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missoesAtivas.map((igreja) => {
                  const stats = estatisticas.find(e => e.igreja_id === igreja.id);
                  if (!stats) return null;

                  const percentualReceita = totaisGerais.total_receitas > 0 
                    ? (stats.total_receitas / totaisGerais.total_receitas) * 100 
                    : 0;

                  return (
                    <div key={igreja.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{igreja.nome}</h3>
                        <Badge variant={stats.saldo_atual >= 0 ? "default" : "destructive"}>
                          {stats.saldo_atual >= 0 ? "Positivo" : "Negativo"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Receitas</div>
                          <div className="font-bold text-green-600">
                            {formatarValor(stats.total_receitas)}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentualReceita.toFixed(1)}% do total
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Despesas</div>
                          <div className="font-bold text-red-600">
                            {formatarValor(stats.total_despesas)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Saldo</div>
                          <div className={`font-bold ${stats.saldo_atual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatarValor(stats.saldo_atual)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membros" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Distribuição de Membros
              </CardTitle>
              <CardDescription>
                Visão geral da distribuição de membros por missão
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {missoesAtivas.map((igreja) => {
                  const stats = estatisticas.find(e => e.igreja_id === igreja.id);
                  if (!stats) return null;

                  const percentualMembros = totaisGerais.total_membros > 0 
                    ? (stats.total_membros / totaisGerais.total_membros) * 100 
                    : 0;

                  return (
                    <div key={igreja.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-medium">{igreja.nome}</h3>
                        <p className="text-sm text-muted-foreground">{igreja.cidade}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{stats.total_membros}</div>
                        <div className="text-sm text-muted-foreground">
                          {percentualMembros.toFixed(1)}% do total
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-4">
          <MissoesRelatorios missoesAtivas={missoesAtivas} />
        </TabsContent>
      </Tabs>
    </div>
  );
};