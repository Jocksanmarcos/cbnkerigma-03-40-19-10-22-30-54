import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Bell, Play, Pause, Settings, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useAgendaEventos } from '@/hooks/useAgendaEventos';
import { toast } from '@/hooks/use-toast';

interface LembreteAutomatico {
  id: string;
  evento_id: string;
  tipo_lembrete: '1_semana' | '3_dias' | '1_dia' | '2_horas' | '30_minutos';
  minutos_antes: number;
  ativo: boolean;
  template_titulo: string;
  template_mensagem: string;
  proxima_execucao: string;
  ultima_execucao?: string;
}

interface TemplateDefault {
  tipo: string;
  titulo: string;
  mensagem: string;
  minutos: number;
}

const LembretesAutomaticos = () => {
  const { eventos } = useAgendaEventos();
  const [lembretes, setLembretes] = useState<LembreteAutomatico[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<string>('');
  const [tipoLembrete, setTipoLembrete] = useState<'1_semana' | '3_dias' | '1_dia' | '2_horas' | '30_minutos'>('1_dia');
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [loading, setLoading] = useState(false);

  const templatesDefault: TemplateDefault[] = [
    {
      tipo: '1_semana',
      titulo: 'Lembrete: {evento} na próxima semana',
      mensagem: 'Olá! Lembramos que o evento "{evento}" acontecerá em uma semana, no dia {data} às {horario}. Não esqueça de confirmar sua presença!',
      minutos: 7 * 24 * 60
    },
    {
      tipo: '3_dias',
      titulo: 'Faltam 3 dias para {evento}',
      mensagem: 'O evento "{evento}" está chegando! Será no dia {data} às {horario}. Prepare-se e não falte!',
      minutos: 3 * 24 * 60
    },
    {
      tipo: '1_dia',
      titulo: 'Amanhã é dia de {evento}',
      mensagem: 'Não esqueça! Amanhã ({data}) às {horario} teremos "{evento}". Te esperamos lá!',
      minutos: 24 * 60
    },
    {
      tipo: '2_horas',
      titulo: '{evento} em 2 horas',
      mensagem: 'O evento "{evento}" começará em 2 horas! Às {horario}. Não se atrase!',
      minutos: 2 * 60
    },
    {
      tipo: '30_minutos',
      titulo: '{evento} em 30 minutos',
      mensagem: 'Atenção! O evento "{evento}" começará em 30 minutos. É hora de se dirigir ao local!',
      minutos: 30
    }
  ];

  useEffect(() => {
    carregarLembretes();
  }, []);

  useEffect(() => {
    const template = templatesDefault.find(t => t.tipo === tipoLembrete);
    if (template) {
      setTitulo(template.titulo);
      setMensagem(template.mensagem);
    }
  }, [tipoLembrete]);

  const carregarLembretes = async () => {
    try {
      // Simular dados de lembretes
      const mockLembretes: LembreteAutomatico[] = [
        {
          id: '1',
          evento_id: eventos[0]?.id || '',
          tipo_lembrete: '1_dia',
          minutos_antes: 24 * 60,
          ativo: true,
          template_titulo: 'Amanhã é dia de {evento}',
          template_mensagem: 'Não esqueça! Amanhã ({data}) às {horario} teremos "{evento}". Te esperamos lá!',
          proxima_execucao: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          ultima_execucao: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          evento_id: eventos[1]?.id || '',
          tipo_lembrete: '2_horas',
          minutos_antes: 2 * 60,
          ativo: true,
          template_titulo: '{evento} em 2 horas',
          template_mensagem: 'O evento "{evento}" começará em 2 horas! Às {horario}. Não se atrase!',
          proxima_execucao: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
        }
      ];
      setLembretes(mockLembretes);
    } catch (error) {
      console.error('Erro ao carregar lembretes:', error);
    }
  };

  const criarLembrete = async () => {
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
      const template = templatesDefault.find(t => t.tipo === tipoLembrete);
      const novoLembrete: LembreteAutomatico = {
        id: Date.now().toString(),
        evento_id: eventoSelecionado,
        tipo_lembrete: tipoLembrete,
        minutos_antes: template?.minutos || 60,
        ativo,
        template_titulo: titulo,
        template_mensagem: mensagem,
        proxima_execucao: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };

      setLembretes(prev => [...prev, novoLembrete]);

      toast({
        title: "Lembrete criado!",
        description: "O lembrete automático foi configurado com sucesso.",
      });

      // Limpar formulário
      setEventoSelecionado('');
      setTitulo('');
      setMensagem('');
      setAtivo(true);
    } catch (error) {
      console.error('Erro ao criar lembrete:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar lembrete automático",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleLembrete = async (lembreteId: string, novoStatus: boolean) => {
    try {
      setLembretes(prev => 
        prev.map(lembrete => 
          lembrete.id === lembreteId 
            ? { ...lembrete, ativo: novoStatus }
            : lembrete
        )
      );

      toast({
        title: novoStatus ? "Lembrete ativado" : "Lembrete desativado",
        description: `O lembrete foi ${novoStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao alterar status do lembrete:', error);
    }
  };

  const deletarLembrete = async (lembreteId: string) => {
    try {
      setLembretes(prev => prev.filter(lembrete => lembrete.id !== lembreteId));
      
      toast({
        title: "Lembrete removido",
        description: "O lembrete automático foi removido com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao deletar lembrete:', error);
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case '1_semana': return '1 semana antes';
      case '3_dias': return '3 dias antes';
      case '1_dia': return '1 dia antes';
      case '2_horas': return '2 horas antes';
      case '30_minutos': return '30 minutos antes';
      default: return tipo;
    }
  };

  return (
    <div className="space-y-6">
      {/* Criar Novo Lembrete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Criar Lembrete Automático
          </CardTitle>
          <CardDescription>
            Configure lembretes automáticos para seus eventos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="evento">Evento</Label>
              <Select value={eventoSelecionado} onValueChange={setEventoSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  {eventos.map((evento) => (
                    <SelectItem key={evento.id} value={evento.id}>
                      {evento.titulo} - {new Date(evento.data_inicio).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo">Tempo do Lembrete</Label>
              <Select value={tipoLembrete} onValueChange={(value: any) => setTipoLembrete(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templatesDefault.map((template) => (
                    <SelectItem key={template.tipo} value={template.tipo}>
                      {getTipoLabel(template.tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="titulo">Título do Lembrete</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Use {evento}, {data}, {horario} como variáveis"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mensagem">Mensagem do Lembrete</Label>
            <Textarea
              id="mensagem"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Use {evento}, {data}, {horario} como variáveis"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="ativo"
              checked={ativo}
              onCheckedChange={setAtivo}
            />
            <Label htmlFor="ativo">Lembrete ativo</Label>
          </div>

          <div className="text-sm text-muted-foreground p-3 bg-blue-50 rounded-lg">
            <p className="font-medium mb-1">Variáveis disponíveis:</p>
            <ul className="space-y-1">
              <li><code>{'{evento}'}</code> - Nome do evento</li>
              <li><code>{'{data}'}</code> - Data do evento (dd/mm/yyyy)</li>
              <li><code>{'{horario}'}</code> - Horário do evento (HH:mm)</li>
            </ul>
          </div>

          <Button 
            onClick={criarLembrete} 
            disabled={loading}
            className="w-full"
          >
            <Clock className="h-4 w-4 mr-2" />
            {loading ? 'Criando...' : 'Criar Lembrete'}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Lembretes */}
      <Card>
        <CardHeader>
          <CardTitle>Lembretes Configurados</CardTitle>
          <CardDescription>
            Gerencie todos os lembretes automáticos configurados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lembretes.map((lembrete) => {
              const evento = eventos.find(e => e.id === lembrete.evento_id);
              
              return (
                <div key={lembrete.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{evento?.titulo || 'Evento não encontrado'}</h4>
                        <Badge variant={lembrete.ativo ? 'default' : 'secondary'}>
                          {getTipoLabel(lembrete.tipo_lembrete)}
                        </Badge>
                        {lembrete.ativo ? (
                          <Badge className="bg-green-500">
                            <Play className="h-3 w-3 mr-1" />
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <Pause className="h-3 w-3 mr-1" />
                            Pausado
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium">Título: {lembrete.template_titulo}</p>
                          <p className="text-muted-foreground">{lembrete.template_mensagem}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>Próximo: {new Date(lembrete.proxima_execucao).toLocaleString()}</span>
                          </div>
                          
                          {lembrete.ultima_execucao && (
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Último: {new Date(lembrete.ultima_execucao).toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleLembrete(lembrete.id, !lembrete.ativo)}
                      >
                        {lembrete.ativo ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deletarLembrete(lembrete.id)}
                      >
                        <AlertTriangle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {lembretes.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum lembrete configurado ainda</p>
                <p className="text-sm">Crie seu primeiro lembrete automático acima</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações de Lembretes
          </CardTitle>
          <CardDescription>
            Configurações gerais para todos os lembretes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Lembretes por WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Enviar lembretes via WhatsApp quando disponível
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Lembretes por Email</Label>
              <p className="text-sm text-muted-foreground">
                Enviar lembretes por email para participantes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Notificações Push</Label>
              <p className="text-sm text-muted-foreground">
                Enviar notificações push no app (quando disponível)
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LembretesAutomaticos;