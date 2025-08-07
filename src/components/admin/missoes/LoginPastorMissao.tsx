import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

export const LoginPastorMissao = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha para acessar.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const result = await signIn(email, password, '/admin');
      
      if (result.error) {
        // O erro já é tratado no hook useAuth
        return;
      }

      // Redirecionar para o painel admin se login bem-sucedido
      if (result.isAdmin) {
        navigate('/admin');
        toast({
          title: "Acesso autorizado",
          description: "Bem-vindo ao painel de gestão da missão!",
        });
      } else {
        toast({
          title: "Acesso negado",
          description: "Suas credenciais não têm permissão para acessar o painel administrativo.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro durante o login.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            Portal do Pastor
          </CardTitle>
          <CardDescription>
            Acesso exclusivo para pastores de missão da CBN Kerigma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  className="pl-10"
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Sua senha"
                  className="pl-10 pr-10"
                  disabled={loading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
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
              className="w-full"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar no Painel"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Para Pastores de Missão:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Acesso total aos dados da sua missão</li>
              <li>• Gestão de membros e células</li>
              <li>• Controle financeiro da missão</li>
              <li>• Relatórios e estatísticas</li>
            </ul>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Problemas com o acesso?{" "}
              <a href="/contato" className="text-blue-600 hover:underline">
                Entre em contato
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Primeira vez? Use as credenciais enviadas por email.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};