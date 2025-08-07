import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Trophy, 
  Star, 
  Target, 
  TrendingUp, 
  Award, 
  Medal,
  Crown,
  Zap,
  Gift,
  Users,
  BookOpen,
  GraduationCap
} from 'lucide-react';

interface Badge {
  id: string;
  nome: string;
  descricao: string;
  icon: string;
  cor: string;
  criterios: any;
  pontos_recompensa: number;
}

interface Conquista {
  id: string;
  pessoa_id: string;
  badge_id: string;
  pontos_ganhos: number;
  data_conquista: string;
  badge?: Badge;
}

interface Ranking {
  pessoa_id: string;
  nome: string;
  total_pontos: number;
  badges_count: number;
  cursos_concluidos: number;
  posicao: number;
}

export const GamificationSystem = () => {
  const { toast } = useToast();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [conquistas, setConquistas] = useState<Conquista[]>([]);
  const [ranking, setRanking] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);

  // Badges pré-definidos do sistema
  const defaultBadges = [
    {
      nome: 'Primeira Matrícula',
      descricao: 'Realizou sua primeira matrícula em um curso',
      icon: '🎓',
      cor: '#3B82F6',
      criterios: { tipo: 'matricula', quantidade: 1 },
      pontos_recompensa: 50
    },
    {
      nome: 'Estudante Dedicado',
      descricao: 'Concluiu 3 cursos com nota superior a 8',
      icon: '📚',
      cor: '#10B981',
      criterios: { tipo: 'conclusao_curso', quantidade: 3, nota_minima: 8 },
      pontos_recompensa: 200
    },
    {
      nome: 'Presença Exemplar',
      descricao: '100% de presença em pelo menos 2 cursos',
      icon: '✅',
      cor: '#F59E0B',
      criterios: { tipo: 'presenca_perfeita', quantidade: 2 },
      pontos_recompensa: 150
    },
    {
      nome: 'Líder em Formação',
      descricao: 'Concluiu trilha completa de liderança',
      icon: '👑',
      cor: '#8B5CF6',
      criterios: { tipo: 'trilha_completa', trilha: 'lideranca' },
      pontos_recompensa: 300
    },
    {
      nome: 'Evangelista',
      descricao: 'Indicou 5 pessoas que se matricularam',
      icon: '🌟',
      cor: '#EF4444',
      criterios: { tipo: 'indicacoes', quantidade: 5 },
      pontos_recompensa: 250
    },
    {
      nome: 'Mestre do Conhecimento',
      descricao: 'Obteve nota máxima em 5 avaliações',
      icon: '🏆',
      cor: '#F97316',
      criterios: { tipo: 'notas_maximas', quantidade: 5 },
      pontos_recompensa: 400
    },
    {
      nome: 'Participativo',
      descricao: 'Participou ativamente de 10 aulas',
      icon: '🗣️',
      cor: '#06B6D4',
      criterios: { tipo: 'participacao_ativa', quantidade: 10 },
      pontos_recompensa: 100
    },
    {
      nome: 'Maratonista',
      descricao: 'Concluiu 10 cursos em 1 ano',
      icon: '🏃',
      cor: '#84CC16',
      criterios: { tipo: 'cursos_ano', quantidade: 10 },
      pontos_recompensa: 500
    }
  ];

  useEffect(() => {
    loadGamificationData();
  }, []);

  const loadGamificationData = async () => {
    setLoading(true);
    try {
      // Temporariamente usando dados mock até as tabelas serem sincronizadas
      console.log('Carregando dados de gamificação...');
      
      // Mock data para desenvolvimento
      setBadges([]);
      setConquistas([]);
      setRanking([]);
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeBadges = async () => {
    try {
      const { error } = await supabase
        .from('badges_ensino')
        .insert(defaultBadges);

      if (error) throw error;

      toast({
        title: "Badges Inicializados!",
        description: "Sistema de badges configurado com sucesso",
      });

      loadGamificationData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao inicializar badges",
        variant: "destructive",
      });
    }
  };

  const processAchievements = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('process-achievements');
      
      if (error) throw error;

      toast({
        title: "Conquistas Processadas!",
        description: `${data.new_achievements} novas conquistas identificadas`,
      });

      loadGamificationData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Falha ao processar conquistas",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Trophy, Star, Target, TrendingUp, Award, Medal, Crown, Zap, Gift, Users, BookOpen, GraduationCap
    };
    return iconMap[iconName] || Trophy;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Sistema de Gamificação</h2>
        </div>
        <div className="flex gap-2">
          <Button onClick={processAchievements} variant="outline">
            <Zap className="h-4 w-4 mr-2" />
            Processar Conquistas
          </Button>
          {badges.length === 0 && (
            <Button onClick={initializeBadges}>
              <Gift className="h-4 w-4 mr-2" />
              Inicializar Badges
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="badges">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges">Badges & Conquistas</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="badges" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <Card key={badge.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">{badge.icon}</div>
                    <Badge variant="secondary">{badge.pontos_recompensa} pts</Badge>
                  </div>
                  <CardTitle className="text-lg">{badge.nome}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{badge.descricao}</p>
                  <div className="mt-3 p-2 bg-muted rounded-lg">
                    <p className="text-xs font-mono">
                      {JSON.stringify(badge.criterios, null, 1)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Conquistas Recentes</CardTitle>
              <CardDescription>Últimas conquistas dos alunos</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conquistas.slice(0, 10).map((conquista) => (
                  <div key={conquista.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{conquista.badge?.icon}</div>
                      <div>
                        <p className="font-medium">{conquista.badge?.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(conquista.data_conquista).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">+{conquista.pontos_ganhos} pts</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Geral</CardTitle>
              <CardDescription>Os alunos mais engajados do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {ranking.map((aluno, index) => (
                  <div key={aluno.pessoa_id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{aluno.nome}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{aluno.badges_count} badges</span>
                          <span>{aluno.cursos_concluidos} cursos</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{aluno.total_pontos.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">pontos</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Pontuação</CardTitle>
              <CardDescription>Defina os pontos para cada ação</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Matrícula em Curso</label>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue="10" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    <span className="text-sm text-muted-foreground">pontos</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Conclusão de Curso</label>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue="100" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    <span className="text-sm text-muted-foreground">pontos</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Presença em Aula</label>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue="5" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    <span className="text-sm text-muted-foreground">pontos</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nota Máxima</label>
                  <div className="flex items-center gap-2">
                    <input type="number" defaultValue="20" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
                    <span className="text-sm text-muted-foreground">pontos</span>
                  </div>
                </div>
              </div>
              <Button>Salvar Configurações</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{badges.length}</div>
                  <p className="text-sm text-muted-foreground">Badges Ativos</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{conquistas.length}</div>
                  <p className="text-sm text-muted-foreground">Conquistas Totais</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{ranking.length}</div>
                  <p className="text-sm text-muted-foreground">Alunos Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};