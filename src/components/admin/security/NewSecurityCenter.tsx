import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, Activity, Lock, Eye, UserCheck, AlertTriangle } from 'lucide-react';
import { NewRBACManager } from './NewRBACManager';
import { AuthSessionManager } from './AuthSessionManager';
import { AuditTrail } from './AuditTrail';
import { NewSecurityDashboard } from './NewSecurityDashboard';
import { useNewRBAC } from '@/hooks/useNewRBAC';

export const NewSecurityCenter: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { profiles, userPermissions, loading } = useNewRBAC();

  const securityStats = {
    totalUsers: 142,
    activeProfiles: profiles.length,
    activeSessions: 23,
    auditEntries: 1847,
    lastAuditEntry: '2 minutos atrás',
    criticalAlerts: 0,
    activeUsers: 142,
    securityScore: 98,
    lastAuditCheck: new Date().toISOString(),
    totalPermissions: userPermissions.length,
    alertsCount: 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Central de Segurança
            </h1>
            <p className="text-muted-foreground text-lg">
              Sistema RBAC Profissional · Controle Granular de Acesso · Auditoria
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{securityStats.totalUsers}</p>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Usuários Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                  <UserCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{securityStats.activeProfiles}</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">Perfis Configurados</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{securityStats.activeSessions}</p>
                  <p className="text-sm text-purple-600 dark:text-purple-400">Sessões Ativas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700 dark:text-green-300">{securityStats.securityScore}%</p>
                  <p className="text-sm text-green-600 dark:text-green-400">Score Segurança</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-14 p-1 bg-muted/50 rounded-xl">
          <TabsTrigger 
            value="dashboard" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Eye className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="rbac" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Shield className="h-4 w-4" />
            Perfis & Permissões
          </TabsTrigger>
          <TabsTrigger 
            value="sessions" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Lock className="h-4 w-4" />
            Autenticação & Sessões
          </TabsTrigger>
          <TabsTrigger 
            value="audit" 
            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Activity className="h-4 w-4" />
            Trilha de Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <NewSecurityDashboard stats={securityStats} />
        </TabsContent>

        <TabsContent value="rbac" className="space-y-6">
          <NewRBACManager />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <AuthSessionManager />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AuditTrail />
        </TabsContent>
      </Tabs>
    </div>
  );
};