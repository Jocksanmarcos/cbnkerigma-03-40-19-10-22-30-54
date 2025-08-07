import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type UserRole = 'membro_comum' | 'novo_convertido' | 'aluno' | 'discipulador' | 'lider_celula' | 'supervisor_regional' | 'coordenador_ensino' | 'tesoureiro' | 'secretario' | 'coordenador_agenda' | 'comunicacao' | 'administrador_geral' | 'visitante_externo';

export type ModuloSistema = 'pessoas' | 'ensino' | 'celulas' | 'financas' | 'agenda' | 'comunicacao' | 'portal_aluno' | 'dashboard_estrategico' | 'escalas' | 'galeria' | 'patrimonio' | 'missoes';

export type AcaoPermissao = 'visualizar' | 'criar' | 'editar' | 'excluir' | 'aprovar' | 'exportar' | 'gerenciar' | 'administrar';

export const useUserRole = () => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Verificar se é admin primeiro
        const { data: adminData } = await supabase
          .from('usuarios_admin')
          .select('papel')
          .eq('user_id', user.id)
          .maybeSingle();

        if (adminData) {
          setRole('administrador_geral');
          setLoading(false);
          return;
        }

        // Buscar pessoa e seu papel na igreja
        const { data: pessoa } = await supabase
          .from('pessoas')
          .select(`
            id,
            papel_igreja,
            tipo_pessoa,
            status_formacao
          `)
          .eq('email', user.email)
          .maybeSingle();

        if (pessoa && pessoa.papel_igreja) {
          setRole(pessoa.papel_igreja as UserRole);
        } else if (pessoa) {
          // Mapear papéis antigos para novos (compatibilidade)
          if (pessoa.tipo_pessoa === 'lider' && pessoa.status_formacao === 'Coordenador') {
            setRole('coordenador_ensino');
          } else if (pessoa.tipo_pessoa === 'lider' && pessoa.status_formacao === 'Supervisor') {
            setRole('supervisor_regional');
          } else if (pessoa.status_formacao === 'Discipulador') {
            setRole('discipulador');
          } else {
            setRole('aluno');
          }
        } else {
          setRole('membro_comum'); // Default role
        }
      } catch (error) {
        console.error('Erro ao buscar role do usuário:', error);
        setRole('membro_comum'); // Default em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  const hasRole = (requiredRoles: UserRole[]) => {
    return role && requiredRoles.includes(role);
  };

  // Função para verificar permissão específica
  const hasPermission = async (modulo: ModuloSistema, acao: AcaoPermissao): Promise<boolean> => {
    if (!user?.email) return false;
    
    try {
      const { data, error } = await supabase.rpc('verificar_permissao', {
        user_email: user.email,
        modulo_codigo: modulo,
        acao_desejada: acao
      });
      
      return !error && !!data;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  };

  // Mapear papéis antigos para novos (compatibilidade)
  const mapOldToNewRole = (oldRole: string): UserRole => {
    const roleMap: Record<string, UserRole> = {
      'Admin': 'administrador_geral',
      'Coordenador': 'coordenador_ensino',
      'Supervisor': 'supervisor_regional',
      'Discipulador': 'discipulador',
      'Aluno': 'aluno'
    };
    return roleMap[oldRole] || 'membro_comum';
  };

  return {
    role,
    loading,
    hasRole,
    hasPermission,
    mapOldToNewRole,
  };
};