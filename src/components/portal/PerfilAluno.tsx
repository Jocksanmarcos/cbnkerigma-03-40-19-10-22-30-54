import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Trophy, 
  GraduationCap, 
  Target, 
  Calendar,
  Phone,
  Mail,
  MapPin
} from 'lucide-react';
import { PerfilAluno } from '@/hooks/usePortalAluno';

interface PerfilAlunoProps {
  perfil: PerfilAluno;
}

export const PerfilAlunoCard: React.FC<PerfilAlunoProps> = ({ perfil }) => {
  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getNivelColor = (nivel: string) => {
    switch (nivel) {
      case 'Iniciante': return 'bg-green-500';
      case 'Intermediário': return 'bg-blue-500';
      case 'Avançado': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getProximoNivel = (pontuacao: number) => {
    if (pontuacao < 500) return { nome: 'Intermediário', pontos_necessarios: 500 - pontuacao };
    if (pontuacao < 1000) return { nome: 'Avançado', pontos_necessarios: 1000 - pontuacao };
    return { nome: 'Mestre', pontos_necessarios: 0 };
  };

  const proximoNivel = getProximoNivel(perfil.pontuacao_total);
  const progressoProximoNivel = proximoNivel.pontos_necessarios > 0 
    ? ((perfil.pontuacao_total % 500) / 500) * 100 
    : 100;

  return (
    <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-white to-accent/5">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
            <AvatarImage src="" alt={perfil.nome_completo} />
            <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-xl font-bold">
              {getInitials(perfil.nome_completo)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold gradient-text">
              {perfil.nome_completo}
            </CardTitle>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className={`${getNivelColor(perfil.nivel_atual)} text-white font-semibold`}>
                {perfil.nivel_atual}
              </Badge>
              {perfil.posicao_ranking && (
                <Badge variant="outline" className="font-semibold">
                  #{perfil.posicao_ranking} no Ranking
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Informações de contato */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-4 w-4" />
            <span>{perfil.email}</span>
          </div>
        </div>

        {/* Estatísticas principais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white/50 rounded-lg border">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto mb-2">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary">{perfil.pontuacao_total}</div>
            <div className="text-xs text-muted-foreground">Pontos</div>
          </div>

          <div className="text-center p-4 bg-white/50 rounded-lg border">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-2">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary">{perfil.cursos_concluidos}</div>
            <div className="text-xs text-muted-foreground">Cursos</div>
          </div>

          <div className="text-center p-4 bg-white/50 rounded-lg border">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full mx-auto mb-2">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary">{perfil.conquistas_total}</div>
            <div className="text-xs text-muted-foreground">Conquistas</div>
          </div>

          <div className="text-center p-4 bg-white/50 rounded-lg border">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-2">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-primary">{perfil.certificados_obtidos}</div>
            <div className="text-xs text-muted-foreground">Certificados</div>
          </div>
        </div>

        {/* Progresso para próximo nível */}
        {proximoNivel.pontos_necessarios > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso para {proximoNivel.nome}</span>
              <span className="font-semibold">{proximoNivel.pontos_necessarios} pontos restantes</span>
            </div>
            <Progress value={progressoProximoNivel} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};