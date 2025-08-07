import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Users,
  GraduationCap,
  Heart,
  Trophy,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  Star,
  Clock
} from 'lucide-react';

interface JornadaMembroViewProps {
  pessoa: any; // Type this properly based on your pessoa interface
}

export function JornadaMembroView({ pessoa }: JornadaMembroViewProps) {
  // Mock data - replace with actual data from your database
  const timelineEvents = [
    {
      date: '2024-01-15',
      type: 'ingresso',
      title: 'Primeira Visita',
      description: 'Conheceu a igreja através do convite da célula'
    },
    {
      date: '2024-02-10',
      type: 'decisao',
      title: 'Decisão por Cristo',
      description: 'Aceitou Jesus como Salvador durante o culto'
    },
    {
      date: '2024-03-05',
      type: 'batismo',
      title: 'Batismo nas Águas',
      description: 'Celebração do batismo no Rio Jordão'
    },
    {
      date: '2024-04-01',
      type: 'discipulado',
      title: 'Iniciou Discipulado',
      description: 'Começou o discipulado com o líder João Silva'
    }
  ];

  const currentStatus = {
    nivel: 'Membro Ativo',
    progresso: 75,
    proximosPasso: 'Curso de Liderança'
  };

  const involvement = {
    celula: 'Célula da Paz - Jardim das Flores',
    ministerio: 'Ministério de Louvor',
    cursos: ['Fundamentos da Fé', 'Liderança Cristã'],
    discipulado: 'Em andamento com João Silva'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">{pessoa?.nome_completo}</h1>
          <p className="text-muted-foreground">Membro desde Janeiro 2024</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Phone className="h-4 w-4" />
              {pessoa?.telefone}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {pessoa?.email}
            </div>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          {currentStatus.nivel}
        </Badge>
      </div>

      {/* Status e Próximos Passos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Jornada Atual
            </CardTitle>
            <CardDescription>
              Progresso na caminhada espiritual
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso Geral</span>
                <span>{currentStatus.progresso}%</span>
              </div>
              <Progress value={currentStatus.progresso} className="h-2" />
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
              <div>
                <p className="font-medium">Próximo Passo</p>
                <p className="text-sm text-muted-foreground">{currentStatus.proximosPasso}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximas Ações
            </CardTitle>
            <CardDescription>
              Atividades programadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <Calendar className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Reunião de Célula</p>
                  <p className="text-xs text-muted-foreground">Hoje às 19:30</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                <GraduationCap className="h-4 w-4 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Curso de Liderança</p>
                  <p className="text-xs text-muted-foreground">Domingo às 9:00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consolidação da Visão - Cards de Envolvimento */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Célula</p>
                <p className="text-xs text-muted-foreground truncate">
                  {involvement.celula}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Ministério</p>
                <p className="text-xs text-muted-foreground truncate">
                  {involvement.ministerio}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Ensino</p>
                <p className="text-xs text-muted-foreground">
                  {involvement.cursos.length} cursos
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Discipulado</p>
                <p className="text-xs text-muted-foreground truncate">
                  {involvement.discipulado}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Linha do Tempo na Igreja
          </CardTitle>
          <CardDescription>
            Marcos importantes da jornada espiritual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  {index < timelineEvents.length - 1 && (
                    <div className="w-px h-12 bg-border mt-2" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {new Date(event.date).toLocaleDateString('pt-BR')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}