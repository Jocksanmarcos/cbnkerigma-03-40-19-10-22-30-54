import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Accessibility, 
  Type, 
  Eye, 
  Volume2, 
  VolumeX,
  Contrast,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AccessibilitySettings {
  fontSize: number;
  highContrast: boolean;
  darkMode: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  audioDescriptions: boolean;
  textToSpeech: boolean;
  zoomLevel: number;
  colorblindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
}

export const AccessibilityControls: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 16,
    highContrast: false,
    darkMode: false,
    reduceMotion: false,
    screenReader: false,
    audioDescriptions: false,
    textToSpeech: false,
    zoomLevel: 100,
    colorblindMode: 'none'
  });

  useEffect(() => {
    // Carregar configurações salvas
    loadSavedSettings();
  }, []);

  useEffect(() => {
    // Aplicar configurações ao DOM
    applySettings();
    
    // Salvar configurações
    saveSettings();
  }, [settings]);

  const loadSavedSettings = () => {
    try {
      const saved = localStorage.getItem('kerigma_accessibility_settings');
      if (saved) {
        setSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações de acessibilidade:', error);
    }
  };

  const saveSettings = () => {
    try {
      localStorage.setItem('kerigma_accessibility_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Erro ao salvar configurações de acessibilidade:', error);
    }
  };

  const applySettings = () => {
    const root = document.documentElement;
    
    // Aplicar tamanho da fonte
    root.style.setProperty('--font-size-base', `${settings.fontSize}px`);
    
    // Aplicar alto contraste
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    // Aplicar modo escuro
    if (settings.darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    // Aplicar redução de movimento
    if (settings.reduceMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }
    
    // Aplicar zoom
    root.style.setProperty('--zoom-level', `${settings.zoomLevel}%`);
    
    // Aplicar modo para daltonismo
    if (settings.colorblindMode !== 'none') {
      root.classList.add(`colorblind-${settings.colorblindMode}`);
    } else {
      root.classList.remove('colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia');
    }
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K, 
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    toast({
      title: "Configuração atualizada",
      description: `${getSettingLabel(key)} foi ${Array.isArray(value) ? 'ajustado' : value ? 'ativado' : 'desativado'}.`,
    });
  };

  const getSettingLabel = (key: keyof AccessibilitySettings): string => {
    const labels = {
      fontSize: 'Tamanho da fonte',
      highContrast: 'Alto contraste',
      darkMode: 'Modo escuro',
      reduceMotion: 'Reduzir animações',
      screenReader: 'Leitor de tela',
      audioDescriptions: 'Descrições de áudio',
      textToSpeech: 'Texto para fala',
      zoomLevel: 'Nível de zoom',
      colorblindMode: 'Modo para daltonismo'
    };
    return labels[key];
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 16,
      highContrast: false,
      darkMode: false,
      reduceMotion: false,
      screenReader: false,
      audioDescriptions: false,
      textToSpeech: false,
      zoomLevel: 100,
      colorblindMode: 'none'
    };
    
    setSettings(defaultSettings);
    
    toast({
      title: "Configurações restauradas",
      description: "Todas as configurações de acessibilidade foram restauradas ao padrão.",
    });
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window && settings.textToSpeech) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="h-full bg-background p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center">
          <Accessibility className="w-6 h-6 mr-2 text-primary" />
          Acessibilidade
        </h1>
        <Button 
          variant="outline" 
          size="sm"
          onClick={resetSettings}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Restaurar
        </Button>
      </div>

      {/* Tamanho da Fonte */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Type className="w-5 h-5 mr-2" />
            Tamanho do Texto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateSetting('fontSize', Math.max(12, settings.fontSize - 2))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-sm font-medium">
              {settings.fontSize}px
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateSetting('fontSize', Math.min(24, settings.fontSize + 2))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Slider
            value={[settings.fontSize]}
            onValueChange={(value) => updateSetting('fontSize', value[0])}
            min={12}
            max={24}
            step={1}
            className="w-full"
          />
          
          <p className="text-sm text-muted-foreground" style={{ fontSize: `${settings.fontSize}px` }}>
            Exemplo de texto com o tamanho selecionado
          </p>
        </CardContent>
      </Card>

      {/* Contraste e Cores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Contrast className="w-5 h-5 mr-2" />
            Contraste e Cores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="high-contrast">Alto Contraste</Label>
            <Switch
              id="high-contrast"
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="dark-mode">Modo Escuro</Label>
            <Switch
              id="dark-mode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => updateSetting('darkMode', checked)}
            />
          </div>
          
          <div>
            <Label className="text-sm font-medium">Modo para Daltonismo</Label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                { value: 'none', label: 'Nenhum' },
                { value: 'protanopia', label: 'Protanopia' },
                { value: 'deuteranopia', label: 'Deuteranopia' },
                { value: 'tritanopia', label: 'Tritanopia' }
              ].map(mode => (
                <Button
                  key={mode.value}
                  variant={settings.colorblindMode === mode.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => updateSetting('colorblindMode', mode.value as any)}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Zoom */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Eye className="w-5 h-5 mr-2" />
            Zoom da Página
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateSetting('zoomLevel', Math.max(75, settings.zoomLevel - 25))}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            
            <span className="text-sm font-medium">
              {settings.zoomLevel}%
            </span>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => updateSetting('zoomLevel', Math.min(200, settings.zoomLevel + 25))}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>
          
          <Slider
            value={[settings.zoomLevel]}
            onValueChange={(value) => updateSetting('zoomLevel', value[0])}
            min={75}
            max={200}
            step={25}
            className="w-full"
          />
        </CardContent>
      </Card>

      {/* Áudio e Movimento */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            Áudio e Movimento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="text-to-speech">Texto para Fala</Label>
            <Switch
              id="text-to-speech"
              checked={settings.textToSpeech}
              onCheckedChange={(checked) => updateSetting('textToSpeech', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="audio-descriptions">Descrições de Áudio</Label>
            <Switch
              id="audio-descriptions"
              checked={settings.audioDescriptions}
              onCheckedChange={(checked) => updateSetting('audioDescriptions', checked)}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="reduce-motion">Reduzir Animações</Label>
            <Switch
              id="reduce-motion"
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
            />
          </div>
          
          {settings.textToSpeech && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => speakText('Esta é uma demonstração da funcionalidade de texto para fala do KerigmaApp.')}
              className="w-full"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Testar Texto para Fala
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Leitor de Tela */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Accessibility className="w-5 h-5 mr-2" />
            Compatibilidade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="screen-reader">Otimizar para Leitor de Tela</Label>
            <Switch
              id="screen-reader"
              checked={settings.screenReader}
              onCheckedChange={(checked) => updateSetting('screenReader', checked)}
            />
          </div>
          
          {settings.screenReader && (
            <p className="text-sm text-muted-foreground mt-2">
              Interface otimizada para leitores de tela como NVDA, JAWS e VoiceOver.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};