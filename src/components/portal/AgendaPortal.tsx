import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, CheckCircle, X, Eye } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAgendaEventos, type AgendaEvento } from '@/hooks/useAgendaEventos';
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';

interface EventoParaAluno extends AgendaEvento {
  podeParticipar: boolean;
  jaConfirmou: boolean;
  relevantePara: string[];
}

interface AgendaPortalProps {
  perfilAluno: {
    id: string;
    nome_completo: string;
    papel_igreja?: string;
    nivel_atual?: string;
  };
}

const AgendaPortal = ({ perfilAluno }: AgendaPortalProps) => {
  const { eventos, loading } = useAgendaEventos();
  const [confirmacoes, setConfirmacoes] = useState<{ [key: string]: boolean }>({});

  // Função para determinar se o evento é relevante para o aluno
  const isEventoRelevanteParaAluno = (evento: AgendaEvento): boolean => {
    // Eventos públicos são sempre relevantes
    if (evento.publico && evento.tipo === 'publico') return true;
    
    // Eventos de ensino são relevantes para alunos
    if (evento.tipo === 'ensino') return true;
    
    // Eventos de células são relevantes se o aluno participa de células
    if (evento.tipo === 'celula') return true;
    
    // Eventos pastorais não são relevantes para alunos comuns
    if (evento.tipo === 'pastoral') return false;
    
    // Reuniões internas apenas para líderes
    if (evento.tipo === 'reuniao_interna') {
      return perfilAluno.papel_igreja === 'lider' || 
             perfilAluno.papel_igreja === 'discipulador';
    }
    
    return false;
  };

  // Processar eventos para o aluno
  const eventosParaAluno: EventoParaAluno[] = useMemo(() => {
    return eventos
      .filter(evento => isEventoRelevanteParaAluno(evento))
      .map(evento => ({
        ...evento,
        podeParticipar: evento.tipo !== 'pastoral' && evento.tipo !== 'reuniao_interna',
        jaConfirmou: confirmacoes[evento.id] || false,
        relevantePara: determinarRelevancia(evento)
      }));
  }, [eventos, confirmacoes, perfilAluno]);

  const determinarRelevancia = (evento: AgendaEvento): string[] => {
    const relevancia = [];
    
    if (evento.tipo === 'publico') relevancia.push('Todos os membros');
    if (evento.tipo === 'ensino') relevancia.push('Alunos EAD');
    if (evento.tipo === 'celula') relevancia.push('Participantes de células');
    if (evento.tipo === 'reuniao_interna') relevancia.push('Liderança');
    
    return relevancia;
  };

  const handleConfirmarPresenca = async (eventoId: string) => {
    try {
      // Aqui seria a lógica para confirmar presença no backend
      setConfirmacoes(prev => ({ ...prev, [eventoId]: true }));
      
      toast({
        title: "Presença confirmada!",
        description: "Sua participação foi registrada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível confirmar sua presença.",
        variant: "destructive",
      });
    }
  };

  const handleCancelarPresenca = async (eventoId: string) => {
    try {
      setConfirmacoes(prev => ({ ...prev, [eventoId]: false }));
      
      toast({
        title: "Presença cancelada",
        description: "Sua participação foi cancelada.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível cancelar sua presença.",
        variant: "destructive",
      });
    }
  };

  const getDataRelativa = (dataEvento: Date) => {
    if (isToday(dataEvento)) return 'Hoje';
    if (isTomorrow(dataEvento)) return 'Amanhã';
    if (isThisWeek(dataEvento)) return format(dataEvento, 'EEEE', { locale: ptBR });
    return format(dataEvento, 'dd/MM/yyyy', { locale: ptBR });
  };

  const getEventoIcon = (tipo: AgendaEvento['tipo']) => {
    switch (tipo) {
      case 'publico': return Users;
      case 'ensino': return Calendar;
      case 'celula': return MapPin;
      case 'reuniao_interna': return Eye;
      default: return Calendar;
    }
  };

  const getTypeColor = (tipo: AgendaEvento['tipo']) => {
    switch (tipo) {
      case 'publico': return 'bg-blue-500 text-white';
      case 'ensino': return 'bg-green-500 text-white';
      case 'celula': return 'bg-purple-500 text-white';
      case 'reuniao_interna': return 'bg-orange-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // Categorizar eventos
  const eventosHoje = eventosParaAluno.filter(evento => 
    isToday(new Date(evento.data_inicio))
  );

  const eventosProximos = eventosParaAluno.filter(evento => {
    const dataEvento = new Date(evento.data_inicio);
    const hoje = new Date();
    const emSeteDias = addDays(hoje, 7);
    return dataEvento > hoje && dataEvento <= emSeteDias;
  });

  const eventosEnsino = eventosParaAluno.filter(evento => evento.tipo === 'ensino');
  const eventosCelulas = eventosParaAluno.filter(evento => evento.tipo === 'celula');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minha Agenda</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Carregando agenda...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Minha Agenda
        </CardTitle>
        <CardDescription>
          Próximos eventos relevantes para você
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="proximos" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="hoje">Hoje ({eventosHoje.length})</TabsTrigger>
            <TabsTrigger value="ensino">Ensino</TabsTrigger>
            <TabsTrigger value="celulas">Células</TabsTrigger>
          </TabsList>

          <TabsContent value="proximos" className="space-y-4 mt-6">
            {eventosProximos.length > 0 ? (
              <div className="space-y-4">
                {eventosProximos.slice(0, 5).map((evento) => {
                  const IconeEvento = getEventoIcon(evento.tipo);
                  const dataEvento = new Date(evento.data_inicio);
                  
                  return (
                    <div key={evento.id} className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <IconeEvento className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{evento.titulo}</h4>
                            <Badge className={`text-xs ${getTypeColor(evento.tipo)}`}>
                              {evento.relevantePara[0]}
                            </Badge>
                          </div>
                        </div>
                        
                        {evento.podeParticipar && (
                          <div className="flex gap-2">
                            {evento.jaConfirmou ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCancelarPresenca(evento.id)}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Confirmado
                              </Button>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleConfirmarPresenca(evento.id)}
                              >
                                Confirmar Presença
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {evento.descricao && (
                        <p className="text-sm text-muted-foreground mb-3">{evento.descricao}</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{getDataRelativa(dataEvento)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{format(dataEvento, 'HH:mm')}</span>
                        </div>
                        {evento.local && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{evento.local}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {eventosProximos.length > 5 && (
                  <Button variant="outline" className="w-full">
                    Ver todos os {eventosProximos.length} eventos
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum evento nos próximos dias</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hoje" className="space-y-4 mt-6">
            {eventosHoje.length > 0 ? (
              <div className="space-y-4">
                {eventosHoje.map((evento) => {
                  const IconeEvento = getEventoIcon(evento.tipo);
                  const dataEvento = new Date(evento.data_inicio);
                  
                  return (
                    <div key={evento.id} className="border-2 border-primary/30 rounded-lg p-4 bg-primary/5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <IconeEvento className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium">{evento.titulo}</h4>
                            <Badge className="bg-primary text-white text-xs">HOJE</Badge>
                          </div>
                        </div>
                        
                        {evento.podeParticipar && !evento.jaConfirmou && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmarPresenca(evento.id)}
                          >
                            Confirmar Presença
                          </Button>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-primary" />
                          <span className="font-medium">{format(dataEvento, 'HH:mm')}</span>
                        </div>
                        {evento.local && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{evento.local}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhum evento hoje</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ensino" className="space-y-4 mt-6">
            {eventosEnsino.length > 0 ? (
              <div className="space-y-4">
                {eventosEnsino.map((evento) => {
                  const dataEvento = new Date(evento.data_inicio);
                  
                  return (
                    <div key={evento.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{evento.titulo}</h4>
                          <p className="text-sm text-muted-foreground">Aula/Curso EAD</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{format(dataEvento, 'dd/MM/yyyy HH:mm')}</span>
                        {evento.local && <span>{evento.local}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma aula agendada</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="celulas" className="space-y-4 mt-6">
            {eventosCelulas.length > 0 ? (
              <div className="space-y-4">
                {eventosCelulas.map((evento) => {
                  const dataEvento = new Date(evento.data_inicio);
                  
                  return (
                    <div key={evento.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{evento.titulo}</h4>
                          <p className="text-sm text-muted-foreground">Reunião de Célula</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{format(dataEvento, 'dd/MM/yyyy HH:mm')}</span>
                        {evento.local && <span>{evento.local}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Nenhuma reunião de célula agendada</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AgendaPortal;