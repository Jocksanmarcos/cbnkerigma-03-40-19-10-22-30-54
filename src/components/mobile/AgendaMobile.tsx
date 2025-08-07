import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle, 
  X, 
  Eye, 
  Plus,
  Bell,
  Heart,
  DollarSign,
  Edit,
  Trash2,
  Settings
} from 'lucide-react';
import { useAgendaEventos, type AgendaEvento } from '@/hooks/useAgendaEventos';
import { useAuth } from '@/hooks/useAuth';
import { useEventoInteractions } from '@/hooks/useEventoInteractions';
import { useSimpleNotifications } from '@/hooks/useSimpleNotifications';
import { format, isToday, isTomorrow, isThisWeek, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from '@/hooks/use-toast';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

interface EventoParaApp extends AgendaEvento {
  podeEditar: boolean;
  podeConfirmar: boolean;
  podeDoar: boolean;
  jaConfirmou: boolean;
}

interface AgendaMobileProps {
  userRole: 'member' | 'leader' | 'admin';
}

export const AgendaMobile: React.FC<AgendaMobileProps> = ({ userRole }) => {
  const { eventos, loading, createEvento, updateEvento, deleteEvento } = useAgendaEventos();
  const { user } = useAuth();
  const { confirmacoes, confirmarPresenca, cancelarConfirmacao, criarDoacao, criarPedidoOracao } = useEventoInteractions();
  const { preferences } = useSimpleNotifications();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AgendaEvento | null>(null);

  // Formulário para novo evento
  const [newEvent, setNewEvent] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    tipo: 'publico' as AgendaEvento['tipo'],
    publico: true,
    enviar_notificacao: true,
    status: 'agendado' as AgendaEvento['status'],
    visivel_para: ['todos'],
    grupo: 'geral'
  });

  // Feedback háptico
  const hapticFeedback = async (impact: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: impact });
    }
  };

  // Verificar permissões do usuário para cada evento
  const processarEventosParaApp = (): EventoParaApp[] => {
    return eventos.map(evento => ({
      ...evento,
      podeEditar: userRole === 'admin' || userRole === 'leader',
      podeConfirmar: ['member', 'leader', 'admin'].includes(userRole),
      podeDoar: ['member', 'leader', 'admin'].includes(userRole),
      jaConfirmou: confirmacoes[evento.id] || false
    }));
  };

  const eventosParaApp = processarEventosParaApp();

  // Categorizar eventos
  const eventosHoje = eventosParaApp.filter(evento => 
    isToday(new Date(evento.data_inicio))
  );

  const eventosProximos = eventosParaApp.filter(evento => {
    const dataEvento = new Date(evento.data_inicio);
    const hoje = new Date();
    const emSeteDias = addDays(hoje, 7);
    return dataEvento > hoje && dataEvento <= emSeteDias;
  });

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
      case 'pastoral': return Settings;
      default: return Calendar;
    }
  };

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

  const handleConfirmarPresenca = async (eventoId: string) => {
    await hapticFeedback(ImpactStyle.Light);
    
    const success = await confirmarPresenca(eventoId);
    if (success) {
      // Agendar lembrete local se as notificações estão habilitadas
      if (Capacitor.isNativePlatform() && preferences?.evento_reminders) {
        const evento = eventos.find(e => e.id === eventoId);
        if (evento) {
          const dataEvento = new Date(evento.data_inicio);
          const lembrete = new Date(dataEvento.getTime() - 30 * 60 * 1000); // 30 min antes
          
          try {
            await LocalNotifications.schedule({
              notifications: [{
                title: `Lembrete: ${evento.titulo}`,
                body: `O evento começará em 30 minutos - ${evento.local || 'Local não informado'}`,
                id: parseInt(eventoId.replace(/\D/g, '')) || Math.floor(Math.random() * 10000),
                schedule: { at: lembrete },
                sound: preferences?.sound_enabled ? 'beep.wav' : undefined
              }]
            });
          } catch (error) {
            console.error('Erro ao agendar lembrete:', error);
          }
        }
      }
    }
  };

  const handleCancelarPresenca = async (eventoId: string) => {
    await hapticFeedback(ImpactStyle.Light);
    await cancelarConfirmacao(eventoId);
  };

  const handleCreateEvent = async () => {
    await hapticFeedback();
    try {
      await createEvento({
        ...newEvent,
        organizador_id: user?.id
      });
      
      setShowCreateDialog(false);
      setNewEvent({
        titulo: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        local: '',
        tipo: 'publico',
        publico: true,
        enviar_notificacao: true,
        status: 'agendado',
        visivel_para: ['todos'],
        grupo: 'geral'
      });
      
      toast({
        title: "Evento criado!",
        description: "O evento foi criado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o evento.",
        variant: "destructive",
      });
    }
  };

  const handlePedidoOracao = async (eventoId: string) => {
    await hapticFeedback();
    
    // Por enquanto, vamos apenas abrir um prompt simples
    const pedido = prompt('Digite seu pedido de oração para este evento:');
    if (pedido && pedido.trim()) {
      try {
        await criarPedidoOracao({
          evento_id: eventoId,
          nome_solicitante: user?.email?.split('@')[0] || 'Anônimo',
          email_solicitante: user?.email,
          pedido: pedido.trim(),
          publico: false,
          status: 'ativo'
        });
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  const handleDoacao = async (eventoId: string) => {
    await hapticFeedback();
    
    // Por enquanto, vamos apenas abrir um prompt simples
    const valorStr = prompt('Digite o valor da doação (R$):');
    if (valorStr && !isNaN(Number(valorStr))) {
      try {
        await criarDoacao({
          evento_id: eventoId,
          nome_doador: user?.email?.split('@')[0] || 'Anônimo',
          email_doador: user?.email,
          valor: Number(valorStr),
          tipo_doacao: 'dinheiro',
          status: 'pendente',
          metodo_pagamento: 'pix'
        });
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-muted-foreground">Carregando agenda...</p>
      </div>
    );
  }

  return (
    <div className="pb-20"> {/* Espaço para navegação inferior */}
      {/* Header com ações */}
      <div className="sticky top-0 bg-background border-b z-10 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Agenda</h1>
          
          <div className="flex gap-2">
            {/* Botão de notificações */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => hapticFeedback()}
              className={preferences?.evento_reminders ? 'text-primary' : 'text-muted-foreground'}
            >
              <Bell className="w-5 h-5" />
            </Button>
            
            {/* Botão criar evento */}
            {(userRole === 'leader' || userRole === 'admin') && (
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button size="sm" onClick={() => hapticFeedback()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Evento</DialogTitle>
                    <DialogDescription>
                      Preencha as informações do evento
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="titulo">Título</Label>
                      <Input
                        id="titulo"
                        value={newEvent.titulo}
                        onChange={(e) => setNewEvent({...newEvent, titulo: e.target.value})}
                        placeholder="Nome do evento"
                      />
                    </div>
                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={newEvent.descricao}
                        onChange={(e) => setNewEvent({...newEvent, descricao: e.target.value})}
                        placeholder="Descrição do evento"
                      />
                    </div>
                    <div>
                      <Label htmlFor="data_inicio">Data e Hora</Label>
                      <Input
                        id="data_inicio"
                        type="datetime-local"
                        value={newEvent.data_inicio}
                        onChange={(e) => setNewEvent({...newEvent, data_inicio: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="local">Local</Label>
                      <Input
                        id="local"
                        value={newEvent.local}
                        onChange={(e) => setNewEvent({...newEvent, local: e.target.value})}
                        placeholder="Local do evento"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="publico"
                        checked={newEvent.publico}
                        onCheckedChange={(checked) => setNewEvent({...newEvent, publico: checked})}
                      />
                      <Label htmlFor="publico">Evento público</Label>
                    </div>
                    <Button onClick={handleCreateEvent} className="w-full">
                      Criar Evento
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Eventos de hoje em destaque */}
      {eventosHoje.length > 0 && (
        <div className="p-4 bg-primary/5">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-primary" />
            Hoje ({eventosHoje.length})
          </h2>
          <div className="space-y-3">
            {eventosHoje.map((evento) => {
              const IconeEvento = getEventoIcon(evento.tipo);
              const dataEvento = new Date(evento.data_inicio);
              
              return (
                <Card key={evento.id} className="border-primary/30 bg-background">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                        <IconeEvento className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{evento.titulo}</h3>
                          <Badge className="bg-primary text-white text-xs">HOJE</Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{format(dataEvento, 'HH:mm')}</span>
                          </div>
                          {evento.local && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{evento.local}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Ações do evento */}
                        <div className="flex flex-wrap gap-2">
                          {evento.podeConfirmar && (
                            <Button
                              size="sm"
                              variant={evento.jaConfirmou ? "default" : "outline"}
                              onClick={() => evento.jaConfirmou 
                                ? handleCancelarPresenca(evento.id) 
                                : handleConfirmarPresenca(evento.id)
                              }
                              className="text-xs"
                            >
                              {evento.jaConfirmou ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Confirmado
                                </>
                              ) : (
                                'Confirmar Presença'
                              )}
                            </Button>
                          )}
                          
                          {evento.podeDoar && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDoacao(evento.id)}
                              className="text-xs"
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Contribuir
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePedidoOracao(evento.id)}
                            className="text-xs"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Oração
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="p-4">
        <Tabs defaultValue="proximos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="proximos">Próximos</TabsTrigger>
            <TabsTrigger value="publicos">Públicos</TabsTrigger>
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>

          <TabsContent value="proximos" className="space-y-4 mt-6">
            {eventosProximos.length > 0 ? (
              <div className="space-y-4">
                {eventosProximos.map((evento) => {
                  const IconeEvento = getEventoIcon(evento.tipo);
                  const dataEvento = new Date(evento.data_inicio);
                  
                  return (
                    <Card key={evento.id} className="hover:shadow-md transition-all duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                            <IconeEvento className="w-5 h-5 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium">{evento.titulo}</h3>
                              {evento.podeEditar && (
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                      hapticFeedback();
                                      setEditingEvent(evento);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                            
                            {evento.descricao && (
                              <p className="text-sm text-muted-foreground mb-3">{evento.descricao}</p>
                            )}
                            
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>{getDataRelativa(dataEvento)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{format(dataEvento, 'HH:mm')}</span>
                              </div>
                              {evento.local && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  <span>{evento.local}</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Ações do evento */}
                            <div className="flex flex-wrap gap-2">
                              {evento.podeConfirmar && (
                                <Button
                                  size="sm"
                                  variant={evento.jaConfirmou ? "default" : "outline"}
                                  onClick={() => evento.jaConfirmou 
                                    ? handleCancelarPresenca(evento.id) 
                                    : handleConfirmarPresenca(evento.id)
                                  }
                                  className="text-xs"
                                >
                                  {evento.jaConfirmou ? (
                                    <>
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Confirmado
                                    </>
                                  ) : (
                                    'Confirmar'
                                  )}
                                </Button>
                              )}
                              
                              {evento.podeDoar && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDoacao(evento.id)}
                                  className="text-xs"
                                >
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Doar
                                </Button>
                              )}
                              
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePedidoOracao(evento.id)}
                                className="text-xs"
                              >
                                <Heart className="h-3 w-3 mr-1" />
                                Oração
                              </Button>
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
                <p className="text-muted-foreground">Nenhum evento nos próximos dias</p>
              </div>
            )}
          </TabsContent>

          {/* Outras abas seguem o mesmo padrão */}
          <TabsContent value="publicos" className="space-y-4 mt-6">
            {/* Implementar lista de eventos públicos */}
            <div className="text-center py-12">
              <Eye className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Eventos públicos</p>
            </div>
          </TabsContent>

          <TabsContent value="todos" className="space-y-4 mt-6">
            {/* Implementar lista de todos os eventos */}
            <div className="text-center py-12">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Todos os eventos</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};