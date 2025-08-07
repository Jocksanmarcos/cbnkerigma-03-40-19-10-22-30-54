import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell, Send, Users, Calendar, AlertTriangle, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';

interface Notification {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
  destinatario_tipo: 'todos' | 'grupo' | 'individual';
  destinatario_ids?: string[] | string;
  enviado_em?: string;
  lido_em?: string;
  status: 'rascunho' | 'enviado' | 'lido';
  criado_por: string;
  created_at: string;
}

type DestinatarioTipo = 'todos' | 'grupo' | 'individual';

const NotificationCenter = () => {
  const [activeTab, setActiveTab] = useState('enviar');
  const [newNotification, setNewNotification] = useState<{
    titulo: string;
    mensagem: string;
    tipo: 'info' | 'sucesso' | 'aviso' | 'erro';
    destinatario_tipo: DestinatarioTipo;
    destinatario_ids: string[];
  }>({
    titulo: '',
    mensagem: '',
    tipo: 'info',
    destinatario_tipo: 'todos',
    destinatario_ids: []
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Buscar notificações usando tipos genéricos
  const { data: notifications = [], loading: notificationsLoading, refetch } = useOptimizedQuery({
    queryKey: 'notifications',
    queryFn: async (): Promise<any[]> => {
      const { data, error } = await supabase.rpc('execute_query', {
        query_text: `
          SELECT n.*, p.nome_completo as criado_por_nome
          FROM notificacoes_usuarios n
          LEFT JOIN pessoas p ON p.id::text = n.criado_por
          ORDER BY n.created_at DESC
          LIMIT 100
        `
      });
      
      if (error) throw error;
      return (Array.isArray(data) ? data : []) as any[];
    },
    staleTime: 30000
  });

  // Buscar pessoas para destinatários
  const { data: pessoas = [] } = useOptimizedQuery({
    queryKey: 'pessoas-select',
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pessoas')
        .select('id, nome_completo, email')
        .eq('situacao', 'ativo')
        .order('nome_completo');
      
      if (error) throw error;
      return data || [];
    }
  });

  const handleSendNotification = async () => {
    if (!newNotification.titulo.trim() || !newNotification.mensagem.trim()) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const notificationData = {
        titulo: newNotification.titulo,
        mensagem: newNotification.mensagem,
        tipo: newNotification.tipo,
        destinatario_tipo: newNotification.destinatario_tipo,
        destinatario_ids: newNotification.destinatario_tipo === 'individual' ? JSON.stringify(newNotification.destinatario_ids) : null,
        status: 'enviado',
        enviado_em: new Date().toISOString(),
        criado_por: user?.id
      };

      const { error } = await supabase
        .from('notificacoes_usuarios' as any)
        .insert(notificationData);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Notificação enviada com sucesso!"
      });

      setNewNotification({
        titulo: '',
        mensagem: '',
        tipo: 'info',
        destinatario_tipo: 'todos',
        destinatario_ids: []
      });

      refetch();
    } catch (error) {
      console.error('Erro ao enviar notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar notificação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes_usuarios' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Notificação excluída com sucesso!"
      });

      refetch();
    } catch (error) {
      console.error('Erro ao excluir notificação:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir notificação",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'enviado': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rascunho': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'lido': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'sucesso': return 'bg-green-100 text-green-800';
      case 'aviso': return 'bg-yellow-100 text-yellow-800';
      case 'erro': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Bell className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Central de Notificações</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enviar">Enviar Notificação</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="enviar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Nova Notificação
              </CardTitle>
              <CardDescription>
                Envie notificações para membros da igreja
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Título</label>
                  <Input
                    value={newNotification.titulo}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Título da notificação"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select
                    value={newNotification.tipo}
                    onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Informação</SelectItem>
                      <SelectItem value="sucesso">Sucesso</SelectItem>
                      <SelectItem value="aviso">Aviso</SelectItem>
                      <SelectItem value="erro">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  value={newNotification.mensagem}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, mensagem: e.target.value }))}
                  placeholder="Conteúdo da notificação"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Destinatários</label>
                <Select
                  value={newNotification.destinatario_tipo}
                  onValueChange={(value: any) => setNewNotification(prev => ({ ...prev, destinatario_tipo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os membros</SelectItem>
                    <SelectItem value="grupo">Grupo específico</SelectItem>
                    <SelectItem value="individual">Pessoas específicas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newNotification.destinatario_tipo === 'individual' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecionar Pessoas</label>
                  <Select
                    onValueChange={(value) => {
                      setNewNotification(prev => ({
                        ...prev,
                        destinatario_ids: [...prev.destinatario_ids, value]
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma pessoa" />
                    </SelectTrigger>
                    <SelectContent>
                      {pessoas.map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {newNotification.destinatario_ids.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {newNotification.destinatario_ids.map((id) => {
                        const pessoa = pessoas.find(p => p.id === id);
                        return (
                          <Badge key={id} variant="outline">
                            {pessoa?.nome_completo}
                            <button
                              onClick={() => {
                                setNewNotification(prev => ({
                                  ...prev,
                                  destinatario_ids: prev.destinatario_ids.filter(pId => pId !== id)
                                }));
                              }}
                              className="ml-2 text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              <Button onClick={handleSendNotification} disabled={loading} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Enviando...' : 'Enviar Notificação'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Notificações</CardTitle>
              <CardDescription>
                Visualize todas as notificações enviadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {notificationsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications.map((notification: any) => (
                    <div key={notification.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(notification.status)}
                          <h3 className="font-semibold">{notification.titulo}</h3>
                          <Badge className={getTipoColor(notification.tipo)}>
                            {notification.tipo}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{notification.mensagem}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Criado por: {notification.criado_por_nome || 'Sistema'}</span>
                          <span>Em: {new Date(notification.created_at).toLocaleString()}</span>
                          <span>Destinatários: {notification.destinatario_tipo}</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {notifications.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhuma notificação encontrada
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
              <CardDescription>
                Configure as preferências de notificação do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Notificações automáticas</h4>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações automáticas para eventos importantes
                    </p>
                  </div>
                  <Button variant="outline">Configurar</Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Templates de notificação</h4>
                    <p className="text-sm text-muted-foreground">
                      Gerenciar templates para notificações recorrentes
                    </p>
                  </div>
                  <Button variant="outline">Gerenciar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotificationCenter;