import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGoogleMaps = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('google-maps-config');
        
        if (error) {
          throw error;
        }

        if (data?.apiKey) {
          setApiKey(data.apiKey);
        } else {
          setError('API Key do Google Maps não encontrada');
        }
      } catch (err) {
        console.error('Erro ao buscar API key do Google Maps:', err);
        setError('Erro ao carregar configuração do Google Maps');
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  return { apiKey, isLoading, error };
};