import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { 
  FileText, 
  Plus, 
  Calendar, 
  Users, 
  DollarSign,
  Heart,
  Upload,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface Celula {
  id: string;
  nome: string;
  lider: string;
}

interface RelatorioSemanal {
  id: string;
  celula_id: string;
  data_reuniao: string;
  presencas: any;
  visitantes: any;
  palavra_ministrada: string;
  oferta_arrecadada: number;
  motivos_oracao: string;
  decisoes_cristo: number;
  batismos_agendados: number;
  foto_url: string;
  status: string;
  created_at: string;
}

interface RelatoriosSemanaisProps {
  celulas: Celula[];
}

export const RelatoriosSemanais = ({ celulas }: RelatoriosSemanaisProps) => {
  const [relatorios, setRelatorios] = useState<RelatorioSemanal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCelula, setSelectedCelula] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    celula_id: '',
    data_reuniao: new Date().toISOString().split('T')[0],
    presencas: [] as string[],
    visitantes: [] as { nome: string; telefone: string; quem_convidou: string }[],
    palavra_ministrada: '',
    oferta_arrecadada: 0,
    motivos_oracao: '',
    decisoes_cristo: 0,
    batismos_agendados: 0,
    foto_url: '',
  });

  useEffect(() => {
    fetchRelatorios();
  }, []);

  const fetchRelatorios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('relatorios_semanais_celulas')
        .select('*')
        .order('data_reuniao', { ascending: false });

      if (error) throw error;
      setRelatorios(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar relatórios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      celula_id: '',
      data_reuniao: new Date().toISOString().split('T')[0],
      presencas: [],
      visitantes: [],
      palavra_ministrada: '',
      oferta_arrecadada: 0,
      motivos_oracao: '',
      decisoes_cristo: 0,
      batismos_agendados: 0,
      foto_url: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('relatorios_semanais_celulas')
        .insert([{
          ...formData,
          status: 'enviado'
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relatório enviado com sucesso!",
      });

      fetchRelatorios();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar relatório",
        variant: "destructive",
      });
    }
  };

  const handleAprovarRelatorio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('relatorios_semanais_celulas')
        .update({ status: 'aprovado' })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Relatório aprovado com sucesso!",
      });

      fetchRelatorios();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao aprovar relatório",
        variant: "destructive",
      });
    }
  };

  const addVisitante = () => {
    setFormData(prev => ({
      ...prev,
      visitantes: [...prev.visitantes, { nome: '', telefone: '', quem_convidou: '' }]
    }));
  };

  const removeVisitante = (index: number) => {
    setFormData(prev => ({
      ...prev,
      visitantes: prev.visitantes.filter((_, i) => i !== index)
    }));
  };

  const updateVisitante = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      visitantes: prev.visitantes.map((v, i) => 
        i === index ? { ...v, [field]: value } : v
      )
    }));
  };

  const filteredRelatorios = relatorios.filter(r => 
    !selectedCelula || selectedCelula === 'all' || r.celula_id === selectedCelula
  );

  const statusColors = {
    'pendente': 'bg-yellow-100 text-yellow-800',
    'enviado': 'bg-blue-100 text-blue-800',
    'aprovado': 'bg-green-100 text-green-800'
  };

  const statusIcons = {
    'pendente': Clock,
    'enviado': AlertCircle,
    'aprovado': CheckCircle
  };

  if (loading) {
    return <div className="text-center">Carregando relatórios...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-bold">Relatórios Semanais</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Relatório
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Novo Relatório Semanal</DialogTitle>
              <DialogDescription>
                Preencha as informações da reunião da célula
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Informações da Reunião</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="celula_id">Célula *</Label>
                    <Select 
                      value={formData.celula_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, celula_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a célula" />
                      </SelectTrigger>
                      <SelectContent>
                        {celulas.map((celula) => (
                          <SelectItem key={celula.id} value={celula.id}>
                            {celula.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="data_reuniao">Data da Reunião *</Label>
                    <Input
                      id="data_reuniao"
                      type="date"
                      value={formData.data_reuniao}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_reuniao: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Palavra Ministrada */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Palavra Ministrada</h3>
                <div>
                  <Label htmlFor="palavra_ministrada">Tema/Assunto da Palavra</Label>
                  <Textarea
                    id="palavra_ministrada"
                    value={formData.palavra_ministrada}
                    onChange={(e) => setFormData(prev => ({ ...prev, palavra_ministrada: e.target.value }))}
                    placeholder="Descreva o tema estudado ou palavra ministrada"
                    className="min-h-[80px]"
                  />
                </div>
              </div>

              {/* Visitantes */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-primary">Visitantes</h3>
                  <Button type="button" onClick={addVisitante} variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Visitante
                  </Button>
                </div>
                {formData.visitantes.map((visitante, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
                    <div>
                      <Label>Nome do Visitante</Label>
                      <Input
                        value={visitante.nome}
                        onChange={(e) => updateVisitante(index, 'nome', e.target.value)}
                        placeholder="Nome completo"
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={visitante.telefone}
                        onChange={(e) => updateVisitante(index, 'telefone', e.target.value)}
                        placeholder="(XX) XXXXX-XXXX"
                      />
                    </div>
                    <div>
                      <Label>Quem Convidou</Label>
                      <Input
                        value={visitante.quem_convidou}
                        onChange={(e) => updateVisitante(index, 'quem_convidou', e.target.value)}
                        placeholder="Nome do membro"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button 
                        type="button" 
                        onClick={() => removeVisitante(index)}
                        variant="outline"
                        size="sm"
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Informações Numéricas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Informações da Reunião</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="oferta_arrecadada">Oferta Arrecadada (R$)</Label>
                    <Input
                      id="oferta_arrecadada"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.oferta_arrecadada}
                      onChange={(e) => setFormData(prev => ({ ...prev, oferta_arrecadada: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="decisoes_cristo">Decisões por Cristo</Label>
                    <Input
                      id="decisoes_cristo"
                      type="number"
                      min="0"
                      value={formData.decisoes_cristo}
                      onChange={(e) => setFormData(prev => ({ ...prev, decisoes_cristo: parseInt(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="batismos_agendados">Batismos Agendados</Label>
                    <Input
                      id="batismos_agendados"
                      type="number"
                      min="0"
                      value={formData.batismos_agendados}
                      onChange={(e) => setFormData(prev => ({ ...prev, batismos_agendados: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
              </div>

              {/* Motivos de Oração */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Motivos de Oração</h3>
                <div>
                  <Label htmlFor="motivos_oracao">Pedidos de Oração</Label>
                  <Textarea
                    id="motivos_oracao"
                    value={formData.motivos_oracao}
                    onChange={(e) => setFormData(prev => ({ ...prev, motivos_oracao: e.target.value }))}
                    placeholder="Descreva os pedidos de oração da célula"
                    className="min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Enviar Relatório
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Select value={selectedCelula} onValueChange={setSelectedCelula}>
              <SelectTrigger className="w-[300px]">
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
            
            <span className="text-sm text-muted-foreground">
              {filteredRelatorios.length} relatórios
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Relatórios */}
      <div className="grid gap-4">
        {filteredRelatorios.map((relatorio) => {
          const celula = celulas.find(c => c.id === relatorio.celula_id);
          const StatusIcon = statusIcons[relatorio.status];
          
          return (
            <Card key={relatorio.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      {new Date(relatorio.data_reuniao).toLocaleDateString('pt-BR')}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {celula?.nome || 'Célula não encontrada'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[relatorio.status]}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {relatorio.status}
                    </Badge>
                    {relatorio.status === 'enviado' && (
                      <Button
                        size="sm"
                        onClick={() => handleAprovarRelatorio(relatorio.id)}
                      >
                        Aprovar
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {relatorio.visitantes?.length || 0} visitantes
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      R$ {relatorio.oferta_arrecadada?.toFixed(2) || '0,00'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {relatorio.decisoes_cristo || 0} decisões
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {relatorio.batismos_agendados || 0} batismos
                    </span>
                  </div>
                </div>

                {relatorio.palavra_ministrada && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Palavra Ministrada:</h4>
                    <p className="text-sm text-muted-foreground">
                      {relatorio.palavra_ministrada}
                    </p>
                  </div>
                )}

                {relatorio.visitantes && relatorio.visitantes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Visitantes:</h4>
                    <div className="space-y-2">
                      {relatorio.visitantes.map((visitante: any, index: number) => (
                        <div key={index} className="flex items-center gap-4 text-sm">
                          <span className="font-medium">{visitante.nome}</span>
                          <span className="text-muted-foreground">{visitante.telefone}</span>
                          <span className="text-muted-foreground">
                            Convidado por: {visitante.quem_convidou}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {relatorio.motivos_oracao && (
                  <div>
                    <h4 className="font-medium mb-2">Motivos de Oração:</h4>
                    <p className="text-sm text-muted-foreground">
                      {relatorio.motivos_oracao}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredRelatorios.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum relatório encontrado.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};