import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Medal, 
  Crown, 
  Star,
  TrendingUp,
  Zap,
  Target,
  Award
} from 'lucide-react';
import { ConquistaAluno, RankingItem, PerfilAluno } from '@/hooks/usePortalAluno';

interface GamificacaoPortalProps {
  perfil: PerfilAluno;
  conquistas: ConquistaAluno[];
  ranking: RankingItem[];
}

export const GamificacaoPortal: React.FC<GamificacaoPortalProps> = ({ 
  perfil, 
  conquistas, 
  ranking 
}) => {
  const conquistasRecentes = conquistas.slice(0, 6);
  const rankingTop10 = ranking.slice(0, 10);
  const minhaPosicao = ranking.find(r => r.é_usuario_atual);

  const getCategoriaIcon = (categoria: string) => {
    switch (categoria) {
      case 'ensino': return <Trophy className="h-4 w-4" />;
      case 'participacao': return <Star className="h-4 w-4" />;
      case 'lideranca': return <Crown className="h-4 w-4" />;
      default: return <Medal className="h-4 w-4" />;
    }
  };

  const getPosicaoIcon = (posicao: number) => {
    switch (posicao) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <Trophy className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getPosicaoColor = (posicao: number) => {
    switch (posicao) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-amber-400 to-amber-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Sistema de Gamificação
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="conquistas" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="conquistas">Conquistas</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
          </TabsList>

          <TabsContent value="conquistas" className="space-y-4">
            {conquistasRecentes.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma conquista ainda</h3>
                <p className="text-muted-foreground">
                  Continue seus estudos para desbloquear conquistas!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conquistasRecentes.map((conquista) => (
                  <div 
                    key={conquista.id}
                    className="p-4 bg-gradient-to-r from-white to-accent/10 rounded-lg border hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div 
                        className="w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg"
                        style={{ backgroundColor: conquista.badge_cor }}
                      >
                        {conquista.badge_icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{conquista.badge_nome}</h3>
                        <p className="text-sm text-muted-foreground">
                          {conquista.badge_descricao}
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        +{conquista.pontos_ganhos} pts
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {getCategoriaIcon(conquista.categoria)}
                        <span className="capitalize">{conquista.categoria}</span>
                      </div>
                      <span>
                        {new Date(conquista.data_conquista).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="ranking" className="space-y-4">
            {/* Minha posição em destaque */}
            {minhaPosicao && (
              <div className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border-2 border-primary/20">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Minha Posição
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getPosicaoColor(minhaPosicao.posicao)} flex items-center justify-center text-white font-bold shadow-lg`}>
                      #{minhaPosicao.posicao}
                    </div>
                    <div>
                      <p className="font-semibold">{minhaPosicao.nome}</p>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{minhaPosicao.badges_count} badges</span>
                        <span>{minhaPosicao.cursos_concluidos} cursos</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{minhaPosicao.pontos_total}</p>
                    <p className="text-sm text-muted-foreground">pontos</p>
                  </div>
                </div>
              </div>
            )}

            {/* Top 10 Ranking */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Top 10 - Ranking Geral
              </h3>
              <div className="space-y-2">
                {rankingTop10.map((item) => (
                  <div 
                    key={item.pessoa_id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 ${
                      item.é_usuario_atual 
                        ? 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30' 
                        : 'bg-white hover:bg-accent/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getPosicaoIcon(item.posicao)}
                        <span className="font-bold text-lg">{item.posicao}</span>
                      </div>
                      <div>
                        <p className={`font-semibold ${item.é_usuario_atual ? 'text-primary' : ''}`}>
                          {item.nome}
                          {item.é_usuario_atual && (
                            <Badge variant="secondary" className="ml-2 text-xs">Você</Badge>
                          )}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{item.badges_count} badges</span>
                          <span>{item.cursos_concluidos} cursos</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{item.pontos_total.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">pontos</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="estatisticas" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pontuação por Categoria */}
              <div className="space-y-4">
                <h3 className="font-semibold">Pontuação por Categoria</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                      <span>Ensino</span>
                    </div>
                    <span className="font-semibold">
                      {conquistas
                        .filter(c => c.categoria === 'ensino')
                        .reduce((acc, c) => acc + c.pontos_ganhos, 0)} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-blue-500" />
                      <span>Participação</span>
                    </div>
                    <span className="font-semibold">
                      {conquistas
                        .filter(c => c.categoria === 'participacao')
                        .reduce((acc, c) => acc + c.pontos_ganhos, 0)} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-purple-500" />
                      <span>Liderança</span>
                    </div>
                    <span className="font-semibold">
                      {conquistas
                        .filter(c => c.categoria === 'lideranca')
                        .reduce((acc, c) => acc + c.pontos_ganhos, 0)} pts
                    </span>
                  </div>
                </div>
              </div>

              {/* Progresso Mensal */}
              <div className="space-y-4">
                <h3 className="font-semibold">Atividade Recente</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Conquistas este mês</span>
                    <span className="font-semibold">
                      {conquistas.filter(c => {
                        const conquistaDate = new Date(c.data_conquista);
                        const now = new Date();
                        return conquistaDate.getMonth() === now.getMonth() && 
                               conquistaDate.getFullYear() === now.getFullYear();
                      }).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Pontos este mês</span>
                    <span className="font-semibold">
                      {conquistas
                        .filter(c => {
                          const conquistaDate = new Date(c.data_conquista);
                          const now = new Date();
                          return conquistaDate.getMonth() === now.getMonth() && 
                                 conquistaDate.getFullYear() === now.getFullYear();
                        })
                        .reduce((acc, c) => acc + c.pontos_ganhos, 0)} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Posição no ranking</span>
                    <span className="font-semibold">
                      #{perfil.posicao_ranking || 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};