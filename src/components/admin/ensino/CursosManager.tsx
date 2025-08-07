import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Book, Clock, Users } from 'lucide-react';
import { useEnsinoCompleto, CursoEnsino } from '@/hooks/useEnsinoCompleto';

export const CursosManager = () => {
  const { cursos, createCurso, updateCurso, deleteCurso, loading } = useEnsinoCompleto();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCurso, setEditingCurso] = useState<CursoEnsino | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    categoria: 'discipulado',
    nivel: 'iniciante',
    pre_requisitos: [] as string[],
    material_didatico: [],
    carga_horaria: 0,
    emite_certificado: true,
    publico_alvo: [] as string[],
    ativo: true,
  });

  const [categorias, setCategorias] = useState([
    { value: 'discipulado', label: 'Discipulado' },
    { value: 'formacao', label: 'Formação' },
    { value: 'voluntariado', label: 'Voluntariado' },
    { value: 'teologico', label: 'Teológico' },
    { value: 'ebd', label: 'EBD' },
  ]);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [showAddCategoria, setShowAddCategoria] = useState(false);

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      categoria: 'discipulado',
      nivel: 'iniciante',
      pre_requisitos: [],
      material_didatico: [],
      carga_horaria: 0,
      emite_certificado: true,
      publico_alvo: [],
      ativo: true,
    });
    setEditingCurso(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCurso) {
        await updateCurso(editingCurso.id, formData);
      } else {
        await createCurso(formData);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar curso:', error);
    }
  };

  const handleEdit = (curso: CursoEnsino) => {
    setEditingCurso(curso);
    setFormData({
      nome: curso.nome,
      descricao: curso.descricao || '',
      categoria: curso.categoria,
      nivel: curso.nivel,
      pre_requisitos: curso.pre_requisitos || [],
      material_didatico: curso.material_didatico || [],
      carga_horaria: curso.carga_horaria || 0,
      emite_certificado: curso.emite_certificado,
      publico_alvo: curso.publico_alvo || [],
      ativo: curso.ativo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este curso?')) {
      await deleteCurso(id);
    }
  };


  const niveis = [
    { value: 'iniciante', label: 'Iniciante' },
    { value: 'intermediario', label: 'Intermediário' },
    { value: 'avancado', label: 'Avançado' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6 max-w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-mobile-lg font-semibold">Cursos Cadastrados</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => { resetForm(); setIsDialogOpen(true); }}
              className="w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Curso
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile">
            <DialogHeader>
              <DialogTitle>
                {editingCurso ? 'Editar Curso' : 'Novo Curso'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Curso *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                      <div className="p-2 border-t">
                        {!showAddCategoria ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setShowAddCategoria(true)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Adicionar Nova Categoria
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <Input
                              placeholder="Nome da nova categoria"
                              value={novaCategoria}
                              onChange={(e) => setNovaCategoria(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  if (novaCategoria.trim() && !categorias.find(c => c.value === novaCategoria.toLowerCase().replace(/\s+/g, '_'))) {
                                    const newCat = {
                                      value: novaCategoria.toLowerCase().replace(/\s+/g, '_'),
                                      label: novaCategoria.trim()
                                    };
                                    setCategorias(prev => [...prev, newCat]);
                                    setFormData(prev => ({ ...prev, categoria: newCat.value }));
                                    setNovaCategoria('');
                                    setShowAddCategoria(false);
                                  }
                                }
                              }}
                            />
                            <div className="flex gap-1">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => {
                                  if (novaCategoria.trim() && !categorias.find(c => c.value === novaCategoria.toLowerCase().replace(/\s+/g, '_'))) {
                                    const newCat = {
                                      value: novaCategoria.toLowerCase().replace(/\s+/g, '_'),
                                      label: novaCategoria.trim()
                                    };
                                    setCategorias(prev => [...prev, newCat]);
                                    setFormData(prev => ({ ...prev, categoria: newCat.value }));
                                    setNovaCategoria('');
                                    setShowAddCategoria(false);
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
                                  setNovaCategoria('');
                                  setShowAddCategoria(false);
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nivel">Nível</Label>
                  <Select value={formData.nivel} onValueChange={(value) => setFormData({ ...formData, nivel: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {niveis.map((nivel) => (
                        <SelectItem key={nivel.value} value={nivel.value}>
                          {nivel.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="carga_horaria">Carga Horária (horas)</Label>
                  <Input
                    id="carga_horaria"
                    type="number"
                    value={formData.carga_horaria}
                    onChange={(e) => setFormData({ ...formData, carga_horaria: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="emite_certificado"
                  checked={formData.emite_certificado}
                  onCheckedChange={(checked) => setFormData({ ...formData, emite_certificado: checked })}
                />
                <Label htmlFor="emite_certificado">Emite Certificado</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
                <Label htmlFor="ativo">Curso Ativo</Label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCurso ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-mobile-sm text-muted-foreground mt-2">Carregando cursos...</p>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          {/* Mobile View */}
          <div className="sm:hidden space-y-3">
            {cursos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Book className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>Nenhum curso cadastrado</p>
              </div>
            ) : (
              cursos.map((curso) => (
                <Card key={curso.id} className="w-full">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <Book className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">{curso.nome}</h4>
                          {curso.descricao && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {curso.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge 
                        variant={curso.ativo ? "default" : "secondary"} 
                        className="text-xs flex-shrink-0 ml-2"
                      >
                        {curso.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">
                        {categorias.find(c => c.value === curso.categoria)?.label || curso.categoria}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {niveis.find(n => n.value === curso.nivel)?.label || curso.nivel}
                      </Badge>
                      {curso.carga_horaria && (
                        <Badge variant="outline" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          {curso.carga_horaria}h
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(curso)}
                        className="p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(curso.id)}
                        className="text-destructive hover:text-destructive p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block border rounded-md overflow-x-auto">
            <Table className="w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="text-mobile-xs min-w-[200px]">Nome</TableHead>
                  <TableHead className="text-mobile-xs min-w-[120px]">Categoria</TableHead>
                  <TableHead className="text-mobile-xs min-w-[100px] hidden md:table-cell">Nível</TableHead>
                  <TableHead className="text-mobile-xs min-w-[120px] hidden lg:table-cell">Carga Horária</TableHead>
                  <TableHead className="text-mobile-xs min-w-[80px]">Status</TableHead>
                  <TableHead className="text-mobile-xs min-w-[100px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cursos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum curso cadastrado
                    </TableCell>
                  </TableRow>
                ) : (
                  cursos.map((curso) => (
                    <TableRow key={curso.id}>
                      <TableCell className="max-w-[200px]">
                        <div className="flex items-center space-x-2">
                          <Book className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="font-medium text-mobile-sm truncate">{curso.nome}</div>
                            {curso.descricao && (
                              <div className="text-mobile-xs text-muted-foreground truncate">
                                {curso.descricao}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {categorias.find(c => c.value === curso.categoria)?.label || curso.categoria}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="secondary" className="text-xs">
                          {niveis.find(n => n.value === curso.nivel)?.label || curso.nivel}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {curso.carga_horaria ? (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{curso.carga_horaria}h</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={curso.ativo ? "default" : "secondary"} className="text-mobile-xs">
                          {curso.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(curso)}
                            className="p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(curso.id)}
                            className="text-destructive hover:text-destructive p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};