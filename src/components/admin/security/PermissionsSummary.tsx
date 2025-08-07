import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useRBAC } from '@/hooks/useRBAC';
import { Users, Shield, Lock, Activity } from 'lucide-react';

export const PermissionsSummary: React.FC = () => {
  const { profiles, permissions, profilePermissions, getPermissionsByModule } = useRBAC();
  
  const permissionsByModule = getPermissionsByModule();
  const totalPermissions = permissions.length;
  const totalProfiles = profiles.length;
  const activeProfiles = profiles.filter(p => p.active).length;
  const systemProfiles = profiles.filter(p => p.is_system).length;
  const sensitivePermissions = permissions.filter(p => p.is_sensitive).length;
  
  // Calcular estatísticas de uso
  const totalAssignments = profilePermissions.filter(pp => pp.granted).length;
  const avgPermissionsPerProfile = totalProfiles > 0 ? totalAssignments / totalProfiles : 0;
  const permissionCoverage = totalPermissions > 0 ? (totalAssignments / (totalPermissions * totalProfiles)) * 100 : 0;

  const moduleStats = Object.entries(permissionsByModule).map(([module, perms]) => ({
    name: module.replace('_', ' '),
    permissions: perms.length,
    sensitive: perms.filter(p => p.is_sensitive).length,
    coverage: perms.length > 0 ? (perms.filter(p => 
      profilePermissions.some(pp => pp.permission_id === p.id && pp.granted)
    ).length / perms.length) * 100 : 0
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Perfis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Perfis Configurados</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProfiles}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{activeProfiles} ativos</span>
            <span>•</span>
            <span>{systemProfiles} sistema</span>
          </div>
          <Progress value={(activeProfiles / totalProfiles) * 100} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* Permissões */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Permissões Totais</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPermissions}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{sensitivePermissions} sensíveis</span>
            <span>•</span>
            <span>{Object.keys(permissionsByModule).length} módulos</span>
          </div>
          <Progress value={(sensitivePermissions / totalPermissions) * 100} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* Atribuições */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Atribuições Ativas</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalAssignments}</div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{avgPermissionsPerProfile.toFixed(1)} por perfil</span>
          </div>
          <Progress value={permissionCoverage} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* Coverage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cobertura</CardTitle>
          <Lock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{permissionCoverage.toFixed(0)}%</div>
          <div className="text-xs text-muted-foreground">
            das permissões estão ativas
          </div>
          <Progress value={permissionCoverage} className="mt-2 h-1" />
        </CardContent>
      </Card>

      {/* Module Breakdown */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-lg">Distribuição por Módulo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {moduleStats.map(module => (
              <div key={module.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{module.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {module.permissions}
                  </Badge>
                </div>
                <Progress value={module.coverage} className="h-1" />
                <div className="text-xs text-muted-foreground">
                  {module.coverage.toFixed(0)}% cobertura
                  {module.sensitive > 0 && (
                    <span className="text-yellow-600 ml-2">
                      • {module.sensitive} sensível{module.sensitive > 1 ? 'is' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};