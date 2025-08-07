import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, KeyRound, Home, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAdmin, isAuthenticated, loading } = useAuth();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && !loading) {
      console.log('🔄 Usuário já autenticado, redirecionando...');
      navigate('/dashboard');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    const checkResetToken = async () => {
      console.log('=== VERIFICANDO TOKEN DE RESET ===');
      console.log('URL completa:', window.location.href);
      
      try {
        const fullUrl = window.location.href;
        const hasRecovery = fullUrl.includes('type=recovery') || fullUrl.includes('access_token=');
        
        if (!hasRecovery) {
          console.log('❌ Nenhum token de recovery encontrado');
          toast({
            title: "Link inválido",
            description: "Este link de redefinição de senha é inválido ou expirou.",
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        // Extrair parâmetros do hash e query string
        const hash = window.location.hash.substring(1);
        const search = window.location.search.substring(1);
        
        const allParams = new URLSearchParams();
        
        if (search) {
          const searchParams = new URLSearchParams(search);
          for (let [key, value] of searchParams.entries()) {
            allParams.set(key, value);
          }
        }
        
        if (hash) {
          const hashParams = new URLSearchParams(hash);
          for (let [key, value] of hashParams.entries()) {
            allParams.set(key, value);
          }
        }
        
        const accessToken = allParams.get('access_token');
        const type = allParams.get('type');
        const refreshToken = allParams.get('refresh_token');
        
        console.log('Tokens extraídos:', { 
          accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : 'null',
          type, 
          refreshToken: refreshToken ? `${refreshToken.substring(0, 10)}...` : 'null'
        });
        
        if (!accessToken || type !== 'recovery') {
          throw new Error('Token inválido');
        }

        // Validar token com Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (error) {
          throw new Error('Token expirado ou inválido');
        }

        console.log('✅ Token válido');
        setIsValidToken(true);
        
        // Salvar tokens para uso posterior
        sessionStorage.setItem('reset_access_token', accessToken);
        if (refreshToken) {
          sessionStorage.setItem('reset_refresh_token', refreshToken);
        }

        // Limpar URL
        window.history.replaceState({}, '', '/reset');
        
      } catch (error: any) {
        console.error('Erro ao validar token:', error);
        toast({
          title: "Link inválido",
          description: "Este link de redefinição de senha é inválido ou expirou.",
          variant: "destructive",
        });
        navigate('/auth');
      } finally {
        setIsCheckingToken(false);
      }
    };

    checkResetToken();
  }, [navigate, toast]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword.trim()) {
      toast({
        title: "Senha obrigatória",
        description: "Por favor, informe sua nova senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A confirmação da senha deve ser igual à nova senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter no mínimo 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Senha redefinida!",
        description: "Sua senha foi alterada com sucesso. Redirecionando...",
      });
      
      // Limpar tokens salvos
      sessionStorage.removeItem('reset_access_token');
      sessionStorage.removeItem('reset_refresh_token');
      
      // Redirecionar após 2 segundos
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
      
    } catch (error: any) {
      console.error('Erro ao redefinir senha:', error);
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Validando link de redefinição...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValidToken) {
    return null; // Já redirecionou
  }

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
          <CardTitle className="text-2xl font-bold">Redefinir Senha</CardTitle>
          <CardDescription>
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Digite sua nova senha"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
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
            
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Confirme sua nova senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            
            <div className="bg-muted/50 p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Instruções:</strong> Digite sua nova senha e confirme. 
                A senha deve ter no mínimo 6 caracteres.
              </p>
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Redefinindo...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Redefinir Senha
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;