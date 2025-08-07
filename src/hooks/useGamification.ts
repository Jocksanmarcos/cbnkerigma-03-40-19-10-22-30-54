import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface GamificationData {
  totalPoints: number;
  level: number;
  badges: Badge[];
  currentStreak: number;
  weeklyGoal: number;
  weeklyProgress: number;
  ranking: number;
  achievements: Achievement[];
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: Date;
}

interface Achievement {
  id: string;
  type: 'course_complete' | 'cell_attendance' | 'prayer_milestone' | 'donation_goal' | 'study_streak';
  title: string;
  description: string;
  points: number;
  date: Date;
}

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [gamificationData, setGamificationData] = useState<GamificationData>({
    totalPoints: 0,
    level: 1,
    badges: [],
    currentStreak: 0,
    weeklyGoal: 100,
    weeklyProgress: 0,
    ranking: 0,
    achievements: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadGamificationData();
    }
  }, [user]);

  const loadGamificationData = async () => {
    try {
      setLoading(true);

      // Buscar dados de gamificação do usuário
      const { data: userData } = await supabase
        .from('pessoas')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (userData) {
        // Buscar conquistas de ensino
        const { data: conquistas } = await supabase
          .from('conquistas_ensino')
          .select(`
            *,
            badges_ensino (*)
          `)
          .eq('pessoa_id', userData.id);

        // Calcular pontos totais
        const totalPoints = conquistas?.reduce((sum, c) => sum + c.pontos_ganhos, 0) || 0;
        
        // Calcular nível baseado nos pontos
        const level = Math.floor(totalPoints / 100) + 1;

        // Buscar ranking do usuário
        const { data: rankingData } = await supabase
          .rpc('obter_ranking_ensino');

        const userRanking = rankingData?.findIndex((r: any) => r.pessoa_id === userData.id) + 1 || 0;

        // Buscar badges
        const badges: Badge[] = conquistas?.map(c => ({
          id: c.badge_id,
          name: c.badges_ensino?.nome || '',
          description: c.badges_ensino?.descricao || '',
          icon: c.badges_ensino?.icon || '🏆',
          color: c.badges_ensino?.cor || '#6366f1',
          earnedAt: new Date(c.data_conquista)
        })) || [];

        setGamificationData({
          totalPoints,
          level,
          badges,
          currentStreak: calculateStreak(conquistas),
          weeklyGoal: 100,
          weeklyProgress: calculateWeeklyProgress(conquistas),
          ranking: userRanking,
          achievements: conquistas?.map(c => ({
            id: c.id,
            type: 'course_complete',
            title: c.badges_ensino?.nome || 'Conquista',
            description: c.badges_ensino?.descricao || '',
            points: c.pontos_ganhos,
            date: new Date(c.data_conquista)
          })) || []
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados de gamificação:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (conquistas: any[]) => {
    if (!conquistas || conquistas.length === 0) return 0;
    
    // Ordenar por data
    const sorted = conquistas.sort((a, b) => 
      new Date(b.data_conquista).getTime() - new Date(a.data_conquista).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    
    for (const conquista of sorted) {
      const conquistaDate = new Date(conquista.data_conquista);
      const diffDays = Math.floor((currentDate.getTime() - conquistaDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays <= 1) {
        streak++;
        currentDate = conquistaDate;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateWeeklyProgress = (conquistas: any[]) => {
    if (!conquistas) return 0;
    
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    
    const weeklyPoints = conquistas
      .filter(c => new Date(c.data_conquista) >= weekStart)
      .reduce((sum, c) => sum + c.pontos_ganhos, 0);
    
    return weeklyPoints;
  };

  const awardPoints = async (points: number, achievementType: Achievement['type'], title: string, description: string) => {
    if (!user) return;

    try {
      // Buscar pessoa
      const { data: pessoa } = await supabase
        .from('pessoas')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!pessoa) return;

      // Criar conquista (se houver badge correspondente)
      const { data: badge } = await supabase
        .from('badges_ensino')
        .select('*')
        .eq('nome', title)
        .single();

      if (badge) {
        await supabase
          .from('conquistas_ensino')
          .insert({
            pessoa_id: pessoa.id,
            badge_id: badge.id,
            pontos_ganhos: points
          });

        // Atualizar dados locais
        setGamificationData(prev => ({
          ...prev,
          totalPoints: prev.totalPoints + points,
          level: Math.floor((prev.totalPoints + points) / 100) + 1,
          achievements: [
            {
              id: `${Date.now()}`,
              type: achievementType,
              title,
              description,
              points,
              date: new Date()
            },
            ...prev.achievements
          ]
        }));

        // Mostrar notificação
        toast({
          title: `+${points} pontos!`,
          description: `${title} - ${description}`,
        });

        // Verificar se subiu de nível
        const newLevel = Math.floor((gamificationData.totalPoints + points) / 100) + 1;
        if (newLevel > gamificationData.level) {
          toast({
            title: `Nível ${newLevel} alcançado! 🎉`,
            description: "Parabéns pelo seu progresso!",
          });
        }
      }
    } catch (error) {
      console.error('Erro ao conceder pontos:', error);
    }
  };

  const getNextLevelProgress = () => {
    const currentLevelMin = (gamificationData.level - 1) * 100;
    const nextLevelMin = gamificationData.level * 100;
    const progress = ((gamificationData.totalPoints - currentLevelMin) / (nextLevelMin - currentLevelMin)) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  const getLeaderboard = async () => {
    try {
      const { data } = await supabase.rpc('obter_ranking_ensino');
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar ranking:', error);
      return [];
    }
  };

  return {
    gamificationData,
    loading,
    awardPoints,
    getNextLevelProgress,
    getLeaderboard,
    refreshData: loadGamificationData
  };
};