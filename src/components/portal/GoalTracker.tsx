import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';

interface Meta {
  id: string;
  titulo: string;
  descricao: string;
  tipo: 'discipulados' | 'certificados' | 'celulas' | 'eventos';
  missao?: string;
  quantidadeAlvo: number;
  quantidadeAtual: number;
  prazoLimite: string;
  status: 'em_andamento' | 'concluida' | 'atrasada' | 'pausada';
  responsavel?: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

interface GoalTrackerProps {
  metas: Meta[];
  groupBy?: 'missao' | 'tipo' | 'responsavel';
  onEditarMeta?: (metaId: string) => void;
  onCriarMeta?: () => void;
}

export const GoalTracker: React.FC<GoalTrackerProps> = ({
  metas = [],
  groupBy = 'tipo',
  onEditarMeta,
  onCriarMeta
}) => {
  const [metasAgrupadas, setMetasAgrupadas] = useState<Record<string, Meta[]>>({});

  useEffect(() => {
    const agrupadas = metas.reduce((acc, meta) => {
      let chave = '';
      switch (groupBy) {
        case 'missao':
          chave = meta.missao || 'Sem Missão';
          break;
        case 'tipo':
          chave = meta.tipo;
          break;
        case 'responsavel':
          chave = meta.responsavel || 'Sem Responsável';
          break;
      }
      
      if (!acc[chave]) {
        acc[chave] = [];
      }
      acc[chave].push(meta);
      return acc;
    }, {} as Record<string, Meta[]>);

    setMetasAgrupadas(agrupadas);
  }, [metas, groupBy]);

  const calcularPercentual = (meta: Meta) => {
    return Math.min((meta.quantidadeAtual / meta.quantidadeAlvo) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluida': return 'bg-green-500';
      case 'em_andamento': return 'bg-blue-500';
      case 'atrasada': return 'bg-red-500';
      case 'pausada': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluida': return CheckCircle;
      case 'em_andamento': return Clock;
      case 'atrasada': return AlertCircle;
      case 'pausada': return Clock;
      default: return Target;
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'discipulados': return Target;
      case 'certificados': return CheckCircle;
      case 'celulas': return TrendingUp;
      case 'eventos': return BarChart3;
      default: return Target;
    }
  };

  const formatarTipo = (tipo: string) => {
    switch (tipo) {
      case 'discipulados': return 'Discipulados';
      case 'certificados': return 'Certificados';
      case 'celulas': return 'Células';
      case 'eventos': return 'Eventos';
      default: return tipo;
    }
  };

  const diasRestantes = (prazoLimite: string) => {
    const hoje = new Date();
    const prazo = new Date(prazoLimite);
    const diferenca = prazo.getTime() - hoje.getTime();
    return Math.ceil(diferenca / (1000 * 3600 * 24));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Metas e Objetivos
          </div>
          {onCriarMeta && (
            <Button size="sm" onClick={onCriarMeta}>
              Nova Meta
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(metasAgrupadas).length > 0 ? (
          Object.entries(metasAgrupadas).map(([grupo, metasDoGrupo]) => (
            <div key={grupo} className="space-y-4">
              <h4 className="font-semibold text-lg border-b pb-2">
                {formatarTipo(grupo)}
              </h4>
              
              <div className="space-y-4">
                {metasDoGrupo.map((meta) => {
                  const percentual = calcularPercentual(meta);
                  const diasRest = diasRestantes(meta.prazoLimite);
                  const StatusIcon = getStatusIcon(meta.status);
                  const TipoIcon = getTipoIcon(meta.tipo);
                  
                  return (
                    <div key={meta.id} className="border rounded-lg p-4 space-y-3">
                      {/* Header da Meta */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`
                            p-2 rounded-lg
                            ${meta.status === 'concluida' ? 'bg-green-100' : ''}
                            ${meta.status === 'em_andamento' ? 'bg-blue-100' : ''}
                            ${meta.status === 'atrasada' ? 'bg-red-100' : ''}
                            ${meta.status === 'pausada' ? 'bg-yellow-100' : ''}
                          `}>
                            <TipoIcon className={`
                              h-5 w-5
                              ${meta.status === 'concluida' ? 'text-green-600' : ''}
                              ${meta.status === 'em_andamento' ? 'text-blue-600' : ''}
                              ${meta.status === 'atrasada' ? 'text-red-600' : ''}
                              ${meta.status === 'pausada' ? 'text-yellow-600' : ''}
                            `} />
                          </div>
                          <div>
                            <h5 className="font-semibold">{meta.titulo}</h5>
                            <p className="text-sm text-muted-foreground">{meta.descricao}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={`${getStatusColor(meta.status)} text-white border-0`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {meta.status.replace('_', ' ')}
                          </Badge>
                          
                          {meta.prioridade === 'alta' && (
                            <Badge variant="destructive">
                              Alta Prioridade
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Progresso */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Progresso: {meta.quantidadeAtual} / {meta.quantidadeAlvo}
                          </span>
                          <span className="font-semibold">
                            {percentual.toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={percentual} className="h-2" />
                      </div>

                      {/* Informações adicionais */}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {diasRest > 0 
                                ? `${diasRest} dias restantes`
                                : diasRest === 0
                                ? 'Vence hoje'
                                : `${Math.abs(diasRest)} dias de atraso`
                              }
                            </span>
                          </div>
                          {meta.responsavel && (
                            <span>Responsável: {meta.responsavel}</span>
                          )}
                        </div>
                        
                        {onEditarMeta && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => onEditarMeta(meta.id)}
                          >
                            Editar
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Target className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhuma meta definida ainda
            </p>
            {onCriarMeta && (
              <Button variant="outline" className="mt-3" onClick={onCriarMeta}>
                Criar Primeira Meta
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};