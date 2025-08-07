import { useState } from 'react';
import { Calendar, Clock, MapPin, Users, Phone, ExternalLink, Filter, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import Footer from '@/components/layout/Footer';
import { useAgendaEventos, type AgendaEvento } from '@/hooks/useAgendaEventos';
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Função para obter cor baseada no tipo
const getTypeColor = (tipo: AgendaEvento['tipo']) => {
  switch (tipo) {
    case 'publico': return 'bg-blue-500 text-white';
    case 'ensino': return 'bg-green-500 text-white';
    case 'celula': return 'bg-purple-500 text-white';
    case 'reuniao_interna': return 'bg-orange-500 text-white';
    case 'pastoral': return 'bg-red-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

// Função para obter ícone baseado no tipo
const getTypeIcon = (tipo: AgendaEvento['tipo']) => {
  switch (tipo) {
    case 'publico': return Users;
    case 'ensino': return Calendar;
    case 'celula': return MapPin;
    case 'reuniao_interna': return ExternalLink;
    case 'pastoral': return Phone;
    default: return Calendar;
  }
};

// Função para obter label do tipo
const getTypeLabel = (tipo: AgendaEvento['tipo']) => {
  switch (tipo) {
    case 'publico': return 'Evento Público';
    case 'ensino': return 'Ensino';
    case 'celula': return 'Célula';
    case 'reuniao_interna': return 'Reunião Interna';
    case 'pastoral': return 'Pastoral';
    default: return 'Evento';
  }
};

// Função para obter texto de data relativa
const getDataRelativa = (dataEvento: Date) => {
  if (isToday(dataEvento)) {
    return 'Hoje';
  } else if (isTomorrow(dataEvento)) {
    return 'Amanhã';
  } else if (isThisWeek(dataEvento)) {
    return format(dataEvento, 'EEEE', { locale: ptBR });
  } else {
    return format(dataEvento, 'dd/MM/yyyy', { locale: ptBR });
  }
};

const Agenda = () => {
  const { eventos, loading, getEventosPublicos, getEventosProximos } = useAgendaEventos();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Filtrar eventos conforme seleção
  const eventosFiltrados = eventos.filter(evento => {
    // Mostrar apenas eventos públicos para usuários não autenticados
    if (!evento.publico) return false;
    
    if (filtroTipo !== 'todos' && evento.tipo !== filtroTipo) return false;
    if (filtroStatus !== 'todos' && evento.status !== filtroStatus) return false;
    
    return true;
  });

  // Eventos por categoria temporal
  const eventosHoje = eventosFiltrados.filter(evento => 
    isToday(new Date(evento.data_inicio))
  );

  const eventosProximos = eventosFiltrados.filter(evento => {
    const dataEvento = new Date(evento.data_inicio);
    const hoje = new Date();
    const emSeteDias = addDays(hoje, 7);
    return dataEvento > hoje && dataEvento <= emSeteDias;
  });

  const eventosDestaque = eventosFiltrados.filter(evento => 
    evento.tipo === 'publico' && evento.status === 'confirmado'
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <p className="text-muted-foreground">Carregando agenda...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      
      {/* Hero Section */}
      <section className="relative bg-gradient-hero text-white section-padding">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl lg:text-5xl font-playfair font-bold mb-6">
            Agenda da Igreja
          </h1>
          <p className="text-xl opacity-90 mb-8">
            Acompanhe todos os eventos, cultos e atividades da nossa comunidade
          </p>
          
          {/* Contador de eventos hoje */}
          {eventosHoje.length > 0 && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 inline-block">
              <p className="text-lg font-medium">
                🗓️ {eventosHoje.length} evento{eventosHoje.length > 1 ? 's' : ''} hoje
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Filtros */}
      <section className="bg-background border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h2 className="text-2xl font-playfair font-bold">Próximos Eventos</h2>
            
            <div className="flex gap-4">
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Tipo de evento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="publico">Evento Público</SelectItem>
                  <SelectItem value="ensino">Ensino</SelectItem>
                  <SelectItem value="celula">Célula</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Eventos em Destaque */}
      {eventosDestaque.length > 0 && (
        <section className="section-padding bg-accent/30">
          <div className="max-w-6xl mx-auto">
            <h3 className="text-2xl font-playfair font-bold mb-8 text-center">Eventos em Destaque</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {eventosDestaque.map((evento) => {
                const IconeEvento = getTypeIcon(evento.tipo);
                const dataEvento = new Date(evento.data_inicio);
                
                return (
                  <Card key={evento.id} className="hover:shadow-lg transition-all duration-300 border-2 border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <IconeEvento className="w-5 h-5 text-white" />
                        </div>
                        <Badge className={getTypeColor(evento.tipo)}>
                          {getTypeLabel(evento.tipo)}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{evento.titulo}</CardTitle>
                      {evento.descricao && (
                        <CardDescription>{evento.descricao}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span className="font-medium">{getDataRelativa(dataEvento)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{format(dataEvento, 'HH:mm', { locale: ptBR })}</span>
                        </div>
                        {evento.local && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span>{evento.local}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Lista de Eventos */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="proximos" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="proximos">Próximos 7 dias</TabsTrigger>
              <TabsTrigger value="hoje">Hoje</TabsTrigger>
              <TabsTrigger value="publicos">Públicos</TabsTrigger>
              <TabsTrigger value="todos">Todos</TabsTrigger>
            </TabsList>

            <TabsContent value="proximos" className="space-y-6 mt-8">
              {eventosProximos.length > 0 ? (
                <div className="grid gap-4">
                  {eventosProximos.map((evento) => {
                    const IconeEvento = getTypeIcon(evento.tipo);
                    const dataEvento = new Date(evento.data_inicio);
                    
                    return (
                      <Card key={evento.id} className="hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                <IconeEvento className="w-6 h-6 text-white" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-playfair font-semibold">{evento.titulo}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {getTypeLabel(evento.tipo)}
                                  </Badge>
                                  {evento.publico ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                
                                {evento.descricao && (
                                  <p className="text-muted-foreground mb-4">{evento.descricao}</p>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{getDataRelativa(dataEvento)}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span>{format(dataEvento, 'HH:mm', { locale: ptBR })}</span>
                                  </div>
                                  {evento.local && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span>{evento.local}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Nenhum evento nos próximos 7 dias</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="hoje" className="space-y-6 mt-8">
              {eventosHoje.length > 0 ? (
                <div className="grid gap-4">
                  {eventosHoje.map((evento) => {
                    const IconeEvento = getTypeIcon(evento.tipo);
                    const dataEvento = new Date(evento.data_inicio);
                    
                    return (
                      <Card key={evento.id} className="hover:shadow-md transition-all duration-300 border-2 border-primary/30">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                <IconeEvento className="w-6 h-6 text-white" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-playfair font-semibold">{evento.titulo}</h3>
                                  <Badge className="bg-primary text-primary-foreground">HOJE</Badge>
                                </div>
                                
                                {evento.descricao && (
                                  <p className="text-muted-foreground mb-4">{evento.descricao}</p>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{format(dataEvento, 'HH:mm', { locale: ptBR })}</span>
                                  </div>
                                  {evento.local && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span>{evento.local}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Nenhum evento hoje</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="publicos" className="space-y-6 mt-8">
              {getEventosPublicos().length > 0 ? (
                <div className="grid gap-4">
                  {getEventosPublicos().map((evento) => {
                    const IconeEvento = getTypeIcon(evento.tipo);
                    const dataEvento = new Date(evento.data_inicio);
                    
                    return (
                      <Card key={evento.id} className="hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                <IconeEvento className="w-6 h-6 text-white" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-playfair font-semibold">{evento.titulo}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {getTypeLabel(evento.tipo)}
                                  </Badge>
                                  <Eye className="h-4 w-4 text-green-600" />
                                </div>
                                
                                {evento.descricao && (
                                  <p className="text-muted-foreground mb-4">{evento.descricao}</p>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{format(dataEvento, 'dd/MM/yyyy', { locale: ptBR })}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span>{format(dataEvento, 'HH:mm', { locale: ptBR })}</span>
                                  </div>
                                  {evento.local && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span>{evento.local}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Nenhum evento público cadastrado</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="todos" className="space-y-6 mt-8">
              {eventosFiltrados.length > 0 ? (
                <div className="grid gap-4">
                  {eventosFiltrados.map((evento) => {
                    const IconeEvento = getTypeIcon(evento.tipo);
                    const dataEvento = new Date(evento.data_inicio);
                    
                    return (
                      <Card key={evento.id} className="hover:shadow-md transition-all duration-300">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                                <IconeEvento className="w-6 h-6 text-white" />
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="text-xl font-playfair font-semibold">{evento.titulo}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {getTypeLabel(evento.tipo)}
                                  </Badge>
                                  {evento.publico ? (
                                    <Eye className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                                
                                {evento.descricao && (
                                  <p className="text-muted-foreground mb-4">{evento.descricao}</p>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="font-medium">{format(dataEvento, 'dd/MM/yyyy', { locale: ptBR })}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-primary" />
                                    <span>{format(dataEvento, 'HH:mm', { locale: ptBR })}</span>
                                  </div>
                                  {evento.local && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-primary" />
                                      <span>{evento.local}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">Nenhum evento encontrado</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Agenda;