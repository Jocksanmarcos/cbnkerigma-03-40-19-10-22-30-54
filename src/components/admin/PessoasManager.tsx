import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { usePessoas, type Pessoa } from '@/hooks/usePessoas';
import { PlusCircle, Users, FileText, BookOpen, Heart, Badge, Mail, Phone, Calendar, MapPin, User, Briefcase, UserCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge as UIBadge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RelatoriosPessoas } from './pessoas/RelatoriosPessoas';
import { PDFDocumentGenerator } from '../PDFDocumentGenerator';
import RelacionamentosFamiliares from './pessoas/RelacionamentosFamiliares';
import { JornadaMembro } from './pessoas/JornadaMembro';
import { PessoasForm } from './pessoas/PessoasForm';
import { PessoasTable } from './pessoas/PessoasTable';
import { PessoasStats } from './pessoas/PessoasStats';
import { DiscipuladoManager } from './pessoas/DiscipuladoManager';
import { toast } from 'sonner';

const PessoasManager = () => {
  const { pessoas, loading, estatisticas, createPessoa, updatePessoa, deletePessoa, calcularIdade } = usePessoas();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPessoa, setEditingPessoa] = useState<Pessoa | null>(null);
  const [selectedPessoa, setSelectedPessoa] = useState<Pessoa | null>(null);
  const [activeTab, setActiveTab] = useState('pessoas');

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Estados do formulário
  const [formData, setFormData] = useState<Partial<Pessoa>>({
    nome_completo: '',
    email: '',
    telefone_celular: '',
    telefone_whatsapp: '',
    data_nascimento: '',
    sexo: 'masculino',
    estado_civil: 'solteiro',
    estado_espiritual: 'visitante',
    tipo_pessoa: 'membro',
    situacao: 'ativo',
    status_discipulado: 'nao_iniciado',
    ministerio_atuacao: [],
    // Novos campos de formação
    status_formacao: 'Visitante',
    aulas_concluidas: 0,
    pontuacao_gamificada: 0,
    medalhas: [],
    papel_na_celula: 'Membro',
  });

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      email: '',
      telefone_celular: '',
      telefone_whatsapp: '',
      data_nascimento: '',
      sexo: 'masculino',
      estado_civil: 'solteiro',
      estado_espiritual: 'visitante',
      tipo_pessoa: 'membro',
      situacao: 'ativo',
      status_discipulado: 'nao_iniciado',
      ministerio_atuacao: [],
      // Novos campos de formação
      status_formacao: 'Visitante',
      aulas_concluidas: 0,
      pontuacao_gamificada: 0,
      medalhas: [],
      papel_na_celula: 'Membro',
    });
    setEditingPessoa(null);
  };

  const handleEdit = (pessoa: Pessoa) => {
    setFormData({
      ...pessoa,
      ministerio_atuacao: pessoa.ministerio_atuacao || [],
      medalhas: pessoa.medalhas || [],
    });
    setEditingPessoa(pessoa);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPessoa) {
        await updatePessoa(editingPessoa.id, formData);
      } else {
        await createPessoa(formData as Omit<Pessoa, 'id' | 'created_at' | 'updated_at'>);
      }

      setIsDialogOpen(false);
      resetForm();
      toast.success(editingPessoa ? 'Pessoa atualizada com sucesso!' : 'Pessoa criada com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar pessoa:', error);
      toast.error('Erro ao salvar pessoa');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePessoa(id);
      toast.success('Pessoa excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao deletar pessoa:', error);
      toast.error('Erro ao excluir pessoa');
    }
  };

  // Handlers para tabela
  const handleView = (pessoa: Pessoa, action?: string) => {
    setSelectedPessoa(pessoa);
    if (action === 'jornada') {
      setActiveTab('jornada');
    } else {
      setIsViewDialogOpen(true);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-mobile-lg sm:text-mobile-xl md:text-mobile-2xl font-bold gradient-text leading-tight">Sistema de Gestão de Pessoas</h2>
          <p className="text-mobile-xs sm:text-mobile-sm text-muted-foreground">Gerencie membros, visitantes e voluntários</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="button-mobile flex-shrink-0">
              <PlusCircle className="mr-1 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Nova Pessoa</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="dialog-mobile">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-mobile-base sm:text-mobile-lg md:text-mobile-xl">
                {editingPessoa ? 'Editar Pessoa' : 'Nova Pessoa'}
              </DialogTitle>
              <DialogDescription className="text-mobile-xs sm:text-mobile-sm">
                Preencha as informações completas da pessoa
              </DialogDescription>
            </DialogHeader>
            
            <div className="dialog-content-scrollable">
              <PessoasForm
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                editingPessoa={editingPessoa}
              />
              <div className="dialog-footer">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" form="pessoas-form" className="button-mobile">
                  {editingPessoa ? 'Salvar Alterações' : 'Criar Pessoa'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Navegação com Tabs Responsivos */}
      <div className="tabs-mobile">
        <MobileTabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 md:space-y-6">
          <MobileTabsList maxTabsPerRow={5} className="grid-cols-3 sm:grid-cols-5 gap-1 p-1 bg-muted/30 rounded-xl">
            <MobileTabsTrigger value="pessoas" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Pessoas</span>
              <span className="sm:hidden text-[10px]">Pessoas</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="discipulado" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Discipulado</span>
              <span className="sm:hidden text-[10px]">Discipulado</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="jornada" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Jornada</span>
              <span className="sm:hidden text-[10px]">Jornada</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="relatorios" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Relatórios</span>
              <span className="sm:hidden text-[10px]">Relatórios</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="documentos" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">PDF</span>
              <span className="sm:hidden text-[10px]">PDF</span>
            </MobileTabsTrigger>
          </MobileTabsList>

          <MobileTabsContent value="pessoas">
            <div className="space-y-3 sm:space-y-4 md:space-y-6">
              <PessoasStats estatisticas={estatisticas} loading={loading} />
              <PessoasTable 
                pessoas={pessoas}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onView={handleView}
                calcularIdade={calcularIdade}
              />
            </div>
          </MobileTabsContent>

          <MobileTabsContent value="discipulado" className="space-y-3 sm:space-y-4 md:space-y-6">
            {selectedPessoa ? (
              <DiscipuladoManager 
                pessoa={selectedPessoa} 
                onUpdate={() => {
                  // Recarregar dados das pessoas
                  window.location.reload();
                }}
              />
            ) : (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione uma pessoa</h3>
                <p className="text-muted-foreground mb-4">
                  Escolha uma pessoa da lista para gerenciar relacionamentos de discipulado.
                </p>
                <Button onClick={() => setActiveTab('pessoas')}>
                  Ir para Lista de Pessoas
                </Button>
              </div>
            )}
          </MobileTabsContent>

          <MobileTabsContent value="jornada" className="space-y-3 sm:space-y-4 md:space-y-6">
            {selectedPessoa ? (
              <JornadaMembro pessoa={selectedPessoa} />
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione uma pessoa</h3>
                <p className="text-muted-foreground mb-4">
                  Escolha uma pessoa da lista para acompanhar sua jornada de formação espiritual.
                </p>
                <Button onClick={() => setActiveTab('pessoas')}>
                  Ir para Lista de Pessoas
                </Button>
              </div>
            )}
          </MobileTabsContent>

          <MobileTabsContent value="relatorios">
            <RelatoriosPessoas />
          </MobileTabsContent>

          <MobileTabsContent value="documentos" className="space-y-3 sm:space-y-4 md:space-y-6">
            {selectedPessoa ? (
              <PDFDocumentGenerator pessoa={selectedPessoa} />
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Selecione uma pessoa</h3>
                <p className="text-muted-foreground mb-4">
                  Escolha uma pessoa da lista para gerar documentos PDF.
                </p>
                <Button onClick={() => setActiveTab('pessoas')}>
                  Ir para Lista de Pessoas
                </Button>
              </div>
            )}
          </MobileTabsContent>
        </MobileTabs>
      </div>

      {/* Modal de Visualização */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Detalhes da Pessoa
            </DialogTitle>
            <DialogDescription>
              Visualização completa dos dados da pessoa
            </DialogDescription>
          </DialogHeader>

          {selectedPessoa && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{selectedPessoa.nome_completo}</h3>
                  <div className="flex gap-2">
                    <UIBadge variant="secondary">
                      {selectedPessoa.tipo_pessoa}
                    </UIBadge>
                    <UIBadge variant="outline">
                      {selectedPessoa.estado_espiritual}
                    </UIBadge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedPessoa.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedPessoa.email}</span>
                    </div>
                  )}
                  {selectedPessoa.telefone_celular && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedPessoa.telefone_celular}</span>
                    </div>
                  )}
                  {selectedPessoa.data_nascimento && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(selectedPessoa.data_nascimento).toLocaleDateString('pt-BR')} 
                        ({calcularIdade(selectedPessoa.data_nascimento)} anos)
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Informações Pessoais */}
              <div className="space-y-3">
                <h4 className="font-medium">Informações Pessoais</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sexo:</span>
                    <p className="font-medium">{selectedPessoa.sexo}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Estado Civil:</span>
                    <p className="font-medium">{selectedPessoa.estado_civil}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Situação:</span>
                    <p className="font-medium">{selectedPessoa.situacao}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Formação Espiritual */}
              <div className="space-y-3">
                <h4 className="font-medium">Formação Espiritual</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Status de Discipulado:</span>
                    <p className="font-medium">{selectedPessoa.status_discipulado}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status de Formação:</span>
                    <p className="font-medium">{selectedPessoa.status_formacao}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Aulas Concluídas:</span>
                    <p className="font-medium">{selectedPessoa.aulas_concluidas || 0}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pontuação:</span>
                    <p className="font-medium">{selectedPessoa.pontuacao_gamificada || 0} pontos</p>
                  </div>
                </div>
              </div>

              {/* Ministérios */}
              {selectedPessoa.ministerio_atuacao && selectedPessoa.ministerio_atuacao.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Briefcase className="h-4 w-4" />
                      Ministérios de Atuação
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPessoa.ministerio_atuacao.map((ministerio, index) => (
                        <UIBadge key={index} variant="outline">
                          {ministerio}
                        </UIBadge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Medalhas */}
              {selectedPessoa.medalhas && selectedPessoa.medalhas.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <Badge className="h-4 w-4" />
                      Medalhas Conquistadas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedPessoa.medalhas.map((medalha, index) => (
                        <UIBadge key={index} variant="secondary">
                          {medalha}
                        </UIBadge>
                      ))}
                    </div>
                  </div>
                </>
              )}


              {/* Datas */}
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <span>Cadastrado em:</span>
                  <p>{new Date(selectedPessoa.created_at || '').toLocaleString('pt-BR')}</p>
                </div>
                <div>
                  <span>Última atualização:</span>
                  <p>{new Date(selectedPessoa.updated_at || '').toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PessoasManager;