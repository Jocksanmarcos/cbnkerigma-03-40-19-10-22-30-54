import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download,
  Upload,
  HardDrive,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Database,
  FileArchive,
  RotateCcw
} from 'lucide-react';

export const BackupManager = () => {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);

  const backups = [
    {
      id: '1',
      name: 'Backup Automático',
      date: new Date().toLocaleDateString(),
      time: '03:00',
      size: '2.4 GB',
      type: 'automatic',
      status: 'completed',
      includes: ['Database', 'Files', 'Configurations']
    },
    {
      id: '2',
      name: 'Backup Manual - Pré Atualização',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString(),
      time: '14:30',
      size: '2.3 GB',
      type: 'manual',
      status: 'completed',
      includes: ['Database', 'Files']
    },
    {
      id: '3',
      name: 'Backup Semanal',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      time: '02:00',
      size: '2.2 GB',
      type: 'scheduled',
      status: 'completed',
      includes: ['Database', 'Files', 'Configurations']
    }
  ];

  const handleCreateBackup = () => {
    setIsCreatingBackup(true);
    setBackupProgress(0);
    
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCreatingBackup(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleRestore = (backupId: string) => {
    setIsRestoring(true);
    setTimeout(() => {
      setIsRestoring(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Sistema de Backup</h2>
          <p className="text-muted-foreground">
            Gerencie backups automáticos e pontos de restauração
          </p>
        </div>
        <Button 
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="flex items-center gap-2"
        >
          {isCreatingBackup ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          {isCreatingBackup ? 'Criando...' : 'Criar Backup'}
        </Button>
      </div>

      {isCreatingBackup && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>Criando backup do sistema... {backupProgress}%</p>
              <Progress value={backupProgress} className="w-full" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="backups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="backups">Backups Disponíveis</TabsTrigger>
          <TabsTrigger value="schedule">Agendamentos</TabsTrigger>
          <TabsTrigger value="storage">Armazenamento</TabsTrigger>
          <TabsTrigger value="settings">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="backups">
          <div className="space-y-4">
            {backups.map((backup) => (
              <Card key={backup.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <FileArchive className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{backup.name}</h3>
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {backup.date} às {backup.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <HardDrive className="h-4 w-4" />
                          {backup.size}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {backup.includes.map((item) => (
                          <Badge key={item} variant="outline" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleRestore(backup.id)}
                        disabled={isRestoring}
                        className="flex items-center gap-2"
                      >
                        {isRestoring ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <RotateCcw className="h-4 w-4" />
                        )}
                        Restaurar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos Automáticos</CardTitle>
              <CardDescription>
                Configure quando e como os backups serão executados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Backup Diário</p>
                      <p className="text-sm text-muted-foreground">Todos os dias às 03:00</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">Backup Semanal</p>
                      <p className="text-sm text-muted-foreground">Domingos às 02:00</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Backup Antes de Atualizações</p>
                      <p className="text-sm text-muted-foreground">Automático antes de mudanças</p>
                    </div>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso do Armazenamento</CardTitle>
                <CardDescription>
                  Espaço utilizado pelos backups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usado</span>
                      <span>7.2 GB de 50 GB</span>
                    </div>
                    <Progress value={14.4} className="w-full" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Backups Locais</p>
                      <p className="font-semibold">4.8 GB</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Backup na Nuvem</p>
                      <p className="font-semibold">2.4 GB</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retenção de Backups</CardTitle>
                <CardDescription>
                  Política de armazenamento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Backups Diários</span>
                    <span className="text-sm font-medium">30 dias</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Backups Semanais</span>
                    <span className="text-sm font-medium">12 semanas</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Backups Mensais</span>
                    <span className="text-sm font-medium">12 meses</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Backups Anuais</span>
                    <span className="text-sm font-medium">5 anos</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Backup</CardTitle>
              <CardDescription>
                Personalize as configurações do sistema de backup
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Componentes do Backup</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Base de dados completa</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Arquivos de mídia</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Configurações do sistema</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Logs do sistema</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Notificações</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Notificar quando backup for concluído</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Alertar sobre falhas no backup</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Relatório semanal de status</span>
                    </label>
                  </div>
                </div>

                <Button className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};