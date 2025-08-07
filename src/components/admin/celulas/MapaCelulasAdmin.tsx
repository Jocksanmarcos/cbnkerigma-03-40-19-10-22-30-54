import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink } from "lucide-react";
import MapaCelulas from "@/components/MapaCelulas";

export const MapaCelulasAdmin = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Mapa de Células</h3>
        <Button asChild variant="outline">
          <a href="/celulas" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-2" />
            Ver Página Pública
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Visualização Geográfica das Células
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="min-h-[600px]">
            <MapaCelulas />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Dicas de Uso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Clique nos marcadores para ver detalhes da célula</p>
            <p>• Use os filtros para encontrar células específicas</p>
            <p>• O mapa ajuda a identificar áreas com potencial para novas células</p>
            <p>• Verifique a distribuição geográfica para planejamento estratégico</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Funcionalidades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Visualização por rede/ministério</p>
            <p>• Filtros por dia da semana</p>
            <p>• Status das células (ativa, pausada, etc.)</p>
            <p>• Informações de contato direto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planejamento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Identifique bairros sem cobertura</p>
            <p>• Analise concentração de células</p>
            <p>• Planeje multiplicações estratégicas</p>
            <p>• Otimize rotas de supervisão</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};