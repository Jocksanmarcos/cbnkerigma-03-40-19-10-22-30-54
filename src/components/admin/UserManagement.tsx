import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download, 
  RefreshCw,
  UserCheck,
  Mail,
  Phone,
  Lock,
  Unlock,
  Shield,
  UserX,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExtendedUser {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  papel_igreja: string;
  ativo: boolean;
  mfa_ativo: boolean;
  ultimo_acesso?: string;
  data_criacao?: string;
}

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  papel_igreja: string;
  ativo: boolean;
  senha: string;
  confirmar_senha: string;
  mfa_ativo: boolean;
}

const roles = [
  { value: 'membro_comum', label: 'Membro Comum' },
  { value: 'novo_convertido', label: 'Novo Convertido' },
  { value: 'aluno', label: 'Aluno' },
  { value: 'discipulador', label: 'Discipulador' },
  { value: 'lider_celula', label: 'Líder de Célula' },
  { value: 'supervisor_regional', label: 'Supervisor Regional' },
  { value: 'coordenador_ensino', label: 'Coordenador de Ensino' },
  { value: 'tesoureiro', label: 'Tesoureiro' },
  { value: 'secretario', label: 'Secretário' },
  { value: 'coordenador_agenda', label: 'Coordenador de Agenda' },
  { value: 'comunicacao', label: 'Comunicação' },
  { value: 'administrador_geral', label: 'Administrador Geral' },
  { value: 'visitante_externo', label: 'Visitante Externo' }
];

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<ExtendedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ExtendedUser | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    papel_igreja: 'membro_comum',
    ativo: true,
    senha: '',
    confirmar_senha: '',
    mfa_ativo: false
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      
      // Carregar dados combinados de pessoas e usuarios_admin
      const { data: pessoas } = await supabase
        .from('pessoas')
        .select('*')
        .order('nome_completo');

      const { data: admins } = await supabase
        .from('usuarios_admin')
        .select('*')
        .order('nome');

      // Combinar e formatar dados
      const combinedUsers: ExtendedUser[] = [
        ...(pessoas || []).map(p => ({
          id: p.id,
          nome: p.nome_completo,
          email: p.email,
          telefone: '',
          papel_igreja: (p.papel_igreja as string) || 'membro_comum',
          ativo: p.situacao === 'ativo',
          mfa_ativo: false,
          ultimo_acesso: p.updated_at,
          data_criacao: p.created_at
        })),
        ...(admins || []).map(a => ({
          id: a.user_id,
          nome: a.nome,
          email: a.email,
          telefone: '',
          papel_igreja: (a.papel as string) || 'administrador_geral',
          ativo: a.ativo,
          mfa_ativo: false,
          ultimo_acesso: a.ultimo_acesso,
          data_criacao: a.created_at
        }))
      ];

      // Remover duplicatas baseado no email
      const uniqueUsers = combinedUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.email === user.email)
      );

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadUsers();
    toast({
      title: "Atualizado",
      description: "Lista de usuários atualizada"
    });
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      email: '',
      telefone: '',
      papel_igreja: 'membro_comum',
      ativo: true,
      senha: '',
      confirmar_senha: '',
      mfa_ativo: false
    });
    setEditingUser(null);
  };

  const handleEdit = (user: ExtendedUser) => {
    console.log('🔧 Editando usuário:', user);
    
    setEditingUser(user);
    setFormData({
      nome: user.nome,
      email: user.email,
      telefone: user.telefone || '',
      papel_igreja: user.papel_igreja,
      ativo: user.ativo,
      senha: '',
      confirmar_senha: '',
      mfa_ativo: user.mfa_ativo
    });
    setDialogOpen(true);
    
    toast({
      title: "Modal de edição",
      description: `Editando dados de ${user.nome}`,
    });
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      const { error } = await supabase
        .from('pessoas')
        .update({ situacao: 'inativo' })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
      toast({
        title: "Sucesso",
        description: "Usuário desativado com sucesso"
      });
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao desativar usuário",
        variant: "destructive"
      });
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      const { error } = await supabase
        .from('pessoas')
        .update({ situacao: newStatus ? 'ativo' : 'inativo' })
        .eq('id', userId);

      if (error) throw error;

      setUsers(users.map(u => 
        u.id === userId ? { ...u, ativo: newStatus } : u
      ));

      toast({
        title: "Sucesso",
        description: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso`
      });
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status do usuário",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser && formData.senha !== formData.confirmar_senha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingUser) {
        // Atualizar usuário existente
        const { error } = await supabase
          .from('pessoas')
          .update({
            nome_completo: formData.nome,
            email: formData.email,
            papel_igreja: formData.papel_igreja as any,
            situacao: formData.ativo ? 'ativo' : 'inativo'
          })
          .eq('id', editingUser.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso"
        });
      } else {
        // Criar novo usuário
        const { error } = await supabase
          .from('pessoas')
          .insert({
            nome_completo: formData.nome,
            email: formData.email,
            papel_igreja: formData.papel_igreja as any,
            situacao: formData.ativo ? 'ativo' : 'inativo',
            igreja_id: '00000000-0000-0000-0000-000000000000'
          });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso"
        });
      }

      setDialogOpen(false);
      resetForm();
      await loadUsers();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast({
        title: "Erro",
        description: "Falha ao salvar usuário",
        variant: "destructive"
      });
    }
  };

  const exportUsers = () => {
    const csv = [
      ['Nome', 'Email', 'Telefone', 'Papel', 'Status', 'Data Criação'].join(','),
      ...filteredUsers.map(user => [
        user.nome,
        user.email,
        user.telefone || '',
        roles.find(r => r.value === user.papel_igreja)?.label || user.papel_igreja,
        user.ativo ? 'Ativo' : 'Inativo',
        user.data_criacao || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'usuarios-cbn-kerigma.csv';
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Sucesso",
      description: "Lista de usuários exportada com sucesso"
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.papel_igreja === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.ativo) ||
                         (statusFilter === 'inactive' && !user.ativo);
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) {
    return (
      <div className="loading-responsive">
        <div className="spinner-responsive"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-responsive">
      <div className="dashboard-header-responsive">
        <div>
          <h1 className="text-responsive-xl font-bold text-foreground">Gerenciar Usuários</h1>
          <p className="text-responsive-sm text-muted-foreground">
            Controle completo de usuários, permissões e segurança do sistema
          </p>
        </div>
        <div className="mobile-button-group">
          <Button onClick={handleRefresh} variant="outline" className="btn-responsive">
            <RefreshCw className="h-4 w-4 mr-2" />
            <span className="hide-mobile">Atualizar</span>
          </Button>
          <Button onClick={exportUsers} variant="outline" className="btn-responsive">
            <Download className="h-4 w-4 mr-2" />
            <span className="hide-mobile">Exportar</span>
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="btn-responsive">
                <Plus className="h-4 w-4 mr-2" />
                <span className="hide-mobile">Novo</span>
                <span className="show-desktop">Usuário</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="dialog-responsive">
              <DialogHeader>
                <DialogTitle className="text-responsive-lg">
                  {editingUser ? 'Editar Usuário' : 'Novo Usuário'}
                </DialogTitle>
                <DialogDescription className="text-responsive-sm">
                  {editingUser 
                    ? 'Altere as informações do usuário conforme necessário.'
                    : 'Preencha os dados para criar um novo usuário no sistema.'
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="dialog-content-responsive">
                <form onSubmit={handleSubmit} className="form-responsive">
                  <div className="form-group-responsive">
                    <div className="space-y-2">
                      <Label htmlFor="nome" className="text-responsive-sm">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                        className="input-responsive"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-responsive-sm">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="input-responsive"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="telefone" className="text-responsive-sm">Telefone</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                        className="input-responsive"
                        placeholder="(00) 00000-0000"
                      />
                    </div>
                  </div>

                  <div className="form-group-responsive">
                    <div className="space-y-2">
                      <Label htmlFor="papel" className="text-responsive-sm">Papel no Sistema *</Label>
                      <Select 
                        value={formData.papel_igreja} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, papel_igreja: value }))}
                      >
                        <SelectTrigger className="input-responsive">
                          <SelectValue placeholder="Selecione um papel" />
                        </SelectTrigger>
                        <SelectContent className="dropdown-responsive">
                          {roles.map((role) => (
                            <SelectItem key={role.value} value={role.value} className="dropdown-item-responsive">
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-responsive-sm">Status da Conta</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.ativo}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
                        />
                        <Label className="text-responsive-sm">
                          {formData.ativo ? 'Conta Ativa' : 'Conta Inativa'}
                        </Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-responsive-sm">Autenticação MFA</Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={formData.mfa_ativo}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, mfa_ativo: checked }))}
                        />
                        <Label className="text-responsive-sm">
                          {formData.mfa_ativo ? 'MFA Habilitado' : 'MFA Desabilitado'}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {!editingUser && (
                    <div className="form-group-responsive">
                      <div className="space-y-2">
                        <Label htmlFor="senha" className="text-responsive-sm">Senha *</Label>
                        <div className="relative">
                          <Input
                            id="senha"
                            type={showPassword ? "text" : "password"}
                            value={formData.senha}
                            onChange={(e) => setFormData(prev => ({ ...prev, senha: e.target.value }))}
                            className="input-responsive pr-10"
                            required={!editingUser}
                            minLength={6}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirmar_senha" className="text-responsive-sm">Confirmar Senha *</Label>
                        <div className="relative">
                          <Input
                            id="confirmar_senha"
                            type={showConfirmPassword ? "text" : "password"}
                            value={formData.confirmar_senha}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmar_senha: e.target.value }))}
                            className="input-responsive pr-10"
                            required={!editingUser}
                            minLength={6}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-auto p-1"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
              
              <DialogFooter className="form-actions-responsive">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="btn-responsive">
                  Cancelar
                </Button>
                <Button type="submit" onClick={handleSubmit} className="btn-responsive">
                  {editingUser ? 'Atualizar' : 'Criar'} Usuário
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="card-responsive">
        <CardHeader className="card-header-responsive">
          <CardTitle className="text-responsive-lg">
            <UserCheck className="h-5 w-5 mr-2 inline" />
            Usuários Ativos ({filteredUsers.length})
          </CardTitle>
          {/* Filtros móveis responsivos */}
          <div className="space-y-3 md:space-y-0 md:flex md:gap-3 md:items-center">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 text-sm md:w-48">
                  <SelectValue placeholder="Papel" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="all">Todos os papéis</SelectItem>
                  {roles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-10 text-sm md:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 md:p-6">
          {/* Mobile Card View - Sem scroll horizontal */}
          <div className="md:hidden p-4 space-y-3 max-w-full overflow-hidden">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4 touch-manipulation">
                <div className="space-y-3">
                  {/* Cabeçalho do usuário */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <UserCheck className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-foreground line-clamp-1">
                            {user.nome}
                          </h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 break-all">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={user.ativo}
                      onCheckedChange={() => toggleUserStatus(user.id, user.ativo)}
                      className="flex-shrink-0"
                    />
                  </div>
                  
                  {/* Informações em grid responsivo */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Papel:</span>
                      <Badge variant="outline" className="text-xs w-full justify-center">
                        {roles.find(r => r.value === user.papel_igreja)?.label || 'Não definido'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge 
                        variant={user.ativo ? "default" : "secondary"} 
                        className="text-xs w-full justify-center"
                      >
                        {user.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Botões de ação empilhados */}
                  <div className="flex flex-col gap-2 pt-2 border-t">
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEdit(user)}
                        className="flex-1 h-9"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          toast({
                            title: "Permissões",
                            description: `Configurar permissões para ${user.nome}`,
                          });
                        }}
                        className="flex-1 h-9"
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Permissões
                      </Button>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDelete(user.id)}
                      className="w-full h-9 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table View - Apenas para telas grandes */}
          <div className="hidden lg:block">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>MFA</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-foreground truncate">
                              {user.nome}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              ID: {user.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{user.email}</span>
                          </div>
                          {user.telefone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span className="truncate">{user.telefone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {roles.find(r => r.value === user.papel_igreja)?.label || 'Não definido'}
                        </Badge>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.ativo ? "default" : "secondary"} className="text-xs">
                            {user.ativo ? 'Ativo' : 'Inativo'}
                          </Badge>
                          <Switch
                            checked={user.ativo}
                            onCheckedChange={() => toggleUserStatus(user.id, user.ativo)}
                            className="scale-90"
                          />
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Badge 
                          variant={user.mfa_ativo ? "default" : "outline"} 
                          className="text-xs"
                        >
                          <span className="inline-flex items-center gap-1">
                            {user.mfa_ativo ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                            {user.mfa_ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEdit(user)}
                            title="Editar usuário"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                              toast({
                                title: "Permissões",
                                description: `Configurar permissões para ${user.nome}`,
                              });
                            }}
                            title="Gerenciar permissões"
                          >
                            <Shield className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDelete(user.id)}
                            className="text-destructive hover:text-destructive"
                            title="Excluir usuário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {filteredUsers.length === 0 && (
            <div className="empty-state-responsive">
              <UserX className="empty-state-icon-responsive" />
              <h3 className="empty-state-title-responsive">Nenhum usuário encontrado</h3>
              <p className="empty-state-description-responsive">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros ou termos de busca.'
                  : 'Comece adicionando um novo usuário ao sistema.'}
              </p>
              {!searchTerm && roleFilter === 'all' && statusFilter === 'all' && (
                <Button onClick={() => setDialogOpen(true)} className="btn-responsive">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Usuário
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};