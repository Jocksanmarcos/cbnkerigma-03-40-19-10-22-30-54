import { useState } from 'react';
import { useConteudo, type ConteudoSite } from '@/hooks/useConteudo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';

export const ConteudoManager = () => {
  const { conteudos, loading, updateConteudo, createConteudo, deleteConteudo } = useConteudo();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ConteudoSite | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [formData, setFormData] = useState<{
    chave: string;
    titulo: string;
    valor: string;
    tipo: 'texto' | 'textarea' | 'html';
    categoria: string;
    descricao: string;
  }>({
    chave: '',
    titulo: '',
    valor: '',
    tipo: 'texto',
    categoria: '',
    descricao: ''
  });

  const resetForm = () => {
    setFormData({
      chave: '',
      titulo: '',
      valor: '',
      tipo: 'texto',
      categoria: '',
      descricao: ''
    });
    setEditingItem(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await updateConteudo(editingItem.id, formData.valor);
      } else {
        await createConteudo(formData);
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar conteúdo:', error);
    }
  };

  const handleEdit = (item: ConteudoSite) => {
    setEditingItem(item);
    setFormData({
      chave: item.chave,
      titulo: item.titulo,
      valor: item.valor,
      tipo: item.tipo,
      categoria: item.categoria || '',
      descricao: item.descricao || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este conteúdo?')) {
      await deleteConteudo(id);
    }
  };

  const startInlineEdit = (item: ConteudoSite) => {
    setEditingId(item.id);
    setEditValue(item.valor);
  };

  const saveInlineEdit = async (id: string) => {
    try {
      await updateConteudo(id, editValue);
      setEditingId(null);
      setEditValue('');
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const cancelInlineEdit = () => {
    setEditingId(null);
    setEditValue('');
  };

  const categorias = [
    'home',
    'sobre',
    'contato',
    'celulas',
    'agenda',
    'galeria',
    'footer',
    'geral'
  ];

  const groupedConteudos = conteudos.reduce((acc, item) => {
    const categoria = item.categoria || 'geral';
    if (!acc[categoria]) {
      acc[categoria] = [];
    }
    acc[categoria].push(item);
    return acc;
  }, {} as Record<string, ConteudoSite[]>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Conteúdo</h2>
          <p className="text-muted-foreground">Gerencie os textos e conteúdos do site</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Conteúdo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Editar Conteúdo' : 'Novo Conteúdo'}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? 'Edite as informações do conteúdo' : 'Adicione um novo conteúdo ao site'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chave">Chave *</Label>
                  <Input
                    id="chave"
                    value={formData.chave}
                    onChange={(e) => setFormData(prev => ({ ...prev, chave: e.target.value }))}
                    placeholder="hero_titulo"
                    required
                    disabled={!!editingItem}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="titulo">Título *</Label>
                  <Input
                    id="titulo"
                    value={formData.titulo}
                    onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                    placeholder="Título Principal"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value: 'texto' | 'textarea' | 'html') => 
                      setFormData(prev => ({ ...prev, tipo: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="texto">Texto</SelectItem>
                      <SelectItem value="textarea">Texto Longo</SelectItem>
                      <SelectItem value="html">HTML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map(categoria => (
                        <SelectItem key={categoria} value={categoria}>
                          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="valor">Valor *</Label>
                {formData.tipo === 'textarea' ? (
                  <Textarea
                    id="valor"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    rows={4}
                    required
                  />
                ) : (
                  <Input
                    id="valor"
                    value={formData.valor}
                    onChange={(e) => setFormData(prev => ({ ...prev, valor: e.target.value }))}
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Input
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  placeholder="Descrição do conteúdo"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingItem ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando conteúdos...</div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedConteudos).map(([categoria, items]) => (
            <Card key={categoria}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  <Badge variant="secondary">{items.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium">{item.titulo}</h4>
                          <p className="text-sm text-muted-foreground">
                            Chave: <code className="bg-muted px-1 rounded">{item.chave}</code>
                          </p>
                          {item.descricao && (
                            <p className="text-sm text-muted-foreground mt-1">{item.descricao}</p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        {editingId === item.id ? (
                          <div className="flex gap-2">
                            {item.tipo === 'textarea' ? (
                              <Textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                rows={3}
                                className="flex-1"
                              />
                            ) : (
                              <Input
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                className="flex-1"
                              />
                            )}
                            <Button size="sm" onClick={() => saveInlineEdit(item.id)}>
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelInlineEdit}>
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : (
                          <div 
                            className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80"
                            onClick={() => startInlineEdit(item)}
                          >
                            {item.tipo === 'textarea' ? (
                              <p className="whitespace-pre-wrap">{item.valor}</p>
                            ) : (
                              <p>{item.valor}</p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Badge variant="outline" className="mt-2">
                        {item.tipo}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          
          {conteudos.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhum conteúdo encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};