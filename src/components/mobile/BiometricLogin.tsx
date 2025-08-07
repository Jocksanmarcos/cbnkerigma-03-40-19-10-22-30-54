import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useAuth } from '@/hooks/useAuth';
import { 
  Fingerprint, 
  Shield, 
  Eye, 
  Smartphone,
  Lock,
  CheckCircle
} from 'lucide-react';

export const BiometricLogin: React.FC = () => {
  const { user, signIn } = useAuth();
  const {
    isAvailable,
    biometryType,
    isEnabled,
    isAuthenticating,
    enableBiometricAuth,
    authenticateWithBiometry,
    disableBiometricAuth,
    getBiometryTypeLabel
  } = useBiometricAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Ícone baseado no tipo de biometria
  const getBiometryIcon = () => {
    if (!biometryType) return Fingerprint;
    
    switch (biometryType) {
      case 'FACE_ID':
      case 'FACE_AUTHENTICATION':
        return Eye;
      case 'TOUCH_ID':
      case 'FINGERPRINT':
        return Fingerprint;
      default:
        return Shield;
    }
  };

  const BiometryIcon = getBiometryIcon();

  const handleRegularLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      const result = await signIn(email, password);
      if (!result.error) {
        // Login bem-sucedido, oferecer configurar biometria
        if (isAvailable && !isEnabled) {
          // Aqui podemos mostrar modal para configurar biometria
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnableBiometry = async () => {
    if (!email || !password) {
      // Precisa fazer login primeiro
      return;
    }
    await enableBiometricAuth(email, password);
  };

  if (!user) {
    return (
      <div className="space-y-6">
        {/* Login Regular */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Login</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegularLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading || !email || !password}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Login Biométrico */}
        {isAvailable && isEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BiometryIcon className="w-5 h-5" />
                <span>Login Biométrico</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={authenticateWithBiometry}
                disabled={isAuthenticating}
                className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90"
                size="lg"
              >
                <BiometryIcon className="w-5 h-5 mr-2" />
                {isAuthenticating ? 'Autenticando...' : `Entrar com ${getBiometryTypeLabel()}`}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Informações sobre Biometria */}
        {isAvailable && !isEnabled && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BiometryIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Configure {getBiometryTypeLabel()}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Acesse o app de forma rápida e segura usando sua biometria
              </p>
              <div className="bg-muted p-3 rounded-lg text-xs text-muted-foreground">
                Faça login primeiro para habilitar a autenticação biométrica
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Usuário logado - Configurações de Biometria
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Segurança Biométrica</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isAvailable ? (
            <div className="text-center p-6">
              <Smartphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Biometria não disponível</h3>
              <p className="text-sm text-muted-foreground">
                Seu dispositivo não suporta autenticação biométrica ou não possui biometrias cadastradas.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center space-x-4 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <BiometryIcon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">{getBiometryTypeLabel()}</h4>
                  <p className="text-sm text-muted-foreground">
                    {isEnabled ? 'Configurado e ativo' : 'Disponível para configuração'}
                  </p>
                </div>
                {isEnabled && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="biometric-toggle" className="text-base font-medium">
                    Autenticação Biométrica
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Use {getBiometryTypeLabel().toLowerCase()} para fazer login
                  </p>
                </div>
                <Switch
                  id="biometric-toggle"
                  checked={isEnabled}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Para habilitar, precisa das credenciais
                      // Aqui você pode abrir um modal para inserir email/senha
                      console.log('Abrir modal para configurar biometria');
                    } else {
                      disableBiometricAuth();
                    }
                  }}
                  disabled={isAuthenticating}
                />
              </div>

              {isEnabled && (
                <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-800 dark:text-green-200">
                        Autenticação configurada
                      </h4>
                      <p className="text-sm text-green-600 dark:text-green-300">
                        Você pode fazer login usando {getBiometryTypeLabel().toLowerCase()} na próxima vez que abrir o app.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {!isEnabled && (
                <Button
                  onClick={() => {
                    // Aqui você precisa implementar um modal para pedir email/senha
                    // Para teste, vamos usar valores mockados
                    console.log('Configurar biometria - implementar modal');
                  }}
                  disabled={isAuthenticating}
                  className="w-full"
                  variant="outline"
                >
                  <BiometryIcon className="w-4 h-4 mr-2" />
                  Configurar {getBiometryTypeLabel()}
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};