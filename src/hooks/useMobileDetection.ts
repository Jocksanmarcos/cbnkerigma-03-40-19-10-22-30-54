import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isNativeApp, setIsNativeApp] = useState(false);
  const [platform, setPlatform] = useState<'web' | 'ios' | 'android'>('web');

  useEffect(() => {
    // Detectar se é app nativo
    const nativeApp = Capacitor.isNativePlatform();
    setIsNativeApp(nativeApp);
    
    // Detectar plataforma
    const currentPlatform = Capacitor.getPlatform();
    setPlatform(currentPlatform as 'web' | 'ios' | 'android');
    
    // Detectar se é mobile (incluindo web mobile)
    const checkMobile = () => {
      const userAgent = navigator.userAgent;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent) || window.innerWidth <= 768;
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    isMobile,
    isNativeApp,
    platform,
    isIOS: platform === 'ios',
    isAndroid: platform === 'android',
    isWeb: platform === 'web'
  };
};