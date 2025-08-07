import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Users, 
  TreePine,
  ChevronDown,
  ChevronRight,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CelulaComFilhas {
  id: string;
  nome: string;
  lider: string;
  bairro: string;
  dia_semana: string;
  horario: string;
  membros_atual: number;
  membros_maximo: number;
  ativa: boolean;
  celula_mae_id?: string;
  data_multiplicacao?: string;
  geracao: number;
  arvore_genealogica?: string;
  data_inicio?: string;
  filhas?: CelulaComFilhas[];
}

interface EstatisticasMultiplicacao {
  total_celulas_originais: number;
  total_celulas_multiplicadas: number;
  geracao_maxima: number;
  celulas_por_geracao: any; // Usando any para simplificar
}

export const ArvoreMultiplicacao = () => {
  const [arvoreCompleta, setArvoreCompleta] = useState<CelulaComFilhas[]>([]);
  const [estatisticas, setEstatisticas] = useState<EstatisticasMultiplicacao | null>(null);
  const [celulasExpandidas, setCelulasExpandidas] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArvoreMultiplicacao();
    fetchEstatisticas();
  }, []);

  const fetchArvoreMultiplicacao = async () => {
    try {
      const { data: celulas, error } = await supabase
        .from('celulas')
        .select('*')
        .order('geracao', { ascending: true })
        .order('nome');

      if (error) throw error;

      // Construir árvore hierárquica
      const arvore = construirArvore(celulas || []);
      setArvoreCompleta(arvore);
    } catch (error) {
      console.error('Erro ao buscar árvore de multiplicação:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar árvore de multiplicação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEstatisticas = async () => {
    try {
      const { data, error } = await supabase.rpc('obter_estatisticas_multiplicacao');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const stats = data[0];
        setEstatisticas({
          total_celulas_originais: stats.total_celulas_originais,
          total_celulas_multiplicadas: stats.total_celulas_multiplicadas,
          geracao_maxima: stats.geracao_maxima,
          celulas_por_geracao: stats.celulas_por_geracao
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  };

  const construirArvore = (celulas: any[]): CelulaComFilhas[] => {
    const mapaFilhas: Record<string, CelulaComFilhas[]> = {};
    const celulasOriginais: CelulaComFilhas[] = [];

    // Primeira passada: converter e separar
    const todasCelulas = celulas.map(c => ({
      ...c,
      filhas: []
    }));

    // Segunda passada: organizar hierarquia
    todasCelulas.forEach(celula => {
      if (celula.celula_mae_id) {
        // É uma célula filha
        if (!mapaFilhas[celula.celula_mae_id]) {
          mapaFilhas[celula.celula_mae_id] = [];
        }
        mapaFilhas[celula.celula_mae_id].push(celula);
      } else {
        // É uma célula original
        celulasOriginais.push(celula);
      }
    });

    // Terceira passada: conectar filhas às mães
    const conectarFilhas = (celula: CelulaComFilhas) => {
      if (mapaFilhas[celula.id]) {
        celula.filhas = mapaFilhas[celula.id];
        celula.filhas.forEach(conectarFilhas);
      }
    };

    celulasOriginais.forEach(conectarFilhas);
    return celulasOriginais;
  };

  const toggleExpansao = (celulaId: string) => {
    const novasExpandidas = new Set(celulasExpandidas);
    if (novasExpandidas.has(celulaId)) {
      novasExpandidas.delete(celulaId);
    } else {
      novasExpandidas.add(celulaId);
    }
    setCelulasExpandidas(novasExpandidas);
  };

  const renderCelula = (celula: CelulaComFilhas, nivel: number = 0) => {
    const temFilhas = celula.filhas && celula.filhas.length > 0;
    const expandida = celulasExpandidas.has(celula.id);
    const indentacao = `${nivel * 24}px`;

    return (
      <div key={celula.id} className="space-y-2">
        <div 
          className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          style={{ marginLeft: indentacao }}
        >
          {temFilhas && (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={() => toggleExpansao(celula.id)}
            >
              {expandida ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          )}
          {!temFilhas && <div className="w-6" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-medium text-sm truncate">{celula.nome}</h4>
              <Badge variant={celula.ativa ? "default" : "secondary"}>
                {celula.geracao}ª Geração
              </Badge>
              {!celula.ativa && (
                <Badge variant="destructive">Inativa</Badge>
              )}
            </div>
            
            <div className="text-xs text-muted-foreground space-y-1">
              <div className="flex items-center space-x-4">
                <span className="flex items-center">
                  <Users className="h-3 w-3 mr-1" />
                  {celula.lider}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {celula.dia_semana}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {celula.horario}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <span>{celula.bairro}</span>
                <span>{celula.membros_atual}/{celula.membros_maximo} membros</span>
                {celula.data_multiplicacao && (
                  <span className="text-purple-600">
                    Multiplicada em {new Date(celula.data_multiplicacao).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>
          </div>

          {temFilhas && (
            <div className="text-xs text-center">
              <div className="font-medium text-green-600">
                {celula.filhas!.length} filha{celula.filhas!.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>

        {temFilhas && expandida && (
          <div className="space-y-2">
            {celula.filhas!.map(filha => renderCelula(filha, nivel + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <TreePine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando árvore de multiplicação...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TreePine className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.total_celulas_originais}</p>
                  <p className="text-xs text-muted-foreground">Células Originais</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">{estatisticas.total_celulas_multiplicadas}</p>
                  <p className="text-xs text-muted-foreground">Células Multiplicadas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {(estatisticas.total_celulas_originais + estatisticas.total_celulas_multiplicadas)}
                  </p>
                  <p className="text-xs text-muted-foreground">Total de Células</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-gradient-to-r from-green-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{estatisticas.geracao_maxima}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold">{estatisticas.geracao_maxima}ª</p>
                  <p className="text-xs text-muted-foreground">Geração Máxima</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Árvore de Multiplicação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TreePine className="h-6 w-6 text-green-600" />
            <span>Árvore Genealógica das Células</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {arvoreCompleta.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Clique nas setas para expandir/contrair as gerações
                </p>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const todasIds = new Set<string>();
                      const coletarIds = (celulas: CelulaComFilhas[]) => {
                        celulas.forEach(c => {
                          todasIds.add(c.id);
                          if (c.filhas) coletarIds(c.filhas);
                        });
                      };
                      coletarIds(arvoreCompleta);
                      setCelulasExpandidas(todasIds);
                    }}
                  >
                    Expandir Todas
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCelulasExpandidas(new Set())}
                  >
                    Contrair Todas
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                {arvoreCompleta.map(celula => renderCelula(celula))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <TreePine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma célula encontrada</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribuição por Geração */}
      {estatisticas && estatisticas.celulas_por_geracao && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <span>Distribuição por Geração</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(estatisticas.celulas_por_geracao).map(([geracao, quantidade]) => (
                <div key={geracao} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{geracao}ª Geração</span>
                  <Badge variant="outline">{String(quantidade)} células</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};