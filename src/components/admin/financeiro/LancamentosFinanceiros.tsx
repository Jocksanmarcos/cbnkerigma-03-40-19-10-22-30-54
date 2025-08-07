import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useFinanceiroCompleto } from '@/hooks/useFinanceiroCompleto';
import type { LancamentoFinanceiro } from '@/hooks/useFinanceiro';
import { PlusCircle, Trash2, Edit, Filter, Calendar, DollarSign, Upload } from 'lucide-react';

const LancamentosFinanceiros = () => {
  const { 
    lancamentos, 
    categorias, 
    subcategorias, 
    contas, 
    createLancamento, 
    updateLancamento, 
    deleteLancamento,
    fetchLancamentos,
    uploadComprovante,
    uploadingFile
  } = useFinanceiroCompleto();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLancamento, setEditingLancamento] = useState<LancamentoFinanceiro | null>(null);
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    categoria: 'todas',
    tipo: 'todos'
  });

  const [formData, setFormData] = useState({
    tipo: 'entrada' as 'entrada' | 'saida',
    descricao: '',
    valor: '',
    data_lancamento: new Date().toISOString().split('T')[0],
    forma_pagamento: 'dinheiro' as 'dinheiro' | 'transferencia' | 'cartao' | 'pix' | 'boleto' | 'cheque',
    categoria_id: '',
    subcategoria_id: '',
    conta_id: '',
    repeticao_mensal: false,
    observacoes: '',
    status: 'confirmado' as 'pendente' | 'confirmado' | 'cancelado',
    comprovante_url: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData({
      tipo: 'entrada',
      descricao: '',
      valor: '',
      data_lancamento: new Date().toISOString().split('T')[0],
      forma_pagamento: 'dinheiro',
      categoria_id: '',
      subcategoria_id: '',
      conta_id: '',
      repeticao_mensal: false,
      observacoes: '',
      status: 'confirmado',
      comprovante_url: ''
    });
    setEditingLancamento(null);
    setSelectedFile(null);
  };

  const handleSubmit = async () => {
    let comprovanteUrl = formData.comprovante_url;

    // Upload do comprovante se houver arquivo selecionado
    if (selectedFile) {
      const uploadResult = await uploadComprovante(selectedFile);
      if (uploadResult.data) {
        comprovanteUrl = uploadResult.data.url;
      }
    }

    const lancamentoData = {
      ...formData,
      valor: parseFloat(formData.valor),
      subcategoria_id: formData.subcategoria_id || undefined,
      observacoes: formData.observacoes || undefined,
      comprovante_url: comprovanteUrl || undefined
    };

    if (editingLancamento) {
      await updateLancamento(editingLancamento.id, lancamentoData);
    } else {
      await createLancamento(lancamentoData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (lancamento: LancamentoFinanceiro) => {
    setFormData({
      tipo: lancamento.tipo,
      descricao: lancamento.descricao,
      valor: lancamento.valor.toString(),
      data_lancamento: lancamento.data_lancamento,
      forma_pagamento: lancamento.forma_pagamento,
      categoria_id: lancamento.categoria_id,
      subcategoria_id: lancamento.subcategoria_id || '',
      conta_id: lancamento.conta_id,
      repeticao_mensal: lancamento.repeticao_mensal,
      observacoes: lancamento.observacoes || '',
      status: lancamento.status,
      comprovante_url: lancamento.comprovante_url || ''
    });
    setEditingLancamento(lancamento);
    setIsDialogOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const aplicarFiltros = () => {
    fetchLancamentos(filtros);
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: '',
      dataFim: '',
      categoria: 'todas',
      tipo: 'todos'
    });
    fetchLancamentos();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getSubcategoriasPorCategoria = (categoriaId: string) => {
    return subcategorias.filter(sub => sub.categoria_id === categoriaId);
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-mobile-lg">
            <Filter className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="data-inicio" className="text-mobile-sm">Data Início</Label>
              <Input
                id="data-inicio"
                type="date"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataInicio: e.target.value }))}
                className="text-mobile-sm"
              />
            </div>
            <div>
              <Label htmlFor="data-fim" className="text-mobile-sm">Data Fim</Label>
              <Input
                id="data-fim"
                type="date"
                value={filtros.dataFim}
                onChange={(e) => setFiltros(prev => ({ ...prev, dataFim: e.target.value }))}
                className="text-mobile-sm"
              />
            </div>
            <div>
              <Label htmlFor="filtro-tipo" className="text-mobile-sm">Tipo</Label>
              <Select value={filtros.tipo} onValueChange={(value) => setFiltros(prev => ({ ...prev, tipo: value }))}>
                <SelectTrigger className="text-mobile-sm">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="entrada">Entrada</SelectItem>
                  <SelectItem value="saida">Saída</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filtro-categoria" className="text-mobile-sm">Categoria</Label>
              <Select value={filtros.categoria} onValueChange={(value) => setFiltros(prev => ({ ...prev, categoria: value }))}>
                <SelectTrigger className="text-mobile-sm">
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col sm:flex-row items-end gap-2 sm:space-x-2">
              <Button onClick={aplicarFiltros} className="flex-1 w-full sm:w-auto button-mobile">
                Aplicar
              </Button>
              <Button variant="outline" onClick={limparFiltros} className="w-full sm:w-auto button-mobile">
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Lançamentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle className="flex items-center text-mobile-lg">
                <DollarSign className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                Lançamentos Financeiros
              </CardTitle>
              <CardDescription className="text-mobile-sm">
                Gerencie todas as movimentações financeiras
              </CardDescription>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="button-mobile">
                  <PlusCircle className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline sm:hidden md:inline">Novo</span>
                  <span className="hidden sm:inline md:hidden">+</span>
                  <span className="hidden md:inline">Novo Lançamento</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-sm sm:max-w-lg md:max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingLancamento ? 'Editar Lançamento' : 'Novo Lançamento'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingLancamento ? 'Edite as informações do lançamento' : 'Preencha as informações do novo lançamento'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <Label htmlFor="tipo" className="text-mobile-sm">Tipo *</Label>
                      <Select value={formData.tipo} onValueChange={(value: 'entrada' | 'saida') => setFormData(prev => ({ ...prev, tipo: value }))}>
                        <SelectTrigger className="text-mobile-sm">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-mobile-sm">Status *</Label>
                      <Select value={formData.status} onValueChange={(value: 'pendente' | 'confirmado' | 'cancelado') => setFormData(prev => ({ ...prev, status: value }))}>
                        <SelectTrigger className="text-mobile-sm">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="confirmado">Confirmado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="descricao">Descrição *</Label>
                    <Input
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                      placeholder="Descrição detalhada do lançamento"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="valor">Valor (R$) *</Label>
                      <Input
                        id="valor"
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                        placeholder="0,00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="data">Data *</Label>
                      <Input
                        id="data"
                        type="date"
                        value={formData.data_lancamento}
                        onChange={(e) => setFormData(prev => ({ ...prev, data_lancamento: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="forma-pagamento">Forma de Pagamento *</Label>
                      <Select value={formData.forma_pagamento} onValueChange={(value: any) => setFormData(prev => ({ ...prev, forma_pagamento: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a forma" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dinheiro">Dinheiro</SelectItem>
                          <SelectItem value="transferencia">Transferência</SelectItem>
                          <SelectItem value="cartao">Cartão</SelectItem>
                          <SelectItem value="pix">PIX</SelectItem>
                          <SelectItem value="boleto">Boleto</SelectItem>
                          <SelectItem value="cheque">Cheque</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="conta">Conta *</Label>
                      <Select value={formData.conta_id} onValueChange={(value) => setFormData(prev => ({ ...prev, conta_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a conta" />
                        </SelectTrigger>
                        <SelectContent>
                          {contas.map((conta) => (
                            <SelectItem key={conta.id} value={conta.id}>
                              {conta.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select 
                        value={formData.categoria_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, categoria_id: value, subcategoria_id: '' }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias
                            .filter(cat => cat.tipo === formData.tipo)
                            .map((categoria) => (
                              <SelectItem key={categoria.id} value={categoria.id}>
                                {categoria.nome}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="subcategoria">Subcategoria</Label>
                      <Select 
                        value={formData.subcategoria_id} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoria_id: value }))}
                        disabled={!formData.categoria_id}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a subcategoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {getSubcategoriasPorCategoria(formData.categoria_id).map((subcategoria) => (
                            <SelectItem key={subcategoria.id} value={subcategoria.id}>
                              {subcategoria.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="repeticao"
                      checked={formData.repeticao_mensal}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, repeticao_mensal: checked }))}
                    />
                    <Label htmlFor="repeticao">Repetição mensal</Label>
                  </div>

                  <div>
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="comprovante">Comprovante</Label>
                    <div className="space-y-2">
                      <Input
                        id="comprovante"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleFileChange}
                      />
                      {selectedFile && (
                        <p className="text-sm text-muted-foreground">
                          Arquivo selecionado: {selectedFile.name}
                        </p>
                      )}
                      {formData.comprovante_url && !selectedFile && (
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-muted-foreground">
                            Comprovante atual anexado
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.open(formData.comprovante_url, '_blank')}
                          >
                            <Upload className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      onClick={handleSubmit}
                      disabled={!formData.descricao || !formData.valor || !formData.categoria_id || !formData.conta_id || uploadingFile}
                    >
                      {uploadingFile ? 'Enviando...' : editingLancamento ? 'Atualizar' : 'Criar'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        
        <CardContent>
          {lancamentos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum lançamento encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {lancamentos.map((lancamento) => (
                <div key={lancamento.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-3 h-3 rounded-full ${
                      lancamento.tipo === 'entrada' ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{lancamento.descricao}</p>
                        <Badge 
                          variant={lancamento.status === 'confirmado' ? 'default' : 
                                   lancamento.status === 'pendente' ? 'secondary' : 'destructive'}
                        >
                          {lancamento.status}
                        </Badge>
                        {lancamento.repeticao_mensal && (
                          <Badge variant="outline">Mensal</Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{lancamento.categoria?.nome}</span>
                        {lancamento.subcategoria && <span>• {lancamento.subcategoria.nome}</span>}
                        <span>• {new Date(lancamento.data_lancamento).toLocaleDateString('pt-BR')}</span>
                        <span>• {lancamento.conta?.nome}</span>
                        <span className="capitalize">• {lancamento.forma_pagamento}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className={`text-lg font-bold ${
                      lancamento.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {lancamento.tipo === 'entrada' ? '+' : '-'}{formatCurrency(lancamento.valor)}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(lancamento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja remover este lançamento? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteLancamento(lancamento.id)}>
                              Remover
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LancamentosFinanceiros;