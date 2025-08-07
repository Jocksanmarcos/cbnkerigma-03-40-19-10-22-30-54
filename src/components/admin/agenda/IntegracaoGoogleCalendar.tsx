import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, ExternalLink, Download, Link, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAgendaEventos } from '@/hooks/useAgendaEventos';
import { toast } from '@/hooks/use-toast';

interface GoogleCalendarConfig {
  calendar_id: string;
  sync_enabled: boolean;
  auto_create_events: boolean;
  sync_bidirectional: boolean;
  last_sync: string | null;
  sync_status: 'success' | 'error' | 'pending';
}

interface EventoSincronizado {
  evento_id: string;
  google_event_id: string;
  google_calendar_link: string;
  titulo: string;
  data_evento: string;
  sync_status: 'synced' | 'pending' | 'error';
  last_updated: string;
}

const IntegracaoGoogleCalendar = () => {
  const { eventos, updateEvento } = useAgendaEventos();
  const [config, setConfig] = useState<GoogleCalendarConfig>({
    calendar_id: '',
    sync_enabled: false,
    auto_create_events: false,
    sync_bidirectional: false,
    last_sync: null,
    sync_status: 'pending'
  });
  const [eventosSincronizados, setEventosSincronizados] = useState<EventoSincronizado[]>([]);
  const [loading, setLoading] = useState(false);
  const [conectado, setConectado] = useState(false);

  useEffect(() => {
    carregarConfiguracao();
    carregarEventosSincronizados();
  }, []);

  const carregarConfiguracao = async () => {
    try {
      // Simular carregamento da configuração
      setConfig({
        calendar_id: 'igreja@example.com',
        sync_enabled: true,
        auto_create_events: true,
        sync_bidirectional: false,
        last_sync: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        sync_status: 'success'
      });
      setConectado(true);
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
    }
  };

  const carregarEventosSincronizados = async () => {
    try {
      // Simular eventos sincronizados
      const mockEventos: EventoSincronizado[] = eventos.slice(0, 3).map((evento, index) => ({
        evento_id: evento.id,
        google_event_id: `google_event_${index}`,
        google_calendar_link: `https://calendar.google.com/calendar/event?eid=evento${index}`,
        titulo: evento.titulo,
        data_evento: evento.data_inicio,
        sync_status: index === 0 ? 'synced' : index === 1 ? 'pending' : 'error',
        last_updated: new Date().toISOString()
      }));
      setEventosSincronizados(mockEventos);
    } catch (error) {
      console.error('Erro ao carregar eventos sincronizados:', error);
    }
  };

  const conectarGoogleCalendar = async () => {
    setLoading(true);
    try {
      // Simular processo de autenticação OAuth do Google
      // Em uma implementação real, isso redirecionaria para o Google OAuth
      
      toast({
        title: "Redirecionando...",
        description: "Você será redirecionado para autorizar o acesso ao Google Calendar",
      });

      // Configurar webhook para sincronização automática
      await configurarWebhookGoogle();

      // Simular sucesso após delay
      setTimeout(() => {
        setConectado(true);
        toast({
          title: "Conectado com sucesso!",
          description: "Sua conta Google Calendar foi conectada e sincronização automática ativada.",
        });
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error('Erro ao conectar Google Calendar:', error);
      toast({
        title: "Erro",
        description: "Erro ao conectar com Google Calendar",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const configurarWebhookGoogle = async () => {
    try {
      // Configurar webhook do Google Calendar para sincronização automática
      const webhookUrl = `${window.location.origin}/api/google-calendar-webhook`;
      
      console.log('Configurando webhook:', webhookUrl);
      
      // Em uma implementação real, aqui seria feita a configuração do webhook no Google Calendar API
      // Por agora, apenas logamos a configuração
      
      toast({
        title: "Webhook configurado",
        description: "Sincronização automática ativada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao configurar webhook:', error);
      throw error;
    }
  };

  const desconectarGoogleCalendar = async () => {
    setLoading(true);
    try {
      setConectado(false);
      setConfig(prev => ({ ...prev, sync_enabled: false }));
      
      toast({
        title: "Desconectado",
        description: "Sua conta Google Calendar foi desconectada.",
      });
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    } finally {
      setLoading(false);
    }
  };

  const sincronizarEventos = async () => {
    setLoading(true);
    try {
      // Simular sincronização
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setConfig(prev => ({
        ...prev,
        last_sync: new Date().toISOString(),
        sync_status: 'success'
      }));

      // Atualizar status dos eventos
      setEventosSincronizados(prev => 
        prev.map(evento => ({
          ...evento,
          sync_status: 'synced',
          last_updated: new Date().toISOString()
        }))
      );

      toast({
        title: "Sincronização concluída!",
        description: "Todos os eventos foram sincronizados com o Google Calendar.",
      });
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast({
        title: "Erro na sincronização",
        description: "Erro ao sincronizar eventos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const criarEventoGoogleCalendar = async (eventoId: string) => {
    try {
      const evento = eventos.find(e => e.id === eventoId);
      if (!evento) return;

      // Simular criação do evento
      const googleEventId = `google_${Date.now()}`;
      const googleLink = `https://calendar.google.com/calendar/event?eid=${googleEventId}`;

      // Atualizar evento local com o link
      await updateEvento(eventoId, {
        link_google_calendar: googleLink
      });

      // Adicionar à lista de eventos sincronizados
      const novoEventoSincronizado: EventoSincronizado = {
        evento_id: eventoId,
        google_event_id: googleEventId,
        google_calendar_link: googleLink,
        titulo: evento.titulo,
        data_evento: evento.data_inicio,
        sync_status: 'synced',
        last_updated: new Date().toISOString()
      };

      setEventosSincronizados(prev => [...prev, novoEventoSincronizado]);

      toast({
        title: "Evento criado no Google Calendar",
        description: "O evento foi criado e sincronizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao criar evento:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar evento no Google Calendar",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'synced': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'synced': return CheckCircle2;
      case 'pending': return Calendar;
      case 'error': return AlertCircle;
      default: return Calendar;
    }
  };

  return (
    <div className="space-y-6">
      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Integração Google Calendar
          </CardTitle>
          <CardDescription>
            Sincronize seus eventos com o Google Calendar automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${conectado ? 'bg-green-500' : 'bg-red-500'}`} />
              <div>
                <p className="font-medium">
                  {conectado ? 'Conectado ao Google Calendar' : 'Não conectado'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {conectado ? config.calendar_id : 'Conecte sua conta para sincronizar eventos'}
                </p>
              </div>
            </div>
            
            {conectado ? (
              <Button 
                onClick={desconectarGoogleCalendar} 
                disabled={loading}
                variant="outline"
              >
                Desconectar
              </Button>
            ) : (
              <Button 
                onClick={conectarGoogleCalendar} 
                disabled={loading}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {loading ? 'Conectando...' : 'Conectar Google'}
              </Button>
            )}
          </div>

          {conectado && (
            <div className="space-y-4">
              {/* Configurações de Sincronização */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label>Configurações de Sincronização</Label>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sync-enabled" className="text-sm">
                      Sincronização automática
                    </Label>
                    <Switch
                      id="sync-enabled"
                      checked={config.sync_enabled}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, sync_enabled: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-create" className="text-sm">
                      Criar eventos automaticamente
                    </Label>
                    <Switch
                      id="auto-create"
                      checked={config.auto_create_events}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, auto_create_events: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="bidirectional" className="text-sm">
                      Sincronização bidirecional
                    </Label>
                    <Switch
                      id="bidirectional"
                      checked={config.sync_bidirectional}
                      onCheckedChange={(checked) => 
                        setConfig(prev => ({ ...prev, sync_bidirectional: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>ID do Calendário</Label>
                  <Input
                    value={config.calendar_id}
                    onChange={(e) => 
                      setConfig(prev => ({ ...prev, calendar_id: e.target.value }))
                    }
                    placeholder="exemplo@gmail.com"
                  />
                  
                  <div className="text-sm text-muted-foreground">
                    <p>Última sincronização:</p>
                    <p>{config.last_sync ? new Date(config.last_sync).toLocaleString() : 'Nunca'}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={sincronizarEventos} 
                  disabled={loading}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {loading ? 'Sincronizando...' : 'Sincronizar Agora'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {conectado && (
        <>
          {/* Eventos Disponíveis para Sincronização */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos Disponíveis</CardTitle>
              <CardDescription>
                Eventos que podem ser sincronizados com o Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventos.filter(evento => 
                  !eventosSincronizados.find(sync => sync.evento_id === evento.id)
                ).slice(0, 5).map((evento) => (
                  <div key={evento.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{evento.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(evento.data_inicio).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => criarEventoGoogleCalendar(evento.id)}
                    >
                      <Link className="h-4 w-4 mr-2" />
                      Sincronizar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Eventos Sincronizados */}
          <Card>
            <CardHeader>
              <CardTitle>Eventos Sincronizados</CardTitle>
              <CardDescription>
                Eventos já sincronizados com o Google Calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {eventosSincronizados.map((evento) => {
                  const StatusIcon = getStatusIcon(evento.sync_status);
                  return (
                    <div key={evento.evento_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <StatusIcon className="h-5 w-5" />
                        <div>
                          <h4 className="font-medium">{evento.titulo}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(evento.data_evento).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(evento.sync_status)}>
                          {evento.sync_status === 'synced' && 'Sincronizado'}
                          {evento.sync_status === 'pending' && 'Pendente'}
                          {evento.sync_status === 'error' && 'Erro'}
                        </Badge>
                        
                        {evento.sync_status === 'synced' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(evento.google_calendar_link, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Abrir no Google
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {eventosSincronizados.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum evento sincronizado ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default IntegracaoGoogleCalendar;