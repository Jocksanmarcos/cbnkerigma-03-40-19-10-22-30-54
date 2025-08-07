import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useRBAC } from '@/hooks/useRBAC';
import { useToast } from '@/hooks/use-toast';
import { Save, Shield, Lock, Eye, Settings, Users, DollarSign, BookOpen, Calendar, MessageSquare, Home } from 'lucide-react';

const MODULE_ICONS: Record<string, React.ComponentType<any>> = {
  admin: Shield,
  financas: DollarSign,
  ensino: BookOpen,
  pessoas: Users,
  celulas: Home,
  agenda: Calendar,
  comunicacao: MessageSquare,
  dashboard: Settings,
  portal_aluno: Eye
};

const ACTION_LABELS: Record<string, string> = {
  read: 'Visualizar',
  create: 'Criar',
  update: 'Editar',
  delete: 'Excluir',
  manage: 'Gerenciar',
  export: 'Exportar',
  submit: 'Enviar'
};

interface PermissionMatrixProps {
  selectedProfileId: string | null;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({ selectedProfileId }) => {
  const { 
    profiles, 
    permissions, 
    profilePermissions, 
    profileHasPermission, 
    updateProfilePermission,
    getPermissionsByModule,
    loading 
  } = useRBAC();
  
  const { toast } = useToast();
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  const selectedProfile = profiles.find(p => p.id === selectedProfileId);
  const permissionsByModule = getPermissionsByModule();

  // Reset pending changes quando mudar de perfil
  useEffect(() => {
    setPendingChanges({});
    setHasChanges(false);
  }, [selectedProfileId]);

  const handlePermissionChange = async (permissionId: string, granted: boolean) => {
    if (!selectedProfileId) return;

    // Atualização imediata no estado local para feedback visual instantâneo
    setPendingChanges(prev => ({
      ...prev,
      [permissionId]: granted
    }));

    try {
      // Salvamento automático
      const success = await updateProfilePermission(selectedProfileId, permissionId, granted);
      
      if (success) {
        // Remove da lista de pendências após sucesso
        setPendingChanges(prev => {
          const newPending = { ...prev };
          delete newPending[permissionId];
          return newPending;
        });
        
        toast({
          title: "Permissão atualizada",
          description: `${granted ? 'Concedida' : 'Revogada'} com sucesso`,
          duration: 2000
        });
      } else {
        // Reverte em caso de erro
        setPendingChanges(prev => {
          const newPending = { ...prev };
          delete newPending[permissionId];
          return newPending;
        });
        
        toast({
          title: "Erro",
          description: "Falha ao atualizar permissão",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Reverte em caso de erro
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[permissionId];
        return newPending;
      });
      
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar",
        variant: "destructive"
      });
    }
  };

  const isPermissionGranted = (permissionId: string): boolean => {
    if (pendingChanges.hasOwnProperty(permissionId)) {
      return pendingChanges[permissionId];
    }
    return selectedProfileId ? profileHasPermission(selectedProfileId, permissionId) : false;
  };

  const isPermissionPending = (permissionId: string): boolean => {
    return pendingChanges.hasOwnProperty(permissionId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!selectedProfile) {
    return (
      <Card className="h-full min-h-[500px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              Selecione um Perfil
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Escolha um perfil na lista à esquerda para visualizar e configurar suas permissões de acesso.
              As alterações serão salvas automaticamente.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[500px]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: selectedProfile.color }}
            >
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                Permissões: {selectedProfile.display_name}
                {Object.keys(pendingChanges).length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Salvando...
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {selectedProfile.description} • Nível {selectedProfile.level}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          {selectedProfile.is_system && (
            <Badge variant="secondary" className="text-xs">
              <Lock className="h-3 w-3 mr-1" />
              Perfil do Sistema
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {Object.keys(permissionsByModule).reduce((total, module) => 
              total + permissionsByModule[module].filter(p => isPermissionGranted(p.id)).length, 0
            )} de {permissions.length} permissões ativas
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-8 max-h-[600px] overflow-y-auto">
        {Object.entries(permissionsByModule).map(([moduleName, modulePermissions]) => {
          const ModuleIcon = MODULE_ICONS[moduleName] || Settings;
          const grantedCount = modulePermissions.filter(p => isPermissionGranted(p.id)).length;
          const totalCount = modulePermissions.length;
          
          return (
            <div key={moduleName} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <ModuleIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg capitalize">
                      {moduleName.replace('_', ' ')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {grantedCount} de {totalCount} permissões ativas
                    </p>
                  </div>
                </div>
                
                <Badge 
                  variant={grantedCount === totalCount ? "default" : grantedCount > 0 ? "secondary" : "outline"}
                  className="text-xs"
                >
                  {Math.round((grantedCount / totalCount) * 100)}%
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pl-11">
                {modulePermissions.map(permission => {
                  const isGranted = isPermissionGranted(permission.id);
                  const isPending = isPermissionPending(permission.id);
                  
                  return (
                    <div 
                      key={permission.id}
                      className={`flex items-center space-x-3 p-3 border rounded-lg transition-all duration-200 ${
                        permission.is_sensitive 
                          ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20' 
                          : 'border-border bg-card hover:shadow-sm'
                      } ${isPending ? 'ring-2 ring-primary/20' : ''}`}
                    >
                      <Checkbox
                        id={permission.id}
                        checked={isGranted}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, checked as boolean)
                        }
                        disabled={selectedProfile.is_system || isPending}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={permission.id}
                          className="text-sm font-medium cursor-pointer flex items-center gap-2"
                        >
                          {ACTION_LABELS[permission.action_name] || permission.action_name}
                          {permission.resource_type && (
                            <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                              {permission.resource_type}
                            </span>
                          )}
                          {isPending && (
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                          )}
                        </label>
                        
                        {permission.description && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {permission.description}
                          </p>
                        )}
                        
                        {permission.is_sensitive && (
                          <Badge variant="outline" className="text-xs mt-2">
                            <Lock className="h-3 w-3 mr-1" />
                            Sensível
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {moduleName !== Object.keys(permissionsByModule)[Object.keys(permissionsByModule).length - 1] && (
                <Separator className="mt-6" />
              )}
            </div>
          );
        })}
        
        {Object.keys(permissionsByModule).length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium">
              Nenhuma permissão encontrada
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Configure permissões no sistema para este módulo
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};