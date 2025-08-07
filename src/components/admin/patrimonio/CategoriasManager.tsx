import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Plus, FolderOpen, FolderPlus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CategoriaPatrimonio {
  id: string;
  nome: string;
  descricao?: string;
  ativa: boolean;
}

interface SubcategoriaPatrimonio {
  id: string;
  nome: string;
  descricao?: string;
  categoria_id: string;
  ativa: boolean;
}

interface CategoriasManagerProps {
  categorias: CategoriaPatrimonio[];
  subcategorias: SubcategoriaPatrimonio[];
  onRefresh: () => void;
}

export const CategoriasManager = ({ categorias, subcategorias, onRefresh }: CategoriasManagerProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubcategoriaDialogOpen, setIsSubcategoriaDialogOpen] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<CategoriaPatrimonio | null>(null);
  const [editingSubcategoria, setEditingSubcategoria] = useState<SubcategoriaPatrimonio | null>(null);
  const [novaCategoria, setNovaCategoria] = useState({ nome: '', descricao: '' });
  const [novaSubcategoria, setNovaSubcategoria] = useState({ nome: '', descricao: '', categoria_id: '' });

  const handleCreateCategoria = async () => {
    if (!novaCategoria.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('categorias_patrimonio')
        .insert([{
          nome: novaCategoria.nome,
          descricao: novaCategoria.descricao || null,
          ativa: true
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });

      setNovaCategoria({ nome: '', descricao: '' });
      setIsDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategoria = async () => {
    if (!editingCategoria || !novaCategoria.nome.trim()) return;

    try {
      const { error } = await supabase
        .from('categorias_patrimonio')
        .update({
          nome: novaCategoria.nome,
          descricao: novaCategoria.descricao || null,
        })
        .eq('id', editingCategoria.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria atualizada com sucesso!",
      });

      setEditingCategoria(null);
      setNovaCategoria({ nome: '', descricao: '' });
      setIsDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategoria = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta categoria?')) return;

    try {
      const { error } = await supabase
        .from('categorias_patrimonio')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Categoria desativada com sucesso!",
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao desativar categoria",
        variant: "destructive",
      });
    }
  };

  const handleCreateSubcategoria = async () => {
    if (!novaSubcategoria.nome.trim() || !novaSubcategoria.categoria_id) {
      toast({
        title: "Erro",
        description: "Nome e categoria são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('subcategorias_patrimonio')
        .insert([{
          nome: novaSubcategoria.nome,
          descricao: novaSubcategoria.descricao || null,
          categoria_id: novaSubcategoria.categoria_id,
          ativa: true
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subcategoria criada com sucesso!",
      });

      setNovaSubcategoria({ nome: '', descricao: '', categoria_id: '' });
      setIsSubcategoriaDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao criar subcategoria",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubcategoria = async () => {
    if (!editingSubcategoria || !novaSubcategoria.nome.trim()) return;

    try {
      const { error } = await supabase
        .from('subcategorias_patrimonio')
        .update({
          nome: novaSubcategoria.nome,
          descricao: novaSubcategoria.descricao || null,
          categoria_id: novaSubcategoria.categoria_id,
        })
        .eq('id', editingSubcategoria.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subcategoria atualizada com sucesso!",
      });

      setEditingSubcategoria(null);
      setNovaSubcategoria({ nome: '', descricao: '', categoria_id: '' });
      setIsSubcategoriaDialogOpen(false);
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao atualizar subcategoria",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubcategoria = async (id: string) => {
    if (!confirm('Tem certeza que deseja desativar esta subcategoria?')) return;

    try {
      const { error } = await supabase
        .from('subcategorias_patrimonio')
        .update({ ativa: false })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Subcategoria desativada com sucesso!",
      });

      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Erro ao desativar subcategoria",
        variant: "destructive",
      });
    }
  };

  const openEditCategoria = (categoria: CategoriaPatrimonio) => {
    setEditingCategoria(categoria);
    setNovaCategoria({ nome: categoria.nome, descricao: categoria.descricao || '' });
    setIsDialogOpen(true);
  };

  const openEditSubcategoria = (subcategoria: SubcategoriaPatrimonio) => {
    setEditingSubcategoria(subcategoria);
    setNovaSubcategoria({ 
      nome: subcategoria.nome, 
      descricao: subcategoria.descricao || '', 
      categoria_id: subcategoria.categoria_id 
    });
    setIsSubcategoriaDialogOpen(true);
  };

  const resetFormCategoria = () => {
    setEditingCategoria(null);
    setNovaCategoria({ nome: '', descricao: '' });
  };

  const resetFormSubcategoria = () => {
    setEditingSubcategoria(null);
    setNovaSubcategoria({ nome: '', descricao: '', categoria_id: '' });
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h3 className="text-lg font-semibold">Gerenciar Categorias e Subcategorias</h3>
          <p className="text-sm text-muted-foreground">
            Organize os patrimônios em categorias e subcategorias
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetFormCategoria();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <FolderPlus className="h-4 w-4" />
                Nova Categoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCategoria ? 'Editar Categoria' : 'Nova Categoria'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome da Categoria</label>
                  <Input
                    value={novaCategoria.nome}
                    onChange={(e) => setNovaCategoria({ ...novaCategoria, nome: e.target.value })}
                    placeholder="Ex: Equipamentos de Som"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={novaCategoria.descricao}
                    onChange={(e) => setNovaCategoria({ ...novaCategoria, descricao: e.target.value })}
                    placeholder="Descrição opcional da categoria"
                  />
                </div>
                <Button 
                  onClick={editingCategoria ? handleUpdateCategoria : handleCreateCategoria}
                  className="w-full"
                >
                  {editingCategoria ? 'Atualizar' : 'Criar'} Categoria
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isSubcategoriaDialogOpen} onOpenChange={(open) => {
            setIsSubcategoriaDialogOpen(open);
            if (!open) resetFormSubcategoria();
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Nova Subcategoria
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingSubcategoria ? 'Editar Subcategoria' : 'Nova Subcategoria'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Categoria</label>
                  <Select 
                    value={novaSubcategoria.categoria_id} 
                    onValueChange={(value) => setNovaSubcategoria({ ...novaSubcategoria, categoria_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Nome da Subcategoria</label>
                  <Input
                    value={novaSubcategoria.nome}
                    onChange={(e) => setNovaSubcategoria({ ...novaSubcategoria, nome: e.target.value })}
                    placeholder="Ex: Microfones"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={novaSubcategoria.descricao}
                    onChange={(e) => setNovaSubcategoria({ ...novaSubcategoria, descricao: e.target.value })}
                    placeholder="Descrição opcional da subcategoria"
                  />
                </div>
                <Button 
                  onClick={editingSubcategoria ? handleUpdateSubcategoria : handleCreateSubcategoria}
                  className="w-full"
                >
                  {editingSubcategoria ? 'Atualizar' : 'Criar'} Subcategoria
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="grid gap-6">
        {categorias.map(categoria => (
          <Card key={categoria.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5" />
                    {categoria.nome}
                  </CardTitle>
                  {categoria.descricao && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {categoria.descricao}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditCategoria(categoria)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCategoria(categoria.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Subcategorias:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {subcategorias
                    .filter(sub => sub.categoria_id === categoria.id)
                    .map(subcategoria => (
                      <div
                        key={subcategoria.id}
                        className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                      >
                        <div>
                          <span className="text-sm font-medium">{subcategoria.nome}</span>
                          {subcategoria.descricao && (
                            <p className="text-xs text-muted-foreground">
                              {subcategoria.descricao}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => openEditSubcategoria(subcategoria)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => handleDeleteSubcategoria(subcategoria.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
                {subcategorias.filter(sub => sub.categoria_id === categoria.id).length === 0 && (
                  <p className="text-sm text-muted-foreground">Nenhuma subcategoria cadastrada</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};