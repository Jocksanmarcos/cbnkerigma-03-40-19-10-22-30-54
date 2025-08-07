import { useState } from "react";
import { useCampanhas, type Campanha } from "@/hooks/useCampanhas";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Edit2, Trash2, Target, Calendar, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface CampanhaFormData {
  titulo: string;
  descricao: string;
  tipo: string;
  meta_valor: number;
  data_inicio: string;
  data_fim: string;
  ativa: boolean;
  imagem_url: string;
}

const initialFormData: CampanhaFormData = {
  titulo: "",
  descricao: "",
  tipo: "geral",
  meta_valor: 0,
  data_inicio: "",
  data_fim: "",
  ativa: true,
  imagem_url: "",
};

export const CampanhasManager = () => {
  const { campanhas, loading, createCampanha, updateCampanha, deleteCampanha, formatarValor, calcularProgresso } = useCampanhas();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<Campanha | null>(null);
  const [formData, setFormData] = useState<CampanhaFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = () => {
    setEditingCampanha(null);
    setFormData(initialFormData);
    setIsDialogOpen(true);
  };

  const handleEdit = (campanha: Campanha) => {
    setEditingCampanha(campanha);
    setFormData({
      titulo: campanha.titulo,
      descricao: campanha.descricao || "",
      tipo: campanha.tipo,
      meta_valor: campanha.meta_valor,
      data_inicio: campanha.data_inicio,
      data_fim: campanha.data_fim,
      ativa: campanha.ativa,
      imagem_url: campanha.imagem_url || "",
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingCampanha) {
        await updateCampanha(editingCampanha.id, formData);
      } else {
        await createCampanha(formData);
      }
      setIsDialogOpen(false);
      setFormData(initialFormData);
    } catch (error) {
      // Error is handled in the hook
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCampanha(id);
  };

  if (loading) {
    return <div>Carregando campanhas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Campanhas de Arrecadação</h2>
          <p className="text-muted-foreground">
            Gerencie as campanhas de arrecadação da igreja
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingCampanha ? "Editar Campanha" : "Nova Campanha"}
              </DialogTitle>
              <DialogDescription>
                {editingCampanha 
                  ? "Edite as informações da campanha"
                  : "Crie uma nova campanha de arrecadação"
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="tipo">Tipo</Label>
                <Select 
                  value={formData.tipo} 
                  onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="geral">Geral</SelectItem>
                    <SelectItem value="construcao">Construção</SelectItem>
                    <SelectItem value="missoes">Missões</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="emergencia">Emergência</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="meta_valor">Meta de Arrecadação (R$)</Label>
                <Input
                  id="meta_valor"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.meta_valor}
                  onChange={(e) => setFormData({ ...formData, meta_valor: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="data_inicio">Data de Início</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imagem_url">URL da Imagem</Label>
                <Input
                  id="imagem_url"
                  type="url"
                  value={formData.imagem_url}
                  onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="ativa"
                  checked={formData.ativa}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
                />
                <Label htmlFor="ativa">Campanha Ativa</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : editingCampanha ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {campanhas.map((campanha) => {
          const progress = calcularProgresso(campanha.valor_atual, campanha.meta_valor);
          
          return (
            <Card key={campanha.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{campanha.titulo}</CardTitle>
                    <CardDescription className="mt-1">
                      {campanha.descricao}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(campanha)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir Campanha</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir a campanha "{campanha.titulo}"? 
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(campanha.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={campanha.ativa ? "default" : "secondary"}>
                    {campanha.ativa ? "Ativa" : "Inativa"}
                  </Badge>
                  <Badge variant="outline">{campanha.tipo}</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatarValor(campanha.valor_atual)}</p>
                      <p className="text-muted-foreground">Arrecadado</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-1 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatarValor(campanha.meta_valor)}</p>
                      <p className="text-muted-foreground">Meta</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    {format(new Date(campanha.data_inicio), "dd/MM/yyyy", { locale: ptBR })} - {" "}
                    {format(new Date(campanha.data_fim), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {campanhas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma campanha encontrada</h3>
            <p className="text-muted-foreground text-center mb-4">
              Comece criando sua primeira campanha de arrecadação
            </p>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Primeira Campanha
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};