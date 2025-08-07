import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Users, 
  Key, 
  Settings, 
  CheckCircle, 
  XCircle,
  User,
  Crown
} from 'lucide-react';
import { useRBACUnified } from '@/hooks/useRBACUnified';

export const NewRBACDashboard: React.FC = () => {
  const { 
    profiles, 
    permissions, 
    userProfile, 
    userPermissions,
    userCan,
    userCanPerform,
    isAdmin,
    getPermissionsBySubject,
    loading 
  } = useRBACUnified();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const permissionsBySubject = getPermissionsBySubject();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema RBAC Consolidado</h1>
          <p className="text-muted-foreground">
            Nova arquitetura unificada de controle de acesso baseado em funções
          </p>
        </div>
        <Badge variant={isAdmin() ? "default" : "secondary"} className="text-sm">
          {isAdmin() ? (
            <>
              <Crown className="h-4 w-4 mr-1" />
              Administrador
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-1" />
              {userProfile?.display_name || 'Usuário'}
            </>
          )}
        </Badge>
      </div>

      {/* Perfil do Usuário Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Meu Perfil de Acesso
          </CardTitle>
          <CardDescription>
            Informações sobre seu perfil atual e permissões ativas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {userProfile ? (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold"
                  style={{ backgroundColor: userProfile.color }}
                >
                  {userProfile.icon || userProfile.display_name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{userProfile.display_name}</h3>
                  <p className="text-sm text-muted-foreground">{userProfile.description}</p>
                </div>
              </div>
              <Badge variant="outline">Nível {userProfile.level}</Badge>
            </div>
          ) : (
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-muted-foreground">Nenhum perfil definido</p>
            </div>
          )}

          <div>
            <h4 className="font-medium mb-2">Suas Permissões ({userPermissions.length})</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {userPermissions.map((permission) => (
                <Badge key={permission} variant="secondary" className="justify-center">
                  {permission}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Teste de Permissões
          </CardTitle>
          <CardDescription>
            Verificação dinâmica das suas permissões no sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(permissionsBySubject).map(([subject, subjectPermissions]) => (
              <div key={subject} className="space-y-2">
                <h4 className="font-medium capitalize text-foreground">{subject}</h4>
                <div className="space-y-1">
                  {subjectPermissions.map((permission) => {
                    const hasPermission = userCanPerform(permission.subject, permission.action);
                    return (
                      <div 
                        key={permission.id} 
                        className={`flex items-center justify-between p-2 rounded text-sm ${
                          hasPermission ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                        }`}
                      >
                        <span className={hasPermission ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                          {permission.action}
                        </span>
                        {hasPermission ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perfis Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.filter(p => p.active).length}</div>
            <p className="text-xs text-muted-foreground">
              {profiles.length} perfis no total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissões</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{permissions.length}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(permissionsBySubject).length} módulos cobertos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Minhas Permissões</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userPermissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Nível de acesso {userProfile?.level || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Perfis Disponíveis */}
      {isAdmin() && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Perfis do Sistema
            </CardTitle>
            <CardDescription>
              Gerenciamento de perfis e níveis de acesso (apenas administradores)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => (
                <div 
                  key={profile.id} 
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                      style={{ backgroundColor: profile.color }}
                    >
                      {profile.icon || profile.display_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium">{profile.display_name}</h4>
                      <p className="text-xs text-muted-foreground">Nível {profile.level}</p>
                    </div>
                  </div>
                  <Badge variant={profile.active ? "default" : "secondary"}>
                    {profile.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Sistema RBAC Consolidado - Kerigma Hub v2.0
            </p>
            <p className="text-xs text-muted-foreground">
              Arquitetura unificada de controle de acesso baseado em funções
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};