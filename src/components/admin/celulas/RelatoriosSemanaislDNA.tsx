import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useCelulas } from '@/hooks/useCelulas';
import { useRelatoriosCelula } from '@/hooks/useRelatoriosCelula';
import { usePessoas } from '@/hooks/usePessoas';
import { 
  FileText, 
  Plus, 
  Users, 
  UserPlus, 
  Heart, 
  DollarSign, 
  Calendar,
  TrendingUp,
  Target,
  CheckCircle
} from 'lucide-react';

export const RelatoriosSemanaisDNA = () => {
  const { celulas } = useCelulas();
  const { relatorios, createRelatorio, adicionarPresencasLote, obterIndicadoresSaude } = useRelatoriosCelula();
  const { pessoas } = usePessoas();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCelula, setSelectedCelula] = useState('');
  const [indicadoresSaude, setIndicadoresSaude] = useState<any>(null);
  const [loadingIndicadores, setLoadingIndicadores] = useState(false);
  
  const [formData, setFormData] = useState({
    data_reuniao: new Date().toISOString().split('T')[0],
    tipo_reuniao: 'semanal',
    presentes: 0,
    visitantes: 0,
    criancas: 0,
    decisoes: 0,
    ofertas: 0,
    estudo_aplicado: '',
    atividades_realizadas: [] as string[],
    proximos_passos: '',
    observacoes: '',
  });

  const [presencas, setPresencas] = useState<{[key: string]: {presente: boolean, tipo: string}}>({});

  const atividadesDisponiveis = [
    'Louvor e Adoração',
    'Estudo Bíblico',
    'Oração pelos Pedidos',
    'Comunhão e Lanche',
    'Evangelismo/Convite',
    'Dinâmica de Integração',
    'Oração pelos Doentes',
    'Testemunhos',
    'Planejamento da Semana',
    'Treinamento de Líderes'
  ];

  const resetForm = () => {
    setFormData({
      data_reuniao: new Date().toISOString().split('T')[0],
      tipo_reuniao: 'semanal',
      presentes: 0,
      visitantes: 0,
      criancas: 0,
      decisoes: 0,
      ofertas: 0,
      estudo_aplicado: '',
      atividades_realizadas: [],
      proximos_passos: '',
      observacoes: '',
    });
    setPresencas({});
    setSelectedCelula('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCelula) return;

    try {
      // Criar o relatório
      const { data: relatorio } = await createRelatorio({
        celula_id: selectedCelula,
        ...formData,
        tipo_reuniao: formData.tipo_reuniao as 'semanal' | 'especial' | 'multiplicacao',
      });

      if (relatorio) {
        // Registrar presenças
        const presencasArray = Object.entries(presencas)
          .filter(([_, data]) => data.presente)
          .map(([pessoaId, data]) => ({
            relatorio_id: relatorio.id,
            pessoa_id: pessoaId,
            presente: true,
            tipo_participacao: data.tipo as 'membro' | 'visitante' | 'crianca',
          }));

        if (presencasArray.length > 0) {
          await adicionarPresencasLote(presencasArray);
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar relatório:', error);
    }
  };

  const handleAtividadeChange = (atividade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      atividades_realizadas: checked 
        ? [...prev.atividades_realizadas, atividade]
        : prev.atividades_realizadas.filter(a => a !== atividade)
    }));
  };

  const handlePresencaChange = (pessoaId: string, presente: boolean, tipo: string) => {
    setPresencas(prev => ({
      ...prev,
      [pessoaId]: { presente, tipo }
    }));
  };

  const loadIndicadoresSaude = async (celulaId: string) => {
    setLoadingIndicadores(true);
    try {
      const indicadores = await obterIndicadoresSaude(celulaId);
      setIndicadoresSaude(indicadores);
    } catch (error) {
      console.error('Erro ao carregar indicadores:', error);
    } finally {
      setLoadingIndicadores(false);
    }
  };

  const getSaudeColor = (saude: number) => {
    if (saude >= 80) return 'text-green-600';
    if (saude >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSaudeLabel = (saude: number) => {
    if (saude >= 80) return 'Excelente';
    if (saude >= 60) return 'Boa';
    if (saude >= 40) return 'Regular';
    return 'Crítica';
  };

  const membrosCelula = pessoas.filter(p => p.celula_id === selectedCelula);

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-mobile-lg sm:text-mobile-xl md:text-mobile-2xl font-bold gradient-text leading-tight">
            Relatórios Semanais DNA
          </h2>
          <p className="text-mobile-xs sm:text-mobile-sm text-muted-foreground">
            Acompanhe o desenvolvimento e saúde das células
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="button-mobile flex-shrink-0">
              <Plus className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Novo Relatório</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile max-w-4xl">
            <DialogHeader>
              <DialogTitle>Novo Relatório Semanal</DialogTitle>
              <DialogDescription>
                Registre as informações da reunião da célula
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Informações da Reunião</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Célula</Label>
                    <Select value={selectedCelula} onValueChange={setSelectedCelula}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a célula" />
                      </SelectTrigger>
                      <SelectContent>
                        {celulas.map((celula) => (
                          <SelectItem key={celula.id} value={celula.id}>
                            {celula.nome} - {celula.lider}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Data da Reunião</Label>
                    <Input
                      type="date"
                      value={formData.data_reuniao}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_reuniao: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label>Tipo de Reunião</Label>
                    <Select 
                      value={formData.tipo_reuniao} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, tipo_reuniao: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="especial">Especial</SelectItem>
                        <SelectItem value="multiplicacao">Multiplicação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Estudo Aplicado</Label>
                    <Input
                      value={formData.estudo_aplicado}
                      onChange={(e) => setFormData(prev => ({ ...prev, estudo_aplicado: e.target.value }))}
                      placeholder="Ex: Lição 5 - O Amor de Deus"
                    />
                  </div>
                </div>
              </div>

              {/* Números da Reunião */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Estatísticas</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Presentes</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.presentes}
                      onChange={(e) => setFormData(prev => ({ ...prev, presentes: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Visitantes</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.visitantes}
                      onChange={(e) => setFormData(prev => ({ ...prev, visitantes: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Crianças</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.criancas}
                      onChange={(e) => setFormData(prev => ({ ...prev, criancas: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  
                  <div>
                    <Label>Decisões</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.decisoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, decisoes: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div className="md:w-1/2">
                  <Label>Ofertas (R$)</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.ofertas}
                    onChange={(e) => setFormData(prev => ({ ...prev, ofertas: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              {/* Atividades Realizadas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary">Atividades Realizadas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {atividadesDisponiveis.map((atividade) => (
                    <div key={atividade} className="flex items-center space-x-2">
                      <Checkbox
                        id={atividade}
                        checked={formData.atividades_realizadas.includes(atividade)}
                        onCheckedChange={(checked) => handleAtividadeChange(atividade, !!checked)}
                      />
                      <Label htmlFor={atividade} className="text-sm">
                        {atividade}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lista de Presença */}
              {selectedCelula && membrosCelula.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-primary">Lista de Presença</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {membrosCelula.map((membro) => (
                      <div key={membro.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{membro.nome_completo}</span>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={presencas[membro.id]?.presente || false}
                            onCheckedChange={(checked) => 
                              handlePresencaChange(membro.id, !!checked, membro.tipo_pessoa || 'membro')
                            }
                          />
                          <Badge variant="outline" className="text-xs">
                            {membro.tipo_pessoa || 'membro'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Observações e Próximos Passos */}
              <div className="space-y-4">
                <div>
                  <Label>Próximos Passos</Label>
                  <Textarea
                    value={formData.proximos_passos}
                    onChange={(e) => setFormData(prev => ({ ...prev, proximos_passos: e.target.value }))}
                    placeholder="Planejamentos e ações para a próxima semana..."
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label>Observações</Label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                    placeholder="Observações gerais sobre a reunião..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={!selectedCelula}>
                  Salvar Relatório
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Seletor de Célula para Indicadores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Indicadores de Saúde
          </CardTitle>
          <CardDescription>
            Visualize a saúde das células baseado nos relatórios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Select onValueChange={loadIndicadoresSaude}>
              <SelectTrigger className="w-80">
                <SelectValue placeholder="Selecione uma célula para ver os indicadores" />
              </SelectTrigger>
              <SelectContent>
                {celulas.map((celula) => (
                  <SelectItem key={celula.id} value={celula.id}>
                    {celula.nome} - {celula.lider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loadingIndicadores && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Carregando indicadores...</p>
            </div>
          )}

          {indicadoresSaude && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Frequência</p>
                    <p className="text-2xl font-bold">{Math.round(indicadoresSaude.frequenciaReunoes)}%</p>
                  </div>
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Crescimento</p>
                    <p className="text-2xl font-bold">
                      {indicadoresSaude.crescimentoNumerico > 0 ? '+' : ''}
                      {Math.round(indicadoresSaude.crescimentoNumerico)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Evangelismo</p>
                    <p className="text-2xl font-bold">{Math.round(indicadoresSaude.evangelismo)}/mês</p>
                  </div>
                  <UserPlus className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Saúde Geral</p>
                    <p className={`text-2xl font-bold ${getSaudeColor(indicadoresSaude.saude)}`}>
                      {getSaudeLabel(indicadoresSaude.saude)}
                    </p>
                  </div>
                  <Heart className="h-8 w-8 text-muted-foreground" />
                </div>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Relatórios Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatórios Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relatorios.slice(0, 10).map((relatorio) => (
              <Card key={relatorio.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold">{relatorio.celula?.nome}</h4>
                      <Badge variant="outline">{relatorio.tipo_reuniao}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(relatorio.data_reuniao).toLocaleDateString('pt-BR')} - {relatorio.celula?.lider}
                    </p>
                    {relatorio.estudo_aplicado && (
                      <p className="text-sm"><strong>Estudo:</strong> {relatorio.estudo_aplicado}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {relatorio.presentes}
                    </div>
                    <div className="flex items-center gap-1">
                      <UserPlus className="h-4 w-4" />
                      {relatorio.visitantes}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {relatorio.decisoes}
                    </div>
                    {relatorio.ofertas > 0 && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        R$ {relatorio.ofertas.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
            
            {relatorios.length === 0 && (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">
                  Nenhum relatório encontrado
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Crie o primeiro relatório semanal.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};