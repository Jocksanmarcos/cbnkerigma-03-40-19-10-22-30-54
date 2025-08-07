import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  History, 
  Users, 
  MapPin, 
  UserCheck, 
  Calendar, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

interface Celula {
  id: string;
  nome: string;
  lider: string;
}

interface HistoricoEvento {
  id: string;
  celula_id: string;
  tipo_evento: string;
  descricao: string;
  dados_antigos: any;
  dados_novos: any;
  usuario_responsavel: string;
  created_at: string;
}

interface HistoricoCelulasProps {
  celulas: Celula[];
}

export const HistoricoCelulas = ({ celulas }: HistoricoCelulasProps) => {
  const [historico, setHistorico] = useState<HistoricoEvento[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCelula, setSelectedCelula] = useState<string>('');
  const [tipoFilter, setTipoFilter] = useState<string>('');

  useEffect(() => {
    fetchHistorico();
  }, []);

  const fetchHistorico = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('historico_celulas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistorico(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar histórico",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredHistorico = historico.filter(h => {
    const matchesCelula = !selectedCelula || selectedCelula === 'all' || h.celula_id === selectedCelula;
    const matchesTipo = !tipoFilter || tipoFilter === 'all' || h.tipo_evento === tipoFilter;
    return matchesCelula && matchesTipo;
  });

  const tipoEventoLabels = {
    'criacao': 'Criação',
    'mudanca_lideranca': 'Mudança de Liderança',
    'mudanca_endereco': 'Mudança de Endereço',
    'multiplicacao': 'Multiplicação',
    'reuniao': 'Reunião',
    'alteracao_status': 'Alteração de Status'
  };

  const tipoEventoColors = {
    'criacao': 'bg-green-100 text-green-800',
    'mudanca_lideranca': 'bg-blue-100 text-blue-800',
    'mudanca_endereco': 'bg-yellow-100 text-yellow-800',
    'multiplicacao': 'bg-purple-100 text-purple-800',
    'reuniao': 'bg-gray-100 text-gray-800',
    'alteracao_status': 'bg-orange-100 text-orange-800'
  };

  const tipoEventoIcons = {
    'criacao': Users,
    'mudanca_lideranca': UserCheck,
    'mudanca_endereco': MapPin,
    'multiplicacao': RefreshCw,
    'reuniao': Calendar,
    'alteracao_status': AlertCircle
  };

  if (loading) {
    return <div className="text-center">Carregando histórico...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Histórico das Células</h3>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedCelula} onValueChange={setSelectedCelula}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por célula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as células</SelectItem>
                {celulas.map((celula) => (
                  <SelectItem key={celula.id} value={celula.id}>
                    {celula.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(tipoEventoLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredHistorico.length} eventos
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline do Histórico */}
      <div className="space-y-4">
        {filteredHistorico.map((evento, index) => {
          const celula = celulas.find(c => c.id === evento.celula_id);
          const EventoIcon = tipoEventoIcons[evento.tipo_evento];
          
          return (
            <Card key={evento.id} className="relative">
              {index < filteredHistorico.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-full bg-border -z-10" />
              )}
              
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-background border-2 border-border rounded-full flex items-center justify-center">
                      <EventoIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{evento.descricao}</h4>
                      <Badge className={tipoEventoColors[evento.tipo_evento]}>
                        {tipoEventoLabels[evento.tipo_evento]}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground mb-3">
                      <p>Célula: {celula?.nome || 'Não encontrada'}</p>
                      <p>Data: {new Date(evento.created_at).toLocaleString('pt-BR')}</p>
                      {evento.usuario_responsavel && (
                        <p>Responsável: {evento.usuario_responsavel}</p>
                      )}
                    </div>

                    {/* Detalhes das mudanças */}
                    {(evento.dados_antigos || evento.dados_novos) && (
                      <div className="bg-muted/50 rounded-lg p-3 mt-3">
                        <h5 className="font-medium text-sm mb-2">Detalhes da alteração:</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {evento.dados_antigos && (
                            <div>
                              <p className="font-medium text-red-700 mb-1">Valores Anteriores:</p>
                              <pre className="bg-red-50 p-2 rounded text-red-800 overflow-auto">
                                {JSON.stringify(evento.dados_antigos, null, 2)}
                              </pre>
                            </div>
                          )}
                          {evento.dados_novos && (
                            <div>
                              <p className="font-medium text-green-700 mb-1">Novos Valores:</p>
                              <pre className="bg-green-50 p-2 rounded text-green-800 overflow-auto">
                                {JSON.stringify(evento.dados_novos, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredHistorico.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum evento encontrado no histórico.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estatísticas do Histórico */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo do Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(tipoEventoLabels).map(([tipo, label]) => {
              const count = historico.filter(h => h.tipo_evento === tipo).length;
              return (
                <div key={tipo} className="text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};