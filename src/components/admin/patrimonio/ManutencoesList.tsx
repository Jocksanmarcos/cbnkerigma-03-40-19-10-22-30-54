import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Wrench, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PersonSelect } from '@/components/ui/person-select';
import { ManutencaoPatrimonio, Patrimonio } from '@/hooks/usePatrimonio';

interface ManutencoesListProps {
  manutencoes: ManutencaoPatrimonio[];
  patrimonios: Patrimonio[];
  onCreateManutencao: (manutencao: any) => void;
}

export const ManutencoesList = ({ 
  manutencoes, 
  patrimonios, 
  onCreateManutencao 
}: ManutencoesListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    patrimonio_id: '',
    data_manutencao: new Date(),
    tipo_manutencao: 'preventiva' as const,
    descricao: '',
    valor_gasto: '',
    responsavel_id: '',
    empresa_responsavel: '',
    observacoes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      data_manutencao: format(formData.data_manutencao, 'yyyy-MM-dd'),
      valor_gasto: formData.valor_gasto ? parseFloat(formData.valor_gasto) : null
    };

    onCreateManutencao(submitData);
    setIsDialogOpen(false);
    setFormData({
      patrimonio_id: '',
      data_manutencao: new Date(),
      tipo_manutencao: 'preventiva',
      descricao: '',
      valor_gasto: '',
      responsavel_id: '',
      empresa_responsavel: '',
      observacoes: ''
    });
  };

  const getTipoManutencaoBadge = (tipo: string) => {
    const tipoConfig = {
      preventiva: { label: 'Preventiva', variant: 'default' as const },
      corretiva: { label: 'Corretiva', variant: 'destructive' as const },
      revisao: { label: 'Revisão', variant: 'secondary' as const }
    };

    const config = tipoConfig[tipo as keyof typeof tipoConfig] || { label: tipo, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const patrimoniosVencimento = patrimonios.filter(p => {
    if (!p.data_proxima_manutencao) return false;
    const hoje = new Date();
    const proximaManutencao = new Date(p.data_proxima_manutencao);
    const diasRestantes = Math.ceil((proximaManutencao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes >= 0;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Manutenções de Patrimônio</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Histórico e agendamento de manutenções
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="button-mobile gap-2 flex-shrink-0">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Nova Manutenção</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Manutenção</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="patrimonio">Patrimônio *</Label>
                  <Select value={formData.patrimonio_id} onValueChange={(value) => setFormData(prev => ({ ...prev, patrimonio_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um patrimônio" />
                    </SelectTrigger>
                    <SelectContent>
                      {patrimonios.map(patrimonio => (
                        <SelectItem key={patrimonio.id} value={patrimonio.id}>
                          {patrimonio.nome} ({patrimonio.codigo_patrimonio})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Data da Manutenção *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.data_manutencao, "PPP", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.data_manutencao}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, data_manutencao: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="tipo_manutencao">Tipo de Manutenção *</Label>
                  <Select value={formData.tipo_manutencao} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo_manutencao: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventiva">Preventiva</SelectItem>
                      <SelectItem value="corretiva">Corretiva</SelectItem>
                      <SelectItem value="revisao">Revisão</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="valor_gasto">Valor Gasto (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={formData.valor_gasto}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor_gasto: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="descricao">Descrição da Manutenção *</Label>
                <Textarea
                  placeholder="Descreva o que foi feito na manutenção"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="responsavel_id">Responsável</Label>
                  <PersonSelect
                    value={formData.responsavel_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, responsavel_id: value }))}
                    placeholder="Selecione o responsável"
                    returnType="id"
                  />
                </div>

                <div>
                  <Label htmlFor="empresa_responsavel">Empresa Responsável</Label>
                  <Input
                    placeholder="Nome da empresa que fez a manutenção"
                    value={formData.empresa_responsavel}
                    onChange={(e) => setFormData(prev => ({ ...prev, empresa_responsavel: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  placeholder="Observações adicionais"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Registrar Manutenção
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerta de Manutenções Próximas */}
      {patrimoniosVencimento.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Manutenções Próximas do Vencimento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {patrimoniosVencimento.map(patrimonio => {
                const hoje = new Date();
                const proximaManutencao = new Date(patrimonio.data_proxima_manutencao!);
                const diasRestantes = Math.ceil((proximaManutencao.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={patrimonio.id} className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{patrimonio.nome}</span>
                      <span className="text-sm text-muted-foreground ml-2">
                        ({patrimonio.codigo_patrimonio})
                      </span>
                    </div>
                    <Badge variant={diasRestantes <= 7 ? "destructive" : "secondary"}>
                      {diasRestantes === 0 ? 'Hoje' : `${diasRestantes} dias`}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Manutenções */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Histórico de Manutenções ({manutencoes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {manutencoes.length === 0 ? (
            <div className="text-center py-8">
              <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma manutenção registrada.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Patrimônio</TableHead>
                    <TableHead className="min-w-[100px]">Data</TableHead>
                    <TableHead className="min-w-[100px]">Tipo</TableHead>
                    <TableHead className="min-w-[200px]">Descrição</TableHead>
                    <TableHead className="min-w-[150px]">Empresa</TableHead>
                    <TableHead className="min-w-[100px]">Valor</TableHead>
                    <TableHead className="min-w-[120px]">Responsável</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manutencoes.map((manutencao) => (
                    <TableRow key={manutencao.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{manutencao.patrimonio?.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {manutencao.patrimonio?.codigo_patrimonio}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(manutencao.data_manutencao), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {getTipoManutencaoBadge(manutencao.tipo_manutencao)}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={manutencao.descricao}>
                          {manutencao.descricao}
                        </div>
                      </TableCell>
                      <TableCell>
                        {manutencao.empresa_responsavel || 'Não informado'}
                      </TableCell>
                      <TableCell>
                        {manutencao.valor_gasto ? (
                          `R$ ${manutencao.valor_gasto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                        ) : (
                          'Não informado'
                        )}
                      </TableCell>
                      <TableCell>
                        {manutencao.responsavel?.nome_completo || 'Sistema'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};