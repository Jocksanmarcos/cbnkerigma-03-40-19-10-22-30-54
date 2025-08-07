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
import { CalendarIcon, Plus, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { PersonSelect } from '@/components/ui/person-select';
import { EmprestimoPatrimonio, Patrimonio } from '@/hooks/usePatrimonio';

interface EmprestimosListProps {
  emprestimos: EmprestimoPatrimonio[];
  patrimonios: Patrimonio[];
  onCreateEmprestimo: (emprestimo: any) => void;
  onDevolverEmprestimo: (id: string, data_devolucao: string, situacao?: string) => void;
}

export const EmprestimosList = ({ 
  emprestimos, 
  patrimonios, 
  onCreateEmprestimo, 
  onDevolverEmprestimo 
}: EmprestimosListProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDevolucaoOpen, setIsDevolucaoOpen] = useState(false);
  const [emprestimoSelecionado, setEmprestimoSelecionado] = useState<EmprestimoPatrimonio | null>(null);
  
  const [formData, setFormData] = useState({
    patrimonio_id: '',
    solicitante_id: '',
    data_retirada: new Date(),
    data_prevista_devolucao: new Date(),
    local_uso: '',
    observacoes: ''
  });

  const [devolucaoData, setDevolucaoData] = useState({
    data_devolucao: new Date(),
    situacao_devolucao: ''
  });

  const patrimoniosDisponiveis = patrimonios.filter(p => p.status === 'em_uso');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      data_retirada: format(formData.data_retirada, 'yyyy-MM-dd'),
      data_prevista_devolucao: format(formData.data_prevista_devolucao, 'yyyy-MM-dd'),
      status: 'ativo'
    };

    onCreateEmprestimo(submitData);
    setIsDialogOpen(false);
    setFormData({
      patrimonio_id: '',
      solicitante_id: '',
      data_retirada: new Date(),
      data_prevista_devolucao: new Date(),
      local_uso: '',
      observacoes: ''
    });
  };

  const handleDevolucao = (e: React.FormEvent) => {
    e.preventDefault();
    if (emprestimoSelecionado) {
      onDevolverEmprestimo(
        emprestimoSelecionado.id,
        format(devolucaoData.data_devolucao, 'yyyy-MM-dd'),
        devolucaoData.situacao_devolucao
      );
      setIsDevolucaoOpen(false);
      setEmprestimoSelecionado(null);
    }
  };

  const getStatusBadge = (status: string, dataPrevista: string) => {
    const hoje = new Date();
    const dataPrevisao = new Date(dataPrevista);
    
    if (status === 'devolvido') {
      return <Badge variant="default">Devolvido</Badge>;
    }
    
    if (status === 'ativo' && dataPrevisao < hoje) {
      return <Badge variant="destructive">Atrasado</Badge>;
    }
    
    return <Badge variant="secondary">Ativo</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-bold">Empréstimos de Patrimônio</h3>
          <p className="text-sm sm:text-base text-muted-foreground">
            Controle de empréstimos internos dos bens da igreja
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="button-mobile gap-2 flex-shrink-0">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Novo Empréstimo</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Empréstimo</DialogTitle>
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
                      {patrimoniosDisponiveis.map(patrimonio => (
                        <SelectItem key={patrimonio.id} value={patrimonio.id}>
                          {patrimonio.nome} ({patrimonio.codigo_patrimonio})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="solicitante">Solicitante *</Label>
                  <PersonSelect
                    value={formData.solicitante_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, solicitante_id: value }))}
                    placeholder="Selecione o solicitante"
                    returnType="id"
                  />
                </div>

                <div>
                  <Label>Data de Retirada *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.data_retirada, "PPP", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.data_retirada}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, data_retirada: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>Data Prevista de Devolução *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-left font-normal")}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(formData.data_prevista_devolucao, "PPP", { locale: ptBR })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={formData.data_prevista_devolucao}
                        onSelect={(date) => date && setFormData(prev => ({ ...prev, data_prevista_devolucao: date }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div>
                <Label htmlFor="local_uso">Local de Uso</Label>
                <Input
                  placeholder="Onde será usado o patrimônio"
                  value={formData.local_uso}
                  onChange={(e) => setFormData(prev => ({ ...prev, local_uso: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  placeholder="Observações sobre o empréstimo"
                  value={formData.observacoes}
                  onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="w-full sm:w-auto">
                  Cancelar
                </Button>
                <Button type="submit" className="w-full sm:w-auto">
                  Registrar Empréstimo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Empréstimos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Lista de Empréstimos ({emprestimos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {emprestimos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum empréstimo registrado.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Patrimônio</TableHead>
                    <TableHead className="min-w-[120px]">Solicitante</TableHead>
                    <TableHead className="min-w-[100px]">Data Retirada</TableHead>
                    <TableHead className="min-w-[120px]">Previsão Devolução</TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="min-w-[100px]">Local de Uso</TableHead>
                    <TableHead className="text-right min-w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emprestimos.map((emprestimo) => (
                    <TableRow key={emprestimo.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{emprestimo.patrimonio?.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            {emprestimo.patrimonio?.codigo_patrimonio}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {emprestimo.solicitante?.nome_completo || 'Nome não encontrado'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(emprestimo.data_retirada), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {format(new Date(emprestimo.data_prevista_devolucao), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(emprestimo.status, emprestimo.data_prevista_devolucao)}
                      </TableCell>
                      <TableCell>
                        {emprestimo.local_uso || 'Não informado'}
                      </TableCell>
                      <TableCell className="text-right">
                        {emprestimo.status === 'ativo' && (
                          <Button
                            size="sm"
                            onClick={() => {
                              setEmprestimoSelecionado(emprestimo);
                              setIsDevolucaoOpen(true);
                            }}
                            className="gap-2 button-mobile"
                          >
                            <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="hidden sm:inline">Devolver</span>
                            <span className="sm:hidden">Dev.</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Devolução */}
      <Dialog open={isDevolucaoOpen} onOpenChange={setIsDevolucaoOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Devolução</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleDevolucao} className="space-y-4">
            <div>
              <Label>Data de Devolução *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(devolucaoData.data_devolucao, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={devolucaoData.data_devolucao}
                    onSelect={(date) => date && setDevolucaoData(prev => ({ ...prev, data_devolucao: date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="situacao_devolucao">Situação na Devolução</Label>
              <Textarea
                placeholder="Como estava o patrimônio na devolução?"
                value={devolucaoData.situacao_devolucao}
                onChange={(e) => setDevolucaoData(prev => ({ ...prev, situacao_devolucao: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setIsDevolucaoOpen(false)} className="w-full sm:w-auto">
                Cancelar
              </Button>
              <Button type="submit" className="w-full sm:w-auto">
                Confirmar Devolução
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};