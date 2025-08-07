import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import { useCelulas, type Celula } from "@/hooks/useCelulas";
import { useGoogleMaps } from "@/hooks/useGoogleMaps";
import { useToast } from "@/hooks/use-toast";

// Declarar tipos globais do Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

interface CelulaWithCoords extends Celula {
  latitude?: number;
  longitude?: number;
}

// Função para geocodificar endereços usando Google Maps
const geocodeAddress = async (endereco: string, bairro: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    if (!window.google?.maps?.Geocoder) return null;
    
    const geocoder = new window.google.maps.Geocoder();
    const address = `${endereco}, ${bairro}, São Luís, MA, Brasil`;
    
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
};

const MapaCelulasGoogle = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<google.maps.Map | null>(null);
  const [selectedCelula, setSelectedCelula] = useState<CelulaWithCoords | null>(null);
  const [celulasWithCoords, setCelulasWithCoords] = useState<CelulaWithCoords[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { celulas, isLoading } = useCelulas();
  const { apiKey, isLoading: isLoadingApiKey, error: apiKeyError } = useGoogleMaps();
  const { toast } = useToast();

  // Geocodificar endereços das células
  useEffect(() => {
    const geocodeCelulas = async () => {
      if (!celulas.length || !apiKey) return;
      
      setIsGeocoding(true);

      const celulasComCoordenadas = await Promise.all(
        celulas.map(async (celula) => {
          // Se já tem coordenadas válidas, usar elas
          if (celula.latitude && celula.longitude && 
              typeof celula.latitude === 'number' && typeof celula.longitude === 'number') {
            console.log(`Usando coordenadas existentes para ${celula.nome}:`, celula.latitude, celula.longitude);
            return { 
              ...celula, 
              latitude: Number(celula.latitude), 
              longitude: Number(celula.longitude) 
            };
          }

          // Caso contrário, geocodificar
          console.log(`Geocodificando ${celula.nome}: ${celula.endereco}, ${celula.bairro}`);
          const coords = await geocodeAddress(celula.endereco, celula.bairro);
          
          if (coords) {
            console.log(`Coordenadas geocodificadas para ${celula.nome}:`, coords.lat, coords.lng);
          }
          
          return {
            ...celula,
            latitude: coords?.lat,
            longitude: coords?.lng
          };
        })
      );

      const celulasValidas = celulasComCoordenadas.filter(c => {
        const temCoords = c.latitude && c.longitude;
        if (!temCoords) {
          console.warn(`Célula ${c.nome} não tem coordenadas válidas`);
        }
        return temCoords;
      });

      console.log(`Total de células com coordenadas válidas: ${celulasValidas.length}`);
      setCelulasWithCoords(celulasValidas);
      setIsGeocoding(false);
    };

    geocodeCelulas();
  }, [celulas, apiKey]);

  useEffect(() => {
    if (!mapContainer.current || !celulasWithCoords.length || !apiKey) return;

    const loadGoogleMaps = async () => {
      // Se o Google Maps já está carregado, não carregar novamente
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      // Carregar o Google Maps dinamicamente
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        initializeMap();
      };

      script.onerror = () => {
        console.error('Erro ao carregar Google Maps');
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar o Google Maps"
        });
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapContainer.current) return;

      console.log('Inicializando mapa com células:', celulasWithCoords.length);

      // Criar o mapa centrado em São Luís
      map.current = new google.maps.Map(mapContainer.current, {
        center: { lat: -2.5298, lng: -44.3028 }, // Centro de São Luís
        zoom: 11,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
      });

      // Adicionar marcadores para cada célula
      const bounds = new google.maps.LatLngBounds();
      let markersAdded = 0;

      celulasWithCoords.forEach((celula) => {
        if (!celula.latitude || !celula.longitude) {
          console.warn(`Célula ${celula.nome} sem coordenadas válidas`);
          return;
        }

        console.log(`Adicionando marcador para ${celula.nome} em:`, celula.latitude, celula.longitude);

        const position = { lat: Number(celula.latitude), lng: Number(celula.longitude) };
        
        const marker = new google.maps.Marker({
          position: position,
          map: map.current!,
          title: celula.nome,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="#3b82f6" stroke="white" stroke-width="3"/>
                <path d="M20 8l-2 4h-4l2 2v6h-2v8h12v-8h-2v-6l2-2h-4l-2-4z" fill="white"/>
                <circle cx="20" cy="12" r="1.5" fill="white"/>
              </svg>
            `),
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 40)
          },
          animation: google.maps.Animation.DROP
        });

        // Adicionar posição aos bounds
        bounds.extend(position);
        markersAdded++;

        // Adicionar evento de clique no marcador
        marker.addListener('click', () => {
          console.log(`Marcador clicado: ${celula.nome}`);
          setSelectedCelula(celula);
          
          // Centralizar mapa no marcador
          map.current?.panTo(position);
          map.current?.setZoom(16);
        });
      });

      console.log(`Total de marcadores adicionados: ${markersAdded}`);

      // Ajustar o zoom para mostrar todos os marcadores
      if (markersAdded > 0) {
        map.current.fitBounds(bounds);
        
        // Garantir um zoom mínimo
        const listener = google.maps.event.addListener(map.current, "idle", function() {
          if (map.current!.getZoom()! > 13) {
            map.current!.setZoom(13);
          }
          google.maps.event.removeListener(listener);
        });
      }
    };

    loadGoogleMaps();

    // Cleanup
    return () => {
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [celulasWithCoords, apiKey, toast]);

  const handleGoToMaps = (celula: CelulaWithCoords) => {
    if (!celula.latitude || !celula.longitude) {
      toast({
        variant: "destructive",
        title: "Localização não disponível",
        description: "Não foi possível encontrar a localização desta célula"
      });
      return;
    }

    const address = encodeURIComponent(`${celula.endereco}, ${celula.bairro}, São Luís, MA`);
    const coords = `${celula.latitude},${celula.longitude}`;
    
    // Detectar se é mobile para usar o app do Google Maps
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let mapsUrl;
    if (isMobile) {
      // URL para abrir no app do Google Maps
      mapsUrl = `https://maps.google.com/maps?q=${coords}&z=16`;
    } else {
      // URL para abrir no navegador
      mapsUrl = `https://www.google.com/maps/place/${address}/@${coords},16z`;
    }
    
    window.open(mapsUrl, '_blank');
  };

  const handleContact = (celula: CelulaWithCoords) => {
    toast({
      title: "Contato iniciado!",
      description: `Em breve você receberá informações sobre a ${celula.nome}.`,
    });
  };

  if (isLoading || isLoadingApiKey) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando mapa das células...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (apiKeyError) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">Erro ao carregar configuração do Google Maps</p>
              <p className="text-sm text-muted-foreground">{apiKeyError}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="w-6 h-6 text-primary" />
                <span>Localização das Células em São Luís</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isGeocoding ? (
                <div className="w-full h-96 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Localizando células...</p>
                  </div>
                </div>
              ) : (
                <div 
                  ref={mapContainer} 
                  className="w-full h-96 rounded-lg"
                  style={{ minHeight: '400px' }}
                />
              )}
            </CardContent>
          </Card>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            Clique nos marcadores para ver detalhes da célula
          </p>
        </div>

        {/* Informações da célula selecionada */}
        <div className="lg:col-span-1">
          {selectedCelula ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">{selectedCelula.nome}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedCelula.descricao && (
                  <p className="text-muted-foreground text-sm">{selectedCelula.descricao}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-primary mr-2" />
                    <span className="font-medium">{selectedCelula.lider}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 text-primary mr-2 mt-0.5" />
                    <div className="flex-1">
                      <div>{selectedCelula.endereco}</div>
                      <div className="text-muted-foreground text-xs">{selectedCelula.bairro}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-primary mr-2" />
                    <span>{selectedCelula.dia_semana} às {selectedCelula.horario}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MapPin className="w-4 h-4 text-primary mr-2" />
                    <span>{selectedCelula.membros_atual} membros</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => handleGoToMaps(selectedCelula)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Ir no Google Maps
                  </Button>
                  
                  <Button 
                    onClick={() => handleContact(selectedCelula)}
                    variant="outline"
                    className="w-full" 
                    size="sm"
                  >
                    Entrar em Contato
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Clique em um marcador no mapa para ver detalhes da célula
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapaCelulasGoogle;