import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserRole, ModuloSistema, AcaoPermissao } from '@/hooks/useUserRole';

interface Permission {
  id: string;
  papel_id: string;
  modulo_id: string;
  acao: AcaoPermissao;
  condicoes: any;
  ativo: boolean;
  papeis_igreja?: { codigo: string };
  modulos_sistema?: { codigo: string };
}

interface Module {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissionsData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Buscar papel do usuário
        const { data: roleData } = await supabase.rpc('obter_papel_usuario', {
          user_email: user.email
        });
        
        setUserRole(roleData);

        // Buscar módulos ativos
        const { data: modulesData } = await supabase
          .from('modulos_sistema')
          .select('*')
          .eq('ativo', true)
          .order('ordem');

        if (modulesData) {
          setModules(modulesData);
        }

        // Buscar permissões do usuário
        const { data: permissionsData, error: permissionsError } = await supabase
          .from('permissoes_sistema')
          .select(`
            *,
            papeis_igreja!inner(codigo),
            modulos_sistema!inner(codigo)
          `)
          .eq('papeis_igreja.codigo', roleData)
          .eq('ativo', true);

        if (!permissionsError && permissionsData) {
          setPermissions(permissionsData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados de permissões:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissionsData();
  }, [user]);

  // Verificar se o usuário tem permissão para um módulo e ação específicos
  const hasPermission = (modulo: ModuloSistema, acao: AcaoPermissao): boolean => {
    if (!userRole) return false;
    
    // Administrador geral tem acesso total
    if (userRole === 'administrador_geral') return true;
    
    return permissions.some(permission => 
      permission.modulos_sistema?.codigo === modulo &&
      permission.acao === acao &&
      permission.ativo
    );
  };

  // Verificar se pode visualizar um módulo
  const canViewModule = (modulo: ModuloSistema): boolean => {
    return hasPermission(modulo, 'visualizar');
  };

  // Verificar se pode criar no módulo
  const canCreate = (modulo: ModuloSistema): boolean => {
    return hasPermission(modulo, 'criar');
  };

  // Verificar se pode editar no módulo
  const canEdit = (modulo: ModuloSistema): boolean => {
    return hasPermission(modulo, 'editar');
  };

  // Verificar se pode excluir no módulo
  const canDelete = (modulo: ModuloSistema): boolean => {
    return hasPermission(modulo, 'excluir');
  };

  // Verificar se pode gerenciar módulo
  const canManage = (modulo: ModuloSistema): boolean => {
    return hasPermission(modulo, 'gerenciar');
  };

  // Obter módulos que o usuário pode acessar
  const getAccessibleModules = (): Module[] => {
    return modules.filter(module => 
      canViewModule(module.codigo as ModuloSistema)
    );
  };

  // Verificar se é administrador
  const isAdmin = (): boolean => {
    return userRole === 'administrador_geral';
  };

  // Verificar se é líder (qualquer tipo)
  const isLeader = (): boolean => {
    const leaderRoles: UserRole[] = [
      'lider_celula',
      'supervisor_regional', 
      'coordenador_ensino',
      'coordenador_agenda',
      'administrador_geral'
    ];
    return userRole ? leaderRoles.includes(userRole) : false;
  };

  // Verificar permissão com condições específicas
  const hasConditionalPermission = (
    modulo: ModuloSistema, 
    acao: AcaoPermissao, 
    conditions: Record<string, any> = {}
  ): boolean => {
    if (!hasPermission(modulo, acao)) return false;

    const permission = permissions.find(p => 
      p.modulos_sistema?.codigo === modulo && 
      p.acao === acao
    );

    if (!permission?.condicoes || Object.keys(permission.condicoes).length === 0) {
      return true; // Sem condições específicas
    }

    // Verificar se as condições são atendidas
    return Object.entries(permission.condicoes).every(([key, value]) => 
      conditions[key] === value
    );
  };

  return {
    permissions,
    modules,
    userRole,
    loading,
    hasPermission,
    canViewModule,
    canCreate,
    canEdit,
    canDelete,
    canManage,
    getAccessibleModules,
    isAdmin,
    isLeader,
    hasConditionalPermission,
  };
};