import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  MapPin, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Target,
  Church,
  Heart
} from 'lucide-react';

interface MissaoInfo {
  id: string;
  nome: string;
  pais: string;
  cidade?: string;
  descricao?: string;
  membros_atual: number;
  meta_membros?: number;
  orcamento_anual?: number;
  data_inicio?: string;
  status: string;
}

interface EstatisticasMissao {
  total_membros: number;
  total_visitantes: number;
  total_celulas: number;
  receitas_mes: number;
  despesas_mes: number;
  saldo_atual: number;
  crescimento_mensal: number;
}

export const DashboardPastorMissao = () => {
  const [missaoInfo, setMissaoInfo] = useState<MissaoInfo | null>(null);
  const [estatisticas, setEstatisticas] = useState<EstatisticasMissao | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isPastorMissao } = useAuth();

  useEffect(() => {
    if (user && isPastorMissao) {
      carregarDadosMissao();
    }
  }, [user, isPastorMissao]);

  const carregarDadosMissao = async () => {
    try {
      setLoading(true);

      // Obter ID da missão do pastor
      const { data: missaoId } = await supabase.rpc('get_pastor_missao_id');
      
      if (!missaoId) {
        console.log('Pastor não tem missão associada');
        return;
      }

      // Carregar informações da missão
      const { data: missaoData, error: missaoError } = await supabase
        .from('missoes')
        .select('*')
        .eq('id', missaoId)
        .single();

      if (missaoError) throw missaoError;
      setMissaoInfo(missaoData);

      // Carregar estatísticas da missão
      await carregarEstatisticas(missaoId);

    } catch (error: any) {
      console.error('Erro ao carregar dados da missão:', error);
    } finally {
      setLoading(false);
    }
  };

  const carregarEstatisticas = async (missaoId: string) => {
    try {
      // Obter igreja_id da missão
      const { data: missaoData } = await supabase
        .from('missoes')
        .select('igreja_responsavel_id')
        .eq('id', missaoId)
        .single();

      if (!missaoData?.igreja_responsavel_id) return;

      const igrejaId = missaoData.igreja_responsavel_id;

      // Contagem de membros
      const { count: totalMembros } = await supabase
        .from('pessoas')
        .select('*', { count: 'exact', head: true })
        .eq('igreja_id', igrejaId)
        .eq('situacao', 'ativo')
        .eq('tipo_pessoa', 'membro');

      // Contagem de visitantes
      const { count: totalVisitantes } = await supabase
        .from('pessoas')
        .select('*', { count: 'exact', head: true })
        .eq('igreja_id', igrejaId)
        .eq('situacao', 'ativo')
        .eq('tipo_pessoa', 'visitante');

      // Contagem de células
      const { count: totalCelulas } = await supabase
        .from('celulas')
        .select('*', { count: 'exact', head: true })
        .eq('igreja_id', igrejaId)
        .eq('ativa', true);

      // Dados financeiros do mês atual
      const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
      
      const { data: lancamentosFinanceiros } = await supabase
        .from('lancamentos_financeiros')
        .select('tipo, valor')
        .eq('igreja_id', igrejaId)
        .eq('status', 'confirmado')
        .gte('data_lancamento', inicioMes);

      const receitas = lancamentosFinanceiros
        ?.filter(l => l.tipo === 'entrada')
        .reduce((sum, l) => sum + Number(l.valor), 0) || 0;

      const despesas = lancamentosFinanceiros
        ?.filter(l => l.tipo === 'saida')
        .reduce((sum, l) => sum + Number(l.valor), 0) || 0;

      // Crescimento mensal (comparar com mês anterior)
      const inicioMesAnterior = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1).toISOString().split('T')[0];
      const fimMesAnterior = new Date(new Date().getFullYear(), new Date().getMonth(), 0).toISOString().split('T')[0];

      const { count: membrosMesAnterior } = await supabase
        .from('pessoas')
        .select('*', { count: 'exact', head: true })
        .eq('igreja_id', igrejaId)
        .eq('situacao', 'ativo')
        .lte('created_at', fimMesAnterior);

      const crescimentoMensal = totalMembros && membrosMesAnterior 
        ? totalMembros - (membrosMesAnterior || 0)
        : 0;

      setEstatisticas({
        total_membros: totalMembros || 0,
        total_visitantes: totalVisitantes || 0,
        total_celulas: totalCelulas || 0,
        receitas_mes: receitas,
        despesas_mes: despesas,
        saldo_atual: receitas - despesas,
        crescimento_mensal: crescimentoMensal
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const calcularProgressoMeta = () => {
    if (!missaoInfo?.meta_membros || !estatisticas?.total_membros) return 0;
    return Math.min((estatisticas.total_membros / missaoInfo.meta_membros) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!missaoInfo) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Nenhuma missão encontrada para este pastor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Missão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Church className="h-5 w-5" />
                {missaoInfo.nome}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <MapPin className="h-4 w-4" />
                {missaoInfo.cidade}, {missaoInfo.pais}
              </CardDescription>
            </div>
            <Badge variant={missaoInfo.status === 'ativa' ? 'default' : 'secondary'}>
              {missaoInfo.status === 'ativa' ? 'Ativa' : 'Inativa'}
            </Badge>
          </div>
          {missaoInfo.descricao && (
            <p className="text-sm text-muted-foreground mt-2">
              {missaoInfo.descricao}
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total de Membros</p>
                <p className="text-2xl font-bold">{estatisticas?.total_membros || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Visitantes</p>
                <p className="text-2xl font-bold">{estatisticas?.total_visitantes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Células Ativas</p>
                <p className="text-2xl font-bold">{estatisticas?.total_celulas || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Crescimento Mensal</p>
                <p className="text-2xl font-bold text-green-600">
                  +{estatisticas?.crescimento_mensal || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso da Meta */}
      {missaoInfo.meta_membros && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Progresso da Meta de Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Atual: {estatisticas?.total_membros || 0}</span>
                <span>Meta: {missaoInfo.meta_membros}</span>
              </div>
              <Progress value={calcularProgressoMeta()} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {calcularProgressoMeta().toFixed(1)}% da meta alcançada
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Resumo Financeiro - Mês Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Receitas</p>
              <p className="text-lg font-semibold text-green-600">
                {formatarMoeda(estatisticas?.receitas_mes || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-lg font-semibold text-red-600">
                {formatarMoeda(estatisticas?.despesas_mes || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Saldo</p>
              <p className={`text-lg font-semibold ${(estatisticas?.saldo_atual || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatarMoeda(estatisticas?.saldo_atual || 0)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações da Missão */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Missão</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {missaoInfo.data_inicio && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Iniciada em: {new Date(missaoInfo.data_inicio).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {missaoInfo.orcamento_anual && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Orçamento Anual: {formatarMoeda(missaoInfo.orcamento_anual)}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};