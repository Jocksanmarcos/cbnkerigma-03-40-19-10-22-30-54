import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Fingerprint, Smartphone, Laptop, Trash2, Plus, Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePasskeys } from '@/hooks/usePasskeys';

export const PasskeyManager: React.FC = () => {
  const {
    credentials,
    loading,
    isSupported,
    registerPasskey,
    authenticateWithPasskey,
    removeCredential
  } = usePasskeys();

  const [newDeviceName, setNewDeviceName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleRegisterPasskey = async () => {
    if (!newDeviceName.trim()) return;

    setIsRegistering(true);
    const success = await registerPasskey(newDeviceName.trim());
    if (success) {
      setNewDeviceName('');
    }
    setIsRegistering(false);
  };

  const getDeviceIcon = (deviceType?: string) => {
    switch (deviceType) {
      case 'platform':
        return <Smartphone className="h-4 w-4" />;
      case 'cross-platform':
        return <Laptop className="h-4 w-4" />;
      default:
        return <Fingerprint className="h-4 w-4" />;
    }
  };

  const getDeviceTypeLabel = (deviceType?: string) => {
    switch (deviceType) {
      case 'platform':
        return 'Dispositivo Integrado';
      case 'cross-platform':
        return 'Dispositivo Externo';
      default:
        return 'Biometria';
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            Passkeys Não Suportados
          </CardTitle>
          <CardDescription>
            Seu navegador não suporta autenticação com passkeys (WebAuthn)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              Para usar passkeys, você precisa de um navegador moderno que suporte WebAuthn 
              e um dispositivo com biometria (impressão digital, reconhecimento facial) ou 
              uma chave de segurança hardware.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Fingerprint className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Chaves de Acesso (Passkeys)</h2>
          <p className="text-muted-foreground">Autenticação sem senha usando biometria do dispositivo</p>
        </div>
      </div>

      {/* Status e Informações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Status da Autenticação Biométrica
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <div>
                <p className="font-medium text-emerald-700 dark:text-emerald-300">
                  WebAuthn Suportado
                </p>
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  Seu navegador suporta passkeys
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <Fingerprint className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium text-blue-700 dark:text-blue-300">
                  {credentials.length} {credentials.length === 1 ? 'Dispositivo' : 'Dispositivos'}
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Configurados para acesso
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Registrar Novo Passkey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Registrar Novo Dispositivo
          </CardTitle>
          <CardDescription>
            Configure a biometria de um novo dispositivo para login sem senha
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Nome do Dispositivo</Label>
            <Input
              id="device-name"
              placeholder="Ex: iPhone pessoal, MacBook do trabalho..."
              value={newDeviceName}
              onChange={(e) => setNewDeviceName(e.target.value)}
            />
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Como funciona:</strong> Ao clicar em "Registrar", você será solicitado 
              a usar a biometria do seu dispositivo (impressão digital, Face ID, etc.) 
              para criar uma chave de acesso segura.
            </p>
          </div>
          
          <Button
            onClick={handleRegisterPasskey}
            disabled={!newDeviceName.trim() || isRegistering || loading}
            className="w-full"
          >
            {isRegistering ? (
              "Aguarde a confirmação biométrica..."
            ) : (
              <>
                <Fingerprint className="mr-2 h-4 w-4" />
                Registrar Dispositivo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Dispositivos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Dispositivos Autorizados
          </CardTitle>
          <CardDescription>
            Gerencie os dispositivos que podem acessar sua conta sem senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {credentials.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Fingerprint className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum dispositivo configurado</p>
              <p className="text-sm">Configure a biometria para login mais rápido e seguro</p>
            </div>
          ) : (
            <div className="space-y-3">
              {credentials.map((credential) => (
                <div key={credential.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getDeviceIcon(credential.device_type)}
                    <div>
                      <h4 className="font-medium">{credential.device_name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {getDeviceTypeLabel(credential.device_type)}
                        </Badge>
                        {credential.last_used_at && (
                          <span className="text-xs text-muted-foreground">
                            Último uso: {new Date(credential.last_used_at).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Registrado em {new Date(credential.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remover Dispositivo</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja remover "{credential.device_name}"? 
                          Este dispositivo não poderá mais fazer login com biometria.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeCredential(credential.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remover
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testar Autenticação */}
      {credentials.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Testar Autenticação</CardTitle>
            <CardDescription>
              Teste se a autenticação biométrica está funcionando corretamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={authenticateWithPasskey}
              disabled={loading}
              variant="outline"
              className="w-full"
            >
              <Fingerprint className="mr-2 h-4 w-4" />
              Testar Autenticação Biométrica
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};