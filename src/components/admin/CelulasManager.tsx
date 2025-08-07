import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { PersonSelect } from '@/components/ui/person-select';
import { 
  Trash2, 
  Edit, 
  Plus, 
  MapPin, 
  Users, 
  FileText, 
  BarChart3, 
  Calendar,
  Map,
  History,
  UserPlus,
  TrendingUp
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { CelulasDashboard } from './celulas/CelulasDashboard';
import { ParticipantesManager } from './celulas/ParticipantesManager';
import { RelatoriosSemanais } from './celulas/RelatoriosSemanais';
import { RelatoriosSemanaisDNA } from './celulas/RelatoriosSemanaislDNA';
import { MapaCelulasAdmin } from './celulas/MapaCelulasAdmin';
import { HistoricoCelulas } from './celulas/HistoricoCelulas';
import { ArvoreMultiplicacao } from './celulas/ArvoreMultiplicacao';

interface Celula {
  id: string;
  nome: string;
  lider: string;
  endereco: string;
  bairro: string;
  dia_semana: string;
  horario: string;
  descricao: string;
  telefone: string;
  latitude: number;
  longitude: number;
  membros_atual: number;
  membros_maximo: number;
  ativa: boolean;
  rede_ministerio?: string;
  coordenador?: string;
  supervisor?: string;
  lider_em_treinamento?: string;
  anfitriao?: string;
  data_inicio?: string;
  status_celula?: string;
  observacoes?: string;
  // Novos campos para multiplicação
  celula_mae_id?: string;
  data_multiplicacao?: string;
  geracao?: number;
  arvore_genealogica?: string;
}

export const CelulasManager = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCelula, setEditingCelula] = useState<Celula | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    lider: '',
    endereco: '',
    bairro: '',
    dia_semana: '',
    horario: '',
    descricao: '',
    telefone: '',
    latitude: 0,
    longitude: 0,
    membros_atual: 0,
    membros_maximo: 20,
    ativa: true,
    rede_ministerio: '',
    coordenador: '',
    supervisor: '',
    lider_em_treinamento: '',
    anfitriao: '',
    data_inicio: '',
    status_celula: 'ativa',
    observacoes: '',
    // Novos campos para multiplicação
    celula_mae_id: '',
    data_multiplicacao: '',
  });

  const [redesMinisterio, setRedesMinisterio] = useState([
    'Jovens',
    'Casais', 
    'Homens',
    'Mulheres',
    'Crianças',
    'Adolescentes',
    'Idosos',
    'Famílias',
    'Profissionais',
    'Universitários'
  ]);
  const [novaRede, setNovaRede] = useState('');
  const [showAddRede, setShowAddRede] = useState(false);

  const statusCelula = [
    { value: 'ativa', label: 'Ativa' },
    { value: 'em_pausa', label: 'Em Pausa' },
    { value: 'multiplicada', label: 'Multiplicada' },
    { value: 'encerrada', label: 'Encerrada' }
  ];

  const diasSemana = [
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
    'Domingo'
  ];

  useEffect(() => {
    fetchCelulas();
  }, []);

  const fetchCelulas = async () => {
    try {
      const { data, error } = await supabase
        .from('celulas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setCelulas(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar células",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      lider: '',
      endereco: '',
      bairro: '',
      dia_semana: '',
      horario: '',
      descricao: '',
      telefone: '',
      latitude: 0,
      longitude: 0,
      membros_atual: 0,
      membros_maximo: 20,
      ativa: true,
      rede_ministerio: '',
      coordenador: '',
      supervisor: '',
      lider_em_treinamento: '',
      anfitriao: '',
      data_inicio: '',
      status_celula: 'ativa',
      observacoes: '',
      celula_mae_id: '',
      data_multiplicacao: '',
    });
    setEditingCelula(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Prepare data for database - convert "none" to null for celula_mae_id
      const submitData = {
        ...formData,
        celula_mae_id: formData.celula_mae_id === 'none' ? null : formData.celula_mae_id
      };

      if (editingCelula) {
        const { error } = await supabase
          .from('celulas')
          .update(submitData)
          .eq('id', editingCelula.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Célula atualizada com sucesso!",
        });
      } else {
        // Obter igreja_id do usuário logado
        const { data: igrejaDados } = await supabase.rpc('get_user_igreja_id');
        
        const { error } = await supabase
          .from('celulas')
          .insert([{
            ...submitData,
            igreja_id: igrejaDados
          }]);

        if (error) throw error;

        toast({
          title: "Sucesso", 
          description: "Célula criada com sucesso!",
        });
      }

      fetchCelulas();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar célula",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (celula: Celula) => {
    setFormData({
      nome: celula.nome,
      lider: celula.lider,
      endereco: celula.endereco,
      bairro: celula.bairro,
      dia_semana: celula.dia_semana,
      horario: celula.horario,
      descricao: celula.descricao || '',
      telefone: celula.telefone || '',
      latitude: celula.latitude || 0,
      longitude: celula.longitude || 0,
      membros_atual: celula.membros_atual || 0,
      membros_maximo: celula.membros_maximo || 20,
      ativa: celula.ativa,
      rede_ministerio: celula.rede_ministerio || '',
      coordenador: celula.coordenador || '',
      supervisor: celula.supervisor || '',
      lider_em_treinamento: celula.lider_em_treinamento || '',
      anfitriao: celula.anfitriao || '',
      data_inicio: celula.data_inicio || '',
      status_celula: celula.status_celula || 'ativa',
      observacoes: celula.observacoes || '',
      celula_mae_id: celula.celula_mae_id || 'none',
      data_multiplicacao: celula.data_multiplicacao || '',
    });
    setEditingCelula(celula);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta célula?')) return;

    try {
      const { error } = await supabase
        .from('celulas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Célula excluída com sucesso!",
      });
      
      fetchCelulas();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir célula",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center">Carregando células...</div>;
  }

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-mobile-lg sm:text-mobile-xl md:text-mobile-2xl font-bold gradient-text leading-tight">Sistema de Gestão de Células</h2>
          <p className="text-mobile-xs sm:text-mobile-sm text-muted-foreground">Gerencie células, participantes e relatórios</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="button-mobile flex-shrink-0">
              <Plus className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Nova Célula</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-mobile-base sm:text-mobile-lg md:text-mobile-xl">
                {editingCelula ? 'Editar Célula' : 'Nova Célula'}
              </DialogTitle>
              <DialogDescription className="text-mobile-xs sm:text-mobile-sm">
                Preencha as informações completas da célula
              </DialogDescription>
            </DialogHeader>
            
            <div className="dialog-content-scrollable">
              <form onSubmit={handleSubmit} className="dialog-form">
              {/* Informações Básicas */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-mobile-sm sm:text-mobile-lg font-semibold text-primary">Informações Básicas</h3>
                <div className="form-grid-mobile">
                  <div>
                    <Label htmlFor="nome">Nome da Célula *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rede_ministerio">Rede/Ministério</Label>
                    <Select 
                      value={formData.rede_ministerio} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, rede_ministerio: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a rede" />
                      </SelectTrigger>
                      <SelectContent>
                        {redesMinisterio.map((rede) => (
                          <SelectItem key={rede} value={rede}>{rede}</SelectItem>
                        ))}
                        <div className="p-2 border-t">
                          {!showAddRede ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setShowAddRede(true)}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              Adicionar Nova Rede
                            </Button>
                          ) : (
                            <div className="space-y-2">
                              <Input
                                placeholder="Nome da nova rede/ministério"
                                value={novaRede}
                                onChange={(e) => setNovaRede(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (novaRede.trim() && !redesMinisterio.includes(novaRede.trim())) {
                                      setRedesMinisterio(prev => [...prev, novaRede.trim()]);
                                      setFormData(prev => ({ ...prev, rede_ministerio: novaRede.trim() }));
                                      setNovaRede('');
                                      setShowAddRede(false);
                                    }
                                  }
                                }}
                              />
                              <div className="flex gap-1">
                                <Button
                                  type="button"
                                  size="sm"
                                  onClick={() => {
                                    if (novaRede.trim() && !redesMinisterio.includes(novaRede.trim())) {
                                      setRedesMinisterio(prev => [...prev, novaRede.trim()]);
                                      setFormData(prev => ({ ...prev, rede_ministerio: novaRede.trim() }));
                                      setNovaRede('');
                                      setShowAddRede(false);
                                    }
                                  }}
                                >
                                  Adicionar
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setNovaRede('');
                                    setShowAddRede(false);
                                  }}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status_celula">Status da Célula</Label>
                    <Select 
                      value={formData.status_celula} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, status_celula: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {statusCelula.map((status) => (
                          <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data_inicio">Data de Início</Label>
                    <Input
                      id="data_inicio"
                      type="date"
                      value={formData.data_inicio}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_inicio: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              {/* Liderança */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-mobile-sm sm:text-mobile-lg font-semibold text-primary">Liderança</h3>
                <div className="form-grid-mobile">
                  <div>
                    <Label htmlFor="coordenador">Coordenador</Label>
                    <PersonSelect
                      value={formData.coordenador}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, coordenador: value }))}
                      placeholder="Selecione o coordenador"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="supervisor">Supervisor</Label>
                    <PersonSelect
                      value={formData.supervisor}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, supervisor: value }))}
                      placeholder="Selecione o supervisor"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lider">Líder Principal *</Label>
                    <PersonSelect
                      value={formData.lider}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, lider: value }))}
                      placeholder="Selecione o líder principal"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lider_em_treinamento">Líder em Treinamento</Label>
                    <PersonSelect
                      value={formData.lider_em_treinamento}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, lider_em_treinamento: value }))}
                      placeholder="Selecione o líder em treinamento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="anfitriao">Anfitrião</Label>
                    <PersonSelect
                      value={formData.anfitriao}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, anfitriao: value }))}
                      placeholder="Selecione o anfitrião"
                    />
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </div>
                </div>
              </div>

              {/* Reunião e Local */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-mobile-sm sm:text-mobile-lg font-semibold text-primary">Reunião e Local</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="dia_semana">Dia da Semana *</Label>
                    <Select 
                      value={formData.dia_semana} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, dia_semana: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o dia" />
                      </SelectTrigger>
                      <SelectContent>
                        {diasSemana.map((dia) => (
                          <SelectItem key={dia} value={dia}>{dia}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="horario">Horário *</Label>
                    <Input
                      id="horario"
                      type="time"
                      value={formData.horario}
                      onChange={(e) => setFormData(prev => ({ ...prev, horario: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bairro">Bairro *</Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => setFormData(prev => ({ ...prev, bairro: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="endereco">Endereço Completo *</Label>
                  <Input
                    id="endereco"
                    value={formData.endereco}
                    onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {/* Capacidade e Observações */}
              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-mobile-sm sm:text-mobile-lg font-semibold text-primary">Capacidade e Observações</h3>
                <div className="form-grid-mobile">
                  <div>
                    <Label htmlFor="membros_atual">Membros Atuais</Label>
                    <Input
                      id="membros_atual"
                      type="number"
                      min="0"
                      value={formData.membros_atual}
                      onChange={(e) => setFormData(prev => ({ ...prev, membros_atual: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="membros_maximo">Membros Máximo</Label>
                    <Input
                      id="membros_maximo"
                      type="number"
                      min="1"
                      value={formData.membros_maximo}
                      onChange={(e) => setFormData(prev => ({ ...prev, membros_maximo: parseInt(e.target.value) || 20 }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    className="min-h-[80px]"
                    value={formData.descricao}
                    onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                    placeholder="Informações adicionais sobre a célula"
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações Gerais</Label>
                  <Textarea
                    id="observacoes"
                    className="min-h-[80px]"
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações administrativas ou notas importantes"
                  />
                </div>
              </div>

              {/* Multiplicação de Células */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Multiplicação de Células</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="celula_mae_id">Célula Mãe (Origem)</Label>
                    <Select 
                      value={formData.celula_mae_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, celula_mae_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar célula mãe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhuma (Célula Original)</SelectItem>
                        {celulas
                          .filter(c => c.id !== editingCelula?.id) // Não permitir que seja mãe de si mesma
                          .map((celula) => (
                            <SelectItem key={celula.id} value={celula.id}>
                              {celula.nome} - {celula.lider}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Deixe em branco se esta é uma célula original
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="data_multiplicacao">Data da Multiplicação</Label>
                    <Input
                      id="data_multiplicacao"
                      type="date"
                      value={formData.data_multiplicacao}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_multiplicacao: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Data em que esta célula foi criada por multiplicação
                    </p>
                  </div>
                </div>
                
                {formData.celula_mae_id && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900">Célula Filha</h4>
                        <p className="text-sm text-blue-700">
                          Esta célula foi criada através da multiplicação de outra célula. 
                          A árvore genealógica e geração serão calculadas automaticamente.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {!formData.celula_mae_id && !editingCelula && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-start space-x-2">
                      <Users className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-900">Célula Original</h4>
                        <p className="text-sm text-green-700">
                          Esta é uma célula original (1ª geração). No futuro, ela poderá 
                          multiplicar e gerar células filhas.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-lg border">
                <Switch
                  id="ativa"
                  checked={formData.ativa}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativa: checked }))}
                />
                <Label htmlFor="ativa" className="text-sm font-medium">Célula ativa</Label>
              </div>
              
              <div className="flex flex-col md:flex-row justify-end space-y-2 md:space-y-0 md:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCelula ? 'Atualizar' : 'Criar'} Célula
                </Button>
              </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="tabs-mobile">
        <MobileTabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 md:space-y-6">
          <MobileTabsList maxTabsPerRow={4} className="grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-muted/30 rounded-xl">
            <MobileTabsTrigger value="dashboard" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden text-[10px]">Dashboard</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="cadastro" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Cadastro</span>
              <span className="sm:hidden text-[10px]">Cadastro</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="participantes" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <UserPlus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Participantes</span>
              <span className="sm:hidden text-[10px]">Participantes</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="relatorios" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden text-[10px]">Relatórios</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="mapa" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <Map className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Mapa</span>
              <span className="sm:hidden text-[10px]">Mapa</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="multiplicacao" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Multiplicação</span>
              <span className="sm:hidden text-[10px]">Multiplicação</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="historico" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <History className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Histórico</span>
              <span className="sm:hidden text-[10px]">Histórico</span>
            </MobileTabsTrigger>
          </MobileTabsList>

          <MobileTabsContent value="dashboard" className="space-y-3 sm:space-y-4 md:space-y-6">
            <CelulasDashboard celulas={celulas} />
          </MobileTabsContent>

          <MobileTabsContent value="cadastro" className="space-y-3 sm:space-y-4 md:space-y-6">

          <div className="grid gap-4">
            {celulas.map((celula) => (
              <Card key={celula.id}>
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="flex flex-col sm:flex-row sm:items-center gap-2 text-base md:text-lg">
                        <span className="truncate">{celula.nome}</span>
                        <div className="flex gap-2 self-start">
                          {!celula.ativa && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                              Inativa
                            </span>
                          )}
                          {celula.rede_ministerio && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                              {celula.rede_ministerio}
                            </span>
                          )}
                          {celula.status_celula && celula.status_celula !== 'ativa' && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              {celula.status_celula}
                            </span>
                           )}
                           {celula.geracao && celula.geracao > 1 && (
                             <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                               {celula.geracao}ª Geração
                             </span>
                           )}
                        </div>
                      </CardTitle>
                      <div className="text-sm text-muted-foreground mt-1 space-y-1">
                        <p>Líder: {celula.lider}</p>
                        {celula.coordenador && <p>Coordenador: {celula.coordenador}</p>}
                      </div>
                    </div>
                    <div className="flex space-x-2 self-start">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(celula)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(celula.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3 md:grid md:grid-cols-2 md:gap-4 md:space-y-0">
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Dia:</strong> {celula.dia_semana}
                      </p>
                      <p className="text-sm">
                        <strong>Horário:</strong> {celula.horario}
                      </p>
                      <p className="text-sm">
                        <strong>Bairro:</strong> {celula.bairro}
                      </p>
                      {celula.supervisor && (
                        <p className="text-sm">
                          <strong>Supervisor:</strong> {celula.supervisor}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Membros:</strong> {celula.membros_atual} / {celula.membros_maximo}
                      </p>
                      {celula.telefone && (
                        <p className="text-sm">
                          <strong>Telefone:</strong> {celula.telefone}
                        </p>
                      )}
                      {celula.lider_em_treinamento && (
                        <p className="text-sm">
                          <strong>Líder em Treinamento:</strong> {celula.lider_em_treinamento}
                        </p>
                      )}
                      {celula.anfitriao && (
                        <p className="text-sm">
                          <strong>Anfitrião:</strong> {celula.anfitriao}
                        </p>
                      )}
                    </div>
                  </div>
                  {celula.endereco && (
                    <p className="text-sm mt-3 flex items-start">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{celula.endereco}</span>
                    </p>
                  )}
                  {celula.descricao && (
                    <p className="text-sm text-muted-foreground mt-3 break-words">
                      {celula.descricao}
                    </p>
                  )}
                  {celula.observacoes && (
                    <p className="text-sm text-muted-foreground mt-2 break-words italic">
                      <strong>Obs:</strong> {celula.observacoes}
                    </p>
                   )}
                  {/* Informações de Multiplicação */}
                  {(celula.celula_mae_id || celula.data_multiplicacao) && (
                    <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-start space-x-2">
                        <TrendingUp className="h-4 w-4 text-purple-600 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-purple-900">Célula Multiplicada</p>
                          {celula.data_multiplicacao && (
                            <p className="text-purple-700">
                              Data de multiplicação: {new Date(celula.data_multiplicacao).toLocaleDateString('pt-BR')}
                            </p>
                          )}
                          {celula.geracao && (
                            <p className="text-purple-700">
                              Geração: {celula.geracao}ª
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </MobileTabsContent>

          <MobileTabsContent value="participantes" className="space-y-3 sm:space-y-4 md:space-y-6">
            <ParticipantesManager celulas={celulas} />
          </MobileTabsContent>

          <MobileTabsContent value="relatorios" className="space-y-3 sm:space-y-4 md:space-y-6">
            <RelatoriosSemanais celulas={celulas} />
          </MobileTabsContent>

          <MobileTabsContent value="mapa" className="space-y-3 sm:space-y-4 md:space-y-6">
            <MapaCelulasAdmin />
          </MobileTabsContent>

          <MobileTabsContent value="multiplicacao" className="space-y-3 sm:space-y-4 md:space-y-6">
            <ArvoreMultiplicacao />
          </MobileTabsContent>

          <MobileTabsContent value="historico" className="space-y-3 sm:space-y-4 md:space-y-6">
            <HistoricoCelulas celulas={celulas} />
          </MobileTabsContent>
        </MobileTabs>
      </div>
    </div>
  );
};