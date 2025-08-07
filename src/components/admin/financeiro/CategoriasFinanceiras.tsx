import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useFinanceiroCompleto } from '@/hooks/useFinanceiroCompleto';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CategoriaFinanceira } from '@/hooks/useFinanceiro';
import { PlusCircle, Trash2, Edit, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

const CategoriasFinanceiras = () => {
  const { categorias, subcategorias, createCategoria, updateCategoria, deleteCategoria, createSubcategoria, deleteSubcategoria } = useFinanceiroCompleto();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubDialogOpen, setIsSubDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaFinanceira | null>(null);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'entrada' as 'entrada' | 'saida',
    descricao: '',
    cor: '#6366f1',
    orcamento_mensal: 0,
    ativa: true
  });

  const [subFormData, setSubFormData] = useState({
    nome: '',
    descricao: '',
    categoria_id: '',
    ativa: true
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'entrada',
      descricao: '',
      cor: '#6366f1',
      orcamento_mensal: 0,
      ativa: true
    });
    setEditingCategoria(null);
  };

  const resetSubForm = () => {
    setSubFormData({
      nome: '',
      descricao: '',
      categoria_id: '',
      ativa: true
    });
  };

  const handleSubmit = async () => {
    const categoriaData = {
      ...formData,
      orcamento_mensal: Number(formData.orcamento_mensal)
    };

    if (editingCategoria) {
      await updateCategoria(editingCategoria.id, categoriaData);
    } else {
      await createCategoria(categoriaData);
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubSubmit = async () => {
    await createSubcategoria(subFormData);
    setIsSubDialogOpen(false);
    resetSubForm();
  };

  const handleEdit = (categoria: CategoriaFinanceira) => {
    setFormData({
      nome: categoria.nome,
      tipo: categoria.tipo,
      descricao: categoria.descricao || '',
      cor: categoria.cor,
      orcamento_mensal: categoria.orcamento_mensal,
      ativa: categoria.ativa
    });
    setEditingCategoria(categoria);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteCategoria(id);
  };

  const handleSubDelete = async (id: string) => {
    await deleteSubcategoria(id);
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

  const categoriasEntrada = categorias.filter(cat => cat.tipo === 'entrada');
  const categoriasSaida = categorias.filter(cat => cat.tipo === 'saida');

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
            <div>
              <CardTitle className="flex items-center text-lg lg:text-xl">
                <BarChart3 className="mr-2 h-5 w-5" />
                Categorias Financeiras
              </CardTitle>
              <CardDescription className="mt-1">
                Gerencie as categorias e subcategorias dos lançamentos
              </CardDescription>
            </div>
            
            <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>
                      {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingCategoria ? 'Edite as informações da categoria' : 'Adicione uma nova categoria financeira'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Dízimos, Ofertas, Contas"
                      />
                    </div>

                    <div>
                      <Label htmlFor="tipo">Tipo *</Label>
                      <Select value={formData.tipo} onValueChange={(value: any) => setFormData(prev => ({ ...prev, tipo: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrada">Entrada</SelectItem>
                          <SelectItem value="saida">Saída</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descrição da categoria..."
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="cor">Cor</Label>
                        <Input
                          id="cor"
                          type="color"
                          value={formData.cor}
                          onChange={(e) => setFormData(prev => ({ ...prev, cor: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="orcamento">Orçamento Mensal (R$)</Label>
                        <Input
                          id="orcamento"
                          type="number"
                          step="0.01"
                          value={formData.orcamento_mensal}
                          onChange={(e) => setFormData(prev => ({ ...prev, orcamento_mensal: Number(e.target.value) }))}
                          placeholder="0,00"
                        />
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
                        disabled={!formData.nome}
                      >
                        {editingCategoria ? 'Atualizar' : 'Criar'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

               <Dialog open={isSubDialogOpen} onOpenChange={setIsSubDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={resetSubForm} className="w-full sm:w-auto">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nova Subcategoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Subcategoria</DialogTitle>
                    <DialogDescription>
                      Adicione uma nova subcategoria
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select value={subFormData.categoria_id} onValueChange={(value) => setSubFormData(prev => ({ ...prev, categoria_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          {categorias.map((categoria) => (
                            <SelectItem key={categoria.id} value={categoria.id}>
                              {categoria.nome} ({categoria.tipo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sub-nome">Nome *</Label>
                      <Input
                        id="sub-nome"
                        value={subFormData.nome}
                        onChange={(e) => setSubFormData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Ex: Missões, Equipamentos"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sub-descricao">Descrição</Label>
                      <Textarea
                        id="sub-descricao"
                        value={subFormData.descricao}
                        onChange={(e) => setSubFormData(prev => ({ ...prev, descricao: e.target.value }))}
                        placeholder="Descrição da subcategoria..."
                        rows={2}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsSubDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        onClick={handleSubSubmit}
                        disabled={!subFormData.nome || !subFormData.categoria_id}
                      >
                        Criar
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorias de Entrada */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-green-600">
              <TrendingUp className="mr-2 h-5 w-5" />
              Categorias de Entrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoriasEntrada.map((categoria) => {
                const subs = getSubcategoriasPorCategoria(categoria.id);
                return (
                  <div key={categoria.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoria.cor }}
                        />
                        <div>
                          <h3 className="font-medium">{categoria.nome}</h3>
                          {categoria.descricao && (
                            <p className="text-sm text-muted-foreground">
                              {categoria.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(categoria)}>
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
                                Tem certeza que deseja remover esta categoria?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(categoria.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {categoria.orcamento_mensal > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground">
                          Orçamento mensal: {formatCurrency(categoria.orcamento_mensal)}
                        </p>
                      </div>
                    )}
                    
                    {subs.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Subcategorias:</p>
                        <div className="flex flex-wrap gap-1">
                          {subs.map((sub) => (
                            <div key={sub.id} className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {sub.nome}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-4 w-4 p-0"
                                onClick={() => handleSubDelete(sub.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Categorias de Saída */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <TrendingDown className="mr-2 h-5 w-5" />
              Categorias de Saída
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoriasSaida.map((categoria) => {
                const subs = getSubcategoriasPorCategoria(categoria.id);
                return (
                  <div key={categoria.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: categoria.cor }}
                        />
                        <div>
                          <h3 className="font-medium">{categoria.nome}</h3>
                          {categoria.descricao && (
                            <p className="text-sm text-muted-foreground">
                              {categoria.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(categoria)}>
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
                                Tem certeza que deseja remover esta categoria?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(categoria.id)}>
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    
                    {categoria.orcamento_mensal > 0 && (
                      <div className="mb-2">
                        <p className="text-sm text-muted-foreground">
                          Orçamento mensal: {formatCurrency(categoria.orcamento_mensal)}
                        </p>
                      </div>
                    )}
                    
                    {subs.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Subcategorias:</p>
                        <div className="flex flex-wrap gap-1">
                          {subs.map((sub) => (
                            <div key={sub.id} className="flex items-center space-x-1">
                              <Badge variant="outline" className="text-xs">
                                {sub.nome}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-4 w-4 p-0"
                                onClick={() => handleSubDelete(sub.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CategoriasFinanceiras;