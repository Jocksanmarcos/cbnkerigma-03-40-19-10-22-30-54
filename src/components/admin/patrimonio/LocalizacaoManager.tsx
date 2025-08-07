import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MapPin, Package, Search } from 'lucide-react';
import { Patrimonio } from '@/hooks/usePatrimonio';

interface LocalizacaoManagerProps {
  patrimonios: Patrimonio[];
}

export const LocalizacaoManager = ({ patrimonios }: LocalizacaoManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Agrupar patrimônios por localização
  const patrimoniosPorLocalizacao = patrimonios.reduce((acc, patrimonio) => {
    const localizacao = patrimonio.localizacao_atual || 'Não informado';
    if (!acc[localizacao]) {
      acc[localizacao] = [];
    }
    acc[localizacao].push(patrimonio);
    return acc;
  }, {} as Record<string, Patrimonio[]>);

  // Filtrar por termo de busca
  const localizacoesFiltradas = Object.entries(patrimoniosPorLocalizacao)
    .filter(([localizacao, items]) => {
      const matchesLocation = localizacao.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesItem = items.some(item => 
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.codigo_patrimonio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      return matchesLocation || matchesItem;
    })
    .sort(([a], [b]) => a.localeCompare(b));

  const getStatusColor = (status: string) => {
    const colors = {
      em_uso: 'bg-green-100 text-green-800',
      em_manutencao: 'bg-red-100 text-red-800',
      emprestado: 'bg-blue-100 text-blue-800',
      encostado: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getEstadoColor = (estado: string) => {
    const colors = {
      novo: 'bg-green-100 text-green-800',
      bom: 'bg-blue-100 text-blue-800',
      usado: 'bg-yellow-100 text-yellow-800',
      danificado: 'bg-orange-100 text-orange-800',
      inservivel: 'bg-red-100 text-red-800'
    };
    return colors[estado as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <h3 className="text-2xl font-bold">Mapa de Localização</h3>
        <p className="text-muted-foreground">
          Visualize a localização física dos patrimônios
        </p>
      </div>

      {/* Busca */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por localização ou patrimônio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas por Localização */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Localizações</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(patrimoniosPorLocalizacao).length}</div>
            <p className="text-xs text-muted-foreground">
              Diferentes locais identificados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maior Concentração</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...Object.values(patrimoniosPorLocalizacao).map(items => items.length))}
            </div>
            <p className="text-xs text-muted-foreground">
              Itens no local com mais patrimônios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sem Localização</CardTitle>
            <MapPin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {patrimoniosPorLocalizacao['Não informado']?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Patrimônios sem localização definida
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Localizações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {localizacoesFiltradas.map(([localizacao, items]) => (
          <Card key={localizacao}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                {localizacao}
                <Badge variant="secondary" className="ml-auto">
                  {items.length} {items.length === 1 ? 'item' : 'itens'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((patrimonio) => (
                  <div key={patrimonio.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{patrimonio.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {patrimonio.codigo_patrimonio} • {patrimonio.categoria?.nome}
                      </div>
                      {patrimonio.ministerio_relacionado && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Ministério: {patrimonio.ministerio_relacionado}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge className={getStatusColor(patrimonio.status)}>
                        {patrimonio.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getEstadoColor(patrimonio.estado_conservacao)} variant="outline">
                        {patrimonio.estado_conservacao}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {localizacoesFiltradas.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhuma localização encontrada com os critérios de busca.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};