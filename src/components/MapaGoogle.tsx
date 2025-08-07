import React, { useEffect, useRef } from 'react';

// Declarar tipos globais do Google Maps
declare global {
  interface Window {
    google: typeof google;
  }
}

// Coordenadas exatas da Comunidade Batista Nacional Kerigma
// Localização precisa fornecida
const IGREJA_COORDINATES = { lat: -2.5533416156529456, lng: -44.22303780903785 };

interface MapaGoogleProps {
  apiKey: string;
}

const MapaGoogle: React.FC<MapaGoogleProps> = ({ apiKey }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
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
      };

      document.head.appendChild(script);
    };

    const initializeMap = () => {
      if (!mapRef.current) return;

      // Criar o mapa centrado na CBN Kerigma
      const map = new google.maps.Map(mapRef.current, {
        center: IGREJA_COORDINATES,
        zoom: 17, // Zoom mais próximo para destacar a localização
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      mapInstanceRef.current = map;

      // Criar marcador destacado para a CBN Kerigma
      const marker = new google.maps.Marker({
        position: IGREJA_COORDINATES,
        map: map,
        title: 'Comunidade Batista Nacional Kerigma',
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r="22" fill="hsl(var(--primary))" stroke="white" stroke-width="4"/>
              <path d="M25 10l-3 6h-6l3 3v9h-3v12h18v-12h-3v-9l3-3h-6l-3-6z" fill="white"/>
              <circle cx="25" cy="15" r="2" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(50, 50),
          anchor: new google.maps.Point(25, 25)
        },
        animation: google.maps.Animation.DROP
      });

      // Criar janela de informações destacada
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="padding: 15px; max-width: 280px; font-family: system-ui;">
            <h3 style="margin: 0 0 10px 0; font-weight: bold; font-size: 18px; color: hsl(var(--primary));">
              Comunidade Batista Nacional Kerigma
            </h3>
            <div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 6px;">
              <p style="margin: 0; color: #666; font-size: 14px; font-weight: 500;">
                📍 Estrada de Ribamar, Km 2, N.º 5<br>
                Aurora - São Luís - MA, Brasil
              </p>
            </div>
            <div style="font-size: 13px; color: #888; border-top: 1px solid #eee; padding-top: 8px; margin-top: 8px;">
              <p style="margin: 0; font-weight: 500;">🕐 Horários dos Cultos:</p>
              <p style="margin: 4px 0 0 0;">• Quinta-feira: 19h00</p>
              <p style="margin: 2px 0 0 0;">• Domingo: 8h30 e 18h00</p>
            </div>
          </div>
        `,
        maxWidth: 300
      });

      // Mostrar janela de informações ao clicar no marcador
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Mostrar a janela por padrão
      infoWindow.open(map, marker);
    };

    if (apiKey) {
      loadGoogleMaps();
    }

    // Cleanup
    return () => {
      // Remover script se necessário
      const existingScript = document.querySelector(`script[src*="maps.googleapis.com"]`);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [apiKey]);

  if (!apiKey) {
    return (
      <div className="w-full h-full bg-accent/30 rounded-lg flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-muted-foreground">API Key do Google Maps necessária</p>
          <p className="text-sm text-muted-foreground mt-2">
            Configure sua API key para visualizar o mapa
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full rounded-lg"
      style={{ minHeight: '300px' }}
    />
  );
};

export default MapaGoogle;