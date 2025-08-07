import React, { createContext, useContext, useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContextType {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenSize: 'mobile' | 'tablet' | 'desktop' | 'wide';
  breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const ResponsiveContext = createContext<ResponsiveContextType | undefined>(undefined);

export const useResponsive = () => {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within a ResponsiveProvider');
  }
  return context;
};

interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export const ResponsiveProvider: React.FC<ResponsiveProviderProps> = ({ children }) => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  const isMobile = useIsMobile();

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine breakpoints
  const getBreakpoint = (): ResponsiveContextType['breakpoint'] => {
    if (dimensions.width < 640) return 'xs';
    if (dimensions.width < 768) return 'sm';
    if (dimensions.width < 1024) return 'md';
    if (dimensions.width < 1280) return 'lg';
    if (dimensions.width < 1536) return 'xl';
    return '2xl';
  };

  const getScreenSize = (): ResponsiveContextType['screenSize'] => {
    if (dimensions.width < 768) return 'mobile';
    if (dimensions.width < 1024) return 'tablet';
    if (dimensions.width < 1440) return 'desktop';
    return 'wide';
  };

  const value: ResponsiveContextType = {
    isMobile: dimensions.width < 768,
    isTablet: dimensions.width >= 768 && dimensions.width < 1024,
    isDesktop: dimensions.width >= 1024,
    screenSize: getScreenSize(),
    breakpoint: getBreakpoint(),
  };

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};