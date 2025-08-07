import { useState } from 'react';
import { useEstatisticas } from '@/hooks/useEstatisticas';
import { useCelulas } from '@/hooks/useCelulas';
import { useEventos } from '@/hooks/useEventos';
import { useEstudos } from '@/hooks/useEstudos';
import { useContatos } from '@/hooks/useContatos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  FileText, 
  MessageCircle,
  Church 
} from 'lucide-react';

export const EstatisticasManager = () => {
  const { estatisticas, updateEstatistica, loading } = useEstatisticas();
  const { celulas } = useCelulas();
  const { eventos } = useEventos();
  const { estudos } = useEstudos();
  const { contatos } = useContatos();
  
  const [valores, setValores] = useState<Record<string, string>>({});

  const handleInputChange = (chave: string, valor: string) => {
    setValores(prev => ({ ...prev, [chave]: valor }));
  };

  const handleUpdate = async (chave: string) => {
    const novoValor = valores[chave];
    if (novoValor !== undefined) {
      await updateEstatistica(chave, novoValor);
      setValores(prev => ({ ...prev, [chave]: '' }));
    }
  };

  const getContadorAtual = (chave: string) => {
    switch (chave) {
      case 'celulas_ativas':
        return celulas.length;
      case 'membros_ativos':
        // Soma dos membros de todas as células
        return celulas.reduce((total, celula) => total + celula.membros_atual, 0);
      case 'anos_ministerio':
        return new Date().getFullYear() - 2019; // Assumindo que a igreja começou em 2019
      default:
        return 0;
    }
  };

  const getIcone = (chave: string) => {
    switch (chave) {
      case 'celulas_ativas':
        return <Users className="h-5 w-5" />;
      case 'membros_ativos':
        return <Church className="h-5 w-5" />;
      case 'anos_ministerio':
        return <BarChart3 className="h-5 w-5" />;
      default:
        return <BarChart3 className="h-5 w-5" />;
    }
  };

  const getTitulo = (chave: string) => {
    switch (chave) {
      case 'celulas_ativas':
        return 'Células Ativas';
      case 'membros_ativos':
        return 'Membros Ativos';
      case 'anos_ministerio':
        return 'Anos de Ministério';
      default:
        return chave;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BarChart3 className="h-6 w-6" />
        <h2 className="text-2xl font-bold">Estatísticas da Página Inicial</h2>
      </div>

      {/* Contadores Atuais em Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle>Contadores Atuais (Dados Reais)</CardTitle>
          <CardDescription>
            Valores baseados nos dados reais do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{celulas.length}</p>
                <p className="text-sm text-muted-foreground">Células Ativas</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
              <Church className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {celulas.reduce((total, celula) => total + celula.membros_atual, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Membros Ativos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{eventos.length}</p>
                <p className="text-sm text-muted-foreground">Eventos</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-accent/50 rounded-lg">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{estudos.length}</p>
                <p className="text-sm text-muted-foreground">Estudos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Configurações dos Valores Exibidos */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Valores da Página Inicial</CardTitle>
          <CardDescription>
            Personalize os valores exibidos na seção de estatísticas da página inicial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {estatisticas.map((estatistica) => {
            const contadorAtual = getContadorAtual(estatistica.chave);
            const valorInput = valores[estatistica.chave] || '';
            
            return (
              <div key={estatistica.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getIcone(estatistica.chave)}
                    <div>
                      <h3 className="font-semibold">{getTitulo(estatistica.chave)}</h3>
                      <p className="text-sm text-muted-foreground">
                        {estatistica.descricao}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      Atual: {contadorAtual}
                    </Badge>
                    <Badge variant="secondary">
                      Exibindo: {estatistica.valor}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Label htmlFor={`valor-${estatistica.chave}`}>
                      Novo Valor
                    </Label>
                    <Input
                      id={`valor-${estatistica.chave}`}
                      placeholder={`Ex: ${contadorAtual}+`}
                      value={valorInput}
                      onChange={(e) => handleInputChange(estatistica.chave, e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={() => handleUpdate(estatistica.chave)}
                    disabled={!valorInput || loading}
                  >
                    Atualizar
                  </Button>
                </div>
                
                {estatistica !== estatisticas[estatisticas.length - 1] && (
                  <Separator className="mt-4" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};