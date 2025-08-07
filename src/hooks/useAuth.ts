import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSedeAdmin, setIsSedeAdmin] = useState(false);
  const [isPastorMissao, setIsPastorMissao] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  const { toast } = useToast();

  // Otimizado: cache das verificações de permissão para evitar requisições desnecessárias
  const [permissionsCache, setPermissionsCache] = useState<{[key: string]: {
    isAdmin: boolean;
    isSedeAdmin: boolean;
    isPastorMissao: boolean;
    timestamp: number;
  }}>({});

  const checkAdminPermissions = async (userId: string, forceRefresh = false) => {
    try {
      // Verificar cache (válido por 5 minutos)
      const cached = permissionsCache[userId];
      const cacheValid = cached && (Date.now() - cached.timestamp < 5 * 60 * 1000);
      
      if (!forceRefresh && cacheValid) {
        setIsAdmin(cached.isAdmin);
        setIsSedeAdmin(cached.isSedeAdmin);
        setIsPastorMissao(cached.isPastorMissao);
        setAdminCheckDone(true);
        return cached.isAdmin;
      }

      // Verificar usando a nova função consolidada is_admin_user
      const [newAdminResult, sedeResult, pastorResult] = await Promise.all([
        supabase.rpc("is_admin_user"),
        supabase.rpc("is_sede_admin", { uid: userId }),
        supabase.rpc("is_pastor_missao", { uid: userId })
      ]);

      const isUserAdmin = !newAdminResult.error && !!newAdminResult.data;
      const isUserSedeAdmin = !sedeResult.error && !!sedeResult.data;
      const isUserPastorMissao = !pastorResult.error && !!pastorResult.data;

      // Atualizar estados
      setIsAdmin(isUserAdmin || isUserPastorMissao);
      setIsSedeAdmin(isUserSedeAdmin);
      setIsPastorMissao(isUserPastorMissao);
      setAdminCheckDone(true);

      // Atualizar cache
      setPermissionsCache(prev => ({
        ...prev,
        [userId]: {
          isAdmin: isUserAdmin,
          isSedeAdmin: isUserSedeAdmin,
          isPastorMissao: isUserPastorMissao,
          timestamp: Date.now()
        }
      }));
      
      return isUserAdmin || isUserPastorMissao;
    } catch (error) {
      console.error('Erro ao verificar permissões admin:', error);
      setIsAdmin(false);
      setIsSedeAdmin(false);
      setIsPastorMissao(false);
      setAdminCheckDone(true);
      return false;
    }
  };

  useEffect(() => {
    let isMounted = true;
    let adminCheckInProgress = false;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!isMounted) return;
        
        console.log('Auth state change:', event, session ? `User: ${session.user?.id}` : 'No session');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Reset admin check when user changes or logs out
        if (event === 'SIGNED_OUT' || !session?.user) {
          setIsAdmin(false);
          setIsSedeAdmin(false);
          setIsPastorMissao(false);
          setAdminCheckDone(true);
        } else if (session?.user && event !== 'TOKEN_REFRESHED') {
          // Check admin permissions for sign in events
          setAdminCheckDone(false);
          if (!adminCheckInProgress) {
            adminCheckInProgress = true;
            checkAdminPermissions(session.user.id).finally(() => {
              adminCheckInProgress = false;
            });
          }
        }
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        console.log('Initial session check:', session ? `User: ${session.user?.id}` : 'No session', error ? `Error: ${error.message}` : '');
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user && !adminCheckInProgress) {
          setAdminCheckDone(false);
          adminCheckInProgress = true;
          checkAdminPermissions(session.user.id).finally(() => {
            adminCheckInProgress = false;
          });
        } else {
          setAdminCheckDone(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
        setAdminCheckDone(true);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, redirectPath?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: "Credenciais inválidas",
            description: "Email ou senha incorretos.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive"
          });
        }
        return { error };
      }

      // Check admin status immediately after login
      if (data.user) {
        const isUserAdmin = await checkAdminPermissions(data.user.id);
        
        toast({
          title: "Login realizado!",
          description: "Escolha onde deseja ir ou será redirecionado automaticamente.",
        });

        // Return success with user info but no automatic redirect
        return { 
          error: null, 
          isAdmin: isUserAdmin, 
          user: data.user,
          showRedirectChoice: true 
        };
      }

      toast({
        title: "Login realizado!",
        description: "Bem-vindo de volta!",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome?: string) => {
    try {
      setLoading(true);
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: nome ? { nome } : undefined
        }
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            title: "Usuário já cadastrado",
            description: "Este email já está registrado. Tente fazer login.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro no cadastro",
            description: error.message,
            variant: "destructive"
          });
        }
        return { error };
      }

      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro no cadastro",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Erro ao sair",
          description: error.message,
          variant: "destructive"
        });
        return { error };
      }

      setIsAdmin(false);
      setIsSedeAdmin(false);
      setIsPastorMissao(false);
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive"
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    session,
    loading,
    isAdmin,
    isSedeAdmin,
    isPastorMissao,
    adminCheckDone,
    signIn,
    signUp,
    signOut,
    isAuthenticated: !!user,
    checkAdminPermissions: () => user && adminCheckDone ? Promise.resolve(isAdmin) : Promise.resolve(false),
  };
};