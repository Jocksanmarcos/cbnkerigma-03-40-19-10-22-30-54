import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileTabs, MobileTabsList, MobileTabsTrigger, MobileTabsContent } from '@/components/ui/mobile-tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  Plus, 
  Package, 
  TrendingUp, 
  Users, 
  Wrench,
  Search,
  Filter,
  QrCode,
  Download,
  MapPin,
  AlertTriangle,
  CheckCircle,
  FolderOpen
} from 'lucide-react';
import { usePatrimonio } from '@/hooks/usePatrimonio';
import { PatrimonioForm } from './patrimonio/PatrimonioForm';
import { PatrimonioList } from './patrimonio/PatrimonioList';
import { EmprestimosList } from './patrimonio/EmprestimosList';
import { ManutencoesList } from './patrimonio/ManutencoesList';
import { PatrimonioStats } from './patrimonio/PatrimonioStats';
import { LocalizacaoManager } from './patrimonio/LocalizacaoManager';
import { PatrimonioCharts } from './patrimonio/PatrimonioCharts';
import { CategoriasManager } from './patrimonio/CategoriasManager';
import { usePatrimonioRelatorios } from '@/hooks/usePatrimonioRelatorios';

export const PatrimonioManager = () => {
  const {
    categorias,
    subcategorias,
    patrimonios,
    emprestimos,
    manutencoes,
    loading,
    estatisticas,
    createPatrimonio,
    updatePatrimonio,
    deletePatrimonio,
    createEmprestimo,
    devolverEmprestimo,
    createManutencao,
    fetchCategorias,
    fetchSubcategorias
  } = usePatrimonio();

  const { 
    exportando, 
    exportarCSV, 
    exportarPDF, 
    exportarRelatorioDetalhado 
  } = usePatrimonioRelatorios({ patrimonios, categorias, loading });

  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPatrimonio, setEditingPatrimonio] = useState(null);

  // Filtrar patrimônios
  const filteredPatrimonios = patrimonios.filter(patrimonio => {
    const matchesSearch = patrimonio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patrimonio.codigo_patrimonio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patrimonio.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || patrimonio.categoria_id === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || patrimonio.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreatePatrimonio = async (data: any) => {
    const result = await createPatrimonio(data);
    if (result.error === null) {
      setIsDialogOpen(false);
      setEditingPatrimonio(null);
    }
  };

  const handleEditPatrimonio = (patrimonio: any) => {
    setEditingPatrimonio(patrimonio);
    setIsDialogOpen(true);
  };

  const handleUpdatePatrimonio = async (id: string, data: any) => {
    const result = await updatePatrimonio(id, data);
    if (result.error === null) {
      setIsDialogOpen(false);
      setEditingPatrimonio(null);
    }
  };

  const handleDeletePatrimonio = async (id: string) => {
    if (confirm('Tem certeza que deseja remover este patrimônio?')) {
      await deletePatrimonio(id);
    }
  };

  const handleExportarRelatorio = () => {
    if (patrimonios.length === 0) {
      toast({
        title: "Nenhum dado para exportar",
        description: "Não há patrimônios cadastrados.",
        variant: "destructive",
      });
      return;
    }

    // Mostrar opções de exportação
    const opcao = window.confirm(
      'Escolha o formato:\n\nOK = PDF Simples\nCancelar = Ver mais opções'
    );
    
    if (opcao) {
      const result = exportarPDF();
      if (result?.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro",
          description: result?.message || "Erro ao exportar",
          variant: "destructive",
        });
      }
    } else {
      // Mostrar menu de opções avançadas
      const opcaoAvancada = window.prompt(
        'Escolha uma opção:\n1 = PDF Simples\n2 = PDF Detalhado\n3 = CSV\n\nDigite o número:'
      );
      
      let result;
      switch (opcaoAvancada) {
        case '1':
          result = exportarPDF();
          break;
        case '2':
          result = exportarRelatorioDetalhado();
          break;
        case '3':
          result = exportarCSV();
          break;
        default:
          return;
      }
      
      if (result?.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        });
      } else {
        toast({
          title: "Erro",
          description: result?.message || "Erro ao exportar",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4 md:space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-mobile-lg sm:text-mobile-xl md:text-mobile-2xl font-bold gradient-text leading-tight">
            Gestão de Patrimônio
          </h2>
          <p className="text-mobile-xs sm:text-mobile-sm text-muted-foreground">
            Controle completo dos bens da igreja
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
          <Button
            onClick={handleExportarRelatorio}
            variant="outline"
            className="button-mobile gap-2"
            disabled={exportando || loading || patrimonios.length === 0}
          >
            <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">{exportando ? 'Exportando...' : 'Exportar Relatório'}</span>
            <span className="sm:hidden">{exportando ? 'Exportando...' : 'Exportar'}</span>
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="button-mobile gap-2">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Novo Patrimônio</span>
                <span className="sm:hidden">Novo</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="dialog-mobile">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>
                  {editingPatrimonio ? 'Editar Patrimônio' : 'Novo Patrimônio'}
                </DialogTitle>
              </DialogHeader>
              <div className="dialog-content-scrollable">
                <PatrimonioForm
                  categorias={categorias}
                  subcategorias={subcategorias}
                  patrimonio={editingPatrimonio}
                  onSubmit={editingPatrimonio ? 
                    (data) => handleUpdatePatrimonio(editingPatrimonio.id, data) : 
                    handleCreatePatrimonio
                  }
                  onCancel={() => {
                    setIsDialogOpen(false);
                    setEditingPatrimonio(null);
                  }}
                />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <PatrimonioStats estatisticas={estatisticas} />

      {/* Abas principais */}
      <div className="tabs-mobile">
        <MobileTabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 md:space-y-6">
          <MobileTabsList maxTabsPerRow={3} className="grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1 p-1 bg-muted/30 rounded-xl">
            <MobileTabsTrigger value="overview" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Visão Geral</span>
              <span className="sm:hidden text-[10px]">Visão</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="patrimonios" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Patrimônios</span>
              <span className="sm:hidden text-[10px]">Patrimônios</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="categorias" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <FolderOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Categorias</span>
              <span className="sm:hidden text-[10px]">Categorias</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="emprestimos" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Empréstimos</span>
              <span className="sm:hidden text-[10px]">Empréstimos</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="manutencoes" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Manutenções</span>
              <span className="sm:hidden text-[10px]">Manutenções</span>
            </MobileTabsTrigger>
            <MobileTabsTrigger value="localizacao" className="flex flex-col sm:flex-row items-center gap-1 p-2 sm:p-3 text-xs sm:text-sm rounded-lg">
              <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Localização</span>
              <span className="sm:hidden text-[10px]">Localização</span>
            </MobileTabsTrigger>
          </MobileTabsList>

          {/* Visão Geral */}
          <MobileTabsContent value="overview" className="space-y-3 sm:space-y-4 md:space-y-6">
            <div className="stats-grid-mobile">
              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-mobile-sm font-medium">Total de Patrimônios</CardTitle>
                  <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-mobile-xl font-bold">{estatisticas.total_patrimonios}</div>
                  <p className="text-mobile-xs text-muted-foreground">
                    Valor total: R$ {estatisticas.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>

              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-mobile-sm font-medium">Em Uso</CardTitle>
                  <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-500" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-mobile-xl font-bold text-green-600">{estatisticas.em_uso}</div>
                  <p className="text-mobile-xs text-muted-foreground">
                    {((estatisticas.em_uso / estatisticas.total_patrimonios) * 100 || 0).toFixed(1)}% do total
                  </p>
                </CardContent>
              </Card>

              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-mobile-sm font-medium">Emprestados</CardTitle>
                  <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-mobile-xl font-bold text-blue-600">{estatisticas.emprestados}</div>
                  <p className="text-mobile-xs text-muted-foreground">
                    {emprestimos.filter(e => e.status === 'ativo').length} empréstimos ativos
                  </p>
                </CardContent>
              </Card>

              <Card className="card-mobile">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-mobile-sm font-medium">Em Manutenção</CardTitle>
                  <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500" />
                </CardHeader>
                <CardContent className="p-3 sm:p-4">
                  <div className="text-mobile-xl font-bold text-orange-600">{estatisticas.em_manutencao}</div>
                  <p className="text-mobile-xs text-muted-foreground">
                    {manutencoes.filter(m => new Date(m.data_manutencao) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} este mês
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos Interativos */}
            <PatrimonioCharts estatisticas={estatisticas} patrimonios={patrimonios} />
          </MobileTabsContent>

          {/* Lista de Patrimônios */}
          <MobileTabsContent value="patrimonios" className="space-y-3 sm:space-y-4 md:space-y-6">
            {/* Filtros */}
            <Card className="card-mobile">
              <CardHeader>
                <CardTitle className="text-mobile-base sm:text-mobile-lg">Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar patrimônio..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 input-mobile"
                    />
                  </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os status</SelectItem>
                    <SelectItem value="em_uso">Em uso</SelectItem>
                    <SelectItem value="em_manutencao">Em manutenção</SelectItem>
                    <SelectItem value="emprestado">Emprestado</SelectItem>
                    <SelectItem value="encostado">Encostado</SelectItem>
                  </SelectContent>
                </Select>
                
                  <Button variant="outline" className="button-mobile gap-2">
                    <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Mais Filtros</span>
                    <span className="sm:hidden">Filtros</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <PatrimonioList
              patrimonios={filteredPatrimonios}
              loading={loading}
              onEdit={handleEditPatrimonio}
              onDelete={handleDeletePatrimonio}
            />
          </MobileTabsContent>

          {/* Empréstimos */}
          <MobileTabsContent value="emprestimos" className="space-y-3 sm:space-y-4 md:space-y-6">
            <EmprestimosList
              emprestimos={emprestimos}
              patrimonios={patrimonios}
              onCreateEmprestimo={createEmprestimo}
              onDevolverEmprestimo={devolverEmprestimo}
            />
          </MobileTabsContent>

          {/* Manutenções */}
          <MobileTabsContent value="manutencoes" className="space-y-3 sm:space-y-4 md:space-y-6">
            <ManutencoesList
              manutencoes={manutencoes}
              patrimonios={patrimonios}
              onCreateManutencao={createManutencao}
            />
          </MobileTabsContent>

          {/* Categorias */}
          <MobileTabsContent value="categorias" className="space-y-3 sm:space-y-4 md:space-y-6">
            <CategoriasManager 
              categorias={categorias} 
              subcategorias={subcategorias}
              onRefresh={() => {
                fetchCategorias();
                fetchSubcategorias();
              }} 
            />
          </MobileTabsContent>

          {/* Localização */}
          <MobileTabsContent value="localizacao" className="space-y-3 sm:space-y-4 md:space-y-6">
            <LocalizacaoManager patrimonios={patrimonios} />
          </MobileTabsContent>
        </MobileTabs>
      </div>
    </div>
  );
};