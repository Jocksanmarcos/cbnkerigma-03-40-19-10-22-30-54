import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Download, Trash2, Shield, FileText, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { usePrivacyConsent } from '@/hooks/usePrivacyConsent';

export const PrivacyPortal: React.FC = () => {
  const {
    consents,
    dataRequests,
    loading,
    updateConsent,
    requestDataExport,
    requestDataDeletion,
    getConsentStatus
  } = usePrivacyConsent();

  const [deletionConfirm, setDeletionConfirm] = useState('');

  const consentTypes = [
    {
      id: 'marketing',
      label: 'Marketing e Comunicações',
      description: 'Receber emails sobre eventos, novidades e campanhas da igreja.'
    },
    {
      id: 'analytics',
      label: 'Análise e Melhorias',
      description: 'Permitir análise do uso da plataforma para melhorias.'
    },
    {
      id: 'notifications',
      label: 'Notificações Push',
      description: 'Receber notificações no navegador sobre atividades.'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'processing':
        return 'Processando';
      case 'rejected':
        return 'Rejeitada';
      default:
        return 'Pendente';
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case 'export':
        return 'Exportação de Dados';
      case 'deletion':
        return 'Exclusão de Dados';
      case 'rectification':
        return 'Correção de Dados';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Portal de Privacidade</h2>
          <p className="text-muted-foreground">Gerencie seus dados e consentimentos conforme a LGPD</p>
        </div>
      </div>

      {/* Gerenciamento de Consentimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Gerenciamento de Consentimento
          </CardTitle>
          <CardDescription>
            Controle como seus dados são utilizados pela plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {consentTypes.map((type) => (
            <div key={type.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{type.label}</h4>
                <p className="text-sm text-muted-foreground">{type.description}</p>
              </div>
              <Switch
                checked={getConsentStatus(type.id)}
                onCheckedChange={(checked) => updateConsent(type.id, checked)}
                disabled={loading}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Exportar Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Exportar Meus Dados
          </CardTitle>
          <CardDescription>
            Receba uma cópia de todos os seus dados pessoais em formato JSON
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 p-4 rounded-lg mb-4">
            <p className="text-sm text-muted-foreground">
              Ao solicitar a exportação, você receberá um email com um link para download 
              contendo todos os seus dados pessoais em até 48 horas úteis.
            </p>
          </div>
          <Button
            onClick={requestDataExport}
            disabled={loading}
            className="w-full"
          >
            <Download className="mr-2 h-4 w-4" />
            Solicitar Exportação de Dados
          </Button>
        </CardContent>
      </Card>

      {/* Exclusão de Conta */}
      <Card className="border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Trash2 className="h-5 w-5" />
            Solicitar Exclusão da Conta
          </CardTitle>
          <CardDescription>
            Remova permanentemente seus dados da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Atenção: Esta ação é irreversível!
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  Todos os seus dados pessoais serão anonimizados e você perderá acesso 
                  à plataforma. Esta operação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="mr-2 h-4 w-4" />
                Solicitar Exclusão da Conta
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar Exclusão de Dados</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação irá anonimizar permanentemente todos os seus dados pessoais.
                  Você não poderá mais acessar a plataforma com esta conta.
                  <br /><br />
                  <strong>Esta operação é irreversível e será processada em até 30 dias.</strong>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={requestDataDeletion}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Confirmar Exclusão
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Histórico de Solicitações */}
      {dataRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Histórico de Solicitações
            </CardTitle>
            <CardDescription>
              Acompanhe o status das suas solicitações de dados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dataRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <p className="font-medium">{getRequestTypeLabel(request.request_type)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(request.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                    {getStatusLabel(request.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};