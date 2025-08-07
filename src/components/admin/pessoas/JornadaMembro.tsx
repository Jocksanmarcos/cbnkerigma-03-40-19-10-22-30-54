import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Star, 
  TrendingUp, 
  User, 
  Calendar,
  Award,
  MapPin,
  Eye,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { type Pessoa } from '@/hooks/usePessoas';

interface TrilhaFormacao {
  id: string;
  nome: string;
  descricao?: string;
  etapas?: any;
  publico_alvo?: string[];
  ativa: boolean;
}

interface ProgressoTrilha {
  id: string;
  pessoa_id: string;
  trilha_id: string;
  etapa_atual: number;
  data_inicio: string;
  data_conclusao?: string;
  status: string;
  observacoes?: string;
  trilha?: TrilhaFormacao;
}

interface MatriculaEnsino {
  id: string;
  pessoa_id: string;
  status: string;
  data_matricula: string;
  data_conclusao?: string;
  nota_final?: number;
  turma?: {
    nome_turma: string;
    curso?: {
      nome: string;
      categoria: string;
    };
  };
}

interface JornadaMembroProps {
  pessoa: Pessoa;
}

export const JornadaMembro = ({ pessoa }: JornadaMembroProps) => {
  const [trilhas, setTrilhas] = useState<TrilhaFormacao[]>([]);
  const [progressos, setProgressos] = useState<ProgressoTrilha[]>([]);
  const [matriculas, setMatriculas] = useState<MatriculaEnsino[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTrilha, setSelectedTrilha] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (pessoa.id) {
      fetchData();
    }
  }, [pessoa.id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar trilhas ativas com tratamento de erro individual
      try {
        const { data: trilhasData, error: trilhasError } = await supabase
          .from('trilhas_formacao')
          .select('*')
          .eq('ativa', true)
          .order('nome');

        if (trilhasError) {
          console.warn('Erro ao buscar trilhas:', trilhasError);
          setTrilhas([]);
        } else {
          setTrilhas(trilhasData || []);
        }
      } catch (error) {
        console.warn('Erro ao buscar trilhas:', error);
        setTrilhas([]);
      }

      // Buscar progressos da pessoa com tratamento de erro individual
      try {
        const { data: progressosData, error: progressosError } = await supabase
          .from('progresso_trilha_formacao')
          .select(`
            *,
            trilha:trilhas_formacao(*)
          `)
          .eq('pessoa_id', pessoa.id);

        if (progressosError) {
          console.warn('Erro ao buscar progressos:', progressosError);
          setProgressos([]);
        } else {
          setProgressos(progressosData || []);
        }
      } catch (error) {
        console.warn('Erro ao buscar progressos:', error);
        setProgressos([]);
      }

      // Buscar matrículas da pessoa com tratamento de erro individual
      try {
        const { data: matriculasData, error: matriculasError } = await supabase
          .from('matriculas_ensino')
          .select(`
            *,
            turma:turmas_ensino(
              nome_turma,
              curso:cursos_ensino(nome, categoria)
            )
          `)
          .eq('pessoa_id', pessoa.id)
          .order('data_matricula', { ascending: false });

        if (matriculasError) {
          console.warn('Erro ao buscar matrículas:', matriculasError);
          setMatriculas([]);
        } else {
          setMatriculas(matriculasData || []);
        }
      } catch (error) {
        console.warn('Erro ao buscar matrículas:', error);
        setMatriculas([]);
      }

    } catch (error: any) {
      console.error('Erro geral ao carregar dados da jornada:', error);
      // Não mostrar toast de erro aqui, pois agora tratamos erros individuais
      // Só mostrar se for um erro crítico que impede completamente o carregamento
    } finally {
      setLoading(false);
    }
  };

  const iniciarTrilha = async () => {
    if (!selectedTrilha) return;

    try {
      const { error } = await supabase
        .from('progresso_trilha_formacao')
        .insert([
          {
            pessoa_id: pessoa.id,
            trilha_id: selectedTrilha,
            etapa_atual: 1,
            data_inicio: new Date().toISOString(),
            status: 'em_andamento',
            observacoes
          }
        ]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Trilha iniciada com sucesso!",
      });

      setIsDialogOpen(false);
      setSelectedTrilha('');
      setObservacoes('');
      fetchData();
    } catch (error: any) {
      console.error('Erro ao iniciar trilha:', error);
      toast({
        title: "Erro",
        description: "Erro ao iniciar trilha",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'em_andamento':
        return 'bg-blue-100 text-blue-800';
      case 'pausado':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return <CheckCircle className="h-4 w-4" />;
      case 'em_andamento':
        return <Clock className="h-4 w-4" />;
      case 'pausado':
        return <MapPin className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const calcularProgressoGeral = () => {
    if (progressos.length === 0) return 0;
    
    const totalEtapas = progressos.reduce((acc, progresso) => {
      const etapas = progresso.trilha?.etapas;
      return acc + (etapas ? Object.keys(etapas).length : 0);
    }, 0);
    
    const etapasCompletas = progressos.reduce((acc, progresso) => {
      return acc + (progresso.etapa_atual || 0);
    }, 0);
    
    return totalEtapas > 0 ? (etapasCompletas / totalEtapas) * 100 : 0;
  };

  const getEstadoEspiritualInfo = () => {
    const estado = pessoa.estado_espiritual;
    switch (estado) {
      case 'visitante':
        return { 
          label: 'Visitante', 
          color: 'bg-gray-100 text-gray-800',
          proximoPasso: 'Participar do curso "Primeira Visita"'
        };
      case 'novo_convertido':
        return { 
          label: 'Novo Convertido', 
          color: 'bg-green-100 text-green-800',
          proximoPasso: 'Realizar curso preparatório para batismo'
        };
      case 'batizado':
        return { 
          label: 'Batizado', 
          color: 'bg-blue-100 text-blue-800',
          proximoPasso: 'Iniciar trilha de discipulado'
        };
      case 'membro_ativo':
        return { 
          label: 'Membro Ativo', 
          color: 'bg-purple-100 text-purple-800',
          proximoPasso: 'Considerar trilha de liderança'
        };
      case 'lider_treinamento':
        return { 
          label: 'Líder em Treinamento', 
          color: 'bg-orange-100 text-orange-800',
          proximoPasso: 'Completar formação de liderança'
        };
      case 'lider':
        return { 
          label: 'Líder', 
          color: 'bg-yellow-100 text-yellow-800',
          proximoPasso: 'Mentorear novos líderes'
        };
      default:
        return { 
          label: estado, 
          color: 'bg-gray-100 text-gray-800',
          proximoPasso: 'Definir próximos passos'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const estadoInfo = getEstadoEspiritualInfo();
  const progressoGeral = calcularProgressoGeral();

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Jornada */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <User className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Jornada de {pessoa.nome_completo}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Acompanhamento do desenvolvimento espiritual e educacional
                </p>
              </div>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Iniciar Trilha
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Iniciar Nova Trilha</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="trilha">Selecionar Trilha</Label>
                    <Select value={selectedTrilha} onValueChange={setSelectedTrilha}>
                      <SelectTrigger>
                        <SelectValue placeholder="Escolha uma trilha de formação" />
                      </SelectTrigger>
                      <SelectContent>
                        {trilhas.map((trilha) => (
                          <SelectItem key={trilha.id} value={trilha.id}>
                            {trilha.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="observacoes">Observações (opcional)</Label>
                    <Textarea
                      id="observacoes"
                      value={observacoes}
                      onChange={(e) => setObservacoes(e.target.value)}
                      placeholder="Anotações sobre esta trilha..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={iniciarTrilha} disabled={!selectedTrilha}>
                      Iniciar Trilha
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Status Atual */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estado Espiritual</Label>
              <Badge className={estadoInfo.color}>
                {estadoInfo.label}
              </Badge>
              <p className="text-xs text-muted-foreground">{estadoInfo.proximoPasso}</p>
            </div>

            {/* Progresso Geral */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Progresso Geral</Label>
              <div className="space-y-1">
                <Progress value={progressoGeral} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {progressoGeral.toFixed(1)}% concluído
                </p>
              </div>
            </div>

            {/* Estatísticas */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Estatísticas</Label>
              <div className="flex space-x-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-primary">{progressos.length}</div>
                  <div className="text-xs text-muted-foreground">Trilhas</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-600">{matriculas.filter(m => m.status === 'concluido').length}</div>
                  <div className="text-xs text-muted-foreground">Concluídos</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-600">{matriculas.filter(m => m.status === 'cursando').length}</div>
                  <div className="text-xs text-muted-foreground">Em Curso</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trilhas de Formação */}
      {progressos.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Trilhas de Formação</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {progressos.map((progresso) => {
                const trilha = progresso.trilha;
                const totalEtapas = trilha?.etapas ? Object.keys(trilha.etapas).length : 0;
                const progressoTrilha = totalEtapas > 0 ? ((progresso.etapa_atual || 0) / totalEtapas) * 100 : 0;

                return (
                  <div key={progresso.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{trilha?.nome}</h4>
                          <p className="text-sm text-muted-foreground">
                            Etapa {progresso.etapa_atual || 0} de {totalEtapas}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(progresso.status)}>
                        {getStatusIcon(progresso.status)}
                        <span className="ml-1">
                          {progresso.status === 'concluido' ? 'Concluído' : 
                           progresso.status === 'em_andamento' ? 'Em Andamento' : 
                           progresso.status === 'pausado' ? 'Pausado' : progresso.status}
                        </span>
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso</span>
                        <span>{progressoTrilha.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressoTrilha} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Iniciado em {new Date(progresso.data_inicio).toLocaleDateString('pt-BR')}</span>
                      </div>
                      {progresso.data_conclusao && (
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4" />
                          <span>Concluído em {new Date(progresso.data_conclusao).toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}
                    </div>

                    {progresso.observacoes && (
                      <div className="bg-muted/50 p-3 rounded-md">
                        <p className="text-sm">{progresso.observacoes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cursos e Matrículas */}
      {matriculas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Histórico de Cursos</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {matriculas.map((matricula) => (
                <div key={matricula.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{matricula.turma?.curso?.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {matricula.turma?.nome_turma} • {matricula.turma?.curso?.categoria}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {matricula.nota_final && (
                      <div className="text-center">
                        <div className="text-sm font-medium">{matricula.nota_final}</div>
                        <div className="text-xs text-muted-foreground">Nota</div>
                      </div>
                    )}
                    <Badge className={getStatusColor(matricula.status)}>
                      {matricula.status === 'concluido' ? 'Concluído' : 
                       matricula.status === 'cursando' ? 'Cursando' : 
                       matricula.status === 'matriculado' ? 'Matriculado' : matricula.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado sem dados */}
      {progressos.length === 0 && matriculas.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma trilha iniciada</h3>
            <p className="text-muted-foreground mb-4">
              Este membro ainda não iniciou nenhuma trilha de formação.
            </p>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Iniciar Primeira Trilha
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};