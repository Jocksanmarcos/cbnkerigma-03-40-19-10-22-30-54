import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Zap, 
  BookOpen, 
  Target, 
  Trophy,
  Calendar,
  Users,
  Star,
  PlayCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AcaoRapida {
  id: string;
  titulo: string;
  descricao: string;
  icon: React.ComponentType<any>;
  acao: () => void;
  disponivel: boolean;
  badge?: {
    texto: string;
    variante: 'default' | 'secondary' | 'destructive' | 'outline';
  };
}

interface ActionCenterProps {
  trilhasDisponiveis: number;
  cursosEmAndamento: number;
  conquistasDesbloqueadas: number;
  proximaAula?: {
    nome: string;
    data: string;
    horario: string;
  };
  onExplorarCursos: () => void;
  onVerTrilhas: () => void;
  onMinhasConquistas: () => void;
  onIniciarProximaAula?: () => void;
}

export const ActionCenter: React.FC<ActionCenterProps> = ({
  trilhasDisponiveis,
  cursosEmAndamento,
  conquistasDesbloqueadas,
  proximaAula,
  onExplorarCursos,
  onVerTrilhas,
  onMinhasConquistas,
  onIniciarProximaAula
}) => {
  const acoes: AcaoRapida[] = [
    {
      id: 'explorar-cursos',
      titulo: 'Explorar Cursos',
      descricao: 'Descubra novos cursos disponíveis para sua jornada',
      icon: BookOpen,
      acao: onExplorarCursos,
      disponivel: true,
      badge: cursosEmAndamento > 0 ? {
        texto: `${cursosEmAndamento} em andamento`,
        variante: 'secondary'
      } : undefined
    },
    {
      id: 'ver-trilhas',
      titulo: 'Ver Trilhas DNA',
      descricao: 'Acompanhe seu progresso nas trilhas de discipulado',
      icon: Target,
      acao: onVerTrilhas,
      disponivel: true,
      badge: trilhasDisponiveis > 0 ? {
        texto: `${trilhasDisponiveis} disponível${trilhasDisponiveis !== 1 ? 'is' : ''}`,
        variante: 'default'
      } : undefined
    },
    {
      id: 'minhas-conquistas',
      titulo: 'Minhas Conquistas',
      descricao: 'Veja todos os badges e certificados conquistados',
      icon: Trophy,
      acao: onMinhasConquistas,
      disponivel: true,
      badge: conquistasDesbloqueadas > 0 ? {
        texto: `${conquistasDesbloqueadas} conquistada${conquistasDesbloqueadas !== 1 ? 's' : ''}`,
        variante: 'outline'
      } : undefined
    },
    ...(proximaAula && onIniciarProximaAula ? [{
      id: 'proxima-aula',
      titulo: 'Próxima Aula',
      descricao: `${proximaAula.nome} - ${proximaAula.data} às ${proximaAula.horario}`,
      icon: PlayCircle,
      acao: onIniciarProximaAula,
      disponivel: true,
      badge: {
        texto: 'Ao vivo',
        variante: 'destructive' as const
      }
    }] : [])
  ];

  const renderIconeAcao = (Icon: React.ComponentType<any>, disponivel: boolean) => (
    <div className={`p-3 rounded-lg transition-all duration-200 ${
      disponivel 
        ? 'bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20' 
        : 'bg-muted'
    }`}>
      <Icon className={`h-5 w-5 ${disponivel ? 'text-primary' : 'text-muted-foreground'}`} />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Central de Ações
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {acoes.map((acao, index) => (
          <div key={acao.id}>
            <Button
              variant="ghost"
              onClick={acao.acao}
              disabled={!acao.disponivel}
              className="w-full justify-start p-4 h-auto group hover:bg-accent/50 transition-all duration-200"
            >
              <div className="flex items-center gap-3 w-full">
                {renderIconeAcao(acao.icon, acao.disponivel)}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{acao.titulo}</span>
                    {acao.badge && (
                      <Badge variant={acao.badge.variante} className="text-xs">
                        {acao.badge.texto}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {acao.descricao}
                  </p>
                </div>
              </div>
            </Button>
            {index < acoes.length - 1 && <Separator className="my-2" />}
          </div>
        ))}

        {/* Seção de estatísticas rápidas */}
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-500" />
            Resumo de Atividades
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-primary">{trilhasDisponiveis}</div>
              <div className="text-xs text-muted-foreground">Trilhas Ativas</div>
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <div className="text-lg font-bold text-accent">{cursosEmAndamento}</div>
              <div className="text-xs text-muted-foreground">Cursos</div>
            </div>
          </div>
        </div>

        {/* Próxima aula em destaque */}
        {proximaAula && (
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Calendar className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-blue-900">Próxima Aula</h4>
                <p className="text-xs text-blue-700">{proximaAula.nome}</p>
                <p className="text-xs text-blue-600">
                  {proximaAula.data} às {proximaAula.horario}
                </p>
              </div>
              {onIniciarProximaAula && (
                <Button size="sm" onClick={onIniciarProximaAula}>
                  <PlayCircle className="h-3 w-3 mr-1" />
                  Participar
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};