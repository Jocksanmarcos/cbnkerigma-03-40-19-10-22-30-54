import React from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from './ResponsiveProvider';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'narrow' | 'wide' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md'
}) => {
  const { screenSize, isMobile } = useResponsive();

  const getMaxWidth = () => {
    switch (variant) {
      case 'narrow': return 'max-w-4xl';
      case 'wide': return 'max-w-8xl';
      case 'full': return 'max-w-full';
      default: return 'max-w-7xl';
    }
  };

  const getPadding = () => {
    if (padding === 'none') return '';
    
    const paddingMap = {
      sm: 'px-2 sm:px-4',
      md: 'px-4 sm:px-6 lg:px-8',
      lg: 'px-6 sm:px-8 lg:px-12',
      xl: 'px-8 sm:px-12 lg:px-16'
    };
    
    return paddingMap[padding];
  };

  return (
    <div className={cn(
      'w-full mx-auto',
      getMaxWidth(),
      getPadding(),
      'transition-all duration-200',
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    wide?: number;
  };
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  minItemWidth?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = 'md',
  minItemWidth
}) => {
  const { screenSize } = useResponsive();

  const getGridCols = () => {
    if (minItemWidth) {
      return `repeat(auto-fit, minmax(min(${minItemWidth}, 100%), 1fr))`;
    }

    const colsMap = {
      mobile: `repeat(${cols.mobile || 1}, minmax(0, 1fr))`,
      tablet: `repeat(${cols.tablet || 2}, minmax(0, 1fr))`,
      desktop: `repeat(${cols.desktop || 3}, minmax(0, 1fr))`,
      wide: `repeat(${cols.wide || 4}, minmax(0, 1fr))`
    };

    return colsMap[screenSize];
  };

  const getGap = () => {
    const gapMap = {
      sm: 'gap-2 sm:gap-3',
      md: 'gap-3 sm:gap-4 lg:gap-6',
      lg: 'gap-4 sm:gap-6 lg:gap-8',
      xl: 'gap-6 sm:gap-8 lg:gap-12'
    };
    
    return gapMap[gap];
  };

  return (
    <div 
      className={cn('grid', getGap(), className)}
      style={{ gridTemplateColumns: getGridCols() }}
    >
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  wrap?: boolean;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className,
  direction = 'responsive',
  align = 'start',
  justify = 'start',
  gap = 'md',
  wrap = false
}) => {
  const { isMobile } = useResponsive();

  const getFlexDirection = () => {
    if (direction === 'vertical') return 'flex-col';
    if (direction === 'horizontal') return 'flex-row';
    return isMobile ? 'flex-col' : 'flex-row'; // responsive
  };

  const getAlignItems = () => {
    const alignMap = {
      start: 'items-start',
      center: 'items-center',
      end: 'items-end',
      stretch: 'items-stretch'
    };
    return alignMap[align];
  };

  const getJustifyContent = () => {
    const justifyMap = {
      start: 'justify-start',
      center: 'justify-center',
      end: 'justify-end',
      between: 'justify-between',
      around: 'justify-around',
      evenly: 'justify-evenly'
    };
    return justifyMap[justify];
  };

  const getGap = () => {
    const gapMap = {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };
    return gapMap[gap];
  };

  return (
    <div className={cn(
      'flex',
      getFlexDirection(),
      getAlignItems(),
      getJustifyContent(),
      getGap(),
      wrap && 'flex-wrap',
      className
    )}>
      {children}
    </div>
  );
};