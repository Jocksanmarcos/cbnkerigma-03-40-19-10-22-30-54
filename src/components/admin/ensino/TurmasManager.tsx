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
import { Plus, Edit, Trash2, Users, Calendar, Clock, MapPin } from 'lucide-react';
import { useEnsinoCompleto, TurmaEnsino } from '@/hooks/useEnsinoCompleto';

export const TurmasManager = () => {
  const { turmas, cursos, createTurma, updateTurma, deleteTurma, loading } = useEnsinoCompleto();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTurma, setEditingTurma] = useState<TurmaEnsino | null>(null);
  const [formData, setFormData] = useState({
    curso_id: '',
    nome_turma: '',
    professor_responsavel: '',
    data_inicio: '',
    data_fim: '',
    dias_semana: [] as string[],
    horario_inicio: '',
    horario_fim: '',
    local_tipo: 'presencial',
    local_endereco: '',
    link_online: '',
    capacidade_maxima: 30,
    lista_espera: true,
    observacoes: '',
    status: 'planejada',
  });

  const resetForm = () => {
    setFormData({
      curso_id: '',
      nome_turma: '',
      professor_responsavel: '',
      data_inicio: '',
      data_fim: '',
      dias_semana: [],
      horario_inicio: '',
      horario_fim: '',
      local_tipo: 'presencial',
      local_endereco: '',
      link_online: '',
      capacidade_maxima: 30,
      lista_espera: true,
      observacoes: '',
      status: 'planejada',
    });
    setEditingTurma(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTurma) {
        await updateTurma(editingTurma.id, formData);
      } else {
        await createTurma(formData);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar turma:', error);
    }
  };

  const handleEdit = (turma: TurmaEnsino) => {
    setEditingTurma(turma);
    setFormData({
      curso_id: turma.curso_id,
      nome_turma: turma.nome_turma,
      professor_responsavel: turma.professor_responsavel,
      data_inicio: turma.data_inicio,
      data_fim: turma.data_fim || '',
      dias_semana: turma.dias_semana,
      horario_inicio: turma.horario_inicio,
      horario_fim: turma.horario_fim,
      local_tipo: turma.local_tipo,
      local_endereco: turma.local_endereco || '',
      link_online: turma.link_online || '',
      capacidade_maxima: turma.capacidade_maxima,
      lista_espera: turma.lista_espera,
      observacoes: turma.observacoes || '',
      status: turma.status,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
      await deleteTurma(id);
    }
  };

  const diasSemana = [
    { value: 'segunda', label: 'Segunda-feira' },
    { value: 'terca', label: 'Terça-feira' },
    { value: 'quarta', label: 'Quarta-feira' },
    { value: 'quinta', label: 'Quinta-feira' },
    { value: 'sexta', label: 'Sexta-feira' },
    { value: 'sabado', label: 'Sábado' },
    { value: 'domingo', label: 'Domingo' },
  ];

  const statusOptions = [
    { value: 'planejada', label: 'Planejada' },
    { value: 'inscricoes_abertas', label: 'Inscrições Abertas' },
    { value: 'ativa', label: 'Ativa' },
    { value: 'concluida', label: 'Concluída' },
    { value: 'cancelada', label: 'Cancelada' },
  ];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-mobile-lg font-semibold">Turmas Cadastradas</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Turma
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile">
            <DialogHeader>
              <DialogTitle>
                {editingTurma ? 'Editar Turma' : 'Nova Turma'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="curso_id">Curso *</Label>
                  <Select value={formData.curso_id} onValueChange={(value) => setFormData({ ...formData, curso_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent>
                      {cursos.filter(c => c.ativo).map((curso) => (
                        <SelectItem key={curso.id} value={curso.id}>
                          {curso.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome_turma">Nome da Turma *</Label>
                  <Input
                    id="nome_turma"
                    value={formData.nome_turma}
                    onChange={(e) => setFormData({ ...formData, nome_turma: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="professor_responsavel">Professor Responsável *</Label>
                <Input
                  id="professor_responsavel"
                  value={formData.professor_responsavel}
                  onChange={(e) => setFormData({ ...formData, professor_responsavel: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_inicio">Data de Início *</Label>
                  <Input
                    id="data_inicio"
                    type="date"
                    value={formData.data_inicio}
                    onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="data_fim">Data de Fim</Label>
                  <Input
                    id="data_fim"
                    type="date"
                    value={formData.data_fim}
                    onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horario_inicio">Horário de Início *</Label>
                  <Input
                    id="horario_inicio"
                    type="time"
                    value={formData.horario_inicio}
                    onChange={(e) => setFormData({ ...formData, horario_inicio: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="horario_fim">Horário de Fim *</Label>
                  <Input
                    id="horario_fim"
                    type="time"
                    value={formData.horario_fim}
                    onChange={(e) => setFormData({ ...formData, horario_fim: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="local_tipo">Tipo de Local</Label>
                  <Select value={formData.local_tipo} onValueChange={(value) => setFormData({ ...formData, local_tipo: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="presencial">Presencial</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                      <SelectItem value="hibrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="capacidade_maxima">Capacidade Máxima</Label>
                  <Input
                    id="capacidade_maxima"
                    type="number"
                    value={formData.capacidade_maxima}
                    onChange={(e) => setFormData({ ...formData, capacidade_maxima: Number(e.target.value) })}
                  />
                </div>
              </div>

              {formData.local_tipo !== 'online' && (
                <div className="space-y-2">
                  <Label htmlFor="local_endereco">Endereço do Local</Label>
                  <Input
                    id="local_endereco"
                    value={formData.local_endereco}
                    onChange={(e) => setFormData({ ...formData, local_endereco: e.target.value })}
                  />
                </div>
              )}

              {formData.local_tipo !== 'presencial' && (
                <div className="space-y-2">
                  <Label htmlFor="link_online">Link Online</Label>
                  <Input
                    id="link_online"
                    value={formData.link_online}
                    onChange={(e) => setFormData({ ...formData, link_online: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="lista_espera"
                  checked={formData.lista_espera}
                  onCheckedChange={(checked) => setFormData({ ...formData, lista_espera: checked })}
                />
                <Label htmlFor="lista_espera">Permitir Lista de Espera</Label>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTurma ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-mobile-sm text-muted-foreground mt-2">Carregando turmas...</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-mobile-xs">Turma</TableHead>
                <TableHead className="text-mobile-xs hidden sm:table-cell">Curso</TableHead>
                <TableHead className="text-mobile-xs hidden md:table-cell">Professor</TableHead>
                <TableHead className="text-mobile-xs hidden lg:table-cell">Cronograma</TableHead>
                <TableHead className="text-mobile-xs">Status</TableHead>
                <TableHead className="text-mobile-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {turmas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma turma cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                turmas.map((turma) => (
                  <TableRow key={turma.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{turma.nome_turma}</div>
                          <div className="text-sm text-muted-foreground">
                            Capacidade: {turma.capacidade_maxima} alunos
                          </div>
                        </div>
                      </div>
                    </TableCell>
                     <TableCell className="hidden sm:table-cell">
                       <div className="text-sm">
                         {turma.curso?.nome || 'N/A'}
                       </div>
                     </TableCell>
                     <TableCell className="hidden md:table-cell">{turma.professor_responsavel}</TableCell>
                     <TableCell className="hidden lg:table-cell">
                       <div className="text-sm space-y-1">
                         <div className="flex items-center space-x-1">
                           <Calendar className="h-3 w-3 text-muted-foreground" />
                           <span>{new Date(turma.data_inicio).toLocaleDateString()}</span>
                         </div>
                         <div className="flex items-center space-x-1">
                           <Clock className="h-3 w-3 text-muted-foreground" />
                           <span>{turma.horario_inicio} - {turma.horario_fim}</span>
                         </div>
                       </div>
                     </TableCell>
                    <TableCell>
                      <Badge variant={
                        turma.status === 'ativa' ? 'default' :
                        turma.status === 'inscricoes_abertas' ? 'secondary' :
                        turma.status === 'concluida' ? 'outline' : 'destructive'
                      }>
                        {statusOptions.find(s => s.value === turma.status)?.label || turma.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(turma)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(turma.id)}
                          className="text-destructive hover:text-destructive"
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
      )}
    </div>
  );
};