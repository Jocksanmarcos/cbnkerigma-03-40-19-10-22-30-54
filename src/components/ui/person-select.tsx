import { useState, useEffect, useRef } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ChevronsUpDown, User, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePessoas } from '@/hooks/usePessoas';

interface PersonSelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  returnType?: 'name' | 'id'; // Nova prop para definir o que retornar
}

export const PersonSelect = ({ 
  value, 
  onValueChange, 
  placeholder = "Selecione uma pessoa...",
  disabled = false,
  returnType = 'name' // Default para manter compatibilidade
}: PersonSelectProps) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pessoas, setPessoas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonName, setSelectedPersonName] = useState('');
  const { buscarPessoasPorNome } = usePessoas();
  const searchTimeout = useRef<NodeJS.Timeout>();

  const handleSearch = async (term: string) => {
    if (term.length < 2) {
      setPessoas([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await buscarPessoasPorNome(term);
      if (Array.isArray(result)) {
        setPessoas(result);
      } else {
        setPessoas([]);
      }
    } catch (error) {
      setPessoas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (term: string) => {
    setSearchTerm(term);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Set new timeout
    searchTimeout.current = setTimeout(() => {
      handleSearch(term);
    }, 300);
  };

  const handleSelect = (pessoa: any) => {
    const valueToReturn = returnType === 'id' ? pessoa.id : pessoa.nome_completo;
    onValueChange(valueToReturn);
    setSelectedPersonName(pessoa.nome_completo);
    setOpen(false);
    setSearchTerm('');
    setPessoas([]);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setSearchTerm('');
      setPessoas([]);
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    }
  };

  // Effect to find and set the selected person name when value changes
  useEffect(() => {
    if (value && !selectedPersonName) {
      // If we have a value but no name, we might need to fetch the person name
      // For now, we'll show a generic message
      setSelectedPersonName('');
    } else if (!value) {
      setSelectedPersonName('');
    }
  }, [value]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className={cn("truncate", !value && "text-muted-foreground")}>
              {returnType === 'name' ? (value || placeholder) : (selectedPersonName || (value ? "Pessoa selecionada" : placeholder))}
            </span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Digite o nome da pessoa..."
            value={searchTerm}
            onChange={(e) => handleInputChange(e.target.value)}
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none border-0 shadow-none focus-visible:ring-0"
            autoFocus
          />
        </div>
        
        <div className="max-h-60 overflow-y-auto">
          {searchTerm.length < 2 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Digite pelo menos 2 caracteres para buscar...
            </div>
          ) : isLoading ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Buscando...
            </div>
          ) : pessoas.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              Nenhuma pessoa encontrada.
            </div>
          ) : (
            <div className="p-1">
              {pessoas.map((pessoa) => (
                <div
                  key={pessoa.id}
                  className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  onClick={() => handleSelect(pessoa)}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                       <Check
                         className={cn(
                           "h-4 w-4",
                           (returnType === 'id' ? value === pessoa.id : value === pessoa.nome_completo) ? "opacity-100" : "opacity-0"
                         )}
                       />
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{pessoa.nome_completo}</div>
                        {pessoa.cargo_funcao && (
                          <div className="text-xs text-muted-foreground">
                            {pessoa.cargo_funcao}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {pessoa.tipo_pessoa}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};