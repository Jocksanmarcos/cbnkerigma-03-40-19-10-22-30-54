import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Users, 
  Edit, 
  Settings, 
  Search, 
  Plus,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, ModuloSistema, AcaoPermissao } from '@/hooks/useUserRole';

interface Papel {
  id: string;
  codigo: UserRole;
  nome: string;
  descricao: string;
  ativo: boolean;
  usuarios_count?: number;
}

interface Modulo {
  id: string;
  codigo: ModuloSistema;
  nome: string;
  ativo: boolean;
}

interface PermissionMatrix {
  [papelId: string]: {
    [moduloId: string]: {
      [acao: string]: boolean;
    };
  };
}

const acoes: AcaoPermissao[] = ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar'];

export const ProfileManagement: React.FC = () => {
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [permissions, setPermissions] = useState<PermissionMatrix>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPapel, setEditingPapel] = useState<Papel | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    ativo: true
  });
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Carregar papéis
      const { data: papeisData } = await supabase
        .from('papeis_igreja')
        .select('*')
        .order('nome');

      // Carregar módulos
      const { data: modulosData } = await supabase
        .from('modulos_sistema')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      // Carregar permissões
      const { data: permissoesData } = await supabase
        .from('permissoes_sistema')
        .select('*');

      setPapeis(papeisData || []);
      setModulos((modulosData || []).map(m => ({
        id: m.id,
        codigo: m.codigo as ModuloSistema,
        nome: m.nome,
        ativo: m.ativo
      })));

      // Construir matriz de permissões
      const matrix: PermissionMatrix = {};
      
      (papeisData || []).forEach(papel => {
        matrix[papel.id] = {};
        (modulosData || []).forEach(modulo => {
          matrix[papel.id][modulo.id] = {};
          acoes.forEach(acao => {
            const permission = (permissoesData || []).find(p => 
              p.papel_id === papel.id && 
              p.modulo_id === modulo.id && 
              p.acao === acao
            );
            matrix[papel.id][modulo.id][acao] = permission ? permission.ativo : false;
          });
        });
      });

      setPermissions(matrix);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de perfis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const togglePermission = async (papelId: string, moduloId: string, acao: AcaoPermissao) => {
    try {
      const currentValue = permissions[papelId]?.[moduloId]?.[acao] || false;
      const newValue = !currentValue;

      // Verificar se permissão já existe
      const { data: existingPermission } = await supabase
        .from('permissoes_sistema')
        .select('id')
        .eq('papel_id', papelId)
        .eq('modulo_id', moduloId)
        .eq('acao', acao)
        .maybeSingle();

      if (existingPermission) {
        // Atualizar permissão existente
        const { error } = await supabase
          .from('permissoes_sistema')
          .update({ ativo: newValue })
          .eq('id', existingPermission.id);

        if (error) throw error;
      } else {
        // Criar nova permissão
        const { error } = await supabase
          .from('permissoes_sistema')
          .insert({
            papel_id: papelId,
            modulo_id: moduloId,
            acao: acao,
            ativo: newValue
          });

        if (error) throw error;
      }

      // Atualizar estado local
      setPermissions(prev => ({
        ...prev,
        [papelId]: {
          ...prev[papelId],
          [moduloId]: {
            ...prev[papelId]?.[moduloId],
            [acao]: newValue
          }
        }
      }));

      toast({
        title: "Sucesso",
        description: "Permissão atualizada com sucesso"
      });

    } catch (error) {
      console.error('Erro ao alterar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar permissão",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      ativo: true
    });
    setEditingPapel(null);
  };

  const handleOpenDialog = (papel?: Papel) => {
    if (papel) {
      setEditingPapel(papel);
      setFormData({
        nome: papel.nome,
        descricao: papel.descricao,
        ativo: papel.ativo
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSavePapel = async () => {
    try {
      if (editingPapel) {
        // Atualizar papel existente
        const { error } = await supabase
          .from('papeis_igreja')
          .update({
            nome: formData.nome,
            descricao: formData.descricao,
            ativo: formData.ativo
          })
          .eq('id', editingPapel.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Perfil atualizado com sucesso!"
        });
      } else {
        // Criar novo papel
        const codigo = formData.nome.toLowerCase()
          .replace(/\s+/g, '_')
          .replace(/[^a-z0-9_]/g, '');
        
        const { error } = await supabase
          .from('papeis_igreja')
          .insert({
            codigo: codigo,
            nome: formData.nome,
            descricao: formData.descricao,
            ativo: formData.ativo,
            nivel_hierarquia: 10
          } as any);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Perfil criado com sucesso!"
        });
      }

      setIsDialogOpen(false);
      resetForm();
      loadData(); // Recarregar dados
    } catch (error) {
      console.error('Erro ao salvar papel:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar perfil",
        variant: "destructive"
      });
    }
  };

  const filteredPapeis = papeis.filter(papel =>
    papel.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    papel.descricao.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Gestão de Perfis</h2>
          <p className="text-muted-foreground">Gerencie papéis e suas permissões no sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Perfil
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar perfis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Profile Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPapeis.map((papel) => (
          <Card key={papel.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{papel.nome}</CardTitle>
                    <Badge variant={papel.ativo ? 'default' : 'secondary'}>
                      {papel.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleOpenDialog(papel)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {papel.descricao}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Usuários: {papel.usuarios_count || 0}</span>
                <span>Código: {papel.codigo}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Matriz de Permissões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-2 border-b font-medium">Módulo</th>
                  {acoes.map(acao => (
                    <th key={acao} className="text-center p-2 border-b font-medium text-xs">
                      {acao.charAt(0).toUpperCase() + acao.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modulos.map(modulo => (
                  <tr key={modulo.id} className="hover:bg-muted/50">
                    <td className="p-2 border-b font-medium">{modulo.nome}</td>
                    {acoes.map(acao => (
                      <td key={`${modulo.id}-${acao}`} className="p-2 border-b text-center">
                        <div className="flex flex-wrap gap-1 justify-center">
                          {filteredPapeis.slice(0, 4).map(papel => (
                            <Button
                              key={`${papel.id}-${modulo.id}-${acao}`}
                              variant="ghost"
                              size="sm"
                              className={`w-6 h-6 p-0 ${
                                permissions[papel.id]?.[modulo.id]?.[acao]
                                  ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                              }`}
                              onClick={() => togglePermission(papel.id, modulo.id, acao)}
                            >
                              {permissions[papel.id]?.[modulo.id]?.[acao] ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                <X className="h-3 w-3" />
                              )}
                            </Button>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Legend */}
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm font-medium mb-2">Legenda dos Perfis:</p>
            <div className="flex flex-wrap gap-2">
              {filteredPapeis.slice(0, 4).map((papel, index) => (
                <div key={papel.id} className="flex items-center gap-1 text-xs">
                  <div className={`w-3 h-3 rounded border ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                  }`} />
                  <span>{papel.nome}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para Criar/Editar Perfil */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingPapel ? 'Editar Perfil' : 'Criar Novo Perfil'}
            </DialogTitle>
            <DialogDescription>
              {editingPapel 
                ? 'Edite as informações do perfil selecionado'
                : 'Crie um novo perfil de acesso para o sistema'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do Perfil</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Ex: Coordenador de Agenda"
              />
            </div>
            
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={formData.descricao}
                onChange={(e) => setFormData(prev => ({ ...prev, descricao: e.target.value }))}
                placeholder="Descreva as responsabilidades deste perfil"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="ativo"
                checked={formData.ativo}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
              />
              <Label htmlFor="ativo">Perfil ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSavePapel}>
              {editingPapel ? 'Salvar Alterações' : 'Criar Perfil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};