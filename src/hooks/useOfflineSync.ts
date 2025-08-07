import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OfflineSyncState {
  isOnline: boolean;
  pendingSync: boolean;
  lastSyncTime: Date | null;
  offlineData: any[];
}

export const useOfflineSync = () => {
  const { toast } = useToast();
  const [syncState, setSyncState] = useState<OfflineSyncState>({
    isOnline: navigator.onLine,
    pendingSync: false,
    lastSyncTime: null,
    offlineData: []
  });

  useEffect(() => {
    const handleOnline = () => {
      setSyncState(prev => ({ ...prev, isOnline: true }));
      syncOfflineData();
    };

    const handleOffline = () => {
      setSyncState(prev => ({ ...prev, isOnline: false }));
      toast({
        title: "Modo Offline",
        description: "Dados serão salvos localmente e sincronizados quando conectar.",
        variant: "default"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Carregar dados offline salvos
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveOfflineData = (key: string, data: any) => {
    try {
      const offlineKey = `kerigma_offline_${key}`;
      localStorage.setItem(offlineKey, JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
        synced: false
      }));

      setSyncState(prev => ({
        ...prev,
        offlineData: [...prev.offlineData, { key, data, timestamp: new Date() }]
      }));
    } catch (error) {
      console.error('Erro ao salvar dados offline:', error);
    }
  };

  const loadOfflineData = () => {
    try {
      const offlineData: any[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('kerigma_offline_')) {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (!data.synced) {
            offlineData.push({
              key: key.replace('kerigma_offline_', ''),
              ...data
            });
          }
        }
      }
      setSyncState(prev => ({ ...prev, offlineData }));
    } catch (error) {
      console.error('Erro ao carregar dados offline:', error);
    }
  };

  const syncOfflineData = async () => {
    if (!syncState.isOnline || syncState.offlineData.length === 0) return;

    setSyncState(prev => ({ ...prev, pendingSync: true }));

    try {
      for (const item of syncState.offlineData) {
        await syncDataItem(item);
        
        // Marcar como sincronizado
        const offlineKey = `kerigma_offline_${item.key}`;
        const existingData = JSON.parse(localStorage.getItem(offlineKey) || '{}');
        localStorage.setItem(offlineKey, JSON.stringify({
          ...existingData,
          synced: true
        }));
      }

      setSyncState(prev => ({
        ...prev,
        pendingSync: false,
        lastSyncTime: new Date(),
        offlineData: []
      }));

      toast({
        title: "Sincronização Completa",
        description: "Todos os dados offline foram sincronizados com sucesso.",
      });

    } catch (error) {
      console.error('Erro na sincronização:', error);
      setSyncState(prev => ({ ...prev, pendingSync: false }));
      
      toast({
        title: "Erro na Sincronização",
        description: "Alguns dados não puderam ser sincronizados. Tentaremos novamente.",
        variant: "destructive"
      });
    }
  };

  const syncDataItem = async (item: any) => {
    const { key, data } = item;

    switch (key) {
      case 'prayer_request':
        await supabase.from('pedidos_oracao').insert(data);
        break;
      case 'contribution':
        await supabase.from('contribuicoes').insert(data);
        break;
      case 'event_attendance':
        // Usar tabela de agenda eventos existente
        await supabase.from('agenda_eventos').insert(data);
        break;
      default:
        console.warn(`Tipo de sincronização não implementado: ${key}`);
    }
  };

  const downloadOfflineContent = async () => {
    if (!syncState.isOnline) return;

    try {
      // Baixar estudos bíblicos
      const { data: estudos } = await supabase
        .from('estudos_biblicos')
        .select('*')
        .eq('ativo', true)
        .limit(10);

      if (estudos) {
        localStorage.setItem('kerigma_offline_estudos', JSON.stringify(estudos));
      }

      // Baixar agenda próximos 30 dias
      const { data: agenda } = await supabase
        .from('agenda_eventos')
        .select('*')
        .gte('data_inicio', new Date().toISOString())
        .lte('data_inicio', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString());

      if (agenda) {
        localStorage.setItem('kerigma_offline_agenda', JSON.stringify(agenda));
      }

      toast({
        title: "Conteúdo Baixado",
        description: "Conteúdo offline atualizado com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao baixar conteúdo offline:', error);
    }
  };

  return {
    ...syncState,
    saveOfflineData,
    syncOfflineData,
    downloadOfflineContent
  };
};