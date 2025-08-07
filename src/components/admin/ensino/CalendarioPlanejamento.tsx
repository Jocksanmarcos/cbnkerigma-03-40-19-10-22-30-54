import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Plus, X, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarUI } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useEnsinoCompleto } from '@/hooks/useEnsinoCompleto';
import { useBloqueiosAcademicos } from '@/hooks/useBloqueiosAcademicos';
import { format, addMonths, subMonths, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EventoCalendario {
  id: string;
  titulo: string;
  data: Date;
  tipo: 'turma' | 'evento' | 'bloqueio';
  cor: string;
  detalhes?: string;
}

export const CalendarioPlanejamento = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'year'>('month');
  const [newBloqueio, setNewBloqueio] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    tipo: 'bloqueio' as 'bloqueio' | 'evento' | 'feriado',
    cor: '#ef4444'
  });
  
  const { turmas, loading } = useEnsinoCompleto();
  const { bloqueios, createBloqueio, deleteBloqueio, loading: loadingBloqueios } = useBloqueiosAcademicos();

  // Combinar turmas com bloqueios acadêmicos
  const eventos: EventoCalendario[] = [
    ...turmas.map(turma => ({
      id: turma.id,
      titulo: turma.nome_turma,
      data: parseISO(turma.data_inicio),
      tipo: 'turma' as const,
      cor: '#3b82f6',
      detalhes: `Curso: ${turma.curso?.nome || 'N/A'} | Professor: ${turma.professor_responsavel}`
    })),
    ...bloqueios.map(bloqueio => ({
      id: bloqueio.id,
      titulo: bloqueio.titulo,
      data: parseISO(bloqueio.data_inicio),
      tipo: bloqueio.tipo as 'bloqueio' | 'evento',
      cor: bloqueio.cor,
      detalhes: bloqueio.descricao || 'Data bloqueada para aulas'
    }))
  ];

  const eventosNaData = (data: Date) => {
    return eventos.filter(evento => isSameDay(evento.data, data));
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      const eventosData = eventosNaData(date);
      if (eventosData.length === 0) {
        setNewBloqueio(prev => ({
          ...prev,
          data_inicio: format(date, 'yyyy-MM-dd'),
          data_fim: format(date, 'yyyy-MM-dd')
        }));
        setShowAddDialog(true);
      }
    }
  };

  const handleCreateBloqueio = async () => {
    if (!newBloqueio.titulo || !newBloqueio.data_inicio) return;

    await createBloqueio({
      ...newBloqueio,
      ativo: true
    });

    setNewBloqueio({
      titulo: '',
      descricao: '',
      data_inicio: '',
      data_fim: '',
      tipo: 'bloqueio',
      cor: '#ef4444'
    });
    setShowAddDialog(false);
  };

  const handleDeleteBloqueio = async (bloqueioId: string) => {
    await deleteBloqueio(bloqueioId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Calendário de Planejamento</h2>
          <p className="text-muted-foreground">
            Visualize turmas, eventos e bloqueios de data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('month')}
            className={viewMode === 'month' ? 'bg-accent' : ''}
          >
            Mês
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('week')}
            className={viewMode === 'week' ? 'bg-accent' : ''}
          >
            Semana
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('year')}
            className={viewMode === 'year' ? 'bg-accent' : ''}
          >
            Ano
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <CalendarUI
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                month={currentDate}
                onMonthChange={setCurrentDate}
                locale={ptBR}
                className="w-full"
              />
              
              {/* Overlay para mostrar eventos */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="grid grid-cols-7 h-full">
                  {/* Esta é uma implementação simples - seria melhor calcular as posições dinamicamente */}
                  {eventos.map((evento) => (
                    <div
                      key={evento.id}
                      className="absolute w-2 h-2 rounded-full pointer-events-none"
                      style={{ 
                        backgroundColor: evento.cor,
                        // Posicionamento seria calculado baseado na data
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Legenda</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Turmas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm">Eventos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm">Bloqueios</span>
              </div>
            </CardContent>
          </Card>

          {selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {format(selectedDate, 'dd/MM/yyyy')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventosNaData(selectedDate).length > 0 ? (
                  <div className="space-y-2">
                     {eventosNaData(selectedDate).map((evento) => (
                       <div key={evento.id} className="p-2 border rounded">
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                             <div
                               className="w-3 h-3 rounded-full"
                               style={{ backgroundColor: evento.cor }}
                             />
                             <span className="font-medium">{evento.titulo}</span>
                           </div>
                           {(evento.tipo === 'bloqueio' || evento.tipo === 'evento') && (
                             <Button
                               variant="ghost"
                               size="sm"
                               onClick={() => handleDeleteBloqueio(evento.id)}
                               className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                             >
                               <X className="h-3 w-3" />
                             </Button>
                           )}
                         </div>
                         {evento.detalhes && (
                           <p className="text-sm text-muted-foreground mt-1">
                             {evento.detalhes}
                           </p>
                         )}
                         <Badge variant="outline" className="mt-1">
                           {evento.tipo}
                         </Badge>
                       </div>
                     ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    <p>Nenhum evento nesta data</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => setShowAddDialog(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Adicionar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Bloqueio/Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="titulo">Título</Label>
              <Input
                id="titulo"
                value={newBloqueio.titulo}
                onChange={(e) => setNewBloqueio(prev => ({ ...prev, titulo: e.target.value }))}
                placeholder="Ex: Conferência Anual"
              />
            </div>
            
            <div>
              <Label htmlFor="tipo">Tipo</Label>
              <Select
                value={newBloqueio.tipo}
                onValueChange={(value: 'bloqueio' | 'evento' | 'feriado') => 
                  setNewBloqueio(prev => ({ ...prev, tipo: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bloqueio">Bloqueio</SelectItem>
                  <SelectItem value="evento">Evento</SelectItem>
                  <SelectItem value="feriado">Feriado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="data_inicio">Data Início</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={newBloqueio.data_inicio}
                  onChange={(e) => setNewBloqueio(prev => ({ ...prev, data_inicio: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="data_fim">Data Fim</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={newBloqueio.data_fim}
                  onChange={(e) => setNewBloqueio(prev => ({ ...prev, data_fim: e.target.value }))}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="cor">Cor</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="cor"
                  type="color"
                  value={newBloqueio.cor}
                  onChange={(e) => setNewBloqueio(prev => ({ ...prev, cor: e.target.value }))}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={newBloqueio.cor}
                  onChange={(e) => setNewBloqueio(prev => ({ ...prev, cor: e.target.value }))}
                  placeholder="#ef4444"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={newBloqueio.descricao}
                onChange={(e) => setNewBloqueio(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descrição opcional do evento..."
                rows={3}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleCreateBloqueio}
                disabled={!newBloqueio.titulo || !newBloqueio.data_inicio}
              >
                Criar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};