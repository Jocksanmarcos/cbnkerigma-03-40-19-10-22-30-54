import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useNewRBAC } from '@/hooks/useNewRBAC';
import { Shield, Users, Lock, Eye, BarChart3, Activity } from 'lucide-react';

export const NewPermissionsSummary: React.FC = () => {
  const { profiles, permissions, profilePermissions, getPermissionsByModule, loading } = useNewRBAC();

  const permissionsByModule = getPermissionsByModule();

  // Calcular estatísticas
  const getProfileStats = () => {
    return profiles.map(profile => {
      const profilePerms = profilePermissions.filter(
        pp => pp.profile_id === profile.id && pp.granted
      );
      const permissionCount = profilePerms.length;
      const percentage = permissions.length > 0 ? (permissionCount / permissions.length) * 100 : 0;
      
      return {
        ...profile,
        permissionCount,
        percentage: Math.round(percentage)
      };
    }).sort((a, b) => b.percentage - a.percentage);
  };

  const getModuleStats = () => {
    return Object.entries(permissionsByModule).map(([moduleName, modulePermissions]) => {
      const assignedCount = profilePermissions.filter(pp => 
        pp.granted && modulePermissions.some(mp => mp.id === pp.permission_id)
      ).length;
      
      const maxPossible = modulePermissions.length * profiles.length;
      const coverage = maxPossible > 0 ? (assignedCount / maxPossible) * 100 : 0;
      
      return {
        moduleName,
        permissionCount: modulePermissions.length,
        assignedCount,
        coverage: Math.round(coverage)
      };
    }).sort((a, b) => b.coverage - a.coverage);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const profileStats = getProfileStats();
  const moduleStats = getModuleStats();
  const totalPermissions = permissions.length;
  const totalAssignments = profilePermissions.filter(pp => pp.granted).length;
  const averagePermissionsPerProfile = profiles.length > 0 ? Math.round(totalAssignments / profiles.length) : 0;

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{profiles.length}</p>
                <p className="text-sm text-muted-foreground">Perfis Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalPermissions}</p>
                <p className="text-sm text-muted-foreground">Permissões Totais</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{totalAssignments}</p>
                <p className="text-sm text-muted-foreground">Atribuições Ativas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{averagePermissionsPerProfile}</p>
                <p className="text-sm text-muted-foreground">Média por Perfil</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Análise por Perfil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Análise por Perfil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {profileStats.map(profile => (
              <div key={profile.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: profile.color }}
                    />
                    <span className="font-medium text-sm">{profile.display_name}</span>
                    {profile.is_system && (
                      <Badge variant="secondary" className="text-xs">Sistema</Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{profile.permissionCount}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      ({profile.percentage}%)
                    </span>
                  </div>
                </div>
                <Progress value={profile.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Análise por Módulo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Cobertura por Módulo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {moduleStats.map(module => (
              <div key={module.moduleName} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm capitalize">
                      {module.moduleName.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium">{module.assignedCount}</span>
                    <span className="text-xs text-muted-foreground ml-1">
                      de {module.permissionCount * profiles.length} possíveis
                    </span>
                  </div>
                </div>
                <Progress value={module.coverage} className="h-2" />
                <div className="text-xs text-muted-foreground">
                  {module.coverage}% de cobertura
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200">
            Recomendações de Segurança
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Revisar Permissões Regularmente</p>
              <p className="text-sm text-muted-foreground">
                Faça auditorias trimestrais das permissões para garantir que cada perfil tenha apenas o acesso necessário
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Princípio do Menor Privilégio</p>
              <p className="text-sm text-muted-foreground">
                Conceda apenas as permissões mínimas necessárias para cada função
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
            <div>
              <p className="font-medium">Monitorar Atividades Sensíveis</p>
              <p className="text-sm text-muted-foreground">
                Mantenha logs de auditoria para todas as operações que envolvem permissões sensíveis
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};