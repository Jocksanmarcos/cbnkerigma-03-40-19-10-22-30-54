import React, { Suspense, lazy, memo, useMemo } from 'react';

// Lazy loading wrapper with simple error handling
export const LazyComponent = ({ 
  loader, 
  fallback = <div className="animate-pulse h-20 bg-muted rounded" />,
  errorFallback = <div className="text-destructive">Erro ao carregar componente</div>
}) => {
  const LazyLoadedComponent = useMemo(() => lazy(loader), [loader]);
  
  return (
    <Suspense fallback={fallback}>
      <LazyLoadedComponent />
    </Suspense>
  );
};

// Image lazy loading with optimization
interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = memo(({
  src,
  alt,
  className,
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+'
}) => {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  const handleLoad = () => setLoaded(true);
  const handleError = () => setError(true);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div 
          className="absolute inset-0 bg-muted animate-pulse"
          style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
        />
      )}
      
      {error ? (
        <div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
          <span>Erro ao carregar imagem</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={`transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} ${className}`}
          style={{
            filter: loaded ? 'none' : 'blur(4px)',
          }}
        />
      )}
    </div>
  );
});

// Virtual scrolling for large lists
interface VirtualListProps {
  items: any[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: any, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualList: React.FC<VirtualListProps> = memo(({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className
}) => {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    items.length
  );
  
  const visibleItems = items.slice(startIndex, endIndex);
  
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return (
    <div
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

// Debounced search input
interface DebouncedSearchProps {
  onSearch: (value: string) => void;
  delay?: number;
  placeholder?: string;
  className?: string;
}

export const DebouncedSearch: React.FC<DebouncedSearchProps> = memo(({
  onSearch,
  delay = 300,
  placeholder = 'Pesquisar...',
  className
}) => {
  const [value, setValue] = React.useState('');
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  React.useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      onSearch(value);
    }, delay);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [value, delay, onSearch]);
  
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
});

// Memoized stats card for performance
interface MemoizedStatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon?: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

export const MemoizedStatsCard: React.FC<MemoizedStatsCardProps> = memo(({
  title,
  value,
  change,
  icon: Icon,
  trend = 'neutral'
}) => {
  const trendColor = {
    up: 'text-success',
    down: 'text-destructive',
    neutral: 'text-muted-foreground'
  };
  
  return (
    <div className="card-enhanced">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <p className={`text-xs ${trendColor[trend]}`}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
      </div>
    </div>
  );
});

// Performance monitoring hook
export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0
  });
  
  const startTime = React.useRef<number>();
  
  React.useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        setMetrics(prev => ({
          renderCount: prev.renderCount + 1,
          lastRenderTime: renderTime,
          averageRenderTime: (prev.averageRenderTime * prev.renderCount + renderTime) / (prev.renderCount + 1)
        }));
      }
    };
  });
  
  return metrics;
};

// Intersection Observer hook for lazy loading
export const useInView = (options?: IntersectionObserverInit) => {
  const [inView, setInView] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      options
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => observer.disconnect();
  }, [options]);
  
  return { ref, inView };
};