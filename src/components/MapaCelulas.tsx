import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Calendar, Clock, AlertCircle } from "lucide-react";
import { useCelulas, type Celula } from "@/hooks/useCelulas";
import { useToast } from "@/hooks/use-toast";

// Token do Mapbox
const MAPBOX_TOKEN = 'pk.eyJ1Ijoiam9ja3Nhbm1hcmNvcyIsImEiOiJjbWRqeTlsOGUwb3RkMmpxNzU3cmlzc2cxIn0.QfUVGt58y8shSzzwGv9I2A';

interface CelulaWithCoords extends Celula {
  latitude?: number;
  longitude?: number;
}

// Função para geocodificar endereços usando Mapbox
const geocodeAddress = async (endereco: string, bairro: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    const query = encodeURIComponent(`${endereco}, ${bairro}, São Luís, MA, Brasil`);
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}&limit=1&proximity=-44.3028,-2.5298&bbox=-44.4,-2.7,-44.1,-2.3`
    );
    
    if (!response.ok) {
      throw new Error('Erro na geocodificação');
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
};

const MapaCelulas = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [selectedCelula, setSelectedCelula] = useState<CelulaWithCoords | null>(null);
  const [celulasWithCoords, setCelulasWithCoords] = useState<CelulaWithCoords[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);
  const { celulas, isLoading } = useCelulas();
  const { toast } = useToast();

  // Verificar suporte WebGL
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (e) {
      return false;
    }
  };

  // Geocodificar endereços das células
  useEffect(() => {
    const geocodeCelulas = async () => {
      if (!celulas.length) return;

      const celulasComCoordenadas = await Promise.all(
        celulas.map(async (celula) => {
          // Se já tem coordenadas, usar elas
          if (celula.latitude && celula.longitude) {
            return { ...celula, latitude: Number(celula.latitude), longitude: Number(celula.longitude) };
          }

          // Caso contrário, geocodificar
          const coords = await geocodeAddress(celula.endereco, celula.bairro);
          return {
            ...celula,
            latitude: coords?.lat,
            longitude: coords?.lng
          };
        })
      );

      setCelulasWithCoords(celulasComCoordenadas.filter(c => c.latitude && c.longitude));
    };

    geocodeCelulas();
  }, [celulas]);

  useEffect(() => {
    if (!mapContainer.current || !celulasWithCoords.length) return;

    // Verificar suporte WebGL antes de inicializar
    if (!checkWebGLSupport()) {
      setIsWebGLSupported(false);
      setMapError('WebGL não é suportado neste navegador/dispositivo');
      return;
    }

    try {
      // Initialize map
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-44.3028, -2.5298], // Centro de São Luís
        zoom: 11,
        pitch: 0,
        preserveDrawingBuffer: true,
        failIfMajorPerformanceCaveat: false
      });
    } catch (error) {
      console.error('Erro ao inicializar mapa:', error);
      setMapError('Erro ao carregar o mapa. Verifique sua conexão com a internet.');
      return;
    }

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl(),
      'top-right'
    );

    // Wait for map to load before adding markers
    map.current.on('load', () => {
      // Add markers for each célula
      celulasWithCoords.forEach((celula) => {
        if (!celula.latitude || !celula.longitude) return;

        // Create marker element
        const markerElement = document.createElement('div');
        markerElement.className = 'custom-marker';
        markerElement.style.cssText = `
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-foreground)));
          border: 3px solid white;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transition: all 0.3s ease;
        `;

        const icon = document.createElement('div');
        icon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;
        markerElement.appendChild(icon);

        // Add hover effect
        markerElement.addEventListener('mouseenter', () => {
          markerElement.style.transform = 'scale(1.1)';
        });
        markerElement.addEventListener('mouseleave', () => {
          markerElement.style.transform = 'scale(1)';
        });

        // Create marker
        const marker = new mapboxgl.Marker(markerElement)
          .setLngLat([celula.longitude, celula.latitude])
          .addTo(map.current!);

        // Add click event to show célula info
        markerElement.addEventListener('click', () => {
          setSelectedCelula(celula);
          
          // Fly to the marker
          map.current?.flyTo({
            center: [celula.longitude!, celula.latitude!],
            zoom: 14,
            duration: 1000
          });
        });
      });

      // Adicionar tratamento de erro do mapa
      map.current.on('error', (e) => {
        console.error('Erro do Mapbox:', e);
        setMapError('Erro ao carregar elementos do mapa');
      });
    });

    // Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [celulasWithCoords]);

  const handleContact = (celula: CelulaWithCoords) => {
    toast({
      title: "Contato iniciado!",
      description: `Em breve você receberá informações sobre a ${celula.nome}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <p className="text-muted-foreground">Carregando mapa das células...</p>
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
              {mapError || !isWebGLSupported ? (
                <div className="w-full h-96 flex items-center justify-center bg-muted rounded-lg">
                  <div className="text-center p-8">
                    <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Mapa indisponível</h3>
                    <p className="text-muted-foreground text-sm">
                      {mapError || 'WebGL não é suportado neste dispositivo.'}
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={() => {
                        setMapError(null);
                        window.location.reload();
                      }}
                    >
                      Tentar novamente
                    </Button>
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
          {!mapError && !isWebGLSupported && (
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Clique nos pontos para ver detalhes da célula
            </p>
          )}
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
                    <Users className="w-4 h-4 text-primary mr-2" />
                    <span>{selectedCelula.lider}</span>
                  </div>
                  <div className="flex items-start text-sm">
                    <MapPin className="w-4 h-4 text-primary mr-2 mt-0.5" />
                    <div className="flex-1">
                      <div>{selectedCelula.endereco}</div>
                      <div className="text-muted-foreground text-xs">{selectedCelula.bairro}</div>
                    </div>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="w-4 h-4 text-primary mr-2" />
                    <span>{selectedCelula.dia_semana}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 text-primary mr-2" />
                    <span>{selectedCelula.horario}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 text-primary mr-2" />
                    <span>{selectedCelula.membros_atual} membros</span>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="sm"
                  onClick={() => handleContact(selectedCelula)}
                >
                  Entrar em Contato
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Clique em um ponto no mapa para ver detalhes da célula
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

export default MapaCelulas;