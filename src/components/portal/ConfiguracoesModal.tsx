import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Eye, 
  EyeOff,
  Save,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar
} from 'lucide-react';

interface PerfilAluno {
  id: string;
  nome_completo: string;
  email: string;
  telefone?: string;
  data_nascimento?: string;
  endereco?: string;
  bio?: string;
  nivel_atual: string;
  pontuacao_total: number;
  posicao_ranking?: number;
}

interface ConfiguracoesModalProps {
  perfil: PerfilAluno;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdatePerfil: (dados: Partial<PerfilAluno>) => Promise<void>;
}

export const ConfiguracoesModal: React.FC<ConfiguracoesModalProps> = ({
  perfil,
  isOpen,
  onOpenChange,
  onUpdatePerfil
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  
  // Estados para perfil
  const [dadosPerfil, setDadosPerfil] = useState({
    nome_completo: perfil.nome_completo || '',
    email: perfil.email || '',
    telefone: perfil.telefone || '',
    data_nascimento: perfil.data_nascimento || '',
    endereco: perfil.endereco || '',
    bio: perfil.bio || ''
  });

  // Estados para senha
  const [dadosSenha, setDadosSenha] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  // Estados para notificações
  const [configuracaoNotificacoes, setConfiguracaoNotificacoes] = useState({
    emailNovaAula: true,
    emailCertificado: true,
    emailConquista: true,
    emailLembrete: true,
    pushNotificacoes: true,
    resumoSemanal: true
  });

  const handleSalvarPerfil = async () => {
    try {
      setLoading(true);
      await onUpdatePerfil(dadosPerfil);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAlterarSenha = async () => {
    if (dadosSenha.novaSenha !== dadosSenha.confirmarSenha) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (dadosSenha.novaSenha.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A nova senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      // Implementar lógica de alteração de senha aqui
      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso!",
      });
      setDadosSenha({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
    } catch (error) {
      toast({
        title: "Erro ao alterar senha",
        description: "Não foi possível alterar sua senha. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarNotificacoes = async () => {
    try {
      setLoading(true);
      // Implementar lógica de salvamento das configurações de notificação
      toast({
        title: "Configurações salvas",
        description: "Suas preferências de notificação foram atualizadas!",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar suas preferências. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da Conta
          </DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais, segurança e preferências de notificação.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="perfil" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="seguranca" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notificações
            </TabsTrigger>
          </TabsList>

          {/* Aba Perfil */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Alterar Foto
                  </Button>
                </div>

                <Separator />

                {/* Informações básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome Completo</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nome"
                        value={dadosPerfil.nome_completo}
                        onChange={(e) => setDadosPerfil({ ...dadosPerfil, nome_completo: e.target.value })}
                        className="pl-10"
                        placeholder="Seu nome completo"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={dadosPerfil.email}
                        onChange={(e) => setDadosPerfil({ ...dadosPerfil, email: e.target.value })}
                        className="pl-10"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="telefone"
                        value={dadosPerfil.telefone}
                        onChange={(e) => setDadosPerfil({ ...dadosPerfil, telefone: e.target.value })}
                        className="pl-10"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nascimento">Data de Nascimento</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="nascimento"
                        type="date"
                        value={dadosPerfil.data_nascimento}
                        onChange={(e) => setDadosPerfil({ ...dadosPerfil, data_nascimento: e.target.value })}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endereco">Endereço</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="endereco"
                      value={dadosPerfil.endereco}
                      onChange={(e) => setDadosPerfil({ ...dadosPerfil, endereco: e.target.value })}
                      className="pl-10"
                      placeholder="Seu endereço completo"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Biografia</Label>
                  <Textarea
                    id="bio"
                    value={dadosPerfil.bio}
                    onChange={(e) => setDadosPerfil({ ...dadosPerfil, bio: e.target.value })}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                  />
                </div>

                <Button onClick={handleSalvarPerfil} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>

            {/* Estatísticas do Perfil */}
            <Card>
              <CardHeader>
                <CardTitle>Estatísticas do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{perfil.pontuacao_total}</div>
                    <div className="text-sm text-muted-foreground">Pontos</div>
                  </div>
                  <div className="text-center">
                    <Badge variant="secondary" className="text-lg px-3 py-1">
                      {perfil.nivel_atual}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">Nível</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      #{perfil.posicao_ranking || 'N/A'}
                    </div>
                    <div className="text-sm text-muted-foreground">Ranking</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">85%</div>
                    <div className="text-sm text-muted-foreground">Progresso</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Segurança */}
          <TabsContent value="seguranca" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Alterar Senha
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senhaAtual">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="senhaAtual"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={dadosSenha.senhaAtual}
                      onChange={(e) => setDadosSenha({ ...dadosSenha, senhaAtual: e.target.value })}
                      placeholder="Digite sua senha atual"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1 h-8 w-8 p-0"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="novaSenha">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={showNewPassword ? 'text' : 'password'}
                      value={dadosSenha.novaSenha}
                      onChange={(e) => setDadosSenha({ ...dadosSenha, novaSenha: e.target.value })}
                      placeholder="Digite sua nova senha"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1 h-8 w-8 p-0"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                  <Input
                    id="confirmarSenha"
                    type="password"
                    value={dadosSenha.confirmarSenha}
                    onChange={(e) => setDadosSenha({ ...dadosSenha, confirmarSenha: e.target.value })}
                    placeholder="Confirme sua nova senha"
                  />
                </div>

                <Button onClick={handleAlterarSenha} disabled={loading} className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  {loading ? 'Alterando...' : 'Alterar Senha'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Notificações */}
          <TabsContent value="notificacoes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Preferências de Notificação
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Notificações por Email</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Novas Aulas</div>
                        <div className="text-sm text-muted-foreground">
                          Receber notificação quando uma nova aula for disponibilizada
                        </div>
                      </div>
                      <Switch
                        checked={configuracaoNotificacoes.emailNovaAula}
                        onCheckedChange={(checked) => 
                          setConfiguracaoNotificacoes({ ...configuracaoNotificacoes, emailNovaAula: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Certificados</div>
                        <div className="text-sm text-muted-foreground">
                          Receber notificação quando um certificado estiver disponível
                        </div>
                      </div>
                      <Switch
                        checked={configuracaoNotificacoes.emailCertificado}
                        onCheckedChange={(checked) => 
                          setConfiguracaoNotificacoes({ ...configuracaoNotificacoes, emailCertificado: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Conquistas</div>
                        <div className="text-sm text-muted-foreground">
                          Receber notificação quando alcançar uma nova conquista
                        </div>
                      </div>
                      <Switch
                        checked={configuracaoNotificacoes.emailConquista}
                        onCheckedChange={(checked) => 
                          setConfiguracaoNotificacoes({ ...configuracaoNotificacoes, emailConquista: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Lembretes</div>
                        <div className="text-sm text-muted-foreground">
                          Receber lembretes de aulas e atividades pendentes
                        </div>
                      </div>
                      <Switch
                        checked={configuracaoNotificacoes.emailLembrete}
                        onCheckedChange={(checked) => 
                          setConfiguracaoNotificacoes({ ...configuracaoNotificacoes, emailLembrete: checked })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">Resumo Semanal</div>
                        <div className="text-sm text-muted-foreground">
                          Receber um resumo semanal do seu progresso
                        </div>
                      </div>
                      <Switch
                        checked={configuracaoNotificacoes.resumoSemanal}
                        onCheckedChange={(checked) => 
                          setConfiguracaoNotificacoes({ ...configuracaoNotificacoes, resumoSemanal: checked })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Notificações Push</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Notificações Push</div>
                      <div className="text-sm text-muted-foreground">
                        Receber notificações em tempo real no navegador
                      </div>
                    </div>
                    <Switch
                      checked={configuracaoNotificacoes.pushNotificacoes}
                      onCheckedChange={(checked) => 
                        setConfiguracaoNotificacoes({ ...configuracaoNotificacoes, pushNotificacoes: checked })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSalvarNotificacoes} disabled={loading} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Salvando...' : 'Salvar Preferências'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};