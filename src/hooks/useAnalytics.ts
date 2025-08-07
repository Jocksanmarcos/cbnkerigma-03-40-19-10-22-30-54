import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PageViewStats {
  page_path: string;
  views: number;
  unique_sessions: number;
}

export interface EngagementMetrics {
  total_page_views: number;
  unique_sessions: number;
  avg_session_duration: number;
  bounce_rate: number;
  top_pages: PageViewStats[];
}

export interface EventParticipation {
  evento_id: string;
  evento_titulo: string;
  total_inscricoes: number;
  total_check_ins: number;
  taxa_comparecimento: number;
}

export const useAnalytics = () => {
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [eventParticipation, setEventParticipation] = useState<EventParticipation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const trackPageView = async (pagePath: string) => {
    try {
      const sessionId = sessionStorage.getItem('session_id') || 
        crypto.randomUUID();
      sessionStorage.setItem('session_id', sessionId);

      await supabase.from('page_views').insert({
        page_path: pagePath,
        user_session: sessionId,
        referrer: document.referrer || null
      });
    } catch (error) {
      console.error('Erro ao registrar page view:', error);
    }
  };

  const fetchEngagementMetrics = async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      // Buscar page views do período
      const { data: pageViews, error } = await supabase
        .from('page_views')
        .select('page_path, user_session, created_at')
        .gte('created_at', start)
        .lt('created_at', end);

      if (error) throw error;

      // Processar métricas
      const totalViews = pageViews?.length || 0;
      const uniqueSessions = new Set(pageViews?.map(pv => pv.user_session)).size;
      
      // Agrupar por página
      const pageStats: Record<string, { views: number; sessions: Set<string> }> = {};
      pageViews?.forEach(pv => {
        if (!pageStats[pv.page_path]) {
          pageStats[pv.page_path] = { views: 0, sessions: new Set() };
        }
        pageStats[pv.page_path].views++;
        pageStats[pv.page_path].sessions.add(pv.user_session);
      });

      const topPages: PageViewStats[] = Object.entries(pageStats)
        .map(([path, stats]) => ({
          page_path: path,
          views: stats.views,
          unique_sessions: stats.sessions.size
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      setEngagementMetrics({
        total_page_views: totalViews,
        unique_sessions: uniqueSessions,
        avg_session_duration: 0, // Calcularia com mais dados
        bounce_rate: 0, // Calcularia com mais dados
        top_pages: topPages
      });

    } catch (error) {
      console.error('Erro ao buscar métricas:', error);
      toast({
        title: "Erro ao carregar métricas",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEventParticipation = async (startDate?: string, endDate?: string) => {
    setIsLoading(true);
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      const { data, error } = await supabase
        .from('participacao_eventos')
        .select(`
          evento_id,
          status,
          check_in_at,
          eventos!inner(titulo, data_inicio)
        `)
        .gte('created_at', start)
        .lt('created_at', end);

      if (error) throw error;

      // Agrupar por evento
      const eventStats: Record<string, {
        titulo: string;
        total_inscricoes: number;
        total_check_ins: number;
      }> = {};

      data?.forEach(p => {
        const evento = p.eventos as any;
        if (!eventStats[p.evento_id]) {
          eventStats[p.evento_id] = {
            titulo: evento.titulo,
            total_inscricoes: 0,
            total_check_ins: 0
          };
        }
        
        if (p.status === 'confirmado') {
          eventStats[p.evento_id].total_inscricoes++;
        }
        
        if (p.check_in_at) {
          eventStats[p.evento_id].total_check_ins++;
        }
      });

      const participation: EventParticipation[] = Object.entries(eventStats)
        .map(([evento_id, stats]) => ({
          evento_id,
          evento_titulo: stats.titulo,
          total_inscricoes: stats.total_inscricoes,
          total_check_ins: stats.total_check_ins,
          taxa_comparecimento: stats.total_inscricoes > 0 
            ? (stats.total_check_ins / stats.total_inscricoes) * 100 
            : 0
        }));

      setEventParticipation(participation);

    } catch (error) {
      console.error('Erro ao buscar participação em eventos:', error);
      toast({
        title: "Erro ao carregar participação",
        description: "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEngagementMetrics();
    fetchEventParticipation();
  }, []);

  return {
    engagementMetrics,
    eventParticipation,
    isLoading,
    trackPageView,
    fetchEngagementMetrics,
    fetchEventParticipation
  };
};