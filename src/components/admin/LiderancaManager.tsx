import { useState } from 'react';
import { useLideranca, type LiderFormData } from '@/hooks/useLideranca';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, User, Upload } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const liderSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  descricao: z.string().optional(),
  foto_url: z.string().optional(),
  ordem: z.coerce.number().min(1, 'Ordem deve ser maior que 0'),
  ativo: z.boolean().optional()
});

export const LiderancaManager = () => {
  const { lideres, loading, criarLider, atualizarLider, deletarLider } = useLideranca();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLider, setEditingLider] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<LiderFormData>({
    resolver: zodResolver(liderSchema),
    defaultValues: {
      ordem: 1,
      ativo: true
    }
  });

  const handleOpenDialog = (lider?: any) => {
    if (lider) {
      setEditingLider(lider);
      Object.keys(lider).forEach(key => {
        setValue(key as keyof LiderFormData, lider[key]);
      });
    } else {
      setEditingLider(null);
      reset({
        nome: '',
        cargo: '',
        descricao: '',
        foto_url: '',
        ordem: Math.max(...lideres.map(l => l.ordem), 0) + 1,
        ativo: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLider(null);
    reset();
  };

  const onSubmit = async (data: LiderFormData) => {
    try {
      if (editingLider) {
        await atualizarLider(editingLider.id, data);
      } else {
        await criarLider(data);
      }
      handleCloseDialog();
    } catch (error) {
      console.error('Erro ao salvar líder:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este líder?')) {
      try {
        await deletarLider(id);
      } catch (error) {
        console.error('Erro ao deletar líder:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Gerenciamento da Liderança</h2>
          <p className="text-muted-foreground">Gerencie os líderes da seção "Nossa Liderança"</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Líder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingLider ? 'Editar Líder' : 'Adicionar Novo Líder'}
              </DialogTitle>
              <DialogDescription>
                {editingLider 
                  ? 'Edite as informações do líder'
                  : 'Preencha as informações do novo líder'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  {...register('nome')}
                  placeholder="Nome completo do líder"
                />
                {errors.nome && (
                  <p className="text-sm text-destructive mt-1">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cargo">Cargo *</Label>
                <Input
                  id="cargo"
                  {...register('cargo')}
                  placeholder="Ex: Pastor Principal, Coordenador de Células"
                />
                {errors.cargo && (
                  <p className="text-sm text-destructive mt-1">{errors.cargo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  {...register('descricao')}
                  placeholder="Breve descrição sobre o líder"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="foto_url">URL da Foto</Label>
                <Input
                  id="foto_url"
                  {...register('foto_url')}
                  placeholder="URL da imagem do líder"
                />
              </div>

              <div>
                <Label htmlFor="ordem">Ordem de Exibição *</Label>
                <Input
                  id="ordem"
                  type="number"
                  {...register('ordem')}
                  min="1"
                />
                {errors.ordem && (
                  <p className="text-sm text-destructive mt-1">{errors.ordem.message}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativo"
                  checked={watch('ativo')}
                  onCheckedChange={(checked) => setValue('ativo', checked)}
                />
                <Label htmlFor="ativo">Ativo</Label>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Salvando...' : editingLider ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Líderes */}
      {loading ? (
        <div className="text-center py-8">Carregando líderes...</div>
      ) : (
        <div className="grid gap-4">
          {lideres.map((lider) => (
            <Card key={lider.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    {lider.foto_url ? (
                      <img 
                        src={lider.foto_url} 
                        alt={lider.nome}
                        className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {lider.nome}
                        <Badge variant={lider.ativo ? "default" : "secondary"}>
                          {lider.ativo ? "Ativo" : "Inativo"}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="font-medium text-primary">
                        {lider.cargo}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mt-1">
                        Ordem: {lider.ordem}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleOpenDialog(lider)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleDelete(lider.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {lider.descricao && (
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {lider.descricao}
                  </p>
                </CardContent>
              )}
            </Card>
          ))}
          
          {lideres.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum líder cadastrado</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};