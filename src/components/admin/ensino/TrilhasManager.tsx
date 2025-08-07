import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, TrendingUp, BookOpen, Users } from 'lucide-react';
import { useEnsinoCompleto, TrilhaFormacao } from '@/hooks/useEnsinoCompleto';

export const TrilhasManager = () => {
  const { trilhas, cursos, createTrilha, loading } = useEnsinoCompleto();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTrilha, setEditingTrilha] = useState<TrilhaFormacao | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    etapas: [] as any[],
    publico_alvo: [] as string[],
    ativa: true,
  });

  const [novaEtapa, setNovaEtapa] = useState({
    nome: '',
    descricao: '',
    curso_id: '',
    ordem: 1,
    obrigatoria: true,
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      etapas: [],
      publico_alvo: [],
      ativa: true,
    });
    setNovaEtapa({
      nome: '',
      descricao: '',
      curso_id: '',
      ordem: 1,
      obrigatoria: true,
    });
    setEditingTrilha(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTrilha) {
        // TODO: Implementar updateTrilha
        console.log('Atualizar trilha:', formData);
      } else {
        await createTrilha(formData);
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar trilha:', error);
    }
  };

  const adicionarEtapa = () => {
    if (novaEtapa.nome && novaEtapa.curso_id) {
      const cursoSelecionado = cursos.find(c => c.id === novaEtapa.curso_id);
      const etapa = {
        ...novaEtapa,
        curso_nome: cursoSelecionado?.nome || '',
        id: Date.now().toString(), // ID temporário
      };
      
      setFormData({
        ...formData,
        etapas: [...formData.etapas, etapa]
      });
      
      setNovaEtapa({
        nome: '',
        descricao: '',
        curso_id: '',
        ordem: formData.etapas.length + 2,
        obrigatoria: true,
      });
    }
  };

  const removerEtapa = (index: number) => {
    const novasEtapas = formData.etapas.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      etapas: novasEtapas
    });
  };

  const publicoAlvoOptions = [
    'novos_convertidos',
    'membros_batizados',
    'lideres_em_treinamento',
    'lideres_ativos',
    'voluntarios',
    'todos_membros',
  ];

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h3 className="text-mobile-lg font-semibold">Trilhas de Formação</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Trilha
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm sm:max-w-lg md:max-w-4xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTrilha ? 'Editar Trilha' : 'Nova Trilha de Formação'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Trilha *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    placeholder="Ex: Jornada do Novo Membro"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <Switch
                    id="ativa"
                    checked={formData.ativa}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })}
                  />
                  <Label htmlFor="ativa">Trilha Ativa</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                  placeholder="Descreva o objetivo e metodologia da trilha"
                />
              </div>

              {/* Configuração de Etapas */}
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Etapas da Trilha</h4>
                
                {/* Formulário para nova etapa */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Adicionar Nova Etapa</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome_etapa">Nome da Etapa</Label>
                        <Input
                          id="nome_etapa"
                          value={novaEtapa.nome}
                          onChange={(e) => setNovaEtapa({ ...novaEtapa, nome: e.target.value })}
                          placeholder="Ex: Primeira Visita"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="curso_etapa">Curso Relacionado</Label>
                        <select
                          id="curso_etapa"
                          value={novaEtapa.curso_id}
                          onChange={(e) => setNovaEtapa({ ...novaEtapa, curso_id: e.target.value })}
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <option value="">Selecione um curso</option>
                          {cursos.filter(c => c.ativo).map((curso) => (
                            <option key={curso.id} value={curso.id}>
                              {curso.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ordem_etapa">Ordem</Label>
                        <Input
                          id="ordem_etapa"
                          type="number"
                          value={novaEtapa.ordem}
                          onChange={(e) => setNovaEtapa({ ...novaEtapa, ordem: Number(e.target.value) })}
                          min="1"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <Switch
                          id="obrigatoria"
                          checked={novaEtapa.obrigatoria}
                          onCheckedChange={(checked) => setNovaEtapa({ ...novaEtapa, obrigatoria: checked })}
                        />
                        <Label htmlFor="obrigatoria">Etapa Obrigatória</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao_etapa">Descrição da Etapa</Label>
                      <Textarea
                        id="descricao_etapa"
                        value={novaEtapa.descricao}
                        onChange={(e) => setNovaEtapa({ ...novaEtapa, descricao: e.target.value })}
                        rows={2}
                        placeholder="Descreva os objetivos desta etapa"
                      />
                    </div>

                    <Button type="button" onClick={adicionarEtapa} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Etapa
                    </Button>
                  </CardContent>
                </Card>

                {/* Lista de etapas adicionadas */}
                {formData.etapas.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Etapas Configuradas:</h5>
                    <div className="space-y-2">
                      {formData.etapas.map((etapa, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline">{etapa.ordem}</Badge>
                              <span className="font-medium">{etapa.nome}</span>
                              {etapa.obrigatoria && (
                                <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              <span>Curso: {etapa.curso_nome}</span>
                              {etapa.descricao && <span> • {etapa.descricao}</span>}
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerEtapa(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTrilha ? 'Atualizar' : 'Criar Trilha'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-6 sm:py-8">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-mobile-sm text-muted-foreground mt-2">Carregando trilhas...</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead className="text-mobile-xs">Nome da Trilha</TableHead>
                <TableHead className="text-mobile-xs hidden sm:table-cell">Descrição</TableHead>
                <TableHead className="text-mobile-xs hidden md:table-cell">Etapas</TableHead>
                <TableHead className="text-mobile-xs">Status</TableHead>
                <TableHead className="text-mobile-xs">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trilhas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma trilha de formação cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                trilhas.map((trilha) => (
                  <TableRow key={trilha.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium text-mobile-sm">{trilha.nome}</div>
                          <div className="sm:hidden mt-1 space-y-1">
                            <div className="text-mobile-xs text-muted-foreground">
                              {trilha.descricao ? trilha.descricao.substring(0, 50) + '...' : 'Sem descrição'}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[10px] px-1">
                                <BookOpen className="h-3 w-3 mr-1" />
                                {trilha.etapas ? Object.keys(trilha.etapas).length : 0} etapas
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-mobile-sm text-muted-foreground max-w-xs truncate">
                        {trilha.descricao || 'Sem descrição'}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center space-x-1">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-mobile-sm">{trilha.etapas ? Object.keys(trilha.etapas).length : 0} etapas</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trilha.ativa ? "default" : "secondary"} className="text-mobile-xs">
                        {trilha.ativa ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingTrilha(trilha);
                            setFormData({
                              nome: trilha.nome,
                              descricao: trilha.descricao || '',
                              etapas: trilha.etapas || [],
                              publico_alvo: trilha.publico_alvo || [],
                              ativa: trilha.ativa,
                            });
                            setIsDialogOpen(true);
                          }}
                          className="p-1.5 sm:p-2"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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