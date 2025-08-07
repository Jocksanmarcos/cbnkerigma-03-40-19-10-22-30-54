import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className,
  mobileClassName,
  desktopClassName
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn(
      className,
      isMobile ? mobileClassName : desktopClassName
    )}>
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  mobileCols?: number;
  tabletCols?: number;
  desktopCols?: number;
  gap?: number;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className,
  mobileCols = 1,
  tabletCols = 2,
  desktopCols = 3,
  gap = 4
}) => {
  return (
    <div className={cn(
      'grid',
      `grid-cols-${mobileCols}`,
      `md:grid-cols-${tabletCols}`,
      `lg:grid-cols-${desktopCols}`,
      `gap-${gap}`,
      className
    )}>
      {children}
    </div>
  );
};

interface ResponsiveTextProps {
  children: React.ReactNode;
  className?: string;
  mobileSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  desktopSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className,
  mobileSize = 'sm',
  desktopSize = 'base'
}) => {
  const sizeMap = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
    '2xl': 'text-2xl',
    '3xl': 'text-3xl'
  };

  return (
    <span className={cn(
      sizeMap[mobileSize],
      `md:${sizeMap[desktopSize]}`,
      className
    )}>
      {children}
    </span>
  );
};