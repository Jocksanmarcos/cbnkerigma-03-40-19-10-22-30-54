import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Celula {
  id: string;
  nome: string;
  lider: string;
  endereco: string;
  bairro: string;
  dia_semana: string;
  horario: string;
  telefone?: string;
  descricao?: string;
  latitude?: number;
  longitude?: number;
  membros_atual: number;
  membros_maximo: number;
  ativa: boolean;
}

export const useCelulas = () => {
  const [celulas, setCelulas] = useState<Celula[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCelulas = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('celulas')
        .select('*')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;

      setCelulas(data || []);
    } catch (err) {
      console.error('Erro ao buscar células:', err);
      setError('Erro ao carregar células');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCelulas();
  }, []);

  return {
    celulas,
    isLoading,
    error,
    refetch: fetchCelulas
  };
};