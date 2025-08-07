import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/hooks/use-toast';
import { 
  Users, 
  UserPlus, 
  Search, 
  Download, 
  Edit, 
  Trash2,
  Filter,
  FileSpreadsheet
} from 'lucide-react';

interface Celula {
  id: string;
  nome: string;
  lider: string;
}

interface Participante {
  id: string;
  celula_id: string;
  nome: string;
  telefone: string;
  email: string;
  data_entrada: string;
  tipo_participante: string;
  status_espiritual: any;
  ativo: boolean;
}

interface ParticipantesManagerProps {
  celulas: Celula[];
}

export const ParticipantesManager = ({ celulas }: ParticipantesManagerProps) => {
  const [participantes, setParticipantes] = useState<Participante[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCelula, setSelectedCelula] = useState<string>('');
  const [tipoFilter, setTipoFilter] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingParticipante, setEditingParticipante] = useState<Participante | null>(null);

  const [formData, setFormData] = useState({
    celula_id: '',
    nome: '',
    telefone: '',
    email: '',
    data_entrada: new Date().toISOString().split('T')[0],
    tipo_participante: 'membro' as 'membro' | 'visitante' | 'novo_convertido',
    status_espiritual: {},
    ativo: true,
  });

  useEffect(() => {
    fetchParticipantes();
  }, []);

  const fetchParticipantes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('participantes_celulas')
        .select('*')
        .order('nome');

      if (error) throw error;
      setParticipantes(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao carregar participantes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      celula_id: '',
      nome: '',
      telefone: '',
      email: '',
      data_entrada: new Date().toISOString().split('T')[0],
      tipo_participante: 'membro',
      status_espiritual: {},
      ativo: true,
    });
    setEditingParticipante(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingParticipante) {
        const { error } = await supabase
          .from('participantes_celulas')
          .update(formData)
          .eq('id', editingParticipante.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Participante atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('participantes_celulas')
          .insert([formData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Participante adicionado com sucesso!",
        });
      }

      fetchParticipantes();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao salvar participante",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (participante: Participante) => {
    setFormData({
      celula_id: participante.celula_id,
      nome: participante.nome,
      telefone: participante.telefone || '',
      email: participante.email || '',
      data_entrada: participante.data_entrada,
      tipo_participante: (participante.tipo_participante as 'membro' | 'visitante' | 'novo_convertido') || 'membro',
      status_espiritual: participante.status_espiritual || {},
      ativo: participante.ativo,
    });
    setEditingParticipante(participante);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este participante?')) return;

    try {
      const { error } = await supabase
        .from('participantes_celulas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Participante excluído com sucesso!",
      });
      
      fetchParticipantes();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir participante",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    // Implementar exportação para Excel/CSV
    const data = filteredParticipantes.map(p => ({
      Nome: p.nome,
      Telefone: p.telefone,
      Email: p.email,
      Célula: celulas.find(c => c.id === p.celula_id)?.nome || '',
      Tipo: p.tipo_participante,
      'Data de Entrada': new Date(p.data_entrada).toLocaleDateString('pt-BR'),
      Status: p.ativo ? 'Ativo' : 'Inativo'
    }));

    const csv = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'participantes_celulas.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredParticipantes = participantes.filter(p => {
    const matchesSearch = p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.telefone.includes(searchTerm) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCelula = !selectedCelula || selectedCelula === 'all' || p.celula_id === selectedCelula;
    const matchesTipo = !tipoFilter || tipoFilter === 'all' || p.tipo_participante === tipoFilter;
    
    return matchesSearch && matchesCelula && matchesTipo;
  });

  const tipoParticipanteLabels = {
    'membro': 'Membro',
    'visitante': 'Visitante', 
    'novo_convertido': 'Novo Convertido'
  };

  const tipoParticipanteColors = {
    'membro': 'bg-green-100 text-green-800',
    'visitante': 'bg-blue-100 text-blue-800',
    'novo_convertido': 'bg-purple-100 text-purple-800'
  };

  if (loading) {
    return <div className="text-center">Carregando participantes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-xl font-bold">Gestão de Participantes</h3>
        <div className="flex gap-2">
          <Button onClick={exportToExcel} variant="outline" size="sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <UserPlus className="h-4 w-4 mr-2" />
                Novo Participante
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingParticipante ? 'Editar Participante' : 'Novo Participante'}
                </DialogTitle>
                <DialogDescription>
                  Preencha as informações do participante
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="celula_id">Célula *</Label>
                    <Select 
                      value={formData.celula_id} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, celula_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a célula" />
                      </SelectTrigger>
                      <SelectContent>
                        {celulas.map((celula) => (
                          <SelectItem key={celula.id} value={celula.id}>
                            {celula.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                      placeholder="(XX) XXXXX-XXXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tipo_participante">Tipo *</Label>
                    <Select 
                      value={formData.tipo_participante} 
                      onValueChange={(value: 'membro' | 'visitante' | 'novo_convertido') => 
                        setFormData(prev => ({ ...prev, tipo_participante: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="membro">Membro</SelectItem>
                        <SelectItem value="visitante">Visitante</SelectItem>
                        <SelectItem value="novo_convertido">Novo Convertido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="data_entrada">Data de Entrada</Label>
                    <Input
                      id="data_entrada"
                      type="date"
                      value={formData.data_entrada}
                      onChange={(e) => setFormData(prev => ({ ...prev, data_entrada: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 rounded-lg border">
                  <Switch
                    id="ativo"
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                  />
                  <Label htmlFor="ativo">Participante ativo</Label>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingParticipante ? 'Atualizar' : 'Criar'} Participante
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar por nome, telefone ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCelula} onValueChange={setSelectedCelula}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por célula" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as células</SelectItem>
                {celulas.map((celula) => (
                  <SelectItem key={celula.id} value={celula.id}>
                    {celula.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="membro">Membros</SelectItem>
                <SelectItem value="visitante">Visitantes</SelectItem>
                <SelectItem value="novo_convertido">Novos Convertidos</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {filteredParticipantes.length} resultados
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Participantes */}
      <div className="grid gap-4">
        {filteredParticipantes.map((participante) => {
          const celula = celulas.find(c => c.id === participante.celula_id);
          
          return (
            <Card key={participante.id}>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold">{participante.nome}</h4>
                      <Badge className={tipoParticipanteColors[participante.tipo_participante]}>
                        {tipoParticipanteLabels[participante.tipo_participante]}
                      </Badge>
                      {!participante.ativo && (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>Célula: {celula?.nome || 'Não encontrada'}</p>
                      {participante.telefone && <p>Telefone: {participante.telefone}</p>}
                      {participante.email && <p>Email: {participante.email}</p>}
                      <p>Entrada: {new Date(participante.data_entrada).toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(participante)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(participante.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredParticipantes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum participante encontrado com os filtros selecionados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};