import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PersonSelect } from '@/components/ui/person-select';
import { 
  BookOpen, 
  Users, 
  UserPlus,
  Trophy,
  Target,
  CheckCircle,
  Clock,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { useTrilhasDNA } from '@/hooks/useTrilhasDNA';
import { usePessoas } from '@/hooks/usePessoas';

export const TrilhasDNAManager = () => {
  const { trilhas, progressos, loading, iniciarTrilha, avancarEtapa, concluirTrilha } = useTrilhasDNA();
  const { pessoas } = usePessoas();
  const [activeTab, setActiveTab] = useState('trilhas');
  const [selectedTrilha, setSelectedTrilha] = useState<string>('');
  const [selectedPessoa, setSelectedPessoa] = useState<string>('');
  const [selectedDiscipulador, setSelectedDiscipulador] = useState<string>('');
  const [isMatriculaOpen, setIsMatriculaOpen] = useState(false);

  const getTipoLabel = (tipo: string) => {
    const labels = {
      'novo_convertido': 'Novo Convertido',
      'batismo': 'Batismo',
      'discipulado_1': 'Discipulado 1',
      'discipulado_2': 'Discipulado 2', 
      'discipulado_3': 'Discipulado 3',
      'lider_celula': 'Líder de Célula',
      'escola_lideres': 'Escola de Líderes'
    };
    return labels[tipo as keyof typeof labels] || tipo;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'em_andamento': 'bg-blue-100 text-blue-800',
      'concluido': 'bg-green-100 text-green-800',
      'pausado': 'bg-yellow-100 text-yellow-800',
      'cancelado': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      'em_andamento': 'Em Andamento',
      'concluido': 'Concluído',
      'pausado': 'Pausado',
      'cancelado': 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const handleIniciarTrilha = async () => {
    if (!selectedPessoa || !selectedTrilha) return;
    
    await iniciarTrilha(selectedPessoa, selectedTrilha, selectedDiscipulador || undefined);
    setIsMatriculaOpen(false);
    setSelectedPessoa('');
    setSelectedTrilha('');
    setSelectedDiscipulador('');
  };

  const calcularProgresso = (progresso: any) => {
    const trilha = trilhas.find(t => t.id === progresso.trilha_id);
    if (!trilha || !trilha.etapas) return 0;
    
    const totalEtapas = trilha.etapas.length;
    const etapasConcluidas = (progresso.etapas_concluidas || []).length;
    return Math.round((etapasConcluidas / totalEtapas) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6 sm:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-24 sm:w-24 md:h-32 md:w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-mobile-sm text-muted-foreground">Carregando trilhas DNA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-mobile-lg sm:text-mobile-xl md:text-mobile-2xl font-bold gradient-text leading-tight">
            Trilhas DNA - Discipulado Natural e Acessível
          </h2>
          <p className="text-mobile-xs sm:text-mobile-sm text-muted-foreground">
            Gerencie o progresso dos membros nas trilhas de formação
          </p>
        </div>
        
        <Dialog open={isMatriculaOpen} onOpenChange={setIsMatriculaOpen}>
          <DialogTrigger asChild>
            <Button className="button-mobile flex-shrink-0">
              <UserPlus className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Iniciar Trilha</span>
              <span className="sm:hidden">Iniciar</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile">
            <DialogHeader>
              <DialogTitle>Iniciar Nova Trilha</DialogTitle>
              <DialogDescription>
                Selecione a pessoa e a trilha para iniciar o discipulado
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="pessoa">Pessoa</Label>
                <PersonSelect
                  value={selectedPessoa}
                  onValueChange={setSelectedPessoa}
                  placeholder="Selecione a pessoa"
                />
              </div>
              
              <div>
                <Label htmlFor="trilha">Trilha DNA</Label>
                <Select value={selectedTrilha} onValueChange={setSelectedTrilha}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a trilha" />
                  </SelectTrigger>
                  <SelectContent>
                    {trilhas.map((trilha) => (
                      <SelectItem key={trilha.id} value={trilha.id}>
                        {trilha.nome} - {getTipoLabel(trilha.tipo)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="discipulador">Discipulador (Opcional)</Label>
                <PersonSelect
                  value={selectedDiscipulador}
                  onValueChange={setSelectedDiscipulador}
                  placeholder="Selecione o discipulador"
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsMatriculaOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleIniciarTrilha} disabled={!selectedPessoa || !selectedTrilha}>
                  Iniciar Trilha
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards de Estatísticas */}
      <div className="stats-grid-mobile">
        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-mobile-sm font-medium">Trilhas Disponíveis</CardTitle>
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-mobile-xl font-bold">{trilhas.length}</div>
            <p className="text-mobile-xs text-muted-foreground">Ativas no sistema</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-mobile-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-mobile-xl font-bold">
              {progressos.filter(p => p.status === 'em_andamento').length}
            </div>
            <p className="text-mobile-xs text-muted-foreground">Pessoas estudando</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-mobile-sm font-medium">Concluídas</CardTitle>
            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-mobile-xl font-bold">
              {progressos.filter(p => p.status === 'concluido').length}
            </div>
            <p className="text-mobile-xs text-muted-foreground">Trilhas finalizadas</p>
          </CardContent>
        </Card>

        <Card className="card-mobile">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-mobile-sm font-medium">Taxa de Conclusão</CardTitle>
            <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-4">
            <div className="text-mobile-xl font-bold">
              {progressos.length > 0 ? 
                Math.round((progressos.filter(p => p.status === 'concluido').length / progressos.length) * 100) : 0
              }%
            </div>
            <p className="text-mobile-xs text-muted-foreground">De sucesso</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Trilhas Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Trilhas Disponíveis
          </CardTitle>
          <CardDescription>
            Trilhas de formação do modelo DNA
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trilhas.map((trilha) => (
              <Card key={trilha.id} className="border-l-4 border-l-primary">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base truncate">{trilha.nome}</h3>
                      <Badge variant="outline" className="mt-1">
                        {getTipoLabel(trilha.tipo)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {trilha.descricao && (
                    <p className="text-xs sm:text-sm text-muted-foreground mb-3">
                      {trilha.descricao}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">
                      {trilha.etapas?.length || 0} etapas
                    </span>
                    <span className="text-muted-foreground">
                      Ordem: {trilha.ordem}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progressos Ativos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Progressos em Andamento
          </CardTitle>
          <CardDescription>
            Acompanhe o desenvolvimento dos discípulos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {progressos
              .filter(p => p.status === 'em_andamento')
              .map((progresso) => {
                const percentual = calcularProgresso(progresso);
                const trilha = trilhas.find(t => t.id === progresso.trilha_id);
                
                return (
                  <Card key={progresso.id} className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm sm:text-base truncate">
                            {progresso.pessoa?.nome_completo}
                          </h4>
                          <Badge className={getStatusColor(progresso.status)}>
                            {getStatusLabel(progresso.status)}
                          </Badge>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                          {trilha?.nome} - Etapa {progresso.etapa_atual} de {trilha?.etapas?.length || 0}
                        </p>
                        {progresso.discipulador && (
                          <p className="text-xs text-muted-foreground">
                            Discipulador: {progresso.discipulador.nome_completo}
                          </p>
                        )}
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-muted-foreground">Progresso</span>
                            <span className="text-xs font-medium">{percentual}%</span>
                          </div>
                          <Progress value={percentual} className="h-2" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {progresso.status === 'em_andamento' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => avancarEtapa(progresso.id, progresso.etapa_atual)}
                              disabled={percentual >= 100}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Avançar
                            </Button>
                            {percentual >= 100 && (
                              <Button
                                size="sm"
                                onClick={() => concluirTrilha(progresso.id)}
                              >
                                <Trophy className="h-3 w-3 mr-1" />
                                Concluir
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
              
            {progressos.filter(p => p.status === 'em_andamento').length === 0 && (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                  Nenhum progresso em andamento
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Inicie uma trilha para começar o discipulado.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};