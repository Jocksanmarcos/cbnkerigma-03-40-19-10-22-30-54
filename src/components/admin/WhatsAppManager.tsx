import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedQuery } from '@/hooks/useOptimizedQuery';
import { supabase } from '@/integrations/supabase/client';
import { 
  MessageCircle, 
  Send, 
  Users, 
  Settings, 
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Upload,
  Download
} from 'lucide-react';

interface WhatsAppMessage {
  id: string;
  phone: string;
  message: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'template' | 'media';
  created_at: string;
  external_id?: string;
  campaign_id?: string;
}

interface WhatsAppTemplate {
  id: string;
  name: string;
  status: string;
  category: string;
  language: string;
  components: any[];
}

export const WhatsAppManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  
  // Single message form
  const [singleMessage, setSingleMessage] = useState({
    phone: '',
    message: '',
    priority: 'normal' as 'high' | 'normal' | 'low'
  });

  // Bulk message form
  const [bulkMessage, setBulkMessage] = useState({
    recipients: '',
    message: '',
    useTemplate: false,
    templateName: '',
    variables: '{}'
  });

  // WhatsApp status
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);

  // Fetch WhatsApp messages - using raw query until types are updated
  const { data: messages = [], loading: messagesLoading, refetch: refetchMessages } = useOptimizedQuery({
    queryKey: 'whatsapp-messages',
    queryFn: async (): Promise<any[]> => {
      // Use raw SQL query since the table is newly created
      const { data, error } = await supabase
        .rpc('execute_query', { 
          query_text: `
            SELECT id, phone, message, status, type, created_at, external_id, campaign_id
            FROM whatsapp_messages 
            ORDER BY created_at DESC 
            LIMIT 100
          `
        });

      if (error) {
        console.error('Error fetching WhatsApp messages:', error);
        return [];
      }
      return (Array.isArray(data) ? data : []) as any[];
    },
    staleTime: 30000,
  });

  // Fetch WhatsApp templates
  const { data: templates = [], loading: templatesLoading } = useOptimizedQuery<WhatsAppTemplate[]>({
    queryKey: 'whatsapp-templates',
    queryFn: async () => {
      try {
        const { data, error } = await supabase.functions.invoke('whatsapp-integration/templates');
        if (error) throw error;
        return data?.templates || [];
      } catch (error) {
        console.error('Error fetching templates:', error);
        return [];
      }
    },
    staleTime: 300000, // 5 minutes
  });

  // Check WhatsApp status on component mount
  useEffect(() => {
    checkWhatsAppStatus();
  }, []);

  const checkWhatsAppStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-integration/status');
      if (error) throw error;
      setWhatsappStatus(data);
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      setWhatsappStatus({ error: 'Não foi possível verificar o status', status: 'offline' });
    }
  };

  const sendSingleMessage = async () => {
    if (!singleMessage.phone || !singleMessage.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o telefone e a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('whatsapp-integration/send-message', {
        body: {
          phone: singleMessage.phone,
          message: singleMessage.message,
          priority: singleMessage.priority,
          type: 'text'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Mensagem enviada",
          description: `Mensagem enviada para ${singleMessage.phone}`,
        });
        setSingleMessage({ phone: '', message: '', priority: 'normal' });
        await refetchMessages();
      } else {
        throw new Error(data.error || 'Erro ao enviar mensagem');
      }
    } catch (error: any) {
      toast({
        title: "Erro ao enviar mensagem",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const sendBulkMessage = async () => {
    if (!bulkMessage.recipients || !bulkMessage.message) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha os destinatários e a mensagem.",
        variant: "destructive",
      });
      return;
    }

    setBulkLoading(true);
    try {
      // Parse recipients (one per line or comma separated)
      const recipients = bulkMessage.recipients
        .split(/[\n,]/)
        .map(phone => phone.trim())
        .filter(phone => phone.length > 0);

      if (recipients.length === 0) {
        throw new Error('Nenhum destinatário válido encontrado');
      }

      // Parse variables if provided
      let variables = [];
      if (bulkMessage.variables.trim()) {
        try {
          variables = JSON.parse(bulkMessage.variables);
          if (!Array.isArray(variables)) {
            variables = [variables];
          }
        } catch (error) {
          throw new Error('Formato de variáveis inválido. Use JSON válido.');
        }
      }

      const { data, error } = await supabase.functions.invoke('whatsapp-integration/send-bulk', {
        body: {
          recipients,
          message: bulkMessage.message,
          variables,
          campaignId: `bulk-${Date.now()}`
        }
      });

      if (error) throw error;

      toast({
        title: "Envio em massa concluído",
        description: `${data.summary.successful}/${data.summary.total} mensagens enviadas com sucesso`,
      });

      setBulkMessage({
        recipients: '',
        message: '',
        useTemplate: false,
        templateName: '',
        variables: '{}'
      });

      await refetchMessages();
    } catch (error: any) {
      toast({
        title: "Erro no envio em massa",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBulkLoading(false);
    }
  };

  const exportMessages = () => {
    if (messages.length === 0) {
      toast({
        title: "Nenhuma mensagem",
        description: "Não há mensagens para exportar.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ['Telefone', 'Mensagem', 'Status', 'Tipo', 'Data de Envio'],
      ...messages.map(msg => [
        msg.phone,
        msg.message.replace(/"/g, '""'), // Escape quotes
        msg.status,
        msg.type,
        new Date(msg.created_at).toLocaleString('pt-BR')
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-messages-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Mensagens exportadas",
      description: "Arquivo CSV baixado com sucesso.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'read': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'read': return 'bg-green-100 text-green-900';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Status do WhatsApp */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Status do WhatsApp
            </div>
            <Button variant="outline" size="sm" onClick={checkWhatsAppStatus}>
              <Settings className="h-4 w-4 mr-2" />
              Verificar Status
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {whatsappStatus ? (
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                whatsappStatus.error ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}>
                {whatsappStatus.error ? (
                  <XCircle className="h-4 w-4" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {whatsappStatus.error ? 'Desconectado' : 'Conectado'}
                </span>
              </div>
              {whatsappStatus.display_phone_number && (
                <span className="text-sm text-muted-foreground">
                  Número: {whatsappStatus.display_phone_number}
                </span>
              )}
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Verificando status...
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="single">Mensagem Individual</TabsTrigger>
          <TabsTrigger value="bulk">Envio em Massa</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        {/* Mensagem Individual */}
        <TabsContent value="single" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem Individual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(11) 99999-9999"
                    value={singleMessage.phone}
                    onChange={(e) => setSingleMessage(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <select
                    id="priority"
                    className="w-full p-2 border rounded-md"
                    value={singleMessage.priority}
                    onChange={(e) => setSingleMessage(prev => ({ 
                      ...prev, 
                      priority: e.target.value as 'high' | 'normal' | 'low' 
                    }))}
                  >
                    <option value="normal">Normal</option>
                    <option value="high">Alta</option>
                    <option value="low">Baixa</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                  value={singleMessage.message}
                  onChange={(e) => setSingleMessage(prev => ({ ...prev, message: e.target.value }))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {singleMessage.message.length}/1000 caracteres
                </div>
              </div>

              <Button 
                onClick={sendSingleMessage} 
                disabled={loading || !singleMessage.phone || !singleMessage.message}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Envio em Massa */}
        <TabsContent value="bulk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Envio em Massa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="recipients">Destinatários</Label>
                <Textarea
                  id="recipients"
                  placeholder="Um telefone por linha ou separado por vírgula&#10;(11) 99999-9999&#10;(11) 88888-8888"
                  rows={6}
                  value={bulkMessage.recipients}
                  onChange={(e) => setBulkMessage(prev => ({ ...prev, recipients: e.target.value }))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {bulkMessage.recipients.split(/[\n,]/).filter(phone => phone.trim()).length} destinatários
                </div>
              </div>

              <div>
                <Label htmlFor="bulkMessage">Mensagem</Label>
                <Textarea
                  id="bulkMessage"
                  placeholder="Digite sua mensagem aqui... Use {{nome}}, {{igreja}} para personalizar"
                  rows={4}
                  value={bulkMessage.message}
                  onChange={(e) => setBulkMessage(prev => ({ ...prev, message: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="variables">Variáveis (JSON)</Label>
                <Textarea
                  id="variables"
                  placeholder='[{"nome": "João", "igreja": "São Paulo"}, {"nome": "Maria", "igreja": "Rio"}]'
                  rows={3}
                  value={bulkMessage.variables}
                  onChange={(e) => setBulkMessage(prev => ({ ...prev, variables: e.target.value }))}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Opcional: Array JSON com variáveis para personalização
                </div>
              </div>

              <Button 
                onClick={sendBulkMessage} 
                disabled={bulkLoading || !bulkMessage.recipients || !bulkMessage.message}
                className="w-full"
              >
                {bulkLoading ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Enviando em massa...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    Enviar para Todos
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Histórico de Mensagens</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={exportMessages}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => refetchMessages()}>
                    <Settings className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {messagesLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-4 border rounded-lg animate-pulse">
                      <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-full mb-1"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Nenhuma mensagem enviada ainda</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{message.phone}</span>
                            <Badge className={getStatusColor(message.status)}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(message.status)}
                                {message.status}
                              </div>
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {message.type}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {message.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>{new Date(message.created_at).toLocaleString('pt-BR')}</span>
                            {message.external_id && (
                              <span>ID: {message.external_id.slice(0, 8)}...</span>
                            )}
                            {message.campaign_id && (
                              <span>Campanha: {message.campaign_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhatsAppManager;