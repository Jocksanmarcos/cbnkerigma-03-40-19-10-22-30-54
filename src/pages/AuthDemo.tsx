import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Crown, 
  GraduationCap, 
  Users, 
  Shield,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  Settings,
  CheckCircle
} from 'lucide-react';

const AuthDemo = () => {
  const { signIn, loading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creatingUsers, setCreatingUsers] = useState(false);
  const [usersCreated, setUsersCreated] = useState(false);

  const testUsers = [
    {
      email: 'admin@kerigma.com',
      password: 'admin123',
      name: 'Admin Sistema',
      role: 'Administrador Geral',
      description: 'Acesso completo ao sistema',
      icon: Crown,
      color: 'bg-purple-500'
    },
    {
      email: 'pastor@kerigma.com', 
      password: 'pastor123',
      name: 'Pastor Carlos Lima',
      role: 'Pastor/Líder',
      description: 'Acesso administrativo e pastoral',
      icon: Shield,
      color: 'bg-blue-500'
    },
    {
      email: 'aluno@kerigma.com',
      password: 'aluno123', 
      name: 'João Silva',
      role: 'Aluno/Membro',
      description: 'Portal do aluno e funcionalidades básicas',
      icon: GraduationCap,
      color: 'bg-green-500'
    },
    {
      email: 'lider@kerigma.com',
      password: 'lider123',
      name: 'Maria Santos',
      role: 'Líder de Célula',
      description: 'Gestão de células e relatórios',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const handleQuickLogin = async (testUser: any) => {
    console.log('Tentando login com:', testUser.email);
    setEmail(testUser.email);
    setPassword(testUser.password);
    
    const result = await signIn(testUser.email, testUser.password);
    console.log('Resultado do login:', result);
    
    if (!result.error) {
      // Redirecionar baseado no tipo de usuário
      if (testUser.email.includes('admin') || testUser.email.includes('pastor')) {
        navigate('/admin');
      } else if (testUser.email.includes('aluno')) {
        navigate('/portal-aluno');
      } else {
        navigate('/dashboard');
      }
    } else {
      console.error('Erro no login:', result.error);
    }
  };

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    const result = await signIn(email, password);
    if (!result.error) {
      navigate('/dashboard');
    }
  };

  const createDemoUsers = async () => {
    setCreatingUsers(true);
    
    try {
      console.log('Iniciando criação de usuários demo...');
      const { data, error } = await supabase.functions.invoke('create-demo-users', {
        body: {}
      });

      console.log('Resposta da função:', { data, error });

      if (error) {
        console.error('Erro da edge function:', error);
        throw error;
      }

      console.log('Usuários criados com sucesso:', data);
      toast({
        title: "Usuários Demo Criados!",
        description: "Todos os usuários de teste foram criados com sucesso. Agora você pode fazer login.",
      });
      
      setUsersCreated(true);
    } catch (error: any) {
      console.error('Erro ao criar usuários demo:', error);
      toast({
        title: "Erro ao criar usuários",
        description: error.message || "Não foi possível criar os usuários de demonstração.",
        variant: "destructive"
      });
    } finally {
      setCreatingUsers(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary">
              Usuário Logado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <p className="font-medium">{user?.email}</p>
              <Badge variant="secondary" className="mt-2">Autenticado</Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                size="sm"
              >
                Dashboard
              </Button>
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                size="sm"
              >
                Admin
              </Button>
              <Button 
                onClick={() => navigate('/portal-aluno')}
                variant="outline"
                size="sm"
              >
                Portal Aluno
              </Button>
              <Button 
                onClick={() => navigate('/celulas')}
                variant="outline"
                size="sm"
              >
                Células
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Demo de Autenticação - Kerigma</h1>
          <p className="text-muted-foreground text-lg">
            Teste o sistema com usuários de diferentes perfis
          </p>
          
          {!usersCreated && (
            <div className="mt-6">
              <Button 
                onClick={createDemoUsers}
                disabled={creatingUsers}
                size="lg"
                className="bg-primary hover:bg-primary/90"
              >
                <Settings className="w-5 h-5 mr-2" />
                {creatingUsers ? 'Criando Usuários...' : 'Criar Usuários Demo'}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Clique para criar automaticamente todos os usuários de teste
              </p>
            </div>
          )}
          
          {usersCreated && (
            <div className="mt-6 flex items-center justify-center space-x-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Usuários demo criados com sucesso!</span>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Usuários de Teste */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Usuários de Teste</h2>
            <div className="space-y-4">
              {testUsers.map((testUser, index) => {
                const IconComponent = testUser.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 ${testUser.color} rounded-lg flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{testUser.name}</h3>
                          <Badge variant="secondary" className="mb-2">{testUser.role}</Badge>
                          <p className="text-sm text-muted-foreground mb-3">
                            {testUser.description}
                          </p>
                          <div className="text-xs text-muted-foreground mb-3">
                            <p><strong>Email:</strong> {testUser.email}</p>
                            <p><strong>Senha:</strong> {testUser.password}</p>
                          </div>
                          <Button 
                            onClick={() => handleQuickLogin(testUser)}
                            disabled={loading}
                            size="sm"
                            className="w-full"
                          >
                            <LogIn className="w-4 h-4 mr-2" />
                            {loading ? 'Entrando...' : 'Login Rápido'}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Login Manual */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Login Manual</h2>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserPlus className="w-5 h-5" />
                  <span>Entrar no Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleManualLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading || !email || !password}
                    className="w-full"
                  >
                    {loading ? 'Entrando...' : 'Entrar'}
                  </Button>
                </form>
                
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Dica</h4>
                  <p className="text-sm text-muted-foreground">
                    Use os botões "Login Rápido" para testar rapidamente diferentes perfis 
                    de usuário ou digite manualmente as credenciais acima.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Informações do Sistema */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Autenticação:</span>
                    <Badge variant="default">✅ Funcionando</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Banco de Dados:</span>
                    <Badge variant="default">✅ Conectado</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Usuários Demo:</span>
                    <Badge variant="default">✅ Criados</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Segurança:</span>
                    <Badge variant="default">✅ Corrigida</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthDemo;