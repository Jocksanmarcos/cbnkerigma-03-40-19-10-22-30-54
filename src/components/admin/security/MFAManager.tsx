import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Shield, 
  QrCode, 
  Key, 
  Copy, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMFA } from '@/hooks/useMFA';
import QRCode from 'qrcode';

export const MFAManager: React.FC = () => {
  const { settings, factors, loading, enrollMFA, verifyMFA, disableMFA, regenerateBackupCodes } = useMFA();
  const { toast } = useToast();
  
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<{
    id: string;
    qr_code: string;
    secret: string;
    uri: string;
  } | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodesModalOpen, setBackupCodesModalOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  const handleEnrollMFA = async () => {
    try {
      const enrollData = await enrollMFA();
      setQrCodeData(enrollData);
      
      // Gerar QR code como imagem
      const qrUrl = await QRCode.toDataURL(enrollData.uri);
      setQrCodeUrl(qrUrl);
      
      setSetupModalOpen(true);
    } catch (error) {
      console.error('Erro ao iniciar configuração MFA:', error);
    }
  };

  const handleVerifyMFA = async () => {
    if (!qrCodeData || !verificationCode) return;

    setIsVerifying(true);
    try {
      const result = await verifyMFA(qrCodeData.id, verificationCode);
      
      if (result.success) {
        setSetupModalOpen(false);
        setQrCodeData(null);
        setVerificationCode('');
        
        // Mostrar códigos de backup
        if (result.backup_codes) {
          setBackupCodesModalOpen(true);
        }
      }
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDisableMFA = async () => {
    const verifiedFactor = factors.find(f => f.status === 'verified');
    if (!verifiedFactor) return;

    if (confirm('Tem certeza que deseja desativar a autenticação de dois fatores?')) {
      try {
        await disableMFA(verifiedFactor.id);
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  const handleRegenerateBackupCodes = async () => {
    if (confirm('Isso invalidará todos os códigos de backup atuais. Continuar?')) {
      try {
        const newCodes = await regenerateBackupCodes();
        if (newCodes) {
          setBackupCodesModalOpen(true);
        }
      } catch (error) {
        // Erro já tratado no hook
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "Texto copiado para a área de transferência"
    });
  };

  const downloadBackupCodes = () => {
    if (!settings?.backup_codes) return;

    const content = settings.backup_codes.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes-cbn-kerigma.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isEnabled = settings?.mfa_enabled && factors.some(f => f.status === 'verified');

  return (
    <div className="space-y-6">
      {/* Status Card */}
      <Card className={isEnabled ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className={`h-6 w-6 ${isEnabled ? 'text-green-600' : 'text-yellow-600'}`} />
            Autenticação de Dois Fatores (2FA)
            <Badge variant={isEnabled ? 'default' : 'secondary'}>
              {isEnabled ? 'Ativado' : 'Desativado'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta,
            exigindo um código do seu dispositivo móvel além da sua senha.
          </p>
          
          {!isEnabled ? (
            <Button onClick={handleEnrollMFA} className="w-full sm:w-auto">
              <Smartphone className="h-4 w-4 mr-2" />
              Ativar Autenticação de Dois Fatores
            </Button>
          ) : (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Sua conta está protegida com autenticação de dois fatores.
                </AlertDescription>
              </Alert>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setBackupCodesModalOpen(true)}
                >
                  <Key className="h-4 w-4 mr-2" />
                  Ver Códigos de Backup
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleRegenerateBackupCodes}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerar Códigos
                </Button>
                
                <Button
                  variant="destructive"
                  onClick={handleDisableMFA}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Desativar 2FA
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fatores Configurados */}
      {factors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Dispositivos Configurados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {factors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Smartphone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{factor.friendly_name || 'Autenticador'}</p>
                      <p className="text-sm text-muted-foreground">
                        Aplicativo TOTP (Google Authenticator, Authy, etc.)
                      </p>
                    </div>
                  </div>
                  <Badge variant={factor.status === 'verified' ? 'default' : 'secondary'}>
                    {factor.status === 'verified' ? 'Verificado' : 'Pendente'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Configuração */}
      <Dialog open={setupModalOpen} onOpenChange={setSetupModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Configurar Autenticação de Dois Fatores
            </DialogTitle>
            <DialogDescription>
              Escaneie o QR code com seu aplicativo autenticador e digite o código de verificação.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {qrCodeUrl && (
              <div className="flex justify-center">
                <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
              </div>
            )}
            
            {qrCodeData && (
              <div className="space-y-2">
                <Label>Código secreto (alternativa ao QR code):</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    value={qrCodeData.secret} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(qrCodeData.secret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Código de verificação:</Label>
              <Input
                id="verification-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Digite o código de 6 dígitos"
                maxLength={6}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyMFA}
                disabled={!verificationCode || isVerifying}
                className="flex-1"
              >
                {isVerifying ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Verificar e Ativar
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setSetupModalOpen(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Códigos de Backup */}
      <Dialog open={backupCodesModalOpen} onOpenChange={setBackupCodesModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Códigos de Backup
            </DialogTitle>
            <DialogDescription>
              Guarde estes códigos em local seguro. Você pode usá-los para acessar sua conta 
              se perder acesso ao seu dispositivo autenticador.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>IMPORTANTE:</strong> Cada código só pode ser usado uma vez. 
                Salve-os em local seguro e offline.
              </AlertDescription>
            </Alert>
            
            {settings?.backup_codes && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
                  {settings.backup_codes.map((code, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span>{code}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={downloadBackupCodes}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Códigos
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(settings.backup_codes.join('\n'))}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Todos
                  </Button>
                </div>
              </div>
            )}
            
            <Button 
              onClick={() => setBackupCodesModalOpen(false)}
              className="w-full"
            >
              Entendi, salvei os códigos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};