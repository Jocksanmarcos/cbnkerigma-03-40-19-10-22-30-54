import { Button } from '@/components/ui/button';
import { Download, RefreshCw, Plus } from 'lucide-react';

interface MissoesHeaderProps {
  missoesCount: number;
  onExportarRelatorio: () => void;
  onRefresh: () => void;
  onNovaMissao: () => void;
  isLoading?: boolean;
}

export const MissoesHeader = ({ 
  missoesCount, 
  onExportarRelatorio, 
  onRefresh, 
  onNovaMissao,
  isLoading 
}: MissoesHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold gradient-text">
          Gestão de Missões
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-2">
          Painel consolidado das missões da CBN Kerigma
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
        <Button 
          size="default" 
          onClick={onNovaMissao}
          className="w-full sm:w-auto px-6 py-3 text-base"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nova Missão
        </Button>
        <Button 
          variant="outline" 
          size="default" 
          onClick={onRefresh}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-3 text-base"
        >
          <RefreshCw className={`h-5 w-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
        <Button 
          variant="outline" 
          size="default" 
          onClick={onExportarRelatorio}
          className="w-full sm:w-auto px-6 py-3 text-base"
        >
          <Download className="h-5 w-5 mr-2" />
          Exportar Relatório
        </Button>
      </div>
    </div>
  );
};