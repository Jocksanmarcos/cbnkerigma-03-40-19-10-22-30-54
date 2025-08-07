import { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Congregacao {
  id: string;
  nome: string;
  tipo: string;
  slug: string;
}

export function CongregacaoSelector() {
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [selectedCongregacao, setSelectedCongregacao] = useState<string>('');
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin) {
      fetchCongregacoes();
    }
  }, [isAdmin]);

  const fetchCongregacoes = async () => {
    try {
      const { data, error } = await supabase
        .from('congregacoes')
        .select('id, nome, tipo, slug')
        .eq('ativa', true)
        .order('nome');

      if (error) throw error;
      setCongregacoes(data || []);
      
      // Set sede as default if available
      const sede = data?.find(c => c.tipo === 'Sede');
      if (sede) {
        setSelectedCongregacao(sede.id);
      }
    } catch (error) {
      console.error('Erro ao buscar congregações:', error);
    }
  };

  const handleCongregacaoChange = (congregacaoId: string) => {
    setSelectedCongregacao(congregacaoId);
    // Here you would update the global congregation context
    localStorage.setItem('selectedCongregacao', congregacaoId);
  };

  if (!isAdmin || congregacoes.length <= 1) {
    return null;
  }

  const selectedCong = congregacoes.find(c => c.id === selectedCongregacao);

  return (
    <div className="flex items-center gap-2">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedCongregacao} onValueChange={handleCongregacaoChange}>
        <SelectTrigger className="w-48 h-8 text-xs">
          <SelectValue placeholder="Selecionar congregação">
            <div className="flex items-center gap-2">
              <span className="truncate">{selectedCong?.nome}</span>
              {selectedCong?.tipo === 'Sede' && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  Sede
                </Badge>
              )}
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {congregacoes.map((congregacao) => (
            <SelectItem key={congregacao.id} value={congregacao.id}>
              <div className="flex items-center gap-2 w-full">
                <span className="flex-1">{congregacao.nome}</span>
                {congregacao.tipo === 'Sede' && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    Sede
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}