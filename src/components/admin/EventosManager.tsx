import { useState } from 'react';
import { useEventos } from '@/hooks/useEventos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, MapPin, Users, Edit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EventosManager = () => {
  const { eventos, loading, createEvento, updateEvento, deleteEvento } = useEventos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<any>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    tipo: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    endereco: '',
    capacidade: '',
    publico: true,
    inscricoes_abertas: true,
    recorrente: false,
    recorrencia_tipo: ''
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      tipo: '',
      data_inicio: '',
      data_fim: '',
      local: '',
      endereco: '',
      capacidade: '',
      publico: true,
      inscricoes_abertas: true,
      recorrente: false,
      recorrencia_tipo: ''
    });
    setEditingEvento(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const eventoData = {
        ...formData,
        capacidade: formData.capacidade ? parseInt(formData.capacidade) : null,
        data_fim: formData.data_fim || null,
        endereco: formData.endereco || null,
        recorrencia_tipo: formData.recorrente ? formData.recorrencia_tipo : null
      };

      if (editingEvento) {
        await updateEvento(editingEvento.id, eventoData);
      } else {
        await createEvento(eventoData);
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar evento:', error);
    }
  };

  const handleEdit = (evento: any) => {
    setEditingEvento(evento);
    setFormData({
      titulo: evento.titulo,
      descricao: evento.descricao || '',
      tipo: evento.tipo,
      data_inicio: evento.data_inicio.slice(0, 16),
      data_fim: evento.data_fim ? evento.data_fim.slice(0, 16) : '',
      local: evento.local,
      endereco: evento.endereco || '',
      capacidade: evento.capacidade?.toString() || '',
      publico: evento.publico,
      inscricoes_abertas: evento.inscricoes_abertas,
      recorrente: evento.recorrente,
      recorrencia_tipo: evento.recorrencia_tipo || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este evento?')) {
      await deleteEvento(id);
    }
  };

  const tiposEvento = [
    'Culto',
    'Célula',
    'Conferência',
    'Workshop',
    'Retiro',
    'Reunião',
    'Batismo',
    'Casamento',
    'Outro'
  ];

  const tiposRecorrencia = [
    'diaria',
    'semanal',
    'mensal',
    'anual'
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Eventos</h2>
          <p className="text-muted-foreground">Gerencie os eventos da comunidade</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingEvento ? 'Editar Evento' : 'Novo Evento'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do evento
              </DialogDescription>
            </DialogHeader>
            
            <div className="dialog-content-scrollable">
              <form onSubmit={handleSubmit} className="dialog-form">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, tipo: value }))}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposEvento.map(tipo => (
                        <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data e Hora de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="datetime-local"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data e Hora de Fim</Label>
                  <Input
                    id="data_fim"
                    type="datetime-local"
                    value={formData.data_fim}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_fim: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="local">Local *</Label>
                  <Input
                    id="local"
                    value={formData.local}
                    onChange={(e) => setFormData(prev => ({ ...prev, local: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="capacidade">Capacidade</Label>
                  <Input
                    id="capacidade"
                    type="number"
                    value={formData.capacidade}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacidade: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço Completo</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="publico"
                    checked={formData.publico}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, publico: checked }))}
                  />
                  <Label htmlFor="publico">Evento Público</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="inscricoes_abertas"
                    checked={formData.inscricoes_abertas}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inscricoes_abertas: checked }))}
                  />
                  <Label htmlFor="inscricoes_abertas">Inscrições Abertas</Label>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="recorrente"
                    checked={formData.recorrente}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recorrente: checked }))}
                  />
                  <Label htmlFor="recorrente">Evento Recorrente</Label>
                </div>
                
                {formData.recorrente && (
                  <div className="space-y-2">
                    <Label htmlFor="recorrencia_tipo">Tipo de Recorrência</Label>
                    <Select
                      value={formData.recorrencia_tipo}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, recorrencia_tipo: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a recorrência" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposRecorrencia.map(tipo => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingEvento ? 'Atualizar' : 'Criar'} Evento
                </Button>
              </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando eventos...</div>
      ) : (
        <div className="grid gap-4">
          {eventos.map((evento) => (
            <Card key={evento.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {evento.titulo}
                      <Badge variant={evento.publico ? "default" : "secondary"}>
                        {evento.publico ? "Público" : "Privado"}
                      </Badge>
                      {evento.inscricoes_abertas && (
                        <Badge variant="outline">Inscrições Abertas</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{evento.descricao}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(evento)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(evento.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(new Date(evento.data_inicio), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{evento.local}</span>
                  </div>
                  {evento.capacidade && (
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Capacidade: {evento.capacidade}</span>
                    </div>
                  )}
                </div>
                {evento.recorrente && (
                  <div className="mt-2">
                    <Badge variant="outline">
                      Recorrente ({evento.recorrencia_tipo})
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {eventos.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum evento encontrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};