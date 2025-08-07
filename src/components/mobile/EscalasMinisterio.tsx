import React, { useState, useEffect } from 'react';
import { format, parseISO, addDays, startOfWeek, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useEscalasMinisterio, TipoEscala, StatusParticipacao, TipoCulto } from '@/hooks/useEscalasMinisterio';
import { useMobileDetection } from '@/hooks/useMobileDetection';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar,
  Clock,
  Users,
  Music,
  CheckCircle,
  XCircle,
  AlertCircle,
  UserPlus,
  Bell,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Mic,
  Camera,
  Shield,
  Heart,
  Baby,
  UserCheck,
  Plus,
  Settings,
  Eye,
  MessageSquare,
  MapPin,
  FileText
} from 'lucide-react';

interface EscalasMinisterioProps {
  userRole: 'member' | 'leader' | 'admin';
}

const tipoEscalaIcons: Record<TipoEscala, React.ElementType> = {
  voluntarios: Users,
  pregadores: Mic,
  ministerio_louvor: Music,
  dancarinos: Play,
  sonorizacao: Volume2,
  multimidia: Camera,
  intercessao: Heart,
  recepcao: UserCheck,
  criancas: Baby,
  seguranca: Shield
};

const tipoEscalaLabels: Record<TipoEscala, string> = {
  voluntarios: 'Voluntários',
  pregadores: 'Pregadores',
  ministerio_louvor: 'Ministério de Louvor',
  dancarinos: 'Dança',
  sonorizacao: 'Sonorização',
  multimidia: 'Multimídia',
  intercessao: 'Intercessão',
  recepcao: 'Recepção',
  criancas: 'Ministério Infantil',
  seguranca: 'Segurança'
};

const tipoCultoLabels: Record<TipoCulto, string> = {
  domingo_manha: 'Domingo Manhã',
  domingo_noite: 'Domingo Noite',
  quarta_oracao: 'Quarta de Oração',
  sexta_jovens: 'Sexta dos Jovens',
  especial: 'Culto Especial',
  ensaio: 'Ensaio'
};

const statusColors: Record<StatusParticipacao, string> = {
  convocado: 'bg-blue-500',
  confirmado: 'bg-green-500',
  negado: 'bg-red-500',
  substituido: 'bg-yellow-500',
  presente: 'bg-purple-500',
  faltou: 'bg-gray-500'
};

const statusLabels: Record<StatusParticipacao, string> = {
  convocado: 'Convocado',
  confirmado: 'Confirmado',
  negado: 'Negado',
  substituido: 'Substituído',
  presente: 'Presente',
  faltou: 'Faltou'
};

export const EscalasMinisterio: React.FC<EscalasMinisterioProps> = ({ userRole }) => {
  const { isMobile } = useMobileDetection();
  const {
    loading,
    programacoes,
    escalas,
    minhasEscalas,
    fetchProgramacoes,
    fetchEscalas,
    fetchMinhasEscalas,
    confirmarParticipacao
  } = useEscalasMinisterio();

  const [activeTab, setActiveTab] = useState('minhas-escalas');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filterTipo, setFilterTipo] = useState<TipoEscala | 'all'>('all');

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Medium) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  };

  useEffect(() => {
    fetchProgramacoes();
    fetchEscalas();
    fetchMinhasEscalas();
  }, []);

  // Filtrar programações por data selecionada
  const programacoesFiltradas = programacoes.filter(prog => 
    isSameDay(parseISO(prog.data_culto), selectedDate)
  );

  // Filtrar escalas por tipo
  const escalasFiltradas = escalas.filter(escala => 
    filterTipo === 'all' || escala.tipo_escala === filterTipo
  );

  // Próximas escalas (próximos 7 dias)
  const proximasEscalas = minhasEscalas.filter(escala => {
    if (!escala.escala?.programacao_culto?.data_culto) return false;
    const dataEscala = parseISO(escala.escala.programacao_culto.data_culto);
    const hoje = new Date();
    const proximosSete = addDays(hoje, 7);
    return dataEscala >= hoje && dataEscala <= proximosSete;
  });

  const handleConfirmarParticipacao = async (participanteId: string, status: StatusParticipacao) => {
    await hapticFeedback();
    await confirmarParticipacao(participanteId, status);
  };

  const renderMinhasEscalas = () => (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-4 p-4">
        {/* Próximas escalas - destacadas */}
        {proximasEscalas.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Próximas Escalas
            </h3>
            {proximasEscalas.map(escala => {
              const IconComponent = tipoEscalaIcons[escala.escala?.tipo_escala || 'voluntarios'];
              const dataEscala = escala.escala?.programacao_culto?.data_culto ? 
                parseISO(escala.escala.programacao_culto.data_culto) : new Date();
              
              return (
                <Card key={escala.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <IconComponent className="w-4 h-4 text-primary" />
                          <span className="font-medium">{escala.funcao}</span>
                          <Badge 
                            className={`${statusColors[escala.status_participacao]} text-white text-xs`}
                          >
                            {statusLabels[escala.status_participacao]}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-1">
                          {escala.escala?.programacao_culto?.titulo}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(dataEscala, 'dd/MM/yyyy', { locale: ptBR })}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(dataEscala, 'HH:mm', { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                      
                      {escala.status_participacao === 'convocado' && (
                        <div className="flex gap-2 ml-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-green-600 border-green-600"
                            onClick={() => handleConfirmarParticipacao(escala.id, 'confirmado')}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2 text-red-600 border-red-600"
                            onClick={() => handleConfirmarParticipacao(escala.id, 'negado')}
                          >
                            <XCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Todas as escalas */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Todas as Minhas Escalas</h3>
          {minhasEscalas.map(escala => {
            const IconComponent = tipoEscalaIcons[escala.escala?.tipo_escala || 'voluntarios'];
            const dataEscala = escala.escala?.programacao_culto?.data_culto ? 
              parseISO(escala.escala.programacao_culto.data_culto) : new Date();
            
            return (
              <Card key={escala.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="w-4 h-4 text-primary" />
                        <span className="font-medium">{escala.funcao}</span>
                        <Badge 
                          className={`${statusColors[escala.status_participacao]} text-white text-xs`}
                        >
                          {statusLabels[escala.status_participacao]}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-1">
                        {escala.escala?.programacao_culto?.titulo}
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(dataEscala, 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(dataEscala, 'HH:mm', { locale: ptBR })}
                        </span>
                      </div>
                      
                      {escala.observacoes && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {escala.observacoes}
                        </p>
                      )}
                    </div>
                    
                    {escala.status_participacao === 'convocado' && (
                      <div className="flex gap-2 ml-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-green-600 border-green-600"
                          onClick={() => handleConfirmarParticipacao(escala.id, 'confirmado')}
                        >
                          <CheckCircle className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-red-600 border-red-600"
                          onClick={() => handleConfirmarParticipacao(escala.id, 'negado')}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {minhasEscalas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma escala encontrada</h3>
              <p className="text-muted-foreground">
                Você ainda não foi convocado para nenhuma escala.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );

  const renderProgramacoes = () => (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-4 p-4">
        {/* Seletor de data */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(startOfWeek(new Date()), i);
            const isSelected = isSameDay(date, selectedDate);
            
            return (
              <Button
                key={i}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="min-w-16 flex-col h-auto py-2"
                onClick={() => {
                  setSelectedDate(date);
                  hapticFeedback();
                }}
              >
                <span className="text-xs">
                  {format(date, 'EEE', { locale: ptBR })}
                </span>
                <span className="text-lg font-bold">
                  {format(date, 'd')}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Programações do dia */}
        {programacoesFiltradas.map(programacao => (
          <Card key={programacao.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{programacao.titulo}</CardTitle>
                <Badge variant="secondary">
                  {tipoCultoLabels[programacao.tipo_culto]}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(parseISO(programacao.data_culto), 'HH:mm')}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {programacao.local}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {programacao.tema_culto && (
                <p className="text-sm mb-2">
                  <strong>Tema:</strong> {programacao.tema_culto}
                </p>
              )}
              {programacao.versiculo_base && (
                <p className="text-sm mb-2">
                  <strong>Versículo:</strong> {programacao.versiculo_base}
                </p>
              )}
              {programacao.observacoes && (
                <p className="text-sm text-muted-foreground">
                  {programacao.observacoes}
                </p>
              )}
            </CardContent>
          </Card>
        ))}

        {programacoesFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma programação</h3>
              <p className="text-muted-foreground">
                Não há programações para {format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );

  const renderEscalas = () => (
    <ScrollArea className="h-[calc(100vh-280px)]">
      <div className="space-y-4 p-4">
        {/* Filtro por tipo */}
        <div>
          <Select 
            value={filterTipo} 
            onValueChange={(value) => setFilterTipo(value as TipoEscala | 'all')}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por ministério" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Ministérios</SelectItem>
              {Object.entries(tipoEscalaLabels).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Lista de escalas */}
        {escalasFiltradas.map(escala => {
          const IconComponent = tipoEscalaIcons[escala.tipo_escala];
          
          return (
            <Card key={escala.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <IconComponent className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">{escala.nome}</CardTitle>
                </div>
                <Badge variant="outline" className="w-fit">
                  {tipoEscalaLabels[escala.tipo_escala]}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Vagas:</span>
                    <span>{escala.vagas_preenchidas}/{escala.vagas_necessarias}</span>
                  </div>
                  
                  {escala.descricao && (
                    <p className="text-sm text-muted-foreground">
                      {escala.descricao}
                    </p>
                  )}
                  
                  {escala.instrucoes_especiais && (
                    <div className="bg-muted p-2 rounded text-xs">
                      <strong>Instruções:</strong> {escala.instrucoes_especiais}
                    </div>
                  )}
                  
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => hapticFeedback()}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Ver Detalhes
                    </Button>
                    {(userRole === 'admin' || userRole === 'leader') && (
                      <Button 
                        size="sm"
                        onClick={() => hapticFeedback()}
                      >
                        <Settings className="w-4 h-4 mr-1" />
                        Gerenciar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {escalasFiltradas.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma escala encontrada</h3>
              <p className="text-muted-foreground">
                Não há escalas para o filtro selecionado.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <h1 className="text-xl font-bold">Escalas e Ministérios</h1>
        <p className="text-sm opacity-90">Gerencie suas escalas e participações</p>
      </div>

      {/* Tabs principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="minhas-escalas">Minhas Escalas</TabsTrigger>
          <TabsTrigger value="programacoes">Programações</TabsTrigger>
          <TabsTrigger value="escalas">Todas as Escalas</TabsTrigger>
        </TabsList>

        <TabsContent value="minhas-escalas" className="mt-0">
          {renderMinhasEscalas()}
        </TabsContent>

        <TabsContent value="programacoes" className="mt-0">
          {renderProgramacoes()}
        </TabsContent>

        <TabsContent value="escalas" className="mt-0">
          {renderEscalas()}
        </TabsContent>
      </Tabs>
    </div>
  );
};