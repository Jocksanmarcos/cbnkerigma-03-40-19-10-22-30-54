import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Capacitor } from '@capacitor/core';
import { useEscalasMinisterio, MusicaLista, ListaMusicas } from '@/hooks/useEscalasMinisterio';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  Music,
  Play,
  Pause,
  SkipForward,
  Volume2,
  FileText,
  Youtube,
  Download,
  Heart,
  Star,
  Clock,
  Users,
  Mic,
  Guitar,
  PlusCircle,
  Eye,
  ExternalLink
} from 'lucide-react';

interface ListasMusicasMobileProps {
  programacaoId?: string;
  userRole: 'member' | 'leader' | 'admin';
}

const tipoMusicaColors = {
  louvor: 'bg-blue-500',
  adoracao: 'bg-purple-500',
  entrada: 'bg-green-500',
  oferta: 'bg-yellow-500',
  saida: 'bg-orange-500',
  especial: 'bg-red-500'
};

const tipoMusicaLabels = {
  louvor: 'Louvor',
  adoracao: 'Adoração',
  entrada: 'Entrada',
  oferta: 'Oferta',
  saida: 'Saída',
  especial: 'Especial'
};

export const ListasMusicasMobile: React.FC<ListasMusicasMobileProps> = ({ 
  programacaoId, 
  userRole 
}) => {
  const { fetchListasMusicas } = useEscalasMinisterio();
  const [listas, setListas] = useState<ListaMusicas[]>([]);
  const [selectedLista, setSelectedLista] = useState<ListaMusicas | null>(null);
  const [loading, setLoading] = useState(false);

  const hapticFeedback = async (style: ImpactStyle = ImpactStyle.Light) => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style });
    }
  };

  useEffect(() => {
    if (programacaoId) {
      carregarListas();
    }
  }, [programacaoId]);

  const carregarListas = async () => {
    if (!programacaoId) return;
    
    setLoading(true);
    try {
      const data = await fetchListasMusicas(programacaoId);
      setListas(data as any);
      if (data.length > 0) {
        setSelectedLista(data[0] as any);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMusicaCard = (musica: MusicaLista, index: number) => (
    <Card key={musica.id} className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Cabeçalho da música */}
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">
                {musica.ordem}
              </span>
              <h3 className="font-semibold text-base">{musica.titulo}</h3>
              <Badge 
                className={`${tipoMusicaColors[musica.tipo]} text-white text-xs`}
              >
                {tipoMusicaLabels[musica.tipo]}
              </Badge>
            </div>

            {/* Informações da música */}
            <div className="space-y-1 text-sm text-muted-foreground">
              {musica.artista && (
                <p className="flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  {musica.artista}
                </p>
              )}
              
              <div className="flex items-center gap-4">
                {musica.tom_execucao && (
                  <span className="flex items-center gap-1">
                    <Guitar className="w-3 h-3" />
                    Tom: {musica.tom_execucao}
                    {musica.tom_original && musica.tom_original !== musica.tom_execucao && (
                      <span className="text-xs opacity-75">(orig: {musica.tom_original})</span>
                    )}
                  </span>
                )}
                
                {musica.bpm && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {musica.bpm} BPM
                  </span>
                )}
              </div>
            </div>

            {/* Observações */}
            {musica.observacoes && (
              <div className="mt-2 p-2 bg-muted rounded text-xs">
                <FileText className="w-3 h-3 inline mr-1" />
                {musica.observacoes}
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {musica.link_video && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-8"
              onClick={() => {
                hapticFeedback();
                window.open(musica.link_video, '_blank');
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Vídeo
            </Button>
          )}
          
          {musica.link_playback && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-8"
              onClick={() => {
                hapticFeedback();
                window.open(musica.link_playback, '_blank');
              }}
            >
              <Volume2 className="w-3 h-3 mr-1" />
              Playback
            </Button>
          )}
          
          {musica.link_partitura && (
            <Button 
              size="sm" 
              variant="outline"
              className="h-8"
              onClick={() => {
                hapticFeedback();
                window.open(musica.link_partitura, '_blank');
              }}
            >
              <FileText className="w-3 h-3 mr-1" />
              Partitura
            </Button>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button 
                size="sm" 
                variant="outline"
                className="h-8"
                onClick={() => hapticFeedback()}
              >
                <Eye className="w-3 h-3 mr-1" />
                Detalhes
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh]">
              <SheetHeader>
                <SheetTitle>{musica.titulo}</SheetTitle>
              </SheetHeader>
              
              <ScrollArea className="h-[60vh] mt-4">
                <div className="space-y-4">
                  {/* Informações técnicas */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Artista:</strong> {musica.artista || 'Não informado'}
                    </div>
                    <div>
                      <strong>Tipo:</strong> {tipoMusicaLabels[musica.tipo]}
                    </div>
                    <div>
                      <strong>Tom Original:</strong> {musica.tom_original || 'N/A'}
                    </div>
                    <div>
                      <strong>Tom Execução:</strong> {musica.tom_execucao || 'N/A'}
                    </div>
                    <div>
                      <strong>BPM:</strong> {musica.bpm || 'N/A'}
                    </div>
                    <div>
                      <strong>Ordem:</strong> {musica.ordem}
                    </div>
                  </div>

                  {/* Letra */}
                  {musica.letra && (
                    <div>
                      <h4 className="font-semibold mb-2">Letra:</h4>
                      <div className="bg-muted p-3 rounded whitespace-pre-wrap text-sm">
                        {musica.letra}
                      </div>
                    </div>
                  )}

                  {/* Cifra */}
                  {musica.cifra && (
                    <div>
                      <h4 className="font-semibold mb-2">Cifra:</h4>
                      <div className="bg-muted p-3 rounded whitespace-pre-wrap text-sm font-mono">
                        {musica.cifra}
                      </div>
                    </div>
                  )}

                  {/* Links */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Links:</h4>
                    <div className="flex flex-col gap-2">
                      {musica.link_video && (
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => window.open(musica.link_video, '_blank')}
                        >
                          <Youtube className="w-4 h-4 mr-2" />
                          Vídeo no YouTube
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Button>
                      )}
                      
                      {musica.link_playback && (
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => window.open(musica.link_playback, '_blank')}
                        >
                          <Volume2 className="w-4 h-4 mr-2" />
                          Playback
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Button>
                      )}
                      
                      {musica.link_partitura && (
                        <Button 
                          variant="outline" 
                          className="justify-start"
                          onClick={() => window.open(musica.link_partitura, '_blank')}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Partitura
                          <ExternalLink className="w-3 h-3 ml-auto" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Music className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Carregando listas...</p>
        </div>
      </div>
    );
  }

  if (!programacaoId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Selecione uma programação para ver as músicas.</p>
        </div>
      </div>
    );
  }

  if (listas.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma lista encontrada</h3>
          <p className="text-muted-foreground">
            Não há listas de músicas para esta programação.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seletor de lista */}
      {listas.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {listas.map((lista) => (
            <Button
              key={lista.id}
              variant={selectedLista?.id === lista.id ? "default" : "outline"}
              size="sm"
              className="min-w-fit"
              onClick={() => {
                setSelectedLista(lista);
                hapticFeedback();
              }}
            >
              {lista.nome}
            </Button>
          ))}
        </div>
      )}

      {/* Lista de músicas */}
      {selectedLista && (
        <div>
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{selectedLista.nome}</h2>
            {selectedLista.observacoes && (
              <p className="text-sm text-muted-foreground">{selectedLista.observacoes}</p>
            )}
          </div>

          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-3">
              {selectedLista.musicas?.sort((a, b) => a.ordem - b.ordem).map((musica, index) => 
                renderMusicaCard(musica, index)
              )}
              
              {(!selectedLista.musicas || selectedLista.musicas.length === 0) && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Music className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Lista vazia</h3>
                    <p className="text-muted-foreground">
                      Não há músicas nesta lista.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};