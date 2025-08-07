import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { usePasswordResetRedirect } from '@/hooks/usePasswordResetRedirect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, LogIn, UserPlus, Home, KeyRound, Settings, User, Fingerprint } from 'lucide-react';
import { usePasswordReset } from '@/hooks/usePasswordReset';
import { usePasskeys } from '@/hooks/usePasskeys';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [activeTab, setActiveTab] = useState('signin');
  const [showRedirectChoice, setShowRedirectChoice] = useState(false);
  const [loginResult, setLoginResult] = useState<any>(null);
  const { signIn, signUp, isAuthenticated, loading, isAdmin } = useAuth();
  const { sendPasswordResetEmail, loading: resetLoading } = usePasswordReset();
  const { authenticateWithPasskey, isSupported: passkeySupported, loading: passkeyLoading } = usePasskeys();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Hook para interceptar tokens de reset
  usePasswordResetRedirect();

  // Check for password reset token in URL and redirect to /reset
  useEffect(() => {
    const fullUrl = window.location.href;
    const hasRecovery = fullUrl.includes('type=recovery') || fullUrl.includes('access_token=');
    
    if (hasRecovery) {
      // Redirect to dedicated reset page, preserving all URL parameters
      window.location.href = window.location.href.replace('/auth', '/reset');
    }
  }, []);

  // Redirect if already authenticated (only if not showing redirect choice)
  useEffect(() => {
    if (isAuthenticated && !loading && !showRedirectChoice) {
      console.log('🔄 Usuário autenticado, redirecionando...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate, showRedirectChoice]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(email, password);
    
    // Show redirect choice if login successful
    if (!result.error && result.showRedirectChoice) {
      setLoginResult(result);
      setShowRedirectChoice(true);
    }
  };

  const handleRedirectChoice = (path: string) => {
    setShowRedirectChoice(false);
    navigate(path);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nome.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, informe seu nome completo.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await signUp(email, password, nome);
    
    if (!error) {
      setEmail('');
      setPassword('');
      setNome('');
    }
    // Error and success messages are handled by useAuth hook
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, informe seu email para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }

    try {
      await sendPasswordResetEmail(resetEmail);
      setResetEmail('');
    } catch (error: any) {
      // Erro já é tratado no hook
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-10"
      >
        <Home className="mr-2 h-4 w-4" />
        Voltar ao Site
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">CBN Kerigma</CardTitle>
          <CardDescription>
            Faça login ou crie sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              <TabsTrigger value="reset">Esqueci Senha</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
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
                      placeholder="Sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
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
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "Entrando..."
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Entrar
                    </>
                  )}
                </Button>
                
                {passkeySupported && (
                  <>
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">ou</span>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full" 
                      onClick={authenticateWithPasskey}
                      disabled={passkeyLoading}
                    >
                      {passkeyLoading ? (
                        "Autenticando..."
                      ) : (
                        <>
                          <Fingerprint className="mr-2 h-4 w-4" />
                          Entrar com Biometria
                        </>
                      )}
                    </Button>
                  </>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-nome">Nome Completo</Label>
                  <Input
                    id="signup-nome"
                    type="text"
                    placeholder="Seu nome completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Crie uma senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
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
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    "Criando conta..."
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Criar Conta
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="reset">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="seu@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Instruções:</strong> Digite seu email cadastrado e clique em "Enviar Link". 
                    Você receberá um email com um link para redefinir sua senha.
                  </p>
                </div>
                
                <Button type="submit" className="w-full" disabled={resetLoading}>
                  {resetLoading ? (
                    "Enviando..."
                  ) : (
                    <>
                      <KeyRound className="mr-2 h-4 w-4" />
                      Enviar Link de Recuperação
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de Escolha de Redirecionamento */}
      <Dialog open={showRedirectChoice} onOpenChange={setShowRedirectChoice}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bem-vindo!</DialogTitle>
            <DialogDescription>
              Login realizado com sucesso. Para onde você gostaria de ir?
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-3 py-4">
            <Button 
              onClick={() => handleRedirectChoice('/dashboard')}
              className="h-16 flex-col gap-2"
              variant="outline"
            >
              <User className="h-6 w-6" />
              <div className="text-center">
                <div className="font-medium">Dashboard Pessoal</div>
                <div className="text-xs text-muted-foreground">Acesso às suas informações</div>
              </div>
            </Button>

            {loginResult?.isAdmin && (
              <Button 
                onClick={() => handleRedirectChoice('/admin')}
                className="h-16 flex-col gap-2"
                variant="outline"
              >
                <Settings className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Painel Administrativo</div>
                  <div className="text-xs text-muted-foreground">Gerenciar a igreja</div>
                </div>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;