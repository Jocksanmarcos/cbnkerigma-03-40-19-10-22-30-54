import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  Users,
  X,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AlertaEngajamento {
  id: string;
  pessoaId: string;
  pessoaNome: string;
  tipoAlerta: 'ultimo_acesso' | 'progresso_atrasado' | 'sem_atividade' | 'meta_nao_cumprida';
  criticidade: 'baixa' | 'media' | 'alta';
  mensagem: string;
  dataDeteccao: string;
  resolvido: boolean;
  acaoSugerida?: string;
}

interface AlertSystemProps {
  celulaId?: string;
  regiao?: string;
  scope?: 'discipulador' | 'supervisor' | 'coordenador';
}

export const AlertSystem: React.FC<AlertSystemProps> = ({
  celulaId,
  regiao,
  scope = 'discipulador'
}) => {
  const { user } = useAuth();
  const [alertas, setAlertas] = useState<AlertaEngajamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAlertas();
    }
  }, [user, celulaId, regiao, scope]);

  const fetchAlertas = async () => {
    try {
      setLoading(true);
      
      // Simulação de alertas baseados em dados reais
      // Em produção, isso seria calculado por uma função do banco ou job
      const alertasSimulados: AlertaEngajamento[] = [
        {
          id: '1',
          pessoaId: 'p1',
          pessoaNome: 'Maria Silva',
          tipoAlerta: 'ultimo_acesso',
          criticidade: 'alta',
          mensagem: 'Não acessa o portal há 18 dias',
          dataDeteccao: new Date().toISOString(),
          resolvido: false,
          acaoSugerida: 'Entrar em contato por WhatsApp ou telefone'
        },
        {
          id: '2',
          pessoaId: 'p2',
          pessoaNome: 'João Santos',
          tipoAlerta: 'progresso_atrasado',
          criticidade: 'media',
          mensagem: 'Progresso de 15% após 12 dias na trilha',
          dataDeteccao: new Date().toISOString(),
          resolvido: false,
          acaoSugerida: 'Agendar reunião de acompanhamento'
        },
        {
          id: '3',
          pessoaId: 'p3',
          pessoaNome: 'Ana Costa',
          tipoAlerta: 'sem_atividade',
          criticidade: 'media',
          mensagem: 'Não completou nenhuma aula na última semana',
          dataDeteccao: new Date().toISOString(),
          resolvido: false,
          acaoSugerida: 'Verificar dificuldades ou impedimentos'
        }
      ];

      setAlertas(alertasSimulados);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolverAlerta = async (alertaId: string) => {
    try {
      // Em produção, atualizar no banco de dados
      setAlertas(prev => 
        prev.map(alerta => 
          alerta.id === alertaId 
            ? { ...alerta, resolvido: true }
            : alerta
        )
      );
    } catch (error) {
      console.error('Erro ao resolver alerta:', error);
    }
  };

  const getCriticidadeColor = (criticidade: string) => {
    switch (criticidade) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baixa': return 'secondary';
      default: return 'secondary';
    }
  };

  const getIconeAlerta = (tipo: string) => {
    switch (tipo) {
      case 'ultimo_acesso': return Clock;
      case 'progresso_atrasado': return TrendingDown;
      case 'sem_atividade': return AlertTriangle;
      case 'meta_nao_cumprida': return Users;
      default: return AlertTriangle;
    }
  };

  const alertasAtivos = alertas.filter(a => !a.resolvido);
  const alertasResolvidos = alertas.filter(a => a.resolvido);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-pulse">Carregando alertas...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Engajamento
          </div>
          {alertasAtivos.length > 0 && (
            <Badge variant="destructive">
              {alertasAtivos.length} alerta{alertasAtivos.length !== 1 ? 's' : ''}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Alertas Ativos */}
        {alertasAtivos.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Necessitam Atenção
            </h4>
            {alertasAtivos.map((alerta) => {
              const IconeAlerta = getIconeAlerta(alerta.tipoAlerta);
              return (
                <Alert key={alerta.id} className="border-l-4 border-l-destructive">
                  <IconeAlerta className="h-4 w-4" />
                  <AlertDescription className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{alerta.pessoaNome}</span>
                          <Badge variant={getCriticidadeColor(alerta.criticidade) as any}>
                            {alerta.criticidade}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alerta.mensagem}
                        </p>
                        {alerta.acaoSugerida && (
                          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                            💡 {alerta.acaoSugerida}
                          </p>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resolverAlerta(alerta.id)}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Resolver
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum alerta de engajamento no momento
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os discípulos estão engajados! 🎉
            </p>
          </div>
        )}

        {/* Alertas Resolvidos - Mostrar apenas os últimos 3 */}
        {alertasResolvidos.length > 0 && (
          <div className="space-y-3 border-t pt-4">
            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
              Resolvidos Recentemente
            </h4>
            {alertasResolvidos.slice(0, 3).map((alerta) => {
              const IconeAlerta = getIconeAlerta(alerta.tipoAlerta);
              return (
                <div key={alerta.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div className="flex-1">
                    <span className="text-sm font-medium text-green-800">
                      {alerta.pessoaNome}
                    </span>
                    <p className="text-xs text-green-600">
                      {alerta.mensagem} - Resolvido
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};