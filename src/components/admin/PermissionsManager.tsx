import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Shield, 
  Settings, 
  Search, 
  Edit, 
  Save,
  UserCheck,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole, ModuloSistema, AcaoPermissao } from '@/hooks/useUserRole';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  papel_igreja?: UserRole;
  ativo: boolean;
  ultima_atividade?: string;
}

interface PermissaoSistema {
  id: string;
  papel_id: string;
  modulo_id: string;
  acao: AcaoPermissao;
  ativo: boolean;
}

interface Modulo {
  id: string;
  codigo: string;
  nome: string;
  ativo: boolean;
}

interface Papel {
  id: string;
  codigo: UserRole;
  nome: string;
  descricao: string;
  ativo: boolean;
}

export const PermissionsManager: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [permissoes, setPermissoes] = useState<PermissaoSistema[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [papeis, setPapeis] = useState<Papel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [editingPermissions, setEditingPermissions] = useState(false);
  
  // Estados para modais de edição
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<'papel' | 'modulo' | null>(null);
  const [editingItem, setEditingItem] = useState<Papel | Modulo | null>(null);
  const [editForm, setEditForm] = useState({
    nome: '',
    descricao: '',
    codigo: ''
  });
  
  const { toast } = useToast();
  const { isAdmin } = usePermissions();

  // Carregar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar usuários (de pessoas + usuarios_admin)
      const { data: pessoas } = await supabase
        .from('pessoas')
        .select('*')
        .eq('situacao', 'ativo');

      const { data: admins } = await supabase
        .from('usuarios_admin')
        .select('*');

      // Combinar dados
      const usuariosFormatados: Usuario[] = [
        ...(pessoas || []).map(p => ({
          id: p.id,
          email: p.email,
          nome: p.nome_completo,
          papel_igreja: p.papel_igreja as UserRole,
          ativo: true,
          ultima_atividade: p.updated_at
        })),
        ...(admins || []).map(a => ({
          id: a.user_id,
          email: a.email,
          nome: a.nome,
          papel_igreja: 'administrador_geral' as UserRole,
          ativo: a.ativo,
          ultima_atividade: a.updated_at
        }))
      ];

      // Remover duplicatas baseado no email
      const usuariosUnicos = usuariosFormatados.filter((usuario, index, self) => 
        index === self.findIndex(u => u.email === usuario.email)
      );

      setUsuarios(usuariosUnicos);

      // Carregar módulos
      const { data: modulosData } = await supabase
        .from('modulos_sistema')
        .select('*')
        .eq('ativo', true);

      setModulos((modulosData || []).map(m => ({
        id: m.id,
        codigo: m.codigo,
        nome: m.nome,
        ativo: m.ativo
      })));

      // Carregar papéis
      const { data: papeisData } = await supabase
        .from('papeis_igreja')
        .select('*')
        .eq('ativo', true);

      setPapeis(papeisData || []);

      // Carregar permissões
      const { data: permissoesData } = await supabase
        .from('permissoes_sistema')
        .select('*');

      setPermissoes(permissoesData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados de permissões",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const alterarPapelUsuario = async (usuarioId: string, novoPapel: UserRole) => {
    try {
      const { error } = await supabase
        .from('pessoas')
        .update({ papel_igreja: novoPapel })
        .eq('id', usuarioId);

      if (error) throw error;

      // Atualizar estado local
      setUsuarios(usuarios.map(u => 
        u.id === usuarioId ? { ...u, papel_igreja: novoPapel } : u
      ));

      toast({
        title: "Sucesso",
        description: "Papel do usuário alterado com sucesso"
      });

    } catch (error) {
      console.error('Erro ao alterar papel:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar papel do usuário",
        variant: "destructive"
      });
    }
  };

  const alternarPermissao = async (papelId: string, moduloId: string, acao: AcaoPermissao) => {
    try {
      // Verificar se permissão já existe
      const permissaoExistente = permissoes.find(p => 
        p.papel_id === papelId && p.modulo_id === moduloId && p.acao === acao
      );

      if (permissaoExistente) {
        // Alternar status da permissão existente
        const { error } = await supabase
          .from('permissoes_sistema')
          .update({ ativo: !permissaoExistente.ativo })
          .eq('id', permissaoExistente.id);

        if (error) throw error;

        // Atualizar estado local
        setPermissoes(permissoes.map(p => 
          p.id === permissaoExistente.id ? { ...p, ativo: !p.ativo } : p
        ));
      } else {
        // Criar nova permissão
        const { data, error } = await supabase
          .from('permissoes_sistema')
          .insert({
            papel_id: papelId,
            modulo_id: moduloId,
            acao: acao,
            ativo: true
          })
          .select()
          .single();

        if (error) throw error;

        // Adicionar ao estado local
        setPermissoes([...permissoes, data]);
      }

      toast({
        title: "Sucesso",
        description: "Permissão alterada com sucesso"
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

  const alternarStatusPapel = async (papelId: string) => {
    try {
      const papel = papeis.find(p => p.id === papelId);
      if (!papel) return;

      const { error } = await supabase
        .from('papeis_igreja')
        .update({ ativo: !papel.ativo })
        .eq('id', papelId);

      if (error) throw error;

      // Atualizar estado local
      setPapeis(papeis.map(p => 
        p.id === papelId ? { ...p, ativo: !p.ativo } : p
      ));

      toast({
        title: "Sucesso",
        description: `Papel ${papel.ativo ? 'desativado' : 'ativado'} com sucesso`
      });

    } catch (error) {
      console.error('Erro ao alterar status do papel:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do papel",
        variant: "destructive"
      });
    }
  };

  const alternarStatusModulo = async (moduloId: string) => {
    try {
      const modulo = modulos.find(m => m.id === moduloId);
      if (!modulo) return;

      const { error } = await supabase
        .from('modulos_sistema')
        .update({ ativo: !modulo.ativo })
        .eq('id', moduloId);

      if (error) throw error;

      // Atualizar estado local
      setModulos(modulos.map(m => 
        m.id === moduloId ? { ...m, ativo: !m.ativo } : m
      ));

      toast({
        title: "Sucesso",
        description: `Módulo ${modulo.ativo ? 'desativado' : 'ativado'} com sucesso`
      });

    } catch (error) {
      console.error('Erro ao alterar status do módulo:', error);
      toast({
        title: "Erro",
        description: "Erro ao alterar status do módulo",
        variant: "destructive"
      });
    }
  };

  const editarPapel = (papel: Papel) => {
    console.log('🔧 Editando papel:', papel);
    setEditingType('papel');
    setEditingItem(papel);
    setEditForm({
      nome: papel.nome,
      descricao: papel.descricao,
      codigo: papel.codigo
    });
    setEditModalOpen(true);
  };

  const editarModulo = (modulo: Modulo) => {
    console.log('🔧 Editando módulo:', modulo);
    setEditingType('modulo');
    setEditingItem(modulo);
    setEditForm({
      nome: modulo.nome,
      descricao: '',
      codigo: modulo.codigo
    });
    setEditModalOpen(true);
  };

  const salvarEdicao = async () => {
    try {
      if (!editingItem || !editingType) return;

      if (editingType === 'papel') {
        const { error } = await supabase
          .from('papeis_igreja')
          .update({
            nome: editForm.nome,
            descricao: editForm.descricao
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        // Atualizar estado local
        setPapeis(papeis.map(p => 
          p.id === editingItem.id 
            ? { ...p, nome: editForm.nome, descricao: editForm.descricao }
            : p
        ));

        toast({
          title: "Sucesso",
          description: "Papel atualizado com sucesso"
        });
      } else {
        const { error } = await supabase
          .from('modulos_sistema')
          .update({
            nome: editForm.nome,
            codigo: editForm.codigo
          })
          .eq('id', editingItem.id);

        if (error) throw error;

        // Atualizar estado local
        setModulos(modulos.map(m => 
          m.id === editingItem.id 
            ? { ...m, nome: editForm.nome, codigo: editForm.codigo }
            : m
        ));

        toast({
          title: "Sucesso",
          description: "Módulo atualizado com sucesso"
        });
      }

      setEditModalOpen(false);
      setEditingItem(null);
      setEditingType(null);

    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar alterações",
        variant: "destructive"
      });
    }
  };

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const acoes: AcaoPermissao[] = ['visualizar', 'criar', 'editar', 'excluir', 'aprovar', 'exportar', 'gerenciar', 'administrar'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin()) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Você não tem permissão para acessar esta área.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Gerenciar Permissões</h1>
          <p className="text-muted-foreground">Controle de acesso e papéis de usuários</p>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm text-muted-foreground">Sistema de Segurança</span>
        </div>
      </div>

      <Tabs defaultValue="usuarios" className="w-full">
        <TabsList className="hidden md:grid md:w-full md:grid-cols-3">
          <TabsTrigger value="usuarios" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="permissoes" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Matriz de Permissões
          </TabsTrigger>
          <TabsTrigger value="papeis" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Papéis e Módulos
          </TabsTrigger>
        </TabsList>

        {/* Mobile tabs - vertical layout */}
        <div className="md:hidden space-y-2">
          <TabsList className="grid grid-cols-1 w-full h-auto p-1">
            <TabsTrigger value="usuarios" className="flex items-center gap-2 justify-start px-3 py-2">
              <Users className="h-4 w-4" />
              Usuários
            </TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-1 w-full h-auto p-1">
            <TabsTrigger value="permissoes" className="flex items-center gap-2 justify-start px-3 py-2">
              <Shield className="h-4 w-4" />
              Matriz de Permissões
            </TabsTrigger>
          </TabsList>
          <TabsList className="grid grid-cols-1 w-full h-auto p-1">
            <TabsTrigger value="papeis" className="flex items-center gap-2 justify-start px-3 py-2">
              <Settings className="h-4 w-4" />
              Papéis e Módulos
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="usuarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários do Sistema
              </CardTitle>
              <CardDescription>
                Gerencie papéis e status dos usuários
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Usuário
                </Button>
              </div>

              {/* Desktop Table */}
              <div className="hidden lg:block rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Papel Atual</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuariosFiltrados.map((usuario) => (
                      <TableRow key={usuario.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <UserCheck className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-medium">{usuario.nome}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {usuario.email}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={usuario.papel_igreja || ''}
                            onValueChange={(value) => alterarPapelUsuario(usuario.id, value as UserRole)}
                          >
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Selecionar papel" />
                            </SelectTrigger>
                            <SelectContent>
                              {papeis.map((papel) => (
                                <SelectItem key={papel.id} value={papel.codigo}>
                                  {papel.nome}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Badge variant={usuario.ativo ? "default" : "secondary"}>
                            {usuario.ativo ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Ativo
                              </>
                            ) : (
                              <>
                                <X className="h-3 w-3 mr-1" />
                                Inativo
                              </>
                            )}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedUser(usuario)}
                            >
                              <Shield className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="lg:hidden space-y-4">
                {usuariosFiltrados.map((usuario) => (
                  <Card key={usuario.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserCheck className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-sm">{usuario.nome}</h3>
                            <p className="text-xs text-muted-foreground break-all">{usuario.email}</p>
                          </div>
                        </div>
                        <Badge variant={usuario.ativo ? "default" : "secondary"} className="text-xs">
                          {usuario.ativo ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Ativo
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Inativo
                            </>
                          )}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">Papel:</label>
                        <Select
                          value={usuario.papel_igreja || ''}
                          onValueChange={(value) => alterarPapelUsuario(usuario.id, value as UserRole)}
                        >
                          <SelectTrigger className="w-full h-8 text-xs">
                            <SelectValue placeholder="Selecionar papel" />
                          </SelectTrigger>
                          <SelectContent>
                            {papeis.map((papel) => (
                              <SelectItem key={papel.id} value={papel.codigo}>
                                {papel.nome}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="h-3 w-3 mr-1" />
                          Editar
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                          onClick={() => setSelectedUser(usuario)}
                        >
                          <Shield className="h-3 w-3 mr-1" />
                          Permissões
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Matriz de Permissões
              </CardTitle>
              <CardDescription>
                Configure permissões por papel e módulo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {papeis.map((papel) => (
                  <Card key={papel.id} className="border-l-4 border-l-primary">
                    <CardHeader>
                      <CardTitle className="text-lg">{papel.nome}</CardTitle>
                      <CardDescription>{papel.descricao}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        {modulos.map((modulo) => (
                          <div key={modulo.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{modulo.nome}</h4>
                              <Badge variant="outline">{modulo.codigo}</Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {acoes.map((acao) => {
                                const temPermissao = permissoes.find(p => 
                                  p.papel_id === papel.id && 
                                  p.modulo_id === modulo.id && 
                                  p.acao === acao &&
                                  p.ativo
                                );

                                return (
                                  <div key={acao} className="flex items-center justify-between p-2 border rounded">
                                    <span className="text-sm capitalize">{acao}</span>
                                    <Switch
                                      checked={!!temPermissao}
                                      onCheckedChange={() => alternarPermissao(papel.id, modulo.id, acao)}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="papeis" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Papéis Disponíveis
                </CardTitle>
                <CardDescription>
                  Gerencie os papéis do sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {papeis.map((papel) => (
                    <div key={papel.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{papel.nome}</h4>
                        <p className="text-sm text-muted-foreground">{papel.descricao}</p>
                      </div>
                       <div className="flex items-center gap-2">
                         <Badge 
                           variant={papel.ativo ? "default" : "secondary"}
                           className={`cursor-pointer transition-colors ${
                             papel.ativo ? 'hover:bg-primary/80' : 'hover:bg-secondary/80'
                           }`}
                           onClick={() => alternarStatusPapel(papel.id)}
                         >
                           {papel.ativo ? "Ativo" : "Inativo"}
                         </Badge>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => editarPapel(papel)}
                           className="hover:bg-primary/10"
                         >
                           <Edit className="h-3 w-3" />
                         </Button>
                       </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Módulos do Sistema
                </CardTitle>
                <CardDescription>
                  Módulos disponíveis para permissão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {modulos.map((modulo) => (
                    <div key={modulo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{modulo.nome}</h4>
                        <p className="text-sm text-muted-foreground">{modulo.codigo}</p>
                      </div>
                       <div className="flex items-center gap-2">
                         <Badge 
                           variant={modulo.ativo ? "default" : "secondary"}
                           className={`cursor-pointer transition-colors ${
                             modulo.ativo ? 'hover:bg-primary/80' : 'hover:bg-secondary/80'
                           }`}
                           onClick={() => alternarStatusModulo(modulo.id)}
                         >
                           {modulo.ativo ? "Ativo" : "Inativo"}
                         </Badge>
                         <Button 
                           variant="outline" 
                           size="sm"
                           onClick={() => editarModulo(modulo)}
                           className="hover:bg-primary/10"
                         >
                           <Edit className="h-3 w-3" />
                         </Button>
                       </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              {editingType === 'papel' ? 'Editar Papel' : 'Editar Módulo'}
            </DialogTitle>
            <DialogDescription>
              {editingType === 'papel' 
                ? 'Altere as informações do papel do sistema'
                : 'Altere as informações do módulo do sistema'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nome" className="text-right">
                Nome
              </Label>
              <Input
                id="nome"
                value={editForm.nome}
                onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                className="col-span-3"
                placeholder="Nome do item"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">
                Código
              </Label>
              <Input
                id="codigo"
                value={editForm.codigo}
                onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
                className="col-span-3"
                placeholder="Código único"
                disabled={editingType === 'papel'}
              />
            </div>

            {editingType === 'papel' && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="descricao" className="text-right">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  value={editForm.descricao}
                  onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
                  className="col-span-3"
                  placeholder="Descrição do papel"
                  rows={3}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};