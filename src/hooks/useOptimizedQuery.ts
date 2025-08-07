import { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface QueryOptions<T> {
  queryKey: string;
  queryFn: () => Promise<T>;
  cacheTime?: number; // em millisegundos
  staleTime?: number; // em millisegundos
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  retry?: number;
  retryDelay?: number;
}

interface QueryState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isStale: boolean;
  lastFetch: number;
}

// Cache global para otimizar requisições
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  staleTime: number;
  cacheTime: number;
}>();

// Cleanup automático do cache
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of queryCache.entries()) {
    if (now - value.timestamp > value.cacheTime) {
      queryCache.delete(key);
    }
  }
}, 60000); // Cleanup a cada minuto

export const useOptimizedQuery = <T>({
  queryKey,
  queryFn,
  cacheTime = 5 * 60 * 1000, // 5 minutos
  staleTime = 30 * 1000, // 30 segundos
  enabled = true,
  refetchOnWindowFocus = false,
  retry = 1,
  retryDelay = 1000
}: QueryOptions<T>) => {
  const [state, setState] = useState<QueryState<T>>({
    data: null,
    loading: false,
    error: null,
    isStale: false,
    lastFetch: 0
  });

  const { toast } = useToast();
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (force = false) => {
    if (!enabled) return;

    // Verificar cache
    const cached = queryCache.get(queryKey);
    const now = Date.now();

    if (!force && cached && (now - cached.timestamp < cached.staleTime)) {
      setState(prev => ({
        ...prev,
        data: cached.data,
        loading: false,
        error: null,
        isStale: false,
        lastFetch: cached.timestamp
      }));
      return;
    }

    // Se há dados em cache mas estão stale
    if (cached && !force) {
      setState(prev => ({
        ...prev,
        data: cached.data,
        isStale: true
      }));
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const data = await queryFn();
      
      // Salvar no cache
      queryCache.set(queryKey, {
        data,
        timestamp: now,
        staleTime,
        cacheTime
      });

      setState({
        data,
        loading: false,
        error: null,
        isStale: false,
        lastFetch: now
      });

      retryCountRef.current = 0;
    } catch (error: any) {
      // Não tratar erro se foi cancelamento
      if (error.name === 'AbortError') return;

      console.error(`Erro na query ${queryKey}:`, error);

      // Implementar retry
      if (retryCountRef.current < retry) {
        retryCountRef.current++;
        setTimeout(() => {
          fetchData(force);
        }, retryDelay * retryCountRef.current);
        return;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        error: error
      }));

      toast({
        title: "Erro ao carregar dados",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive"
      });
    }
  }, [queryKey, queryFn, enabled, staleTime, cacheTime, retry, retryDelay, toast]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const invalidateQuery = useCallback(() => {
    queryCache.delete(queryKey);
    refetch();
  }, [queryKey, refetch]);

  // Fetch inicial
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch quando foco na janela
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cached = queryCache.get(queryKey);
      if (cached && Date.now() - cached.timestamp > staleTime) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [queryKey, staleTime, refetchOnWindowFocus, fetchData]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    invalidateQuery,
    isFetching: state.loading,
    isSuccess: !state.loading && !state.error && state.data !== null,
    isError: !!state.error,
    isLoading: state.loading && state.data === null
  };
};

// Hook específico para múltiplas queries
export const useOptimizedQueries = <T extends Record<string, any>>(
  queries: Array<QueryOptions<any> & { queryKey: keyof T }>
) => {
  const results = queries.map(query => 
    useOptimizedQuery(query)
  );

  const isLoading = results.some(result => result.isLoading);
  const isError = results.some(result => result.isError);
  const isSuccess = results.every(result => result.isSuccess);

  const data = queries.reduce((acc, query, index) => ({
    ...acc,
    [query.queryKey]: results[index].data
  }), {} as T);

  const refetch = () => {
    results.forEach(result => result.refetch());
  };

  return {
    data,
    isLoading,
    isError,
    isSuccess,
    refetch,
    results
  };
};

export default useOptimizedQuery;