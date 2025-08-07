import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Edit, Key, UserX, UserCheck, Mail, Phone, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PastorMissao {
  id: string;
  user_id: string;
  missao_id: string;
  nome: string;
  email: string;
  telefone?: string;
  data_ordenacao?: string;
  ativo: boolean;
  papel: string;
  created_at: string;
  updated_at: string;
  missao_nome?: string;
}

interface Missao {
  id: string;
  nome: string;
  pais: string;
  cidade?: string;
  ativa: boolean;
}

export const PastoresMissoesManager = () => {
  const [pastores, setPastores] = useState<PastorMissao[]>([]);
  const [missoes, setMissoes] = useState<Missao[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCadastroModal, setShowCadastroModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCredenciaisModal, setShowCredenciaisModal] = useState(false);
  const [pastorSelecionado, setPastorSelecionado] = useState<PastorMissao | null>(null);
  const [credenciaisGeradas, setCredenciaisGeradas] = useState<{email: string, senha: string} | null>(null);
  const { toast } = useToast();

  const enviarCredenciaisPorEmail = async (pastorId: string, email: string, nome: string, senha: string) => {
    try {
      const pastor = pastores.find(p => p.id === pastorId || p.user_id === pastorId);
      const nomeIgreja = pastor?.missao_nome || 'Missão';

      const { error } = await supabase.functions.invoke('send-pastor-credentials', {
        body: {
          pastorId,
          email,
          nome,
          senha,
          nomeIgreja
        }
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        toast({
          title: "Aviso",
          description: "Pastor criado, mas houve erro no envio do email. Informe as credenciais manualmente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao enviar credenciais:', error);
    }
  };

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_ordenacao: '',
    missao_id: '',
    gerar_senha: false
  });

  const [editFormData, setEditFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    data_ordenacao: '',
    missao_id: ''
  });

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // Carregar pastores de missão
      const { data: pastoresData, error: pastoresError } = await supabase
        .from('pastores_missoes')
        .select(`
          *,
          missoes:missao_id (
            nome,
            pais,
            cidade
          )
        `)
        .order('created_at', { ascending: false });

      if (pastoresError) throw pastoresError;

      // Formatar dados dos pastores
      const pastoresFormatados = pastoresData?.map(pastor => ({
        ...pastor,
        missao_nome: pastor.missoes ? `${pastor.missoes.nome} - ${pastor.missoes.pais}` : 'Missão não encontrada'
      })) || [];

      setPastores(pastoresFormatados);

      // Carregar missões ativas
      const { data: missoesData, error: missoesError } = await supabase
        .from('missoes')
        .select('id, nome, pais, cidade, ativa')
        .eq('ativa', true)
        .order('nome');

      if (missoesError) throw missoesError;
      setMissoes(missoesData || []);

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos pastores.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const gerarSenhaAleatoria = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
    let senha = '';
    for (let i = 0; i < 12; i++) {
      senha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return senha;
  };

  const handleCadastrarPastor = async () => {
    try {
      if (!formData.nome || !formData.email || !formData.missao_id) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha nome, email e missão.",
          variant: "destructive"
        });
        return;
      }

      setLoading(true);

      // Gerar senha se solicitado
      let senhaGerada = '';
      let userId = '';

      if (formData.gerar_senha) {
        senhaGerada = gerarSenhaAleatoria();
        
        // Criar usuário no Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          password: senhaGerada,
          email_confirm: true,
          user_metadata: {
            nome: formData.nome,
            tipo_usuario: 'pastor_missao',
            missao_id: formData.missao_id
          }
        });

        if (authError) throw authError;
        userId = authData.user.id;
      } else {
        // Se não gerar senha, criar UUID temporário
        userId = crypto.randomUUID();
      }

      // Inserir pastor na tabela pastores_missoes
      const { error: insertError } = await supabase
        .from('pastores_missoes')
        .insert([{
          user_id: userId,
          missao_id: formData.missao_id,
          nome: formData.nome,
          email: formData.email,
          telefone: formData.telefone || null,
          data_ordenacao: formData.data_ordenacao || null,
          ativo: true,
          papel: 'pastor_missao'
        }]);

      if (insertError) throw insertError;

      if (formData.gerar_senha) {
        // Enviar credenciais por email
        await enviarCredenciaisPorEmail(userId, formData.email, formData.nome, senhaGerada);
        
        setCredenciaisGeradas({
          email: formData.email,
          senha: senhaGerada
        });
        setShowCredenciaisModal(true);
      }

      toast({
        title: "Pastor cadastrado!",
        description: formData.gerar_senha 
          ? "Pastor cadastrado e credenciais enviadas por email."
          : "Pastor cadastrado. Credenciais devem ser criadas separadamente.",
      });

      setFormData({
        nome: '',
        email: '',
        telefone: '',
        data_ordenacao: '',
        missao_id: '',
        gerar_senha: false
      });
      setShowCadastroModal(false);
      carregarDados();

    } catch (error: any) {
      console.error('Erro ao cadastrar pastor:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível cadastrar o pastor.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditarPastor = async () => {
    try {
      if (!editFormData.nome || !editFormData.email || !editFormData.missao_id) {
        toast({
          title: "Campos obrigatórios",
          description: "Preencha nome, email e missão.",
          variant: "destructive"
        });
        return;
      }

      if (!pastorSelecionado) return;

      setLoading(true);

      const { error } = await supabase
        .from('pastores_missoes')
        .update({
          nome: editFormData.nome,
          email: editFormData.email,
          telefone: editFormData.telefone || null,
          data_ordenacao: editFormData.data_ordenacao || null,
          missao_id: editFormData.missao_id
        })
        .eq('id', pastorSelecionado.id);

      if (error) throw error;

      toast({
        title: "Pastor atualizado!",
        description: "As informações do pastor foram atualizadas com sucesso.",
      });

      setShowEditModal(false);
      setPastorSelecionado(null);
      setEditFormData({
        nome: '',
        email: '',
        telefone: '',
        data_ordenacao: '',
        missao_id: ''
      });
      carregarDados();

    } catch (error: any) {
      console.error('Erro ao editar pastor:', error);
      toast({
        title: "Erro",
        description: error.message || "Não foi possível atualizar o pastor.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (pastor: PastorMissao) => {
    try {
      const novoStatus = !pastor.ativo;
      
      const { error } = await supabase
        .from('pastores_missoes')
        .update({ ativo: novoStatus })
        .eq('id', pastor.id);

      if (error) throw error;

      toast({
        title: novoStatus ? "Pastor ativado" : "Pastor desativado",
        description: `${pastor.nome} foi ${novoStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });

      carregarDados();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do pastor.",
        variant: "destructive"
      });
    }
  };

  const handleGerarNovasCredenciais = async (pastor: PastorMissao) => {
    try {
      const novaSenha = gerarSenhaAleatoria();
      
      // Atualizar senha no Supabase Auth
      const { error } = await supabase.auth.admin.updateUserById(
        pastor.user_id,
        { password: novaSenha }
      );

      if (error) throw error;

      // Enviar nova senha por email
      await enviarCredenciaisPorEmail(pastor.id, pastor.email, pastor.nome, novaSenha);

      setCredenciaisGeradas({
        email: pastor.email,
        senha: novaSenha
      });
      setShowCredenciaisModal(true);

      toast({
        title: "Novas credenciais geradas",
        description: "Nova senha gerada e enviada por email.",
      });

    } catch (error: any) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar novas credenciais.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Pastores de Missão</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie os pastores responsáveis pelas missões
          </p>
        </div>
        <Dialog open={showCadastroModal} onOpenChange={setShowCadastroModal}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Pastor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Cadastrar Pastor de Missão</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome completo *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  placeholder="Nome do pastor"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label htmlFor="data_ordenacao">Data de Ordenação</Label>
                <Input
                  id="data_ordenacao"
                  type="date"
                  value={formData.data_ordenacao}
                  onChange={(e) => setFormData({...formData, data_ordenacao: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="missao">Missão *</Label>
                <Select value={formData.missao_id} onValueChange={(value) => setFormData({...formData, missao_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a missão" />
                  </SelectTrigger>
                  <SelectContent>
                    {missoes.map((missao) => (
                      <SelectItem key={missao.id} value={missao.id}>
                        {missao.nome} - {missao.pais}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="gerar_senha"
                  checked={formData.gerar_senha}
                  onChange={(e) => setFormData({...formData, gerar_senha: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="gerar_senha">Gerar credenciais de acesso automaticamente</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleCadastrarPastor} disabled={loading} className="flex-1">
                  Cadastrar Pastor
                </Button>
                <Button variant="outline" onClick={() => setShowCadastroModal(false)} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pastores</CardTitle>
          <CardDescription>
            Total: {pastores.length} pastores cadastrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pastor</TableHead>
                <TableHead>Missão</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data Ordenação</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pastores.map((pastor) => (
                <TableRow key={pastor.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{pastor.nome}</div>
                      <div className="text-sm text-muted-foreground">{pastor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{pastor.missao_nome}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {pastor.email && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {pastor.email}
                        </div>
                      )}
                      {pastor.telefone && (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {pastor.telefone}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pastor.ativo ? "default" : "secondary"}>
                      {pastor.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pastor.data_ordenacao ? (
                      <div className="flex items-center text-sm">
                        <Calendar className="h-3 w-3 mr-1" />
                        {format(new Date(pastor.data_ordenacao), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setPastorSelecionado(pastor);
                          setEditFormData({
                            nome: pastor.nome,
                            email: pastor.email,
                            telefone: pastor.telefone || '',
                            data_ordenacao: pastor.data_ordenacao || '',
                            missao_id: pastor.missao_id
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleGerarNovasCredenciais(pastor)}
                      >
                        <Key className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant={pastor.ativo ? "destructive" : "default"}
                        onClick={() => handleToggleStatus(pastor)}
                      >
                        {pastor.ativo ? <UserX className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pastor de Missão</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_nome">Nome completo *</Label>
              <Input
                id="edit_nome"
                value={editFormData.nome}
                onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})}
                placeholder="Nome do pastor"
              />
            </div>
            
            <div>
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <Label htmlFor="edit_telefone">Telefone</Label>
              <Input
                id="edit_telefone"
                value={editFormData.telefone}
                onChange={(e) => setEditFormData({...editFormData, telefone: e.target.value})}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <Label htmlFor="edit_data_ordenacao">Data de Ordenação</Label>
              <Input
                id="edit_data_ordenacao"
                type="date"
                value={editFormData.data_ordenacao}
                onChange={(e) => setEditFormData({...editFormData, data_ordenacao: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="edit_missao">Missão *</Label>
              <Select value={editFormData.missao_id} onValueChange={(value) => setEditFormData({...editFormData, missao_id: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a missão" />
                </SelectTrigger>
                <SelectContent>
                  {missoes.map((missao) => (
                    <SelectItem key={missao.id} value={missao.id}>
                      {missao.nome} - {missao.pais}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditarPastor} disabled={loading} className="flex-1">
                Atualizar Pastor
              </Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Credenciais Geradas */}
      <Dialog open={showCredenciaisModal} onOpenChange={setShowCredenciaisModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Credenciais de Acesso Geradas</DialogTitle>
          </DialogHeader>
          {credenciaisGeradas && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Email:</Label>
                    <div className="font-mono text-sm">{credenciaisGeradas.email}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Senha:</Label>
                    <div className="font-mono text-sm bg-background p-2 rounded border">
                      {credenciaisGeradas.senha}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                ⚠️ Anote essas credenciais em local seguro. A senha não será exibida novamente.
              </div>
              <Button onClick={() => setShowCredenciaisModal(false)} className="w-full">
                Entendi
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};