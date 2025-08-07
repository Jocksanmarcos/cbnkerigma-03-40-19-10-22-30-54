import { useState } from 'react';
import { useEstudos } from '@/hooks/useEstudos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, Download, Edit, Trash2, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const EstudosManager = () => {
  const { estudos, loading, createEstudo, updateEstudo, deleteEstudo } = useEstudos();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEstudo, setEditingEstudo] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    versiculo_chave: '',
    semana_inicio: '',
    semana_fim: '',
    ativo: true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      versiculo_chave: '',
      semana_inicio: '',
      semana_fim: '',
      ativo: true
    });
    setSelectedFile(null);
    setEditingEstudo(null);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (file: File) => {
    // Aqui implementaríamos o upload real para o Supabase Storage
    // Por agora, vamos simular o upload
    setUploading(true);
    
    try {
      // Simular delay de upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Retornar dados simulados do arquivo
      return {
        arquivo_url: `/uploads/${file.name}`,
        arquivo_nome: file.name,
        arquivo_tamanho: formatFileSize(file.size)
      };
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let arquivoData = {};
      
      if (selectedFile) {
        arquivoData = await handleFileUpload(selectedFile);
      }

      const estudoData = {
        ...formData,
        ...arquivoData
      };

      if (editingEstudo) {
        await updateEstudo(editingEstudo.id, estudoData);
      } else {
        await createEstudo(estudoData);
      }
      
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar estudo:', error);
    }
  };

  const handleEdit = (estudo: any) => {
    setEditingEstudo(estudo);
    setFormData({
      titulo: estudo.titulo,
      descricao: estudo.descricao || '',
      versiculo_chave: estudo.versiculo_chave || '',
      semana_inicio: estudo.semana_inicio,
      semana_fim: estudo.semana_fim,
      ativo: estudo.ativo
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este estudo?')) {
      await deleteEstudo(id);
    }
  };

  const incrementDownload = async (estudo: any) => {
    await updateEstudo(estudo.id, { 
      downloads: (estudo.downloads || 0) + 1 
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento de Estudos Bíblicos</h2>
          <p className="text-muted-foreground">Gerencie os estudos bíblicos da comunidade</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Estudo
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>
                {editingEstudo ? 'Editar Estudo' : 'Novo Estudo'}
              </DialogTitle>
              <DialogDescription>
                Preencha as informações do estudo bíblico
              </DialogDescription>
            </DialogHeader>
            
            <div className="dialog-content-scrollable">
              <form onSubmit={handleSubmit} className="dialog-form">
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

              <div className="space-y-2">
                <Label htmlFor="versiculo_chave">Versículo Chave</Label>
                <Input
                  id="versiculo_chave"
                  value={formData.versiculo_chave}
                  onChange={(e) => setFormData(prev => ({ ...prev, versiculo_chave: e.target.value }))}
                  placeholder="Ex: João 3:16"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semana_inicio">Semana de Início *</Label>
                  <Input
                    id="semana_inicio"
                    type="date"
                    value={formData.semana_inicio}
                    onChange={(e) => setFormData(prev => ({ ...prev, semana_inicio: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="semana_fim">Semana de Fim *</Label>
                  <Input
                    id="semana_fim"
                    type="date"
                    value={formData.semana_fim}
                    onChange={(e) => setFormData(prev => ({ ...prev, semana_fim: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="arquivo">Arquivo do Estudo (PDF)</Label>
                <Input
                  id="arquivo"
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">
                    Arquivo selecionado: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                />
                <Label htmlFor="ativo">Estudo Ativo</Label>
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
                    editingEstudo ? 'Atualizar' : 'Criar'
                  )} Estudo
                </Button>
              </div>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8">Carregando estudos...</div>
      ) : (
        <div className="grid gap-4">
          {estudos.map((estudo) => (
            <Card key={estudo.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {estudo.titulo}
                      <Badge variant={estudo.ativo ? "default" : "secondary"}>
                        {estudo.ativo ? "Ativo" : "Inativo"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{estudo.descricao}</CardDescription>
                    {estudo.versiculo_chave && (
                      <p className="text-sm text-primary font-medium mt-1">
                        📖 {estudo.versiculo_chave}
                      </p>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(estudo)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDelete(estudo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Período:</strong> {' '}
                    {format(new Date(estudo.semana_inicio), 'dd/MM/yyyy', { locale: ptBR })} - {' '}
                    {format(new Date(estudo.semana_fim), 'dd/MM/yyyy', { locale: ptBR })}
                  </div>
                  
                  {estudo.arquivo_url && (
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => incrementDownload(estudo)}
                      >
                        {estudo.arquivo_nome}
                      </Button>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Download className="h-4 w-4 text-muted-foreground" />
                    <span>{estudo.downloads || 0} downloads</span>
                  </div>
                </div>
                
                {estudo.arquivo_tamanho && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Tamanho do arquivo: {estudo.arquivo_tamanho}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          
          {estudos.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum estudo encontrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};