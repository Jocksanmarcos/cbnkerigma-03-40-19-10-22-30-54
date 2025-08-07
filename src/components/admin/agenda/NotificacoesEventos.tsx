import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Bell, Send, Users, Clock, CheckCircle2 } from 'lucide-react';
import { useAgendaEventos } from '@/hooks/useAgendaEventos';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificacaoEvento {
  id: string;
  evento_id: string;
  tipo: 'push' | 'email' | 'whatsapp';
  titulo: string;
  mensagem: string;
  enviado_em: string;
  total_destinatarios: number;
  total_entregues: number;
  status: 'pendente' | 'enviando' | 'concluido' | 'erro';
}

const NotificacoesEventos = () => {
  const { eventos } = useAgendaEventos();
  const [eventoSelecionado, setEventoSelecionado] = useState<string>('');
  const [tipoNotificacao, setTipoNotificacao] = useState<'push' | 'email' | 'whatsapp'>('push');
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [notificarLideres, setNotificarLideres] = useState(true);
  const [notificarMembros, setNotificarMembros] = useState(true);
  const [notificarVisitantes, setNotificarVisitantes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notificacoes, setNotificacoes] = useState<NotificacaoEvento[]>([]);

  const handleEnviarNotificacao = async () => {
    if (!eventoSelecionado || !titulo || !mensagem) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-event-notification', {
        body: {
          evento_id: eventoSelecionado,
          tipo: tipoNotificacao,
          titulo,
          mensagem,
          destinatarios: {
            lideres: notificarLideres,
            membros: notificarMembros,
            visitantes: notificarVisitantes,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Notificação enviada com sucesso!",
      });

      // Limpar formulário
      setTitulo('');
      setMensagem('');
      setEventoSelecionado('');

      // Atualizar lista de notificações
      carregarNotificacoes();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const carregarNotificacoes = async () => {
    try {
      // Simular dados enquanto a tabela não existe
      const mockData: NotificacaoEvento[] = [
        {
          id: '1',
          evento_id: 'evento-1',
          tipo: 'push',
          titulo: 'Lembrete: Culto Dominical',
          mensagem: 'Não esqueça do nosso culto dominical às 19h',
          enviado_em: new Date().toISOString(),
          total_destinatarios: 150,
          total_entregues: 143,
          status: 'concluido'
        }
      ];
      setNotificacoes(mockData);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-500';
      case 'enviando': return 'bg-blue-500';
      case 'erro': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido': return CheckCircle2;
      case 'enviando': return Clock;
      case 'erro': return Bell;
      default: return Bell;
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de Nova Notificação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Enviar Notificação
          </CardTitle>
          <CardDescription>
            Envie notificações para os participantes dos eventos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="evento">Evento</Label>
              <select
                id="evento"
                value={eventoSelecionado}
                onChange={(e) => setEventoSelecionado(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Selecione um evento</option>
                {eventos.map((evento) => (
                  <option key={evento.id} value={evento.id}>
                    {evento.titulo} - {new Date(evento.data_inicio).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Notificação</Label>
              <div className="flex gap-2">
                {(['push', 'email', 'whatsapp'] as const).map((tipo) => (
                  <Button
                    key={tipo}
                    variant={tipoNotificacao === tipo ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTipoNotificacao(tipo)}
                  >
                    {tipo === 'push' && '📱'}
                    {tipo === 'email' && '📧'}
                    {tipo === 'whatsapp' && '💬'}
                    {' '}
                    {tipo.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Notificação</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Lembrete: Culto hoje às 19h"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Digite a mensagem da notificação..."
              rows={3}
            />
          </div>

          <div className="space-y-3">
            <Label>Destinatários</Label>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="lideres"
                  checked={notificarLideres}
                  onCheckedChange={setNotificarLideres}
                />
                <Label htmlFor="lideres">Líderes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="membros"
                  checked={notificarMembros}
                  onCheckedChange={setNotificarMembros}
                />
                <Label htmlFor="membros">Membros</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="visitantes"
                  checked={notificarVisitantes}
                  onCheckedChange={setNotificarVisitantes}
                />
                <Label htmlFor="visitantes">Visitantes</Label>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleEnviarNotificacao} 
            disabled={loading}
            className="w-full"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar Notificação'}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>
            Últimas notificações enviadas para eventos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificacoes.map((notificacao) => {
              const StatusIcon = getStatusIcon(notificacao.status);
              return (
                <div key={notificacao.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium">{notificacao.titulo}</h4>
                      <p className="text-sm text-muted-foreground">
                        {notificacao.mensagem}
                      </p>
                    </div>
                    <Badge className={getStatusColor(notificacao.status)}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {notificacao.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{notificacao.total_destinatarios} destinatários</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{notificacao.total_entregues} entregues</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(notificacao.enviado_em).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {notificacoes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma notificação enviada ainda</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificacoesEventos;