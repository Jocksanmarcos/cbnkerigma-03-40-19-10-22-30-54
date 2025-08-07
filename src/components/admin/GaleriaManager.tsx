import { useState } from 'react';
import { useGaleria } from '@/hooks/useGaleria';
import { useEventos } from '@/hooks/useEventos';
import { useCategoriasGaleria } from '@/hooks/useCategoriasGaleria';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { Plus, Camera, Edit, Trash2, Upload, Eye, Tag } from 'lucide-react';
import { CategoriasGaleriaManager } from './galeria/CategoriasGaleriaManager';

export const GaleriaManager = () => {
  const { items, loading, createItem, updateItem, deleteItem, uploadImage } = useGaleria();
  const { eventos } = useEventos();
  const { categorias: categoriasGaleria } = useCategoriasGaleria();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
    data_evento: '',
    destaque: false,
    ordem: '',
    evento_id: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      categoria: '',
      data_evento: '',
      destaque: false,
      ordem: '',
      evento_id: ''
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setEditingItem(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !editingItem) return;

    try {
      setUploading(true);
      let imageUrl = editingItem?.url_imagem || '';

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);
      }

      const itemData = {
        ...formData,
        url_imagem: imageUrl,
        url_thumbnail: imageUrl, // Por simplicidade, usando a mesma URL
        ordem: formData.ordem ? parseInt(formData.ordem) : null,
        evento_id: formData.evento_id || null,
        data_evento: formData.data_evento || null
      };

      if (editingItem) {
        await updateItem(editingItem.id, itemData);
      } else {
        await createItem(itemData);
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      titulo: item.titulo,
      descricao: item.descricao || '',
      categoria: item.categoria || '',
      data_evento: item.data_evento || '',
      destaque: item.destaque || false,
      ordem: item.ordem?.toString() || '',
      evento_id: item.evento_id || ''
    });
    setPreviewUrl(item.url_imagem);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta imagem?')) {
      await deleteItem(id);
    }
  };

  const categorias = [
    'culto',
    'celula',
    'evento',
    'batismo',
    'casamento',
    'jovens',
    'geral'
  ];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <MobileTabs defaultValue="galeria" className="w-full">
        <MobileTabsList className="grid w-full grid-cols-2">
          <MobileTabsTrigger value="galeria" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            <span>Galeria</span>
          </MobileTabsTrigger>
          <MobileTabsTrigger value="categorias" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span>Categorias</span>
          </MobileTabsTrigger>
        </MobileTabsList>

        <MobileTabsContent value="galeria" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Gerenciamento de Galeria</h2>
              <p className="text-muted-foreground">Gerencie as fotos e vídeos da comunidade</p>
            </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Imagem
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingItem ? 'Editar Imagem' : 'Nova Imagem'}
              </DialogTitle>
              <DialogDescription>
                Faça upload e configure as informações da imagem
              </DialogDescription>
            </DialogHeader>
            
            <div className="dialog-content-scrollable">
              <form onSubmit={handleSubmit} className="dialog-form">
              <div className="space-y-2">
                <Label htmlFor="imagem">Imagem *</Label>
                <Input
                  id="imagem"
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  required={!editingItem}
                />
                {previewUrl && (
                  <div className="mt-2">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="titulo">Título *</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData(prev => ({ ...prev, titulo: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, categoria: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                     <SelectContent>
                      {categoriasGaleria.map(categoria => (
                        <SelectItem key={categoria.id} value={categoria.nome}>
                          {categoria.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data_evento">Data do Evento</Label>
                  <Input
                    id="data_evento"
                    type="date"
                    value={formData.data_evento}
                    onChange={(e) => setFormData(prev => ({ ...prev, data_evento: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="evento_id">Evento Relacionado</Label>
                  <Select
                    value={formData.evento_id}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, evento_id: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um evento" />
                    </SelectTrigger>
                    <SelectContent>
                      {eventos.map(evento => (
                        <SelectItem key={evento.id} value={evento.id}>
                          {evento.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ordem">Ordem de Exibição</Label>
                  <Input
                    id="ordem"
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData(prev => ({ ...prev, ordem: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="destaque"
                  checked={formData.destaque}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, destaque: checked }))}
                />
                <Label htmlFor="destaque">Imagem em Destaque</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Upload className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    editingItem ? 'Atualizar' : 'Adicionar'
                  )} Imagem
                </Button>
              </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando galeria...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <Card key={item.id} className="group overflow-hidden">
              <div className="relative aspect-square">
                <img
                  src={item.url_thumbnail || item.url_imagem}
                  alt={item.titulo}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button size="sm" variant="secondary" onClick={() => window.open(item.url_imagem, '_blank')}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {item.destaque && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-yellow-500">Destaque</Badge>
                  </div>
                )}
                {item.categoria && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="secondary">{item.categoria}</Badge>
                  </div>
                )}
              </div>
              
              <CardContent className="p-3">
                <h3 className="font-semibold mb-1 line-clamp-1">{item.titulo}</h3>
                {item.descricao && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>
                )}
                {item.data_evento && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(item.data_evento).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
          
          {items.length === 0 && (
            <div className="col-span-full text-center py-8">
              <Camera className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhuma imagem encontrada</p>
            </div>
          )}
        </div>
      )}
        </MobileTabsContent>

        <MobileTabsContent value="categorias">
          <CategoriasGaleriaManager />
        </MobileTabsContent>

      </MobileTabs>
    </div>
  );
};