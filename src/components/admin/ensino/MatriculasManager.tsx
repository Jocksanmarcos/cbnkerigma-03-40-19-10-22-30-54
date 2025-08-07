import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, UserCheck, Award, Calendar, User } from 'lucide-react';
import { useEnsinoCompleto, MatriculaEnsino } from '@/hooks/useEnsinoCompleto';
import { usePessoas } from '@/hooks/usePessoas';

export const MatriculasManager = () => {
  const { matriculas, turmas, createMatricula, updateMatricula, loading } = useEnsinoCompleto();
  const { pessoas } = usePessoas();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatricula, setEditingMatricula] = useState<MatriculaEnsino | null>(null);
  const [formData, setFormData] = useState({
    pessoa_id: '',
    turma_id: '',
    data_matricula: new Date().toISOString().split('T')[0],
    status: 'matriculado',
    nota_final: 0,
    frequencia_percentual: 0,
    certificado_emitido: false,
    certificado_url: '',
    data_conclusao: '',
    observacoes: '',
  });

  const resetForm = () => {
    setFormData({
      pessoa_id: '',
      turma_id: '',
      data_matricula: new Date().toISOString().split('T')[0],
      status: 'matriculado',
      nota_final: 0,
      frequencia_percentual: 0,
      certificado_emitido: false,
      certificado_url: '',
      data_conclusao: '',
      observacoes: '',
    });
    setEditingMatricula(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingMatricula) {
        await updateMatricula(editingMatricula.id, formData);
      } else {
        await createMatricula(formData);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar matrícula:', error);
    }
  };

  const handleEdit = (matricula: MatriculaEnsino) => {
    setEditingMatricula(matricula);
    setFormData({
      pessoa_id: matricula.pessoa_id,
      turma_id: matricula.turma_id,
      data_matricula: matricula.data_matricula,
      status: matricula.status,
      nota_final: matricula.nota_final || 0,
      frequencia_percentual: matricula.frequencia_percentual,
      certificado_emitido: matricula.certificado_emitido,
      certificado_url: matricula.certificado_url || '',
      data_conclusao: matricula.data_conclusao || '',
      observacoes: matricula.observacoes || '',
    });
    setIsDialogOpen(true);
  };

  const statusOptions = [
    { value: 'matriculado', label: 'Matriculado' },
    { value: 'cursando', label: 'Cursando' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'reprovado', label: 'Reprovado' },
    { value: 'desistente', label: 'Desistente' },
    { value: 'transferido', label: 'Transferido' },
  ];

  const turmasAtivas = turmas.filter(t => ['ativa', 'inscricoes_abertas'].includes(t.status));

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-mobile-lg font-semibold">Matrículas</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Matrícula
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-lg md:max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingMatricula ? 'Editar Matrícula' : 'Nova Matrícula'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pessoa_id">Aluno *</Label>
                  <Select 
                    value={formData.pessoa_id} 
                    onValueChange={(value) => setFormData({ ...formData, pessoa_id: value })}
                    disabled={!!editingMatricula}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um aluno" />
                    </SelectTrigger>
                    <SelectContent>
                      {pessoas.filter(p => p.situacao === 'ativo').map((pessoa) => (
                        <SelectItem key={pessoa.id} value={pessoa.id}>
                          {pessoa.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="turma_id">Turma *</Label>
                  <Select 
                    value={formData.turma_id} 
                    onValueChange={(value) => setFormData({ ...formData, turma_id: value })}
                    disabled={!!editingMatricula}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      {turmasAtivas.map((turma) => (
                        <SelectItem key={turma.id} value={turma.id}>
                          {turma.nome_turma} - {turma.curso?.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data_matricula">Data da Matrícula</Label>
                  <Input
                    id="data_matricula"
                    type="date"
                    value={formData.data_matricula}
                    onChange={(e) => setFormData({ ...formData, data_matricula: e.target.value })}
                  />
                </div>

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
              </div>

              {formData.status === 'concluido' && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nota_final">Nota Final</Label>
                    <Input
                      id="nota_final"
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={formData.nota_final}
                      onChange={(e) => setFormData({ ...formData, nota_final: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequencia_percentual">Frequência (%)</Label>
                    <Input
                      id="frequencia_percentual"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.frequencia_percentual}
                      onChange={(e) => setFormData({ ...formData, frequencia_percentual: Number(e.target.value) })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="data_conclusao">Data de Conclusão</Label>
                    <Input
                      id="data_conclusao"
                      type="date"
                      value={formData.data_conclusao}
                      onChange={(e) => setFormData({ ...formData, data_conclusao: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingMatricula ? 'Atualizar' : 'Matricular'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-mobile-sm text-muted-foreground mt-2">Carregando matrículas...</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-mobile-xs">Aluno</TableHead>
                <TableHead className="text-mobile-xs hidden sm:table-cell">Turma/Curso</TableHead>
                <TableHead className="text-mobile-xs hidden md:table-cell">Data Matrícula</TableHead>
                <TableHead className="text-mobile-xs">Status</TableHead>
                <TableHead className="text-mobile-xs hidden lg:table-cell">Progresso</TableHead>
                <TableHead className="text-mobile-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matriculas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhuma matrícula encontrada
                  </TableCell>
                </TableRow>
              ) : (
                matriculas.map((matricula) => (
                  <TableRow key={matricula.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">
                            {matricula.pessoa?.nome_completo || 'N/A'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {matricula.pessoa?.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                     <TableCell className="hidden sm:table-cell">
                       <div className="text-sm">
                         <div className="font-medium">{matricula.turma?.nome_turma}</div>
                         <div className="text-muted-foreground">
                           {matricula.turma?.curso?.nome}
                         </div>
                       </div>
                     </TableCell>
                     <TableCell className="hidden md:table-cell">
                       <div className="flex items-center space-x-1">
                         <Calendar className="h-4 w-4 text-muted-foreground" />
                         <span>{new Date(matricula.data_matricula).toLocaleDateString()}</span>
                       </div>
                     </TableCell>
                    <TableCell>
                      <Badge variant={
                        matricula.status === 'concluido' ? 'default' :
                        matricula.status === 'cursando' ? 'secondary' :
                        matricula.status === 'matriculado' ? 'outline' : 'destructive'
                      }>
                        {statusOptions.find(s => s.value === matricula.status)?.label || matricula.status}
                      </Badge>
                    </TableCell>
                     <TableCell className="hidden lg:table-cell">
                       <div className="text-sm space-y-1">
                         {matricula.status === 'concluido' && (
                           <div className="space-y-1">
                             <div className="flex items-center space-x-1">
                               <Award className="h-3 w-3 text-muted-foreground" />
                               <span>Nota: {matricula.nota_final}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <UserCheck className="h-3 w-3 text-muted-foreground" />
                               <span>Freq: {matricula.frequencia_percentual}%</span>
                             </div>
                           </div>
                         )}
                         {matricula.certificado_emitido && (
                           <Badge variant="secondary">Certificado Emitido</Badge>
                         )}
                       </div>
                     </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(matricula)}
                        >
                          <Edit className="h-4 w-4" />
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