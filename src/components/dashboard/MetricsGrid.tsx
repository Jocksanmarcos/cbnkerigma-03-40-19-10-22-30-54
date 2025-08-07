import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar,
  DollarSign,
  TrendingUp,
  Heart,
  UserCheck,
  Building2,
  BookOpen,
  Home
} from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePedidosOracao } from '@/hooks/usePedidosOracao';
import { useVoluntarios } from '@/hooks/useVoluntarios';
import { useEventos } from '@/hooks/useEventos';
import { usePessoas } from '@/hooks/usePessoas';
import { useEnsinoCompleto } from '@/hooks/useEnsinoCompleto';
import { Skeleton } from '@/components/ui/skeleton';

export const MetricsGrid = () => {
  const { engagementMetrics, isLoading: analyticsLoading } = useAnalytics();
  const { pedidosPublicos } = usePedidosOracao();
  const { voluntarios } = useVoluntarios();
  const { eventos } = useEventos();
  const { estatisticas } = useEnsinoCompleto();
  
  // Temporariamente removido até configurar tabela relacionamentos_familiares
  const totalFamilias = 0;

  console.log('MetricsGrid - dados:', { 
    analyticsLoading, 
    pedidosPublicos: pedidosPublicos?.length, 
    voluntarios: voluntarios?.length, 
    eventos: eventos?.length,
    totalFamilias
  });

  const formatarNumero = (num: number) => {
    return new Intl.NumberFormat('pt-BR').format(num);
  };

  const metrics = [
    {
      title: 'Membros Ativos',
      value: formatarNumero(voluntarios.filter(v => v.status === 'ativo').length),
      change: '+12%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Eventos Este Mês',
      value: formatarNumero(eventos.length),
      change: '+5%',
      trend: 'up',
      icon: Calendar,
    },
    {
      title: 'Pedidos de Oração',
      value: formatarNumero(pedidosPublicos.length),
      change: '+8%',
      trend: 'up',
      icon: Heart,
    },
    {
      title: 'Voluntários',
      value: formatarNumero(voluntarios.length),
      change: '+3%',
      trend: 'up',
      icon: UserCheck,
    },
    {
      title: 'Visualizações',
      value: formatarNumero(engagementMetrics?.total_page_views || 0),
      change: '+15%',
      trend: 'up',
      icon: TrendingUp,
    },
    {
      title: 'Sessões Únicas',
      value: formatarNumero(engagementMetrics?.unique_sessions || 0),
      change: '+10%',
      trend: 'up',
      icon: Users,
    },
    {
      title: 'Famílias Cadastradas',
      value: formatarNumero(totalFamilias),
      change: '+6%',
      trend: 'up',
      icon: Home,
    },
    {
      title: 'Cursos Ativos',
      value: formatarNumero(estatisticas?.total_cursos || 0),
      change: '+2%',
      trend: 'up',
      icon: BookOpen,
    },
    {
      title: 'Espaços Reservados',
      value: '8',
      change: '+25%',
      trend: 'up',
      icon: Building2,
    }
  ];

  if (analyticsLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {Array(9).fill(0).map((_, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-2 sm:p-3 md:p-4">
              <Skeleton className="h-3 sm:h-4 md:h-5 w-3/4 mb-1 sm:mb-2" />
              <Skeleton className="h-5 sm:h-6 md:h-7 w-full mb-1 sm:mb-2" />
              <Skeleton className="h-2 sm:h-3 md:h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <Card key={index} className="platform-card hover:shadow-primary/10">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex flex-col space-y-2 sm:space-y-2.5 md:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-[9px] sm:text-[10px] md:text-[11px] px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${metric.trend === 'up' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-red-600 border-red-200 bg-red-50'}`}
                  >
                    {metric.change}
                  </Badge>
                </div>
                <div className="space-y-1 sm:space-y-1.5">
                  <p className="text-[10px] sm:text-xs md:text-sm font-medium text-muted-foreground line-clamp-2 leading-tight">
                    {metric.title}
                  </p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold gradient-text tracking-tight">
                    {metric.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};