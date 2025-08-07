import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  GraduationCap, 
  PlayCircle, 
  CheckCircle, 
  Clock,
  Download,
  Calendar,
  Users,
  Star
} from 'lucide-react';
import { CursoAluno } from '@/hooks/usePortalAluno';

interface CursosAlunoProps {
  cursos: CursoAluno[];
}

export const CursosAluno: React.FC<CursosAlunoProps> = ({ cursos }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-500';
      case 'cursando': return 'bg-blue-500';
      case 'matriculado': return 'bg-yellow-500';
      case 'cancelado': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'cursando': return 'Em Andamento';
      case 'matriculado': return 'Matriculado';
      case 'cancelado': return 'Cancelado';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido': return <CheckCircle className="h-4 w-4" />;
      case 'cursando': return <PlayCircle className="h-4 w-4" />;
      case 'matriculado': return <Clock className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (cursos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Meus Cursos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não está matriculado em nenhum curso
            </p>
            <Button>
              <GraduationCap className="h-4 w-4 mr-2" />
              Explorar Cursos
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          Meus Cursos
          <Badge variant="secondary" className="ml-auto">
            {cursos.length} curso{cursos.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {cursos.map((curso) => (
          <div 
            key={curso.id} 
            className="p-5 bg-gradient-to-r from-white to-accent/5 rounded-xl border hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl shadow-lg">
                  {getStatusIcon(curso.status)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg gradient-text">{curso.curso_nome}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {curso.turma_nome}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Iniciado em: {new Date(curso.data_inicio).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(curso.status)} text-white flex items-center gap-1`}
              >
                {getStatusIcon(curso.status)}
                {getStatusText(curso.status)}
              </Badge>
            </div>

            {/* Progresso */}
            <div className="space-y-3 mb-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso do Curso</span>
                  <span className="font-semibold">{curso.progresso_percentual}%</span>
                </div>
                <Progress 
                  value={curso.progresso_percentual} 
                  className="h-2"
                />
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {curso.nota_atual && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-muted-foreground">Nota:</span>
                    <span className="font-semibold">{curso.nota_atual.toFixed(1)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Frequência:</span>
                  <span className="font-semibold">{curso.frequencia_percentual}%</span>
                </div>
              </div>
            </div>

            {/* Próxima aula */}
            {curso.status === 'cursando' && curso.proxima_aula && (
              <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <PlayCircle className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Próxima Aula: {curso.proxima_aula.titulo}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600">
                      {curso.proxima_aula.data} • {curso.proxima_aula.local}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            )}

            {/* Ações */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {curso.status === 'cursando' && (
                  <Button size="sm">
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continuar
                  </Button>
                )}
                {curso.status === 'concluido' && curso.certificado_url && (
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Certificado
                  </Button>
                )}
                <Button size="sm" variant="ghost">
                  Ver Detalhes
                </Button>
              </div>
              
              {curso.data_conclusao && (
                <span className="text-xs text-green-600 font-medium">
                  Concluído em: {new Date(curso.data_conclusao).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};