import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Activity, 
  UserPlus, 
  Calendar,
  Heart,
  DollarSign,
  BookOpen
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  color: string;
  created_at: string;
}

export const RecentActivity = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentActivities();
  }, []);

  const fetchRecentActivities = async () => {
    try {
      const recentActivities: ActivityItem[] = [];

      // Buscar pessoas recém cadastradas
      const { data: pessoas } = await supabase
        .from('pessoas')
        .select('nome_completo, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      pessoas?.forEach(pessoa => {
        recentActivities.push({
          id: `pessoa-${pessoa.nome_completo}`,
          type: 'member',
          title: 'Novo membro cadastrado',
          description: `${pessoa.nome_completo} se juntou à igreja`,
          time: formatDistanceToNow(new Date(pessoa.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          }),
          icon: UserPlus,
          color: 'bg-primary',
          created_at: pessoa.created_at
        });
      });

      // Buscar eventos recentes
      const { data: eventos } = await supabase
        .from('eventos')
        .select('titulo, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      eventos?.forEach(evento => {
        recentActivities.push({
          id: `evento-${evento.titulo}`,
          type: 'event',
          title: 'Evento criado',
          description: evento.titulo,
          time: formatDistanceToNow(new Date(evento.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          }),
          icon: Calendar,
          color: 'bg-emerald-500',
          created_at: evento.created_at
        });
      });

      // Buscar pedidos de oração recentes
      const { data: pedidos } = await supabase
        .from('pedidos_oracao')
        .select('nome, pedido, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      pedidos?.forEach(pedido => {
        recentActivities.push({
          id: `pedido-${pedido.nome}`,
          type: 'prayer',
          title: 'Pedido de oração',
          description: `${pedido.nome} solicitou oração`,
          time: formatDistanceToNow(new Date(pedido.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          }),
          icon: Heart,
          color: 'bg-pink-500',
          created_at: pedido.created_at
        });
      });

      // Buscar contribuições recentes
      const { data: contribuicoes } = await supabase
        .from('contribuicoes')
        .select('nome, valor, tipo, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

      contribuicoes?.forEach(contribuicao => {
        recentActivities.push({
          id: `contribuicao-${contribuicao.nome}`,
          type: 'financial',
          title: 'Contribuição registrada',
          description: `${contribuicao.tipo} de R$ ${contribuicao.valor} de ${contribuicao.nome}`,
          time: formatDistanceToNow(new Date(contribuicao.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          }),
          icon: DollarSign,
          color: 'bg-accent',
          created_at: contribuicao.created_at
        });
      });

      // Buscar estudos bíblicos recentes
      const { data: estudos } = await supabase
        .from('estudos_biblicos')
        .select('titulo, created_at')
        .order('created_at', { ascending: false })
        .limit(2);

      estudos?.forEach(estudo => {
        recentActivities.push({
          id: `estudo-${estudo.titulo}`,
          type: 'study',
          title: 'Estudo publicado',
          description: estudo.titulo,
          time: formatDistanceToNow(new Date(estudo.created_at), { 
            addSuffix: true, 
            locale: ptBR 
          }),
          icon: BookOpen,
          color: 'bg-secondary',
          created_at: estudo.created_at
        });
      });

      // Ordenar por data de criação (mais recente primeiro) e limitar a 5 itens
      const sortedActivities = recentActivities
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Erro ao buscar atividades recentes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="platform-card">
      <CardHeader className="pb-2 sm:pb-3">
        <CardTitle className="flex items-center space-x-2 text-sm sm:text-base md:text-lg">
          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
          </div>
          <span>Atividades Recentes</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 sm:p-3 md:p-4">
        {loading ? (
          <div className="space-y-2 sm:space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl animate-pulse">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full" />
                <div className="flex-1 space-y-1 sm:space-y-2">
                  <div className="h-3 sm:h-4 bg-muted rounded-lg w-3/4" />
                  <div className="h-2 sm:h-3 bg-muted rounded-lg w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-1 sm:space-y-2">
            {activities.map((activity) => {
              const Icon = activity.icon;
              
              return (
                <div key={activity.id} className="group flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 rounded-lg sm:rounded-xl hover:bg-muted/50 transition-all duration-200 touch-manipulation">
                  <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-white ${activity.color} flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-0.5 sm:gap-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-xs sm:text-sm leading-tight truncate">{activity.title}</p>
                        <Badge variant="outline" className="text-[8px] sm:text-[9px] md:text-[10px] px-1 sm:px-2 py-0.5 rounded-full shrink-0">
                          {activity.time}
                        </Badge>
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 text-muted-foreground">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Activity className="h-6 w-6 sm:h-8 sm:w-8 opacity-50" />
            </div>
            <p className="text-xs sm:text-sm">Nenhuma atividade recente encontrada</p>
          </div>
        )}
        
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/50">
          <button className="text-xs sm:text-sm text-primary hover:text-primary/80 w-full text-center py-1.5 sm:py-2 touch-manipulation transition-colors font-medium">
            Ver todas as atividades →
          </button>
        </div>
      </CardContent>
    </Card>
  );
};