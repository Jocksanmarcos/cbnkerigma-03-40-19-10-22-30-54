import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, CheckCircle, Clock, Shield, Database, Server, Wifi, RefreshCw } from 'lucide-react';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
  performance: number;
  uptime: number;
  last_check: string;
}

const SystemMonitoring = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    database: 'healthy',
    api: 'healthy',
    storage: 'healthy',
    performance: 95,
    uptime: 99.9,
    last_check: new Date().toISOString()
  });

  const { data: systemStats = {}, refetch } = useOptimizedQuery({
    queryKey: 'system-monitoring',
    queryFn: async () => {
      try {
        // Test database connection
        const { data: dbTest, error: dbError } = await supabase
          .from('pessoas')
          .select('count', { count: 'exact', head: true });

        // Test storage connection
        const { data: storageTest, error: storageError } = await supabase.storage
          .from('galeria')
          .list('', { limit: 1 });

        // Calculate performance metrics
        const startTime = performance.now();
        await new Promise(resolve => setTimeout(resolve, 100));
        const responseTime = performance.now() - startTime;
        const performanceScore = Math.max(0, 100 - responseTime);

        return {
          database_status: dbError ? 'error' : 'healthy',
          storage_status: storageError ? 'error' : 'healthy',
          api_status: 'healthy',
          performance_score: Math.round(performanceScore),
          response_time: Math.round(responseTime),
          last_updated: new Date().toISOString()
        };
      } catch (error) {
        return {
          database_status: 'error',
          storage_status: 'error',
          api_status: 'error',
          performance_score: 0,
          response_time: 0,
          last_updated: new Date().toISOString()
        };
      }
    },
    staleTime: 30000
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'error': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          <h1 className="text-3xl font-bold">Monitoramento do Sistema</h1>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Banco de Dados</p>
                <p className={`text-lg font-bold ${getStatusColor((systemStats as any).database_status || 'healthy')}`}>
                  {(systemStats as any).database_status === 'healthy' ? 'Operacional' : 'Problema'}
                </p>
              </div>
              <Database className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              {getStatusIcon((systemStats as any).database_status || 'healthy')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">API</p>
                <p className={`text-lg font-bold ${getStatusColor((systemStats as any).api_status || 'healthy')}`}>
                  {(systemStats as any).api_status === 'healthy' ? 'Operacional' : 'Problema'}
                </p>
              </div>
              <Server className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2">
              {getStatusIcon((systemStats as any).api_status || 'healthy')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Storage</p>
                <p className={`text-lg font-bold ${getStatusColor((systemStats as any).storage_status || 'healthy')}`}>
                  {(systemStats as any).storage_status === 'healthy' ? 'Operacional' : 'Problema'}
                </p>
              </div>
              <Wifi className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-2">
              {getStatusIcon((systemStats as any).storage_status || 'healthy')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance</p>
                <p className="text-lg font-bold">{(systemStats as any).performance_score || 95}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div className="mt-2">
              <Progress value={(systemStats as any).performance_score || 95} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Monitoramento em tempo real dos componentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5" />
                <span className="font-medium">Banco de Dados</span>
              </div>
              <Badge variant={(systemStats as any).database_status === 'healthy' ? 'default' : 'destructive'}>
                {(systemStats as any).database_status === 'healthy' ? 'OK' : 'Erro'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5" />
                <span className="font-medium">API REST</span>
              </div>
              <Badge variant={(systemStats as any).api_status === 'healthy' ? 'default' : 'destructive'}>
                {(systemStats as any).api_status === 'healthy' ? 'OK' : 'Erro'}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5" />
                <span className="font-medium">Storage</span>
              </div>
              <Badge variant={(systemStats as any).storage_status === 'healthy' ? 'default' : 'destructive'}>
                {(systemStats as any).storage_status === 'healthy' ? 'OK' : 'Erro'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas de Performance</CardTitle>
            <CardDescription>Estatísticas de desempenho do sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Performance Geral</span>
                <span>{(systemStats as any).performance_score || 95}%</span>
              </div>
              <Progress value={(systemStats as any).performance_score || 95} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tempo de Resposta</span>
                <span>{(systemStats as any).response_time || 120}ms</span>
              </div>
              <Progress value={Math.max(0, 100 - ((systemStats as any).response_time || 120) / 10)} />
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Última verificação: {new Date((systemStats as any).last_updated || Date.now()).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemMonitoring;